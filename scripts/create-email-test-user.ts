import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestEmailUser() {
    const testEmail = process.argv[2] || 'test@b2bchat.co';

    console.log(`🔧 Creando usuario de prueba con email: ${testEmail}`);

    // Check if user already exists
    const existing = await prisma.user.findUnique({
        where: { email: testEmail }
    });

    if (existing) {
        console.log(`✅ Usuario ya existe: ${existing.name} (${existing.email})`);
        console.log(`   ID: ${existing.id}`);
        return;
    }

    // Create test user
    const user = await prisma.user.create({
        data: {
            name: 'Test Email Recipient',
            email: testEmail,
            phone: '+573001111111',
            passwordHash: '$2a$10$dummyhash', // Fake hash, can't login
            role: 'USUARIO'
        }
    });

    console.log(`✅ Usuario creado exitosamente:`);
    console.log(`   Nombre: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`\n📧 Ahora puedes enviarle un mensaje desde la UI para probar el email`);
}

createTestEmailUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
