import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Quick seeding...');

    const passwordHash = await bcrypt.hash('password123', 10);

    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            phone: '+573001234567',
            email: 'test@example.com',
            passwordHash,
            role: 'USUARIO'
        }
    });

    console.log('✅ Created user:', user.phone);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
