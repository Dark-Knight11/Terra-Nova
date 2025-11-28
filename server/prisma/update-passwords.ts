import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = 'Password123';

const companyEmails = [
    'ecocorpglobal@example.com',
    'greenchainltd@example.com',
    'futureenergy@example.com',
    'arctictrust@example.com',
    'riftvalleypower@example.com'
];

async function updatePasswords() {
    console.log('🔐 Updating user passwords...\n');

    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    for (const email of companyEmails) {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            await prisma.user.update({
                where: { email },
                data: { passwordHash }
            });
            console.log(`✓ Updated password for: ${email}`);
        }
    }

    console.log('\n✅ All passwords updated!');
    console.log('\n📧 Login Credentials:');
    console.log('━'.repeat(60));
    console.log('Password for ALL accounts: Password123');
    console.log('━'.repeat(60));
    companyEmails.forEach((email, index) => {
        console.log(`${index + 1}. Email: ${email}`);
    });
    console.log('━'.repeat(60));
}

updatePasswords()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
