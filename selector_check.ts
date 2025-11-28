
import { id } from 'ethers';

const functions = [
    'setApprovalForAll(address,bool)',
    'isApprovedForAll(address,address)',
    'balanceOf(address,uint256)',
    'balanceOf(address)',
    'safeTransferFrom(address,address,uint256,uint256,bytes)',
    'submitProject(string,uint8,uint8,string,string,address,string,uint256)',
    'getProjectBasicInfo(uint256)',
    'getProjectDetailsStruct(uint256)',
    'getProjectCredits(uint256)',
    'getDeveloperProjects(address)',
    'getTotalProjects()',
    'projectExists(uint256)',
    'mintCredits(uint256,uint256,string)',
    'approveProject(uint256)',
    'assignAuditor(uint256,address)'
];

console.log("Searching for selector 0x812739a2...");

functions.forEach(sig => {
    const selector = id(sig).slice(0, 10);
    console.log(`${selector} : ${sig}`);
    if (selector === '0x812739a2') {
        console.log(`MATCH FOUND: ${sig}`);
    }
});
