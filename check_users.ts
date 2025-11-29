
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log(`Total users: ${userCount}`);

        const users = await prisma.user.findMany({
            take: 10,
            select: {
                email: true,
                role: true,
                passwordHash: true // Just to see if it's set, not the actual password
            }
        });

        console.log('Sample users:');
        users.forEach(u => {
            console.log(`- ${u.email} (${u.role})`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
