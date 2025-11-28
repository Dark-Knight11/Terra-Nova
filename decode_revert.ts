import { ethers } from 'ethers';

const functionSelector = '0x12e4bfab';
const errorRoleHash = '0xc2979137d1774e40fe2638d355bf7a7b092be4c67f242aad1655e1e27f9df9cc';

const knownFunctions = [
    'assignAuditor(uint256,address)',
    'approveProject(uint256)',
    'grantRole(bytes32,address)',
    'submitProject(string,uint8,uint8,string,string,address,string,uint256)'
];

const knownRoles = [
    'AUDITOR_ROLE',
    'REGISTRY_ROLE',
    'DEFAULT_ADMIN_ROLE',
    'COMPANY_ROLE'
];

console.log(`Checking function selector ${functionSelector}...`);
knownFunctions.forEach(func => {
    const hash = ethers.id(func).slice(0, 10);
    console.log(`${func}: ${hash}`);
    if (hash === functionSelector) {
        console.log(`MATCH FOUND: ${func}`);
    }
});

console.log(`\nChecking role hash ${errorRoleHash}...`);
knownRoles.forEach(role => {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(role));
    console.log(`${role}: ${hash}`);
    if (hash.toLowerCase() === errorRoleHash.toLowerCase()) { // Case insensitive check
        console.log(`MATCH FOUND: ${role}`);
    } else if (hash.slice(2).toLowerCase() === errorRoleHash.toLowerCase()) {
        console.log(`MATCH FOUND (no prefix): ${role}`);
    }
});

// Also check default admin role (0x00...00)
if (errorRoleHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
    console.log('MATCH FOUND: DEFAULT_ADMIN_ROLE');
}
