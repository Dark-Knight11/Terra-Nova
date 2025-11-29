import { ethers } from 'ethers';
import web3Service from './web3.service';
import { Logger } from '../utils/logger';
import prisma from '../db/client';

// Contract Addresses
const DEFAULT_CONTRACT_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const DEFAULT_MARKETPLACE_ADDRESS = '0x63CdAF5CC857105E7a0dAE9463Ef8E04dF5A3c8e';

const CARBON_CREDIT_ABI = [
    // ERC1155 functions
    'function balanceOf(address account, uint256 id) view returns (uint256)',
    'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data) external',

    // Legacy support / Convenience
    'function balanceOf(address owner) view returns (uint256)',
    'function getProjectDetails(uint256 projectId) view returns (string memory name, string memory location, uint256 credits)',

    // Carbon credit specific
    'function mintCredits(uint256 projectId, uint256 amount, string memory monitoringReportHash) external',

    // Events
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event CreditMinted(address indexed to, uint256 amount, uint256 projectId)',
    'event ProjectCreated(uint256 indexed projectId, string name, uint8 category, uint8 gasType)',
    'event ProjectApproved(uint256 indexed projectId)',
    'event ProjectSubmitted(uint256 indexed projectId, address indexed developer, string projectName, uint8 category)'
];

const MARKETPLACE_ABI = [
    'event ListingCreated(uint256 indexed listingId, uint256 indexed projectId, address indexed seller, uint256 amount, uint256 startingPrice, uint8 auctionType)',
    'event FixedPriceSale(uint256 indexed listingId, address indexed buyer, uint256 amount, uint256 price)',
    'event AuctionCompleted(uint256 indexed listingId, address indexed winner, uint256 finalPrice, uint256 amount)',
    'event AuctionCancelled(uint256 indexed listingId, address indexed seller)',
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
            this.contractAddress = process.env.CONTRACT_ADDRESS || DEFAULT_CONTRACT_ADDRESS;

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
            this.marketplaceAddress = process.env.MARKETPLACE_CONTRACT_ADDRESS || DEFAULT_MARKETPLACE_ADDRESS;

            if (!this.marketplaceAddress) {
                Logger.warn('MARKETPLACE_CONTRACT_ADDRESS not configured, using placeholder or skipping');
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
            // Using the legacy support function which returns total balance across all IDs
            const balance = await contract.balanceOf(walletAddress);

            // Convert from wei to tokens (assuming 18 decimals equivalent logic in contract)
            // Note: If ERC1155 uses 0 decimals for count, formatUnits might be wrong if '18' is expected.
            // But based on previous code it expected 18.
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

    // Listen for project events
    async listenForProjectEvents() {
        try {
            const contract = this.getContract();

            // Project Created
            contract.on('ProjectCreated', async (projectId, name, _category, _gasType, _event) => {
                Logger.info('ProjectCreated event detected', { projectId, name });
                // We might want to link this to an existing CarbonCredit if it was created via API
                // For now, we just log it, or we could try to find a pending credit with same name?
                // Ideally, the API creation returns the ID which is then used on-chain.
                // But here we are syncing back.

                // Strategy: If we have a CarbonCredit with this name and no projectId, update it.
                try {
                    const credit = await prisma.carbonCredit.findFirst({
                        where: {
                            title: name,
                            projectId: null
                        }
                    });

                    if (credit) {
                        await prisma.carbonCredit.update({
                            where: { id: credit.id },
                            data: {
                                projectId: projectId.toString(),
                                status: 'SUBMITTED'
                            }
                        });
                        Logger.info('Linked on-chain project to CarbonCredit', { creditId: credit.id, projectId });
                    }
                } catch (err) {
                    Logger.error('Error indexing ProjectCreated', err);
                }
            });

            // Project Approved
            contract.on('ProjectApproved', async (projectId, _event) => {
                Logger.info('ProjectApproved event detected', { projectId });
                try {
                    await prisma.carbonCredit.update({
                        where: { projectId: projectId.toString() },
                        data: { status: 'APPROVED' }
                    });
                    Logger.info('Updated CarbonCredit status to APPROVED', { projectId });
                } catch (err) {
                    Logger.error('Error indexing ProjectApproved', err);
                }
            });

            // Project Submitted
            contract.on('ProjectSubmitted', async (projectId, developer, projectName, category, event) => {
                Logger.info('ProjectSubmitted event detected', { projectId, developer, projectName });
                console.log('I was called vedant')

                try {
                    // Fetch the transaction to decode input data
                    const tx = await event.getTransaction();
                    // We need the full function signature to decode the transaction input
                    // Adding the function to the interface if it's not already there (it's not in the ABI array above)
                    // But we can't easily add to `contract.interface` dynamically if it was initialized with a fixed ABI.
                    // However, we can use a temporary interface or ensure the function is in the ABI.

                    // Let's check if the function is in the ABI. It is NOT.
                    // We need to add the function definition to the ABI constant first.
                    // Assuming we will add it, or we can use a local interface.

                    const SUBMISSION_FRAGMENT = 'function submitProject(string memory _projectName, uint8 _category, uint8 _primaryGasType, string memory _country, string memory _registry, address _consultant, string memory _verificationDocHash, uint256 _vintageYear) external returns (uint256)';
                    const iface = new ethers.Interface([SUBMISSION_FRAGMENT]);

                    const decoded = iface.parseTransaction({ data: tx.data, value: tx.value });

                    if (!decoded) {
                        Logger.warn('Failed to decode transaction input for project submission');
                        return;
                    }

                    // Extract args from decoded transaction
                    const args = decoded.args;
                    // args: [_projectName, _category, _primaryGasType, _country, _registry, _consultant, _verificationDocHash, _vintageYear]
                    const country = args[3];
                    const registry = args[4];
                    const vintageYear = args[7];

                    // Find the company
                    const company = await prisma.company.findUnique({
                        where: { walletAddress: developer }
                    });

                    if (!company) {
                        Logger.warn(`Company not found for wallet ${developer}, creating project without company link or skipping`);
                        // We can still create it but without company link? Or just skip.
                        // Let's skip for now as per previous logic.
                        return;
                    }

                    // Map Category to CreditType
                    const creditTypeMap: Record<number, string> = {
                        0: 'RENEWABLE_ENERGY',
                        1: 'REFORESTATION',
                        2: 'RENEWABLE_ENERGY',
                        3: 'PRESERVATION',
                        4: 'BLUE_CARBON',
                        5: 'PRESERVATION',
                        6: 'PRESERVATION'
                    };

                    const creditType = creditTypeMap[Number(category)] || 'REFORESTATION';

                    // Create CarbonCredit record
                    await prisma.carbonCredit.create({
                        data: {
                            title: projectName,
                            type: creditType as any,
                            price: 0,
                            score: 0,
                            location: country || 'Unknown',
                            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop',
                            companyId: company.id,
                            companyName: company.name,
                            description: `Project ID: ${projectId}. A ${creditType} project in ${country}. Registry: ${registry}.`,
                            vintage: vintageYear.toString(),
                            volume: '0',
                            methodology: registry || 'Verra VCS',
                            walletAddress: developer,
                            projectId: projectId.toString()
                        }
                    });

                    Logger.info(`Project ${projectId} persisted to database via transaction decoding`);

                } catch (err) {
                    Logger.error('Error indexing ProjectSubmitted', err);
                }
            });

            Logger.info('Listening for Project events');
        } catch (error) {
            Logger.error('Failed to setup project listener', { error });
        }
    }

    // Listen for credit minted events
    async listenForCreditMints(callback: (to: string, amount: bigint, projectId: bigint) => void) {
        try {
            const contract = this.getContract();

            contract.on('CreditMinted', async (to, amount, projectId, _event) => {
                Logger.info('CreditMinted event detected', {
                    to,
                    amount: amount.toString(),
                    projectId: projectId.toString()
                });

                // Update volume/credits in DB
                try {
                    const credit = await prisma.carbonCredit.findUnique({
                        where: { projectId: projectId.toString() }
                    });

                    if (credit) {
                        // Parse current volume, add new amount
                        // Assuming volume is stored as string representation of number
                        // But schema says 'volume' string. Let's assume it's just a display string for now
                        // or we might want to add a 'creditsIssued' field.
                        // For now, let's just log it.

                        // Actually, Company model has 'credits' field.
                        await prisma.company.update({
                            where: { id: credit.companyId },
                            data: {
                                credits: {
                                    increment: Number(ethers.formatUnits(amount, 18)) // Assuming 18 decimals
                                }
                            }
                        });
                    }
                } catch (err) {
                    Logger.error('Error updating credits on mint', err);
                }

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
                    const listing = await prisma.listing.findUnique({ where: { listingId: listingId.toString() } });

                    // Create Trade
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
                    const listing = await prisma.listing.findUnique({ where: { listingId: listingId.toString() } });

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
