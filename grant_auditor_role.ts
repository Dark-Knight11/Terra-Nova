import { ethers } from 'ethers';

// dotenv removed to avoid dependency issues. 
// Please provide PRIVATE_KEY via command line: PRIVATE_KEY=... npx tsx grant_auditor_role.ts

const TOKEN_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';

// ABI for AccessControl
const ABI = [
    'function grantRole(bytes32 role, address account) external',
    'function hasRole(bytes32 role, address account) external view returns (bool)',
    'function AUDITOR_ROLE() external view returns (bytes32)',
    'function DEFAULT_ADMIN_ROLE() external view returns (bytes32)'
];

async function main() {
    // 1. Get Private Key
    const privateKey = process.env.PRIVATE_KEY || process.env.VITE_PRIVATE_KEY;
    if (!privateKey) {
        console.error('Error: PRIVATE_KEY or VITE_PRIVATE_KEY not found in environment variables.');
        console.log('Please set it in your .env file or pass it when running the script.');
        process.exit(1);
    }

    // 2. Setup Provider and Signer
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, wallet);

    // 3. Target Address (from error log)
    const targetAddress = '0xc3E121368a7159402c27b2CE626C368e187f4506';

    console.log(`Granting AUDITOR_ROLE to ${targetAddress}...`);
    console.log(`Using admin wallet: ${wallet.address}`);

    try {
        // 4. Get Role Hashes
        let auditorRoleHash;
        let registryRoleHash;
        try {
            auditorRoleHash = await contract.AUDITOR_ROLE();
            // Try to get REGISTRY_ROLE, or fallback to known hash
            try {
                // Assuming REGISTRY_ROLE is public constant
                // If not in ABI, we use the hash we found: 0xc2979137d1774e40fe2638d355bf7a7b092be4c67f242aad1655e1e27f9df9cc
                registryRoleHash = await contract.REGISTRY_ROLE(); // Attempt to fetch from contract
            } catch (e) {
                console.log('Could not fetch REGISTRY_ROLE constant from contract, using default hash.');
                registryRoleHash = '0xc2979137d1774e40fe2638d355bf7a7b092be4c67f242aad1655e1e27f9df9cc';
            }
        } catch (e) {
            console.log('Could not fetch role constants, using defaults');
            auditorRoleHash = ethers.keccak256(ethers.toUtf8Bytes("AUDITOR_ROLE"));
            registryRoleHash = '0xc2979137d1774e40fe2638d355bf7a7b092be4c67f242aad1655e1e27f9df9cc';
        }

        // 5. Grant AUDITOR_ROLE
        const hasAuditorRole = await contract.hasRole(auditorRoleHash, targetAddress);
        if (!hasAuditorRole) {
            console.log('Granting AUDITOR_ROLE...');
            const tx1 = await contract.grantRole(auditorRoleHash, targetAddress);
            console.log(`Transaction sent for AUDITOR_ROLE: ${tx1.hash}`);
            await tx1.wait();
            console.log('AUDITOR_ROLE granted.');
        } else {
            console.log('Address already has AUDITOR_ROLE.');
        }

        // 6. Grant REGISTRY_ROLE (Required for approveProject)
        const hasRegistryRole = await contract.hasRole(registryRoleHash, targetAddress);
        if (!hasRegistryRole) {
            console.log('Granting REGISTRY_ROLE...');
            const tx2 = await contract.grantRole(registryRoleHash, targetAddress);
            console.log(`Transaction sent for REGISTRY_ROLE: ${tx2.hash}`);
            await tx2.wait();
            console.log('REGISTRY_ROLE granted.');
        } else {
            console.log('Address already has REGISTRY_ROLE.');
        }

    } catch (error) {
        console.error('Error granting role:', error);
        // @ts-ignore
        if (error.code === 'CALL_EXCEPTION') {
            console.error('Transaction reverted. Ensure the wallet has DEFAULT_ADMIN_ROLE.');
        }
    }
}

main();
