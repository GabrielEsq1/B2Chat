import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
    try {
        console.log('🔧 Creating admin user...');

        const adminEmail = 'admin@b2bchat.com';
        const adminPassword = 'Admin123!'; // Change this after first login
        const adminPhone = '+573026687991'; // Your WhatsApp number

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email:', adminEmail);
            console.log('🔑 Use existing password or reset it');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: 'Admin B2BChat',
                phone: adminPhone,
                role: 'ADMIN', // Set admin role
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
        console.log('🔐 IMPORTANT: Change the password after first login!');
        console.log('');
        console.log('🔗 Login at: https://creatiendasgit1.vercel.app/login');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createAdminUser()
    .then(() => {
        console.log('✅ Script completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Script failed:', error);
        process.exit(1);
    });
