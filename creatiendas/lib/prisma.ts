import { PrismaClient } from '@prisma/client';

declare global {
    // Allows TypeScript to recognize the global prisma variable
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ||
    new PrismaClient({
        log: ['query', 'error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}
