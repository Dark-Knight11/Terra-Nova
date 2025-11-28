import { ethers } from 'ethers';
import web3Service from './web3.service';
import { Logger } from '../utils/logger';
import prisma from '../db/client';

// Placeholder ABI - will be replaced with actual contract ABI
const CARBON_CREDIT_ABI = [
    // ERC20-like functions
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',

    // Carbon credit specific
    'function getProjectDetails(uint256 projectId) view returns (string memory name, string memory location, uint256 credits)',
    'function mintCredits(address to, uint256 amount) returns (bool)',

    // Events
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event CreditMinted(address indexed to, uint256 amount, uint256 projectId)'
];

const MARKETPLACE_ABI = [
    'event ListingCreated(uint256 indexed listingId, uint256 indexed projectId, address indexed seller, uint256 amount, uint256 startingPrice, uint8 auctionType)',
    'event FixedPriceSale(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price)',
    'event AuctionCompleted(uint256 indexed listingId, address indexed winner, uint256 finalPrice, uint256 amount)',
    'event AuctionCancelled(uint256 indexed listingId, address indexed seller)'
];

interface ProjectDetails {
    name: string;
    location: string;
    credits: bigint;
}

class ContractService {
    private contractAddress: string | null = null;
    private marketplaceAddress: string | null = null;
    private contract: ethers.Contract | null = null;
    private marketplaceContract: ethers.Contract | null = null;

    // Initialize contract
    private getContract(): ethers.Contract {
        if (!this.contract) {
            this.contractAddress = process.env.CONTRACT_ADDRESS || '';

            if (!this.contractAddress) {
                throw new Error('CONTRACT_ADDRESS not configured');
            }

            this.contract = web3Service.getContract(
                this.contractAddress,
                CARBON_CREDIT_ABI
            );

            Logger.info('Carbon credit contract initialized', {
                address: this.contractAddress
            });
        }

        return this.contract;
    }

    private getMarketplaceContract(): ethers.Contract {
        if (!this.marketplaceContract) {
            this.marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS || '';

            if (!this.marketplaceAddress) {
                // Fallback or throw? For now, let's log warning and throw if critical
                Logger.warn('MARKETPLACE_CONTRACT_ADDRESS not configured, using placeholder or skipping');
                // throw new Error('MARKETPLACE_CONTRACT_ADDRESS not configured');
            }

            if (this.marketplaceAddress) {
                this.marketplaceContract = web3Service.getContract(
                    this.marketplaceAddress,
                    MARKETPLACE_ABI
                );

                Logger.info('Marketplace contract initialized', {
                    address: this.marketplaceAddress
                });
            }
        }

        if (!this.marketplaceContract) {
            throw new Error('Marketplace contract not initialized');
        }

        return this.marketplaceContract;
    }

    // Get credit balance for an address
    async getCreditBalance(walletAddress: string): Promise<string> {
        try {
            if (!web3Service.verifyWalletAddress(walletAddress)) {
                throw new Error('Invalid wallet address');
            }

            const contract = this.getContract();
            const balance = await contract.balanceOf(walletAddress);

            // Convert from wei to tokens (assuming 18 decimals)
            return ethers.formatUnits(balance, 18);
        } catch (error) {
            Logger.error('Failed to get credit balance', { walletAddress, error });
            throw new Error('Failed to fetch credit balance from blockchain');
        }
    }

    // Get project details from blockchain
    async getProjectDetails(projectId: number): Promise<ProjectDetails | null> {
        try {
            const contract = this.getContract();
            const [name, location, credits] = await contract.getProjectDetails(projectId);

            return {
                name,
                location,
                credits
            };
        } catch (error) {
            Logger.error('Failed to get project details', { projectId, error });
            return null;
        }
    }

    // Listen for transfer events
    async listenForTransfers(callback: (from: string, to: string, amount: bigint) => void) {
        try {
            const contract = this.getContract();

            contract.on('Transfer', (from, to, amount, _event) => {
                Logger.info('Transfer event detected', { from, to, amount: amount.toString() });
                callback(from, to, amount);
            });

            Logger.info('Listening for Transfer events');
        } catch (error) {
            Logger.error('Failed to setup transfer listener', { error });
        }
    }

    // Listen for credit minted events
    async listenForCreditMints(callback: (to: string, amount: bigint, projectId: bigint) => void) {
        try {
            const contract = this.getContract();

            contract.on('CreditMinted', (to, amount, projectId, _event) => {
                Logger.info('CreditMinted event detected', {
                    to,
                    amount: amount.toString(),
                    projectId: projectId.toString()
                });
                callback(to, amount, projectId);
            });

            Logger.info('Listening for CreditMinted events');
        } catch (error) {
            Logger.error('Failed to setup credit mint listener', { error });
        }
    }

    // Listen for marketplace events
    async listenForMarketEvents() {
        try {
            const contract = this.getMarketplaceContract();

            // Listing Created
            contract.on('ListingCreated', async (listingId, projectId, seller, amount, startingPrice, _auctionType, _event) => {
                Logger.info('ListingCreated event detected', { listingId, projectId, seller });
                try {
                    // @ts-ignore
                    await prisma.listing.create({
                        data: {
                            listingId: listingId.toString(),
                            projectId: projectId.toString(),
                            seller: seller,
                            amount: amount.toString(),
                            price: startingPrice.toString(),
                            status: 'ACTIVE'
                        }
                    });
                } catch (err) {
                    Logger.error('Error indexing ListingCreated', err);
                }
            });

            // Fixed Price Sale
            contract.on('FixedPriceSale', async (listingId, buyer, amount, price, _event) => {
                Logger.info('FixedPriceSale event detected', { listingId, buyer });
                try {
                    // @ts-ignore
                    const listing = await prisma.listing.findUnique({ where: { listingId: listingId.toString() } });

                    // Create Trade
                    // @ts-ignore
                    await prisma.trade.create({
                        data: {
                            listingId: listingId.toString(),
                            buyer: buyer,
                            seller: listing ? listing.seller : 'unknown', // Ideally we fetch from listing
                            projectId: listing ? listing.projectId : 'unknown',
                            amount: amount.toString(),
                            price: price.toString()
                        }
                    });

                    // Update Listing Status (assuming full sale for now, or we might need to decrement amount)
                    // For simplicity, if it's a one-off listing, mark as COMPLETED. 
                    // If partial fills are allowed, we'd need to check remaining amount.
                    // The contract `buyFixedPrice` seems to complete the auction.
                    // @ts-ignore
                    await prisma.listing.update({
                        where: { listingId: listingId.toString() },
                        data: { status: 'COMPLETED' }
                    });

                } catch (err) {
                    Logger.error('Error indexing FixedPriceSale', err);
                }
            });

            // Auction Completed
            contract.on('AuctionCompleted', async (listingId, winner, finalPrice, amount, _event) => {
                Logger.info('AuctionCompleted event detected', { listingId, winner });
                try {
                    // @ts-ignore
                    const listing = await prisma.listing.findUnique({ where: { listingId: listingId.toString() } });

                    // @ts-ignore
                    await prisma.trade.create({
                        data: {
                            listingId: listingId.toString(),
                            buyer: winner,
                            seller: listing ? listing.seller : 'unknown',
                            projectId: listing ? listing.projectId : 'unknown',
                            amount: amount.toString(),
                            price: finalPrice.toString()
                        }
                    });

                    // @ts-ignore
                    await prisma.listing.update({
                        where: { listingId: listingId.toString() },
                        data: { status: 'COMPLETED' }
                    });
                } catch (err) {
                    Logger.error('Error indexing AuctionCompleted', err);
                }
            });

            // Auction Cancelled
            contract.on('AuctionCancelled', async (listingId, seller, _event) => {
                Logger.info('AuctionCancelled event detected', { listingId, seller });
                try {
                    // @ts-ignore
                    await prisma.listing.update({
                        where: { listingId: listingId.toString() },
                        data: { status: 'CANCELLED' }
                    });
                } catch (err) {
                    Logger.error('Error indexing AuctionCancelled', err);
                }
            });

            Logger.info('Listening for Marketplace events');

        } catch (error) {
            Logger.error('Failed to setup marketplace listener', { error });
        }
    }

    // Verify a transaction hash
    async verifyTransaction(txHash: string): Promise<{ verified: boolean; confirmations?: number }> {
        try {
            const receipt = await web3Service.getTransactionReceipt(txHash);

            if (!receipt) {
                return { verified: false };
            }

            const currentBlock = await web3Service.getCurrentBlock();
            const confirmations = currentBlock - receipt.blockNumber + 1;

            return {
                verified: receipt.status === 1, // 1 = success, 0 = failed
                confirmations
            };
        } catch (error) {
            Logger.error('Transaction verification failed', { txHash, error });
            throw new Error('Failed to verify transaction');
        }
    }
}

export default new ContractService();
