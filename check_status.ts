import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// Minimal ABI to check status
const ABI = [
    'function getProjectDetailsStruct(uint256 _projectId) external view returns (tuple(string country, string registry, uint256 vintageYear, uint8 status, uint256 createdAt, uint256 approvedAt))',
    'function projectExists(uint256 _projectId) external view returns (bool)'
];

const ProjectStatus = [
    'Submitted',
    'UnderAudit',
    'Approved',
    'Rejected',
    'Active',
    'Completed'
];

async function main() {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, provider);

    const projectId = 1;

    console.log(`Checking project ${projectId} on contract ${TOKEN_ADDRESS}...`);

    try {
        const exists = await contract.projectExists(projectId);
        console.log(`Project ${projectId} exists: ${exists}`);

        if (exists) {
            const details = await contract.getProjectDetailsStruct(projectId);
            const statusIndex = Number(details.status);
            console.log(`Project Status Index: ${statusIndex}`);
            console.log(`Project Status: ${ProjectStatus[statusIndex]}`);

            if (statusIndex !== 2) { // 2 is Approved
                console.log('WARNING: Project is NOT Approved. Minting will fail.');
            } else {
                console.log('Project is Approved. Minting should work.');
            }
        }
    } catch (error) {
        console.error('Error fetching project info:', error);
    }
}

main();
