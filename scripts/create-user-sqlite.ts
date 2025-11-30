import { prisma } from '../src/lib/prisma.ts';
import bcrypt from 'bcryptjs';

async function createUser() {
    const hash = await bcrypt.hash('test123', 10);

    try {
        const user = await prisma.user.upsert({
            where: { phone: '+573100000003' },
            update: {},
            create: {
                name: 'Test User',
                phone: '+573100000003',
                email: 'test3@example.com',
                passwordHash: hash,
                role: 'USUARIO',
                creditBalance: 100
            }
        });
        console.log('User created:', user.id);
    } catch (e) {
        console.error('Error creating user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createUser();
