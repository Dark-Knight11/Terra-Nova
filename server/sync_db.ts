
import { PrismaClient } from '@prisma/client';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

// Hardcoded for now based on user logs: 2 projects exist on chain.
// We will assume they map to the first 2 credits in DB for demo purposes.
// In reality, the indexer should do this based on name matching or creation events.

async function main() {
    console.log('Syncing on-chain projects to DB...');

    const credits = await prisma.carbonCredit.findMany({
        orderBy: { createdAt: 'asc' },
        take: 2
    });

    if (credits.length < 2) {
        console.log('Not enough credits in DB to sync');
        return;
    }

    // Update Project 1
    await prisma.carbonCredit.update({
        where: { id: credits[0].id },
        data: {
            projectId: '1',
            status: 'APPROVED'
        }
    });
    console.log(`Updated ${credits[0].title} to Project ID 1`);

    // Update Project 2
    await prisma.carbonCredit.update({
        where: { id: credits[1].id },
        data: {
            projectId: '2',
            status: 'APPROVED'
        }
    });
    console.log(`Updated ${credits[1].title} to Project ID 2`);

    // Create Mock Listings for them so they show up in Marketplace
    // Listing 1 for Project 1
    await prisma.listing.create({
        data: {
            listingId: '1',
            projectId: '1',
            seller: '0x9f5BEa2E776DCc71cB209fb10A617563f2a6d632', // User wallet from logs
            amount: '1000',
            price: ethers.parseEther('0.05').toString(), // 0.05 ETH
            status: 'ACTIVE'
        }
    });
    console.log('Created Listing 1 for Project 1');

    // Listing 2 for Project 2
    await prisma.listing.create({
        data: {
            listingId: '2',
            projectId: '2',
            seller: '0x9f5BEa2E776DCc71cB209fb10A617563f2a6d632',
            amount: '500',
            price: ethers.parseEther('0.08').toString(), // 0.08 ETH
            status: 'ACTIVE'
        }
    });
    console.log('Created Listing 2 for Project 2');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
