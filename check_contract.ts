
import { ethers } from 'ethers';

const RPC_URL = 'https://sepolia.infura.io/v3/b5832597371f456fbe9020a5cc93f92e'; // Using a public or provided RPC if available, otherwise I'll try a public one.
// Actually, let's use a public RPC for Sepolia to be safe, or the one from the code if I can find it.
// The code uses 'https://sepolia.infura.io/v3/' but doesn't show the key in the snippet (it might be in env).
// I will use a public RPC for this check.
const PUBLIC_RPC = 'https://rpc.sepolia.org';

const ADDRESS = '0xcd0b420f1ab141c0D411E43f23F68d6A80650e90';

async function checkCode() {
    const provider = new ethers.JsonRpcProvider(PUBLIC_RPC);
    console.log(`Checking code at ${ADDRESS} on Sepolia...`);
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
