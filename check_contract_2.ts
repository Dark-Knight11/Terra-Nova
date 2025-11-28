
import { ethers } from 'ethers';

const RPC_URL = 'https://ethereum-sepolia.publicnode.com';
const ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';

async function checkCode() {
    console.log(`Connecting to ${RPC_URL}...`);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    console.log(`Checking code at ${ADDRESS}...`);
    try {
        const code = await provider.getCode(ADDRESS);
        console.log(`Code length: ${code.length}`);
        if (code === '0x') {
            console.log('NO CODE FOUND at this address!');
        } else {
            console.log('Contract code found.');
        }
    } catch (error) {
        console.error('Error fetching code:', error);
    }
}

checkCode();
