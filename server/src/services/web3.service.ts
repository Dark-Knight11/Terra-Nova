import { ethers } from 'ethers';
import { Logger } from '../utils/logger';

class Web3Service {
    private provider: ethers.JsonRpcProvider | null = null;

    // Initialize provider
    getProvider(): ethers.JsonRpcProvider {
        if (!this.provider) {
            const rpcUrl = process.env.ETHEREUM_RPC_URL;
            if (!rpcUrl) {
                throw new Error('ETHEREUM_RPC_URL not configured');
            }
            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            // Increase polling interval to avoid rate limiting (default is 4000ms)
            this.provider.pollingInterval = 12000;
            Logger.info('Ethereum provider initialized', { rpcUrl, pollingInterval: this.provider.pollingInterval });
        }
        return this.provider;
    }

    // Get contract instance
    getContract(address: string, abi: any[]): ethers.Contract {
        const provider = this.getProvider();
        return new ethers.Contract(address, abi, provider);
    }

    // Validate Ethereum address format
    verifyWalletAddress(address: string): boolean {
        try {
            return ethers.isAddress(address);
        } catch (error) {
            return false;
        }
    }

    // Normalize Ethereum address (checksum)
    normalizeAddress(address: string): string {
        if (!this.verifyWalletAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }
        return ethers.getAddress(address);
    }

    // Recover signer address from message and signature
    recoverSignerAddress(message: string, signature: string): string {
        try {
            const recoveredAddress = ethers.verifyMessage(message, signature);
            return this.normalizeAddress(recoveredAddress);
        } catch (error) {
            Logger.error('Failed to recover signer address', { error });
            throw new Error('Invalid signature');
        }
    }

    // Hash a message (for signing)
    hashMessage(message: string): string {
        return ethers.hashMessage(message);
    }

    // Get current block number
    async getCurrentBlock(): Promise<number> {
        const provider = this.getProvider();
        return await provider.getBlockNumber();
    }

    // Get transaction receipt
    async getTransactionReceipt(txHash: string): Promise<ethers.TransactionReceipt | null> {
        const provider = this.getProvider();
        return await provider.getTransactionReceipt(txHash);
    }

    // Verify transaction exists and is confirmed
    async verifyTransaction(txHash: string, requiredConfirmations: number = 1): Promise<boolean> {
        try {
            const receipt = await this.getTransactionReceipt(txHash);
            if (!receipt) {
                return false;
            }

            const currentBlock = await this.getCurrentBlock();
            const confirmations = currentBlock - receipt.blockNumber + 1;

            return confirmations >= requiredConfirmations;
        } catch (error) {
            Logger.error('Transaction verification failed', { txHash, error });
            return false;
        }
    }
}

export default new Web3Service();
