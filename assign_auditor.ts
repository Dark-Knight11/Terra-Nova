import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const TOKEN_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

const ABI = [
    'function assignAuditor(uint256 _projectId, address _auditor) external',
    'function getProjectDetailsStruct(uint256 _projectId) external view returns (tuple(string country, string registry, uint256 vintageYear, uint8 status, uint256 createdAt, uint256 approvedAt))'
];

async function main() {
    // 1. Get Private Key (Admin)
    const privateKey = process.env.PRIVATE_KEY || process.env.VITE_PRIVATE_KEY;
    if (!privateKey) {
        console.error('Error: PRIVATE_KEY or VITE_PRIVATE_KEY not found.');
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet);

    // 2. Configuration
    const projectId = 1; // Change as needed
    const auditorAddress = '0xc3E121368a7159402c27b2CE626C368e187f4506'; // The user's auditor address

    console.log(`Assigning Auditor ${auditorAddress} to Project ${projectId}...`);
    console.log(`Using Admin Wallet: ${wallet.address}`);

    try {
        const tx = await contract.assignAuditor(projectId, auditorAddress);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log('Transaction confirmed! Auditor assigned.');
    } catch (error) {
        console.error('Error assigning auditor:', error);
    }
}

main();
