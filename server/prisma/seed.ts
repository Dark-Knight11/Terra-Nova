import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default password for all test users
const DEFAULT_PASSWORD = 'Password123';

// Mock data from frontend
const credits = [
    {
        title: "Amazonian Canopy", type: "REFORESTATION", price: "24.50", score: 98, location: "Brazil",
        image: "linear-gradient(135deg, #1a2a1a, #0f1f0f)",
        company: "EcoCorp Global",
        description: "A large-scale reforestation initiative restoring 50,000 hectares of degraded rainforest in the Amazon basin. This project not only sequesters carbon but also protects critical jaguar habitats and supports local indigenous communities.",
        vintage: "2023",
        volume: "50,000 tCO2e",
        methodology: "VM0007",
        wallet: "0x71C...9A2"
    },
    {
        title: "Nordic Wind Farm", type: "RENEWABLE_ENERGY", price: "18.20", score: 95, location: "Norway",
        image: "linear-gradient(135deg, #1a2a3a, #0f1f2f)",
        company: "GreenChain Ltd",
        description: "Offshore wind farm project in the North Sea generating 500MW of clean energy. Replaces fossil-fuel based grid power and utilizes advanced turbine technology to minimize marine impact.",
        vintage: "2022",
        volume: "120,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x3B2...1F4"
    },
    {
        title: "Sahara Solar Array", type: "SOLAR", price: "21.00", score: 92, location: "Morocco",
        image: "linear-gradient(135deg, #2a201a, #1f150f)",
        company: "Future Energy",
        description: "Concentrated solar power plant utilizing mirror technology to provide 24/7 renewable baseload power. Reduces dependency on imported coal.",
        vintage: "2023",
        volume: "85,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x9X1...8P0"
    },
    {
        title: "Mangrove Shield", type: "BLUE_CARBON", price: "32.00", score: 99, location: "Indonesia",
        image: "linear-gradient(135deg, #1a2a2a, #0f1f1f)",
        company: "EcoCorp Global",
        description: "Restoration of coastal mangrove ecosystems. Mangroves sequester carbon up to 4x faster than tropical rainforests and provide essential storm surge protection.",
        vintage: "2024",
        volume: "15,000 tCO2e",
        methodology: "VM0033",
        wallet: "0x71C...9A2"
    },
    {
        title: "Alaskan Carbon Sink", type: "PRESERVATION", price: "28.50", score: 97, location: "USA",
        image: "linear-gradient(135deg, #1a2a2a, #2f3f3f)",
        company: "Arctic Trust",
        description: "Forest preservation project in the Alaskan interior preventing logging of old-growth boreal forests.",
        vintage: "2023",
        volume: "40,000 tCO2e",
        methodology: "VM0015",
        wallet: "0x2A5...7K9"
    },
    {
        title: "Kenya Geothermal", type: "GEOTHERMAL", price: "19.75", score: 94, location: "Kenya",
        image: "linear-gradient(135deg, #2a1a1a, #3f2f1f)",
        company: "Rift Valley Power",
        description: "Geothermal expansion project harnessing the Great Rift Valley's heat to provide stable, clean electricity to the national grid.",
        vintage: "2022",
        volume: "60,000 tCO2e",
        methodology: "ACM0002",
        wallet: "0x8L4...2M1"
    },
];

const wallets = [
    { address: "0x71C...9A2", entity: "EcoCorp Global", score: 98, volume: "125k", status: "VERIFIED" },
    { address: "0x3B2...1F4", entity: "GreenChain Ltd", score: 94, volume: "84k", status: "VERIFIED" },
    { address: "0x9X1...8P0", entity: "Future Energy", score: 82, volume: "12k", status: "PENDING" },
];

const proposals = [
    { title: "Adjust Transaction Fee to 1.5%", status: "ACTIVE", votesFor: 65, votesAgainst: 35, daysUntilEnd: 2 },
    { title: "Add 'Blue Carbon' Category", status: "PASSED", votesFor: 88, votesAgainst: 12, daysUntilEnd: null },
    { title: "Whitelist 'EcoCorp' Verifier", status: "REJECTED", votesFor: 42, votesAgainst: 58, daysUntilEnd: null },
];

async function main() {
    console.log('🌱 Starting database seeding...');

    // First, create a test company for each unique company name
    const companyMap: { [key: string]: any } = {};

    // Get unique company names
    const uniqueCompanies = Array.from(new Set(credits.map(c => c.company)));

    console.log('\n📦 Creating companies...');
    for (const companyName of uniqueCompanies) {
        // Check if company already exists
        let company = await prisma.company.findFirst({
            where: { name: companyName }
        });

        if (!company) {
            // Hash the default password
            const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

            // Create user first
            const user = await prisma.user.create({
                data: {
                    email: `${companyName.toLowerCase().replace(/\s+/g, '')}@example.com`,
                    passwordHash,
                    role: 'COMPANY',
                    isVerified: true
                }
            });

            // Create company
            company = await prisma.company.create({
                data: {
                    userId: user.id,
                    name: companyName,
                    description: `${companyName} - Carbon credit provider`,
                    verificationStatus: 'VERIFIED',
                    country: 'Global',
                    industry: 'Renewable Energy'
                }
            });

            console.log(`✓ Created company: ${companyName}`);
        } else {
            console.log(`✓ Company already exists: ${companyName}`);
        }

        companyMap[companyName] = company;
    }

    // Seed carbon credits
    console.log('\n🌍 Seeding carbon credits...');
    for (const credit of credits) {
        const company = companyMap[credit.company];

        const existingCredit = await prisma.carbonCredit.findFirst({
            where: {
                title: credit.title,
                companyId: company.id
            }
        });

        if (!existingCredit) {
            await prisma.carbonCredit.create({
                data: {
                    title: credit.title,
                    type: credit.type as any,
                    price: parseFloat(credit.price),
                    score: credit.score,
                    location: credit.location,
                    image: credit.image,
                    companyId: company.id,
                    companyName: credit.company,
                    description: credit.description,
                    vintage: credit.vintage,
                    volume: credit.volume,
                    methodology: credit.methodology,
                    walletAddress: credit.wallet
                }
            });
            console.log(`✓ Created credit: ${credit.title}`);
        } else {
            console.log(`✓ Credit already exists: ${credit.title}`);
        }
    }

    // Seed wallets
    console.log('\n💰 Seeding wallets...');
    for (const wallet of wallets) {
        const existingWallet = await prisma.wallet.findUnique({
            where: { walletAddress: wallet.address }
        });

        if (!existingWallet) {
            await prisma.wallet.create({
                data: {
                    walletAddress: wallet.address,
                    entity: wallet.entity,
                    score: wallet.score,
                    volume: wallet.volume,
                    status: wallet.status as any
                }
            });
            console.log(`✓ Created wallet: ${wallet.address}`);
        } else {
            console.log(`✓ Wallet already exists: ${wallet.address}`);
        }
    }

    // Seed proposals
    console.log('\n🗳️  Seeding proposals...');
    for (const proposal of proposals) {
        const existingProposal = await prisma.proposal.findFirst({
            where: { title: proposal.title }
        });

        if (!existingProposal) {
            const endDate = proposal.daysUntilEnd
                ? new Date(Date.now() + proposal.daysUntilEnd * 24 * 60 * 60 * 1000)
                : null;

            await prisma.proposal.create({
                data: {
                    title: proposal.title,
                    status: proposal.status as any,
                    votesFor: proposal.votesFor,
                    votesAgainst: proposal.votesAgainst,
                    endDate
                }
            });
            console.log(`✓ Created proposal: ${proposal.title}`);
        } else {
            console.log(`✓ Proposal already exists: ${proposal.title}`);
        }
    }

    console.log('\n✅ Seeding completed successfully!');
    console.log('\n📧 Login Credentials for Test Accounts:');
    console.log('━'.repeat(60));
    console.log('Password for ALL accounts: Password123');
    console.log('━'.repeat(60));
    uniqueCompanies.forEach((companyName, index) => {
        const email = `${companyName.toLowerCase().replace(/\s+/g, '')}@example.com`;
        console.log(`${index + 1}. ${companyName}`);
        console.log(`   Email: ${email}`);
    });
    console.log('━'.repeat(60));
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
