import { PrismaClient } from '../node_modules/@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
    try {
        console.log('🔄 Creating test users...');

        // Hash password
        const passwordHash = await bcrypt.hash('Test123!', 10);

        // Create Company 1: TechCorp Solutions
        let company1 = await prisma.company.findFirst({
            where: { name: 'TechCorp Solutions' }
        });
        if (!company1) {
            company1 = await prisma.company.create({
                data: { name: 'TechCorp Solutions' }
            });
        }
        console.log('✅ Created/Found company:', company1.name);

        // Create Company 2: InnovateTech Colombia
        let company2 = await prisma.company.findFirst({
            where: { name: 'InnovateTech Colombia' }
        });
        if (!company2) {
            company2 = await prisma.company.create({
                data: { name: 'InnovateTech Colombia' }
            });
        }
        console.log('✅ Created/Found company:', company2.name);

        // Create User 1: Carlos Mendoza (TechCorp)
        const user1 = await prisma.user.upsert({
            where: { phone: '+573001234567' },
            update: {
                name: 'Carlos Mendoza',
                passwordHash,
                companyId: company1.id,
                role: 'USUARIO',
            },
            create: {
                name: 'Carlos Mendoza',
                phone: '+573001234567',
                email: 'carlos@techcorp.com',
                passwordHash,
                companyId: company1.id,
                role: 'USUARIO',
            }
        });
        console.log('✅ Created user:', user1.name, user1.phone);

        // Create User 2: María Rodríguez (InnovateTech)
        const user2 = await prisma.user.upsert({
            where: { phone: '+573007654321' },
            update: {
                name: 'María Rodríguez',
                passwordHash,
                companyId: company2.id,
                role: 'USUARIO',
            },
            create: {
                name: 'María Rodríguez',
                phone: '+573007654321',
                email: 'maria@innovatetech.co',
                passwordHash,
                companyId: company2.id,
                role: 'USUARIO',
            }
        });
        console.log('✅ Created user:', user2.name, user2.phone);

        console.log('\n🎉 Test users created successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('User 1 (Carlos):');
        console.log('  Phone: +573001234567');
        console.log('  Password: Test123!');
        console.log('  Company: TechCorp Solutions');
        console.log('\nUser 2 (María):');
        console.log('  Phone: +573007654321');
        console.log('  Password: Test123!');
        console.log('  Company: InnovateTech Colombia');

    } catch (error) {
        console.error('❌ Error creating test users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestUsers();
