
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check collision for phone
    const conflictingUser = await prisma.user.findUnique({
        where: { phone: '+573100000001' },
    });

    if (conflictingUser && conflictingUser.email !== 'superadmin@b2bchat.com') {
        console.log(`⚠️ User ${conflictingUser.email} already has phone +573100000001. Updating conflicting user to temp phone...`);
        await prisma.user.update({
            where: { id: conflictingUser.id },
            data: { phone: `+573100000001_OLD_${Date.now()}` } // Frees up the phone number
        });
    }

    // 1. Create or Update Super Admin
    const data = {
        email: 'superadmin@b2bchat.com',
        name: 'Super Admin Principal',
        passwordHash: hashedPassword,
        role: 'SUPERADMIN',
        phone: '+573100000001',
        position: 'CEO',
        industry: 'Technology'
    };

    const superAdmin = await prisma.user.upsert({
        where: { email: data.email },
        update: { passwordHash: hashedPassword, role: 'SUPERADMIN', phone: '+573100000001' },
        create: data,
    });

    console.log(`✅ Upserted Super Admin: ${superAdmin.email}`);

    // 2. Reset Admin password
    const adminEmail = 'admin@b2bchat.com';
    try {
        const admin = await prisma.user.update({
            where: { email: adminEmail },
            data: { passwordHash: hashedPassword },
        });
        console.log(`✅ Reset password for: ${admin.email}`);
    } catch (e) {
        if (e.code === 'P2025') {
            // Check collision for admin phone
            const conflictingAdmin = await prisma.user.findUnique({
                where: { phone: '+573100000003' },
            });

            if (conflictingAdmin) {
                await prisma.user.update({
                    where: { id: conflictingAdmin.id },
                    data: { phone: `+573100000003_OLD_${Date.now()}` }
                });
            }

            await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: 'Admin User',
                    passwordHash: hashedPassword,
                    role: 'ADMIN_EMPRESA',
                    phone: '+573100000003'
                }
            });
            console.log(`✅ Created ${adminEmail}`);
        } else {
            console.error(e);
        }
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
