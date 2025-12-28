import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔧 Cleaning and creating admin user...');

        const adminEmail = 'admin@b2bchat.com';
        const adminPassword = 'Admin123!';
        const adminPhone = '+573026687991';

        // 1. Delete any existing user with that email OR phone to avoid conflicts
        console.log(`🧹 Checking for conflicts with ${adminEmail} or ${adminPhone}...`);

        await prisma.user.deleteMany({
            where: {
                OR: [
                    { email: adminEmail },
                    { phone: adminPhone }
                ]
            }
        });

        console.log('✨ Cleanup complete.');

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // 3. Create fresh admin user
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                passwordHash: hashedPassword,
                name: 'Admin B2BChat',
                phone: adminPhone,
                role: 'ADMIN',
                isBot: false,
                position: 'Administrator',
                bio: 'Administrador principal de B2BChat',
                industry: 'Tecnología',
                avatar: '👑',
                profilePicture: 'https://res.cloudinary.com/dg2suxdit/image/upload/v1/b2bchat/admin-avatar.png',
            }
        });

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📧 Email:', adminEmail);
        console.log('🔑 Password:', adminPassword);
        console.log('📱 Phone:', adminPhone);
        console.log('👤 User ID:', admin.id);
        console.log('');
        console.log('🔐 IMPORTANT: Use these credentials to login.');

    } catch (error) {
        console.error('❌ Error in admin setup:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser()
    .then(() => {
        console.log('✅ Setup completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });
