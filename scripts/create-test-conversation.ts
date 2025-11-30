import { prisma } from '../src/lib/prisma';

async function createTestConversation() {
    // Create or find a test user
    const user = await prisma.user.upsert({
        where: { email: 'test-api-user@example.com' },
        update: {},
        create: {
            email: 'test-api-user@example.com',
            name: 'Test API User',
            phone: '+1234567890',
            passwordHash: 'hash',
            role: 'USER',
        },
    });

    // Create or find a bot
    const bot = await prisma.user.upsert({
        where: { email: 'olivia-bot@example.com' },
        update: { isBot: true },
        create: {
            email: 'olivia-bot@example.com',
            name: 'Olivia Bot',
            phone: '+0987654321',
            passwordHash: 'hash',
            role: 'ADMIN',
            isBot: true,
        },
    });

    // Create a conversation
    const conversation = await prisma.conversation.create({
        data: {
            userAId: user.id,
            userBId: bot.id,
        },
    });

    console.log(JSON.stringify({
        userId: user.id,
        conversationId: conversation.id,
    }));
}

createTestConversation()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
