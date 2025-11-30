const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
    console.log('Creating user...');
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
