import { ethers } from 'ethers';

const errorSelector = '0xe2517d3f';

const commonErrors = [
    'InvalidProjectStatus()',
    'ProjectNotUnderAudit()',
    'CallerNotAuditor()',
    'AccessControlUnauthorizedAccount(address,bytes32)',
    'NotProjectAuditor()',
    'ProjectAlreadyApproved()',
    'InvalidTransition()'
];

console.log(`Checking selector ${errorSelector}...`);

commonErrors.forEach(err => {
    const hash = ethers.id(err).slice(0, 10);
    console.log(`${err}: ${hash}`);
    if (hash === errorSelector) {
        console.log(`MATCH FOUND: ${err}`);
    }
});
