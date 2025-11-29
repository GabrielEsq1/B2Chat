import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });

async function setupMadocoAdsAndUsers() {
    console.log('\n🚀 Setting up MADOCO Ads and Test Users\n');

    try {
        await prisma.$connect();
        console.log('✅ Database connected\n');

        // 1. CREATE MADOCO ADVERTISER
        console.log('📢 Creating MADOCO advertiser...');
        let madocoUser = await prisma.user.findUnique({ where: { email: 'madoco@madoco21.com' } });

        if (!madocoUser) {
            try {
                madocoUser = await prisma.user.create({
                    data: {
                        email: 'madoco@madoco21.com',
                        name: 'MADOCO XXI SAS BIC',
                        password: 'madoco123',
                        phone: `+57300MADOCO${Date.now().toString().slice(-4)}`,
                        industry: 'Industrial Safety',
                        position: 'Fabricante de Ropa Ignífuga'
                    }
                });
                console.log('✅ Created MADOCO advertiser');
            } catch (e) {
                madocoUser = await prisma.user.findUnique({ where: { email: 'madoco@madoco21.com' } });
                console.log('✅ Found MADOCO advertiser');
            }
        } else {
            console.log('✅ Found MADOCO advertiser');
        }

        if (!madocoUser) throw new Error('Could not create MADOCO user');

        // 2. CREATE CAMPAIGN
        console.log('\n📊 Creating MADOCO campaign...');
        let campaign = await prisma.campaign.findFirst({
            where: { userId: madocoUser.id, title: 'MADOCO Industrial Safety 2025' }
        });

        if (!campaign) {
            campaign = await prisma.campaign.create({
                data: {
                    userId: madocoUser.id,
                    title: 'MADOCO Industrial Safety 2025',
                    objective: 'TRAFFIC',
                    status: 'ACTIVE',
                    budget: 5000,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                }
            });
            console.log('✅ Created campaign');
        } else {
            console.log('✅ Found campaign');
        }

        // 3. DELETE OLD ADS AND CREATE NEW MADOCO ADS
        console.log('\n🎨 Updating MADOCO ads...');

        // Delete old non-MADOCO ads
        const deleted = await prisma.ad.deleteMany({
            where: {
                campaignId: { not: campaign.id }
            }
        });
        console.log(`🗑️ Deleted ${deleted.count} old ads`);

        const madocoAds = [
            {
                title: 'Protección Industrial con Tecnología Nomex®',
                description: 'MADOCO - Empresa colombiana especializada en ropa ignífuga para Oil & Gas, sector eléctrico y bomberos. Fabricamos confianza con tecnología DuPont™ Nomex®. 🇨🇴',
                image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80',
                link: 'https://madoco21.com',
                cta: 'Ver Productos',
                status: 'ACTIVE',
                format: 'IMAGE'
            },
            {
                title: '¡Fabricamos Confianza, No Solo Prendas!',
                description: 'Uniformes ignífugos certificados para sector eléctrico, oil & gas y bomberos. Tecnología Nomex® que salva vidas. Hecho con orgullo en Colombia 🇨🇴',
                image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80',
                link: 'https://madoco21.com/collections/all',
                cta: 'Comprar Ahora',
                status: 'ACTIVE',
                format: 'IMAGE'
            },
            {
                title: 'Certificado DuPont™ Nomex® Partner',
                description: 'MADOCO obtiene insignia COMMITTED de EcoVadis. Empresa BIC - Beneficio e Impacto Colectivo. Soluciones de seguridad industrial sostenibles.',
                image: 'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?w=800&q=80',
                link: 'https://madoco21.com/blogs/noticias',
                cta: 'Leer Noticias',
                status: 'ACTIVE',
                format: 'IMAGE'
            }
        ];

        for (const adData of madocoAds) {
            const existing = await prisma.ad.findFirst({
                where: { campaignId: campaign.id, title: adData.title }
            });

            if (!existing) {
                await prisma.ad.create({
                    data: { campaignId: campaign.id, ...adData }
                });
                console.log(`✅ ${adData.title}`);
            } else {
                console.log(`ℹ️ Already exists: ${adData.title}`);
            }
        }

        // 4. CREATE TEST USERS
        console.log('\n👥 Creating test users...');

        const testUsers = [
            {
                email: 'juan.perez@test.com',
                name: 'Juan Pérez',
                phone: `+5731012${Date.now().toString().slice(-5)}`,
                industry: 'Oil & Gas',
                position: 'Ingeniero de Seguridad'
            },
            {
                email: 'maria.garcia@test.com',
                name: 'María García',
                phone: `+5732012${Date.now().toString().slice(-5)}`,
                industry: 'Sector Eléctrico',
                position: 'Jefa de Operaciones'
            },
            {
                email: 'carlos.rodriguez@test.com',
                name: 'Carlos Rodríguez',
                phone: `+5733012${Date.now().toString().slice(-5)}`,
                industry: 'Bomberos',
                position: 'Capitán de Bomberos'
            }
        ];

        const users = [];
        for (const userData of testUsers) {
            let user = await prisma.user.findUnique({ where: { email: userData.email } });

            if (!user) {
                try {
                    user = await prisma.user.create({
                        data: { ...userData, password: 'test123' }
                    });
                    console.log(`✅ ${user.name}`);
                } catch (e) {
                    user = await prisma.user.findUnique({ where: { email: userData.email } });
                    console.log(`✅ Found: ${userData.name}`);
                }
            } else {
                console.log(`✅ Found: ${user.name}`);
            }
            if (user) users.push(user);
        }

        // 5. CREATE CONVERSATIONS
        console.log('\n💬 Creating conversations...');

        if (users.length >= 2) {
            // Juan <-> María
            let conv1 = await prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    OR: [
                        { AND: [{ userAId: users[0].id }, { userBId: users[1].id }] },
                        { AND: [{ userAId: users[1].id }, { userBId: users[0].id }] }
                    ]
                }
            });

            if (!conv1) {
                conv1 = await prisma.conversation.create({
                    data: { userAId: users[0].id, userBId: users[1].id, isGroup: false }
                });

                await prisma.message.create({
                    data: {
                        conversationId: conv1.id,
                        senderId: users[0].id,
                        content: 'Hola María! Vi que trabajas en el sector eléctrico. En MADOCO tenemos los mejores uniformes ignífugos.',
                        messageType: 'TEXT'
                    }
                });

                await prisma.message.create({
                    data: {
                        conversationId: conv1.id,
                        senderId: users[1].id,
                        content: 'Hola Juan! Sí, estamos buscando nuevos uniformes. ¿Tienen certificación Nomex?',
                        messageType: 'TEXT'
                    }
                });

                console.log('✅ Juan <-> María');
            }

            // María <-> Carlos
            if (users.length >= 3) {
                let conv2 = await prisma.conversation.findFirst({
                    where: {
                        isGroup: false,
                        OR: [
                            { AND: [{ userAId: users[1].id }, { userBId: users[2].id }] },
                            { AND: [{ userAId: users[2].id }, { userBId: users[1].id }] }
                        ]
                    }
                });

                if (!conv2) {
                    conv2 = await prisma.conversation.create({
                        data: { userAId: users[1].id, userBId: users[2].id, isGroup: false }
                    });

                    await prisma.message.create({
                        data: {
                            conversationId: conv2.id,
                            senderId: users[1].id,
                            content: 'Carlos, necesito tu recomendación sobre uniformes ignífugos para el sector eléctrico.',
                            messageType: 'TEXT'
                        }
                    });

                    await prisma.message.create({
                        data: {
                            conversationId: conv2.id,
                            senderId: users[2].id,
                            content: 'Te recomiendo MADOCO. Usamos sus uniformes en el cuerpo de bomberos. Excelente calidad!',
                            messageType: 'TEXT'
                        }
                    });

                    console.log('✅ María <-> Carlos');
                }
            }
        }

        console.log('\n✨ MADOCO setup complete!\n');
        console.log('🔑 TEST USER CREDENTIALS:');
        console.log('═══════════════════════════════');
        for (const u of testUsers) {
            console.log(`📧 ${u.email}`);
            console.log(`🔐 Password: test123`);
            console.log(`👤 Name: ${u.name}`);
            console.log('───────────────────────────────');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setupMadocoAdsAndUsers();
