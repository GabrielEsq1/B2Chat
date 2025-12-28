import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const prisma = new PrismaClient();
const CSV_PATH = path.join(process.cwd(), 'firts useres db.csv');
const DEFAULT_PASSWORD = 'B2BChat2024!';

async function bulkOnboard() {
    try {
        console.log('🚀 Starting bulk onboarding of 3500+ users...');
        const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

        // 1. Ensure Admin User exists
        let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        if (!admin) {
            console.log('👤 Creating Admin user...');
            admin = await prisma.user.create({
                data: {
                    name: 'Admin B2BChat',
                    phone: '+570000000000',
                    email: 'admin@b2bchat.io',
                    passwordHash,
                    role: 'ADMIN',
                    creditBalance: 999999
                }
            });
        }
        console.log('✅ Admin User:', admin.email);

        const fileStream = fs.createReadStream(CSV_PATH);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let count = 0;
        let lineCount = 0;

        for await (const line of rl) {
            lineCount++;
            if (lineCount % 100 === 0) console.log(`📖 Reading line ${lineCount}...`);

            if (lineCount === 1) {
                console.log('⏭️ Skipping header row:', line);
                continue;
            }
            if (!line.trim()) continue;
            if (!line.includes('@')) {
                console.log(`⚠️  Skipping line ${lineCount} (no @):`, line);
                continue;
            }

            const email = line.trim().toLowerCase();
            const name = email.split('@')[0].replace(/[._]/g, ' ');
            const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

            console.log(`👤 Processing user: ${email}`);

            // Unique dummy phone for importing
            const dummyPhone = `+import-${lineCount.toString().padStart(6, '0')}`;

            try {
                // Check if user exists
                const existing = await prisma.user.findFirst({
                    where: { OR: [{ email }, { phone: dummyPhone }] }
                });

                if (existing) {
                    // console.log(`⏭️  Skipping ${email} (already exists)`);
                    continue;
                }

                // Create Company
                const company = await prisma.company.create({
                    data: {
                        name: `${capitalizedName} Solutions`,
                        isActivated: false,
                        publicInfo: {
                            industry: "General B2B",
                            email: email,
                            description: `Perfil empresarial para ${capitalizedName}`
                        }
                    }
                });

                // Create User
                const user = await prisma.user.create({
                    data: {
                        name: capitalizedName,
                        email: email,
                        phone: dummyPhone,
                        passwordHash,
                        companyId: company.id,
                        role: 'USUARIO',
                        creditBalance: 20.0 // Give some starting credits
                    }
                });

                // Create Welcome Conversation
                const conversation = await prisma.conversation.create({
                    data: {
                        type: 'DIRECT',
                        userAId: admin.id,
                        userBId: user.id
                    }
                });

                // Create Welcome Message
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderUserId: admin.id,
                        text: `¡Hola ${capitalizedName} 👋 Bienvenido a B2BChat. Tu perfil empresarial ya está listo. Hemos activado una campaña de prueba gratuita para ti.`
                    }
                });

                // Create Free Campaign
                const campaign = await prisma.adCampaign.create({
                    data: {
                        companyId: company.id,
                        userId: user.id,
                        name: 'Campaña de Bienvenida',
                        objective: 'REACH',
                        status: 'ACTIVE',
                        industry: 'General',
                        dailyBudget: 1.0,
                        durationDays: 30,
                        totalBudget: 30.0,
                        creativeType: 'IMAGE'
                    }
                });

                // Create Ad Creative
                await prisma.adCreative.create({
                    data: {
                        campaignId: campaign.id,
                        title: '¡Impulsa tu negocio con B2BChat!',
                        description: `Conecta con empresas reales y cierra más negocios.`,
                        approvalStatus: 'APPROVED',
                        isActive: true
                    }
                });

                count++;
                if (count % 100 === 0) {
                    console.log(`📦 Processed ${count} users...`);
                }

                // Stop after 50 for testing if not 3500
                // if (count >= 50) break; 

            } catch (err) {
                console.error(`❌ Error onboarding ${email}:`, err);
            }
        }

        console.log(`\n🎉 Bulk onboarding complete!`);
        console.log(`📊 Total users created: ${count}`);
        console.log(`🔑 Default Password: ${DEFAULT_PASSWORD}`);

    } catch (error) {
        console.error('❌ Global error in bulk onboarding:', error);
    } finally {
        await prisma.$disconnect();
    }
}

bulkOnboard();
