import { ethers } from 'ethers';
import web3Service from './web3.service';
import { Logger } from '../utils/logger';

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

interface ProjectDetails {
    name: string;
    location: string;
    credits: bigint;
}

class ContractService {
    private contractAddress: string | null = null;
    private contract: ethers.Contract | null = null;

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
