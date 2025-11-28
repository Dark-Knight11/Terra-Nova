
import { ethers } from 'ethers';

const RPC_URL = 'https://ethereum-sepolia.publicnode.com';
const ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';

const ABI = [
    'function projectExists(uint256 _projectId) external view returns (bool)',
    'function getProjectBasicInfo(uint256 _projectId) external view returns (tuple(uint256 projectId, string projectName, address projectDeveloper, address consultant, address auditor, uint8 category, uint8 primaryGasType))',
    'function getTotalProjects() external view returns (uint256)'
];

async function checkProject() {
    console.log(`Connecting to ${RPC_URL}...`);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(ADDRESS, ABI, provider);

    try {
        console.log('Checking total projects...');
        const total = await contract.getTotalProjects();
        console.log('Total projects:', total.toString());

        console.log('Checking if project 1 exists...');
        const exists = await contract.projectExists(1);
        console.log('Project 1 exists:', exists);

        if (exists) {
            console.log('Fetching project 1 info...');
            const info = await contract.getProjectBasicInfo(1);
            console.log('Project 1 Info:', info);
        } else {
            console.log('Project 1 does not exist, so getProjectBasicInfo(1) will revert.');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

checkProject();
