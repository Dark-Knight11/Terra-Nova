import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for Node.js environment
neonConfig.webSocketConstructor = ws;

// Create Prisma client (singleton)
const prismaClientSingleton = () => {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
}

// Create Neon serverless pool (for edge/serverless functions)
const connectionString = process.env.DATABASE_URL;
export const neonPool = connectionString ? new Pool({ connectionString }) : null;

// Helper type for transaction client
type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

// Execute a callback with RLS context set
export async function withRLS<T>(
    userId: string,
    role: string,
    callback: (tx: TxClient) => Promise<T>
): Promise<T> {
    return await prisma.$transaction(async (tx) => {
        // Set the RLS context for this transaction
        await tx.$executeRawUnsafe(`
            SELECT set_config('request.jwt.claims', 
                '${JSON.stringify({ userId, role })}', 
                true
            )
        `);

        // Execute the callback with the transaction client
        return await callback(tx as TxClient);
    });
}

// Graceful shutdown
async function gracefulShutdown() {
    await prisma.$disconnect();
    if (neonPool) {
        await neonPool.end();
    }
}

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default prisma;
