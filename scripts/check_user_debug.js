
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@b2bchat.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log(`User found: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Password Hash starts with: ${user.passwordHash ? user.passwordHash.substring(0, 10) : 'NO HASH'}`);
    } else {
        console.log(`User ${email} NOT found.`);
    }

    const admin = await prisma.user.findUnique({
        where: { email: 'admin@b2bchat.com' },
    });
    if (admin) {
        console.log(`User found: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
    } else {
        console.log(`User admin@b2bchat.com NOT found.`);
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
