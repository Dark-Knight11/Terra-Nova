
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking database content...');

    const credits = await prisma.carbonCredit.findMany();
    console.log(`Found ${credits.length} CarbonCredits:`);
    credits.forEach(c => console.log(`- ID: ${c.id}, ProjectID: ${c.projectId}, Title: ${c.title}, Status: ${c.status}`));

    const listings = await prisma.listing.findMany();
    console.log(`\nFound ${listings.length} Listings:`);
    listings.forEach(l => console.log(`- ID: ${l.id}, ListingID: ${l.listingId}, ProjectID: ${l.projectId}, Status: ${l.status}`));

    const trades = await prisma.trade.findMany();
    console.log(`\nFound ${trades.length} Trades`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
