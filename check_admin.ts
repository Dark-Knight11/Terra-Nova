import { ethers } from 'ethers';

const TOKEN_ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';
const SEPOLIA_RPC = 'https://ethereum-sepolia-rpc.publicnode.com';
const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';

// Address from the user's failed transaction
const USER_ADDRESS = '0xc3E121368a7159402c27b2CE626C368e187f4506';

const ABI = [
    'function hasRole(bytes32 role, address account) external view returns (bool)'
];

async function main() {
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(TOKEN_ADDRESS, ABI, provider);

    console.log(`Checking DEFAULT_ADMIN_ROLE for ${USER_ADDRESS}...`);

    try {
        const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, USER_ADDRESS);
        console.log(`Is Admin: ${isAdmin}`);

        if (!isAdmin) {
            console.log('\nCRITICAL: This wallet is NOT the admin. It cannot grant roles.');
            console.log('You must use the Private Key of the wallet that DEPLOYED the contract.');
        } else {
            console.log('\nThis wallet IS the admin. The previous error might be related to something else.');
        }
    } catch (error) {
        console.error('Error checking role:', error);
    }
}

main();
