import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Helper functions for generating realistic data
const firstNames = [
    "Carlos", "María", "Juan", "Ana", "Luis", "Sofia", "Diego", "Laura", "Miguel", "Carmen",
    "José", "Patricia", "Francisco", "Andrea", "Antonio", "Valentina", "Manuel", "Isabella",
    "David", "Camila", "Jorge", "Daniela", "Pedro", "Gabriela", "Roberto", "Natalia",
    "Fernando", "Paula", "Alberto", "Diana", "Alejandro", "Carolina", "Ricardo", "Mariana",
    "Javier", "Claudia", "Sergio", "Monica", "Raul", "Silvia", "Eduardo", "Beatriz",
    "Guillermo", "Teresa", "Pablo", "Rosa", "Rafael", "Elena", "Andres", "Lucia",
    "Oscar", "Cristina", "Felipe", "Adriana", "Gustavo", "Veronica", "Ernesto", "Angela",
    "Hector", "Sandra", "Enrique", "Paola", "Victor", "Cecilia", "Arturo", "Martha"
];

const lastNames = [
    "García", "Rodríguez", "Martínez", "López", "González", "Hernández", "Pérez", "Sánchez",
    "Ramírez", "Torres", "Flores", "Rivera", "Gómez", "Díaz", "Cruz", "Reyes", "Morales",
    "Jiménez", "Romero", "Ruiz", "Álvarez", "Castillo", "Ortiz", "Mendoza", "Vargas",
    "Castro", "Ramos", "Vega", "Guerrero", "Medina", "Campos", "Ríos", "Chávez", "Herrera",
    "Aguilar", "León", "Gutiérrez", "Salazar", "Domínguez", "Estrada", "Vázquez", "Moreno"
];

const industries = [
    "Tecnología", "Marketing", "Finanzas", "Salud", "Manufactura", "Retail", "Educación",
    "Consultoría", "Logística", "Telecomunicaciones", "Energía", "Construcción", "Turismo",
    "Alimentación", "Farmacéutica", "Automotriz", "Textil", "Comercio", "Servicios", "TI"
];

const positions = [
    "CEO", "CTO", "CFO", "COO", "CMO", "Gerente General", "Director de Operaciones",
    "Director de Marketing", "Director de Ventas", "Director de RRHH", "Gerente de Proyecto",
    "Gerente de Producto", "Gerente de TI", "Consultor Senior", "Analista de Negocios",
    "Desarrollador Senior", "Diseñador UX", "Especialista en Marketing", "Contador",
    "Abogado Corporativo", "Ingeniero", "Arquitecto de Soluciones", "Product Manager"
];

const botPersonalities = [
    { type: "BUSINESS_ADVISOR", name: "Asesora de Negocios", emoji: "🎯", desc: "Te ayudo con estrategias, análisis de mercado y decisiones empresariales" },
    { type: "NEWS_BOT", name: "Noticias B2B", emoji: "📰", desc: "Te mantengo informado sobre tendencias, noticias de industria y novedades del mercado" },
    { type: "TASK_ASSISTANT", name: "Asistente Virtual", emoji: "✅", desc: "Te ayudo con tareas, cálculos, recordatorios y organización" },
    { type: "INDUSTRY_EXPERT", name: "Experto Industrial", emoji: "📊", desc: "Análisis profundo de sectores, competencia y oportunidades de mercado" },
    { type: "SALES_COACH", name: "Coach de Ventas", emoji: "💼", desc: "Mejora tus habilidades de venta B2B y cierre de negocios" },
    { type: "TECH_SUPPORT", name: "Soporte Técnico", emoji: "🔧", desc: "Ayuda con tecnología, software y soluciones digitales" },
    { type: "HR_ASSISTANT", name: "Asistente de RRHH", emoji: "👥", desc: "Consejos sobre gestión de talento, reclutamiento y cultura empresarial" },
    { type: "NETWORKING_COACH", name: "Coach de Networking", emoji: "🤝", desc: "Charlemos de negocios, conexiones y oportunidades de colaboración" },
    { type: "FINANCE_ADVISOR", name: "Asesor Financiero", emoji: "💰", desc: "Gestión financiera, inversiones y optimización de costos" },
    { type: "MARKETING_GURU", name: "Gurú de Marketing", emoji: "📱", desc: "Estrategias de marketing digital, SEO, redes sociales y branding" }
];

function getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateName(): string {
    return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
}

function generateEmail(name: string, index: number): string {
    const cleanName = name.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, ".");
    return `${cleanName}${index}@empresa.co`;
}

function generatePhone(index: number): string {
    const basePhone = 3000000000;
    return `+57${basePhone + index}`;
}

function generateBio(name: string, position: string, industry: string): string {
    const templates = [
        `Profesional en ${industry} con más de 10 años de experiencia. Especializado en ${position}.`,
        `${position} apasionado por la innovación y el crecimiento empresarial en ${industry}.`,
        `Experto en ${industry}. Busco crear conexiones B2B significativas y oportunidades de colaboración.`,
        `Líder en ${industry} enfocado en transformación digital y crecimiento sostenible.`,
        `${position} con experiencia internacional. Apasionado por ${industry} y las nuevas tecnologías.`
    ];
    return getRandomItem(templates);
}

export async function GET() {
    try {
        console.log("🌱 Starting comprehensive database seed...");

        // Clean database before seeding
        console.log("🧹 Cleaning existing data...");
        await prisma.message.deleteMany({});
        await prisma.conversation.deleteMany({});
        await prisma.friendRequest.deleteMany({});
        await prisma.groupMember.deleteMany({});
        await prisma.group.deleteMany({});
        // await prisma.adCreative.deleteMany({});
        // await prisma.adCampaign.deleteMany({});
        await prisma.subscription.deleteMany({});
        await prisma.user.deleteMany({});
        console.log("✅ Database cleaned successfully");

        const testPassword = await bcrypt.hash("test123", 10);

        // ============================================
        // 1. CREATE 5 ADMIN USERS
        // ============================================
        console.log("👑 Creating admin users...");
        const admins = await Promise.all([
            prisma.user.create({
                data: {
                    name: "Super Admin Principal",
                    email: "superadmin@b2bchat.com",
                    phone: "+573100000001",
                    passwordHash: testPassword,
                    role: "SUPERADMIN",
                    bio: "Administrador principal del sistema B2BChat",
                    position: "Super Administrator",
                    industry: "Tecnología"
                }
            }),
            prisma.user.create({
                data: {
                    name: "Super Admin Secundario",
                    email: "superadmin2@b2bchat.com",
                    phone: "+573100000002",
                    passwordHash: testPassword,
                    role: "SUPERADMIN",
                    bio: "Administrador secundario del sistema",
                    position: "Super Administrator",
                    industry: "Tecnología"
                }
            }),
            prisma.user.create({
                data: {
                    name: "Admin Empresa Uno",
                    email: "admin1@b2bchat.com",
                    phone: "+573100000003",
                    passwordHash: testPassword,
                    role: "ADMIN_EMPRESA",
                    bio: "Administrador de empresa con acceso a campañas y gestión",
                    position: "Company Admin",
                    industry: "Marketing"
                }
            }),
            prisma.user.create({
                data: {
                    name: "Admin Empresa Dos",
                    email: "admin2@b2bchat.com",
                    phone: "+573100000004",
                    passwordHash: testPassword,
                    role: "ADMIN_EMPRESA",
                    bio: "Administrador de empresa con gestión de anuncios",
                    position: "Company Admin",
                    industry: "Ventas"
                }
            }),
            prisma.user.create({
                data: {
                    name: "Admin Empresa Tres",
                    email: "admin3@b2bchat.com",
                    phone: "+573100000005",
                    passwordHash: testPassword,
                    role: "ADMIN_EMPRESA",
                    bio: "Administrador de empresa para gestión de campañas",
                    position: "Company Admin",
                    industry: "Consultoría"
                }
            })
        ]);

        // ============================================
        // 2. CREATE 5 AI BOTS (Reduced from 50)
        // ============================================
        console.log("🤖 Creating AI bots...");
        const bots: any[] = [];

        // Create 10 AI bots (1 of each personality)
        for (let i = 0; i < 10; i++) {
            const personality = botPersonalities[i % botPersonalities.length];
            const botNumber = Math.floor(i / botPersonalities.length) + 1;
            const botName = botNumber > 1 ? `${personality.name} ${botNumber}` : personality.name;

            const bot = await prisma.user.create({
                data: {
                    name: `${botName}`,
                    email: `bot${i + 1}@b2bchat.bot`,
                    phone: `+5732${String(i + 1).padStart(8, '0')}`,
                    passwordHash: testPassword,
                    role: "USUARIO",
                    isBot: true,
                    botPersonality: personality.type,
                    bio: `🤖 ${personality.desc}`,
                    position: `${personality.name} Bot`,
                    industry: "Inteligencia Artificial",
                    avatar: personality.emoji
                }
            });
            bots.push(bot);
        }

        // ============================================
        // 3. CREATE 30 REGULAR USERS (Good for demo)
        // ============================================
        console.log("👥 Creating regular users...");
        const users: any[] = [];

        for (let i = 0; i < 30; i++) {
            const name = generateName();
            const email = generateEmail(name, i + 1);
            const phone = generatePhone(i + 100);
            const industry = getRandomItem(industries);
            const position = getRandomItem(positions);
            const bio = generateBio(name, position, industry);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    phone,
                    passwordHash: testPassword,
                    role: "USUARIO",
                    bio,
                    position,
                    industry,
                    website: Math.random() > 0.5 ? `https://${name.toLowerCase().replace(/\s+/g, '')}.com` : undefined
                }
            });
            users.push(user);
        }

        // ============================================
        // 4. CREATE INITIAL CONVERSATIONS (10)
        // ============================================
        console.log("💬 Creating initial conversations...");
        const conversations: any[] = [];

        // Create conversations between random users and bots
        for (let i = 0; i < 10; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomBot = bots[Math.floor(Math.random() * bots.length)];

            const conv = await prisma.conversation.create({
                data: {
                    type: "USER_USER",
                    userAId: randomBot.id,
                    userBId: randomUser.id
                }
            });

            conversations.push(conv);
        }

        // ============================================
        // 5. CREATE FRIEND REQUESTS (10)
        // ============================================
        console.log("🤝 Creating friend requests...");
        const friendRequests: any[] = [];

        for (let i = 0; i < 10; i++) {
            const requester = users[Math.floor(Math.random() * users.length)];
            const receiver = users[Math.floor(Math.random() * users.length)];

            // Avoid self-requests and duplicates
            if (requester.id === receiver.id) continue;

            try {
                const status = i < 5 ? "ACCEPTED" : "PENDING"; // 5 accepted, 5 pending
                const friendRequest = await prisma.friendRequest.create({
                    data: {
                        requesterId: requester.id,
                        receiverId: receiver.id,
                        status
                    }
                });
                friendRequests.push(friendRequest);
            } catch (error) {
                // Skip if duplicate
                continue;
            }
        }

        // ============================================
        // 6. CREATE TEST GROUPS (3)
        // ============================================
        console.log("👥 Creating test groups...");
        const groups: any[] = [];
        const groupNames = [
            "Emprendedores Tech",
            "Marketing Digital Colombia",
            "CEOs y Directores",
            "Fintech Innovadores",
            "Retail y Comercio",
            "Manufactura y Logística",
            "Consultores B2B",
            "Startups Latam",
            "Inteligencia Artificial",
            "Transformación Digital"
        ];

        for (let i = 0; i < 3; i++) {
            const creator = users[Math.floor(Math.random() * users.length)];

            const group = await prisma.group.create({
                data: {
                    name: groupNames[i],
                    description: `Grupo profesional de ${groupNames[i]}. Comparte experiencias, haz networking y encuentra oportunidades de negocio.`,
                    createdById: creator.id
                }
            });

            // Add 5-15 random members to each group
            const memberCount = 5 + Math.floor(Math.random() * 11);
            const groupMembers: any[] = [];

            // Add creator as admin
            await prisma.groupMember.create({
                data: {
                    groupId: group.id,
                    userId: creator.id,
                    isAdmin: true
                }
            });

            // Add random members
            for (let j = 0; j < memberCount; j++) {
                const member = users[Math.floor(Math.random() * users.length)];

                try {
                    await prisma.groupMember.create({
                        data: {
                            groupId: group.id,
                            userId: member.id,
                            isAdmin: false
                        }
                    });
                } catch (error) {
                    // Skip if already a member
                    continue;
                }
            }

            groups.push(group);
        }

        // ============================================
        // 7. CREATE AD CAMPAIGNS & COMPANIES (3)
        // ============================================
        console.log("📢 Creating companies and ad campaigns...");
        const adCompanies = [admins[2], admins[3], admins[4]]; // Company Admins

        // Specific Companies Data
        const specificCompanies = [
            {
                name: "MADOCO XXI SAS BIC",
                description: "Expertos en ropa de seguridad industrial y dotaciones.",
                industry: "Textil",
                website: "https://madoco.com",
                phone: "+573001234567"
            },
            {
                name: "Tech Solutions Ltd",
                description: "Desarrollo de software y consultoría TI.",
                industry: "Tecnología",
                website: "https://techsolutions.com",
                phone: "+573009876543"
            },
            {
                name: "Constructora Global",
                description: "Proyectos de infraestructura y vivienda.",
                industry: "Construcción",
                website: "https://globalconst.com",
                phone: "+573005551234"
            }
        ];

        for (let i = 0; i < 3; i++) {
            const admin = adCompanies[i];
            const companyData = specificCompanies[i];

            // Create a company for the admin
            const company = await prisma.company.create({
                data: {
                    name: companyData.name,
                    taxId: companyData.phone,
                    users: { connect: { id: admin.id } }
                }
            });

            console.log(`✅ Created company: ${company.name}`);

            /*
            // Create campaign
            const campaign = await prisma.adCampaign.create({
                data: {
                    companyId: company.id,
                    userId: admin.id,
                    name: `Campaña ${i + 1} - ${admin.industry}`,
                    objective: "TRAFFIC",
                    status: "ACTIVE", // Set to ACTIVE for immediate display
                    dailyBudget: 50000,
                    durationDays: 30,
                    totalBudget: 1500000,
                    creativeType: "IMAGE",
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });

            // Create AdCreative (only basic required fields to avoid schema mismatch)
            await prisma.adCreative.create({
                data: {
                    campaignId: campaign.id,
                    title: `Soluciones de ${admin.industry}`,
                    description: `Impulsa tu negocio con servicios de ${admin.industry}. Expertos en B2B.`,
                    imageUrl: `https://images.unsplash.com/photo-${1556761175 + i * 1000}?w=800&q=80`,
                    ctaLabel: "Ver Más",
                    destinationUrl: "https://example.com",
                    approvalStatus: "APPROVED", // Pre-approved for demo
                    isActive: true
                }
            });
            */
        }

        // ============================================
        // 8. FINAL STATISTICS
        // ============================================
        const finalStats = {
            totalUsers: await prisma.user.count(),
            admins: admins.length,
            bots: bots.length,
            regularUsers: users.length,
            conversations: conversations.length,
            messages: await prisma.message.count(),
            friendRequests: friendRequests.length,
            groups: groups.length,
            groupMembers: await prisma.groupMember.count()
        };

        console.log("✅ Seed completed successfully!");
        console.log("📊 Statistics:", finalStats);

        return NextResponse.json({
            success: true,
            message: "Database seeded successfully with 300 users!",
            stats: finalStats,
            credentials: {
                note: "All users have password: test123",
                adminEmails: [
                    "superadmin@b2bchat.com",
                    "superadmin2@b2bchat.com",
                    "admin1@b2bchat.com",
                    "admin2@b2bchat.com",
                    "admin3@b2bchat.com"
                ],
                sampleUsers: users.slice(0, 5).map((u: any) => ({
                    name: u.name,
                    email: u.email,
                    phone: u.phone
                }))
            }
        });

    } catch (error: any) {
        console.error("❌ Seed error:", error);
        return NextResponse.json({
            success: false,
            error: "Failed to seed database",
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
