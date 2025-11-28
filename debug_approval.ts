import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// ABI to check roles and project status
const ABI = [
    'function hasRole(bytes32 role, address account) external view returns (bool)',
    'function getProjectDetailsStruct(uint256 _projectId) external view returns (tuple(string country, string registry, uint256 vintageYear, uint8 status, uint256 createdAt, uint256 approvedAt))',
    'function projectExists(uint256 _projectId) external view returns (bool)',
    'function AUDITOR_ROLE() external view returns (bytes32)'
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

    const callerAddress = '0xc3E121368a7159402c27b2CE626C368e187f4506'; // From user error log
    const projectId = 1;

    console.log(`Debugging approval failure for caller ${callerAddress} on project ${projectId}...`);

    try {
        // 1. Check AUDITOR_ROLE
        console.log('Checking AUDITOR_ROLE...');
        let auditorRoleHash;
        try {
            auditorRoleHash = await contract.AUDITOR_ROLE();
            console.log('AUDITOR_ROLE hash:', auditorRoleHash);
        } catch (e) {
            console.log('Could not fetch AUDITOR_ROLE constant, using default keccak256("AUDITOR_ROLE")');
            auditorRoleHash = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));
        }

        const hasRole = await contract.hasRole(auditorRoleHash, callerAddress);
        console.log(`Has AUDITOR_ROLE: ${hasRole}`);

        if (!hasRole) {
            console.error('CRITICAL: Caller does NOT have AUDITOR_ROLE. Transaction will revert.');
        }

        // 2. Check Project Status
        console.log('Checking Project Status...');
        const exists = await contract.projectExists(projectId);
        if (!exists) {
            console.error('CRITICAL: Project does not exist.');
            return;
        }

        const details = await contract.getProjectDetailsStruct(projectId);
        const statusIndex = Number(details.status);
        console.log(`Project Status: ${ProjectStatus[statusIndex]} (${statusIndex})`);

        // Check if status allows approval (usually Submitted=0 or UnderAudit=1)
        if (statusIndex !== 0 && statusIndex !== 1) {
            console.error(`CRITICAL: Project status ${ProjectStatus[statusIndex]} might not allow approval.`);
        }

    } catch (error) {
        console.error('Error during debug:', error);
    }
}

main();
