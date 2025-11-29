import { ethers } from 'ethers';

const CARBON_CREDIT_ABI = [
    'function grantRole(bytes32 role, address account) external',
    'function hasRole(bytes32 role, address account) view returns (bool)',
    'function REGISTRY_ROLE() view returns (bytes32)',
    'function DEFAULT_ADMIN_ROLE() view returns (bytes32)'
];

async function grantRegistryRole() {
    // Configuration - Read from environment variables
    const RPC_URL = process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/a489d1777b30400c846653d2c03de7d2';
    const PRIVATE_KEY = process.env.PRIVATE_KEY; // From command line
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';

    // The wallet address you want to grant REGISTRY_ROLE to
    const REGISTRY_WALLET = process.argv[2];

    if (!REGISTRY_WALLET) {
        console.error('❌ Error: Please provide the registry wallet address as an argument');
        console.log('Usage: PRIVATE_KEY=<key> npx tsx grant_registry_role.ts <WALLET_ADDRESS>');
        process.exit(1);
    }

    if (!PRIVATE_KEY) {
        console.error('❌ Error: PRIVATE_KEY not provided');
        console.log('Usage: PRIVATE_KEY=<your_private_key> npx tsx grant_registry_role.ts <WALLET_ADDRESS>');
        process.exit(1);
    }

    console.log('🔐 Granting REGISTRY_ROLE...');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('Registry Wallet:', REGISTRY_WALLET);
    console.log('');

    try {
        // Connect to network
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        console.log('Admin Wallet:', wallet.address);

        // Connect to contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CARBON_CREDIT_ABI, wallet);

        // Get REGISTRY_ROLE hash
        const REGISTRY_ROLE = await contract.REGISTRY_ROLE();
        console.log('REGISTRY_ROLE hash:', REGISTRY_ROLE);

        // Check if already has role
        const hasRole = await contract.hasRole(REGISTRY_ROLE, REGISTRY_WALLET);

        if (hasRole) {
            console.log('✅ Wallet already has REGISTRY_ROLE!');
            return;
        }

        // Grant role
        console.log('⏳ Sending transaction...');
        const tx = await contract.grantRole(REGISTRY_ROLE, REGISTRY_WALLET);
        console.log('Transaction hash:', tx.hash);

        console.log('⏳ Waiting for confirmation...');
        const receipt = await tx.wait();

        console.log('✅ REGISTRY_ROLE granted successfully!');
        console.log('Block number:', receipt.blockNumber);
        console.log('Gas used:', receipt.gasUsed.toString());

        // Verify
        const hasRoleNow = await contract.hasRole(REGISTRY_ROLE, REGISTRY_WALLET);
        console.log('');
        console.log('Verification:', hasRoleNow ? '✅ Role confirmed' : '❌ Role not found');

    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.code === 'CALL_EXCEPTION') {
            console.log('');
            console.log('💡 Possible reasons:');
            console.log('   - You are not the contract admin/owner');
            console.log('   - The contract address is incorrect');
            console.log('   - The wallet address is invalid');
        }
        process.exit(1);
    }
}

grantRegistryRole();
