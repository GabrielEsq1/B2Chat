
import { PrismaClient, ConnectionStatus, ConversationType, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting comprehensive seed...');

    // 1. Clean up (Optional - be careful in prod)
    // await prisma.message.deleteMany();
    // await prisma.conversation.deleteMany();
    // await prisma.adCreative.deleteMany();
    // await prisma.adCampaign.deleteMany();
    // await prisma.company.deleteMany();
    // await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    // ==========================================
    // 2. Create Super Admin
    // ==========================================
    const admin = await prisma.user.upsert({
        where: { email: 'admin@b2bchat.com' },
        update: { passwordHash, role: 'SUPERADMIN' },
        create: {
            name: 'Super Admin',
            email: 'admin@b2bchat.com',
            phone: '+573000000000',
            passwordHash,
            role: 'SUPERADMIN',
            bio: 'System Administrator',
            position: 'Admin',
            industry: 'Technology'
        }
    });
    console.log('✅ Super Admin created/updated');

    // ==========================================
    // 3. Create Test Users (from LISTO_PARA_LANZAR.md)
    // ==========================================
    const testUsersData = [
        { name: 'Carlos Rodríguez', phone: '+573001234567', position: 'CEO', industry: 'Tecnología', email: 'carlos@test.com' },
        { name: 'María González', phone: '+573009876543', position: 'Directora Marketing', industry: 'Marketing Digital', email: 'maria@test.com' },
        { name: 'Juan Pérez', phone: '+573005551234', position: 'Gerente Operaciones', industry: 'Logística', email: 'juan@test.com' },
        { name: 'Ana Martínez', phone: '+573007778888', position: 'Consultora Senior', industry: 'Consultoría', email: 'ana@test.com' },
        { name: 'Luis Hernández', phone: '+573003334444', position: 'Director Financiero', industry: 'Finanzas', email: 'luis@test.com' },
        { name: 'Laura Sánchez', phone: '+573002221111', position: 'CEO E-commerce', industry: 'E-commerce', email: 'laura@test.com' },
        { name: 'Diego Torres', phone: '+573006665555', position: 'CTO', industry: 'Software', email: 'diego@test.com' },
        { name: 'Camila Ruiz', phone: '+573004443333', position: 'Directora RRHH', industry: 'RRHH', email: 'camila@test.com' },
        { name: 'Andrés López', phone: '+573008887777', position: 'Abogado', industry: 'Legal', email: 'andres@test.com' },
        { name: 'Valentina Castro', phone: '+573001112222', position: 'Diseñadora UX/UI', industry: 'Diseño', email: 'valentina@test.com' },
        { name: 'Santiago Vargas', phone: '+573005554444', position: 'Director Comercial', industry: 'Ventas', email: 'santiago@test.com' },
        { name: 'Isabella Moreno', phone: '+573009998888', position: 'Content Manager', industry: 'Marketing', email: 'isabella@test.com' },
        { name: 'Mateo Ramírez', phone: '+573003332222', position: 'Data Scientist', industry: 'Data Science', email: 'mateo@test.com' },
        { name: 'Sofía Jiménez', phone: '+573007776666', position: 'Event Manager', industry: 'Eventos', email: 'sofia@test.com' },
        { name: 'Daniel Ortiz', phone: '+573002223333', position: 'Security Officer', industry: 'Ciberseguridad', email: 'daniel@test.com' }
    ];

    const createdUsers = [];
    for (const u of testUsersData) {
        const user = await prisma.user.upsert({
            where: { phone: u.phone },
            update: { passwordHash },
            create: {
                ...u,
                passwordHash,
                role: 'USUARIO',
                bio: `${u.position} en ${u.industry}`,
                creditBalance: 100 // Give them some credits
            }
        });
        createdUsers.push(user);
        console.log(`✅ User created: ${u.name}`);
    }

    // ==========================================
    // 4. Create Companies & Assign Admins
    // ==========================================
    const companiesData = [
        {
            name: "MADOCO XXI SAS BIC",
            description: "Expertos en ropa de seguridad industrial y dotaciones.",
            industry: "Textil",
            adminEmail: "admin@madoco.com",
            phone: "+573000000001"
        },
        {
            name: "Tech Solutions Ltd",
            description: "Desarrollo de software y consultoría TI.",
            industry: "Tecnología",
            adminEmail: "admin@tech.com",
            phone: "+573000000002"
        },
        {
            name: "Constructora Global",
            description: "Proyectos de infraestructura y vivienda.",
            industry: "Construcción",
            adminEmail: "admin@const.com",
            phone: "+573000000003"
        }
    ];

    for (const c of companiesData) {
        // Create Company Admin
        const adminUser = await prisma.user.upsert({
            where: { email: c.adminEmail },
            update: { passwordHash, role: 'ADMIN_EMPRESA' },
            create: {
                name: `Admin ${c.name}`,
                email: c.adminEmail,
                phone: c.phone,
                passwordHash,
                role: 'ADMIN_EMPRESA',
                position: 'Company Admin',
                industry: c.industry
            }
        });

        // Create Company
        const company = await prisma.company.create({
            data: {
                name: c.name,
                users: { connect: { id: adminUser.id } }
            }
        });

        // Update user with companyId
        await prisma.user.update({
            where: { id: adminUser.id },
            data: { companyId: company.id }
        });

        console.log(`✅ Company created: ${c.name}`);

        // Create Ads for this company
        if (c.name === "MADOCO XXI SAS BIC") {
            const campaign = await prisma.adCampaign.create({
                data: {
                    userId: adminUser.id,
                    companyId: company.id,
                    name: 'Seguridad Industrial 2025',
                    objective: 'SALES',
                    status: 'ACTIVE',
                    dailyBudget: 50,
                    totalBudget: 1500,
                    durationDays: 30,
                    creativeType: 'IMAGE',
                    startDate: new Date(),
                }
            });

            await prisma.adCreative.create({
                data: {
                    campaignId: campaign.id,
                    title: 'Dotación Industrial Premium',
                    description: 'La mejor ropa de seguridad para tu empresa. Certificada y duradera.',
                    imageUrl: 'https://images.unsplash.com/photo-1617957743097-0d20d5787f66?w=800&q=80', // Industrial safety image
                    destinationUrl: 'https://madoco.com',
                    ctaLabel: 'Cotizar Ahora',
                    isActive: true,
                    type: 'IMAGE'
                }
            });
            console.log(`✅ Ad created for: ${c.name}`);
        }
    }

    // ==========================================
    // 5. Create Bots
    // ==========================================
    const bots = [
        {
            name: 'Sofia AI',
            email: 'sofia@b2bchat.ai',
            phone: '+573100000001',
            isBot: true,
            botPersonality: 'BUSINESS_ADVISOR',
            position: 'Business Advisor',
            industry: 'Consulting'
        },
        {
            name: 'Carlos News',
            email: 'carlos@b2bchat.ai',
            phone: '+573100000002',
            isBot: true,
            botPersonality: 'NEWS_BOT',
            position: 'News Analyst',
            industry: 'Media'
        }
    ];

    for (const b of bots) {
        await prisma.user.upsert({
            where: { email: b.email },
            update: { passwordHash, isBot: true, botPersonality: b.botPersonality },
            create: {
                name: b.name,
                email: b.email,
                phone: b.phone,
                passwordHash,
                isBot: b.isBot,
                botPersonality: b.botPersonality,
                role: 'USUARIO',
                bio: 'AI Assistant',
                position: b.position,
                industry: b.industry
            }
        });
        console.log(`✅ Bot created: ${b.name}`);
    }

    // ==========================================
    // 6. Create Conversations (30+)
    // ==========================================
    // Randomly connect users and create conversations
    const allUsers = await prisma.user.findMany({ where: { isBot: false } });

    let convCount = 0;
    for (let i = 0; i < allUsers.length; i++) {
        for (let j = i + 1; j < allUsers.length; j++) {
            if (convCount >= 30) break;

            const userA = allUsers[i];
            const userB = allUsers[j];

            // Create Conversation
            const conv = await prisma.conversation.create({
                data: {
                    type: 'USER_USER',
                    userAId: userA.id,
                    userBId: userB.id,
                }
            });

            // Add some messages
            await prisma.message.create({
                data: {
                    conversationId: conv.id,
                    senderUserId: userA.id,
                    text: `Hola ${userB.name}, ¿cómo estás?`
                }
            });
            await prisma.message.create({
                data: {
                    conversationId: conv.id,
                    senderUserId: userB.id,
                    text: `Hola ${userA.name}, todo bien. ¿Y tú?`
                }
            });

            convCount++;
        }
    }
    console.log(`✅ Created ${convCount} conversations`);

    console.log('✨ Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
