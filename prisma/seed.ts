
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting local seed...');

    // Cleanup - SKIPPED to avoid FK issues and schema mismatch
    // await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('test123', 10);

    try {
        const admin = await prisma.user.upsert({
            where: { email: 'admin1@b2bchat.com' },
            update: {
                passwordHash, // Update password just in case
                role: 'SUPERADMIN'
            },
            create: {
                name: 'Local Admin',
                email: 'admin1@b2bchat.com',
                phone: '+573000000000',
                passwordHash,
                role: 'SUPERADMIN',
                bio: 'Local admin user',
                position: 'Admin',
                industry: 'Tech'
            }
        });
        console.log('✅ Admin user upserted: admin1@b2bchat.com');
    } catch (e) {
        console.error('Error creating admin:', e);
    }

    console.log('✅ Local seed complete. Created admin: admin1@b2bchat.com / test123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
