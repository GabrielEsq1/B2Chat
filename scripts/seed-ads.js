const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAds() {
    console.log('Seeding ads...');
    try {
        // 1. Get the test user
        const user = await prisma.user.findUnique({
            where: { phone: '+573100000003' }
        });

        if (!user) {
            console.error('Test user not found. Run create-user-simple.js first.');
            return;
        }

        // 2. Create a Company
        const company = await prisma.company.create({
            data: {
                name: 'Tech Solutions Inc.',
                users: {
                    connect: { id: user.id }
                }
            }
        });
        console.log('Company created:', company.name);

        // 3. Create Ad Campaign
        const campaign = await prisma.adCampaign.create({
            data: {
                companyId: company.id,
                userId: user.id,
                name: 'Enterprise Launch',
                objective: 'AWARENESS',
                dailyBudget: 50.0,
                durationDays: 30,
                totalBudget: 1500.0,
                creativeType: 'MIXED',
                status: 'ACTIVE',
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
        console.log('Campaign created:', campaign.name);

        // 4. Create Ad Creatives (Stories & Feed)
        const creatives = [
            {
                title: 'Revoluciona tu B2B',
                description: 'Conecta con miles de empresas al instante.',
                imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80',
                ctaLabel: 'Empezar',
                destinationUrl: 'https://b2bchat.com',
                type: 'IMAGE'
            },
            {
                title: 'Seguridad Industrial',
                description: 'La mejor protección para tu equipo.',
                imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
                ctaLabel: 'Ver Catálogo',
                destinationUrl: 'https://madoco.com',
                type: 'IMAGE'
            },
            {
                title: 'Software ERP',
                description: 'Gestiona tu inventario sin estrés.',
                imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
                ctaLabel: 'Demo Gratis',
                destinationUrl: 'https://erp-demo.com',
                type: 'IMAGE'
            }
        ];

        for (const creative of creatives) {
            await prisma.adCreative.create({
                data: {
                    campaignId: campaign.id,
                    title: creative.title,
                    description: creative.description,
                    imageUrl: creative.imageUrl,
                    ctaLabel: creative.ctaLabel,
                    destinationUrl: creative.destinationUrl,
                    type: creative.type,
                    isActive: true,
                    approvalStatus: 'APPROVED'
                }
            });
        }

        console.log(`Created ${creatives.length} ads.`);

    } catch (e) {
        console.error('Error seeding ads:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seedAds();
