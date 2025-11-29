import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting simple seed...');

    const passwordHash = await bcrypt.hash('test123', 10);

    try {
        const user = await prisma.user.create({
            data: {
                name: 'Test Admin',
                email: 'admin@test.com',
                phone: '+573001234567',
                passwordHash,
                role: 'SUPERADMIN'
            }
        });
        console.log('✅ Created user:', user.email);
    } catch (e) {
        console.error('Error creating user:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
