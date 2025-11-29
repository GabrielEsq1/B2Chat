import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🤖 Seeding bots...');

    const passwordHash = await bcrypt.hash('bot123', 10);

    const bots = [
        {
            name: 'Sofia',
            email: 'sofia@b2bchat.ai',
            phone: '+573000000001',
            isBot: true,
            botPersonality: 'BUSINESS_ADVISOR',
            bio: 'Asesora de negocios B2B experta',
            position: 'Business Advisor',
            industry: 'Consulting'
        },
        {
            name: 'Carlos',
            email: 'carlos@b2bchat.ai',
            phone: '+573000000002',
            isBot: true,
            botPersonality: 'NEWS_BOT',
            bio: 'Bot de noticias B2B',
            position: 'News Analyst',
            industry: 'Media'
        },
        {
            name: 'Ana',
            email: 'ana@b2bchat.ai',
            phone: '+573000000003',
            isBot: true,
            botPersonality: 'TASK_ASSISTANT',
            bio: 'Asistente virtual',
            position: 'Assistant',
            industry: 'Productivity'
        }
    ];

    for (const bot of bots) {
        await prisma.user.upsert({
            where: { email: bot.email },
            update: { ...bot, passwordHash },
            create: { ...bot, passwordHash }
        });
        console.log(`✅ Bot upserted: ${bot.name}`);
    }

    console.log('✅ Bot seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
