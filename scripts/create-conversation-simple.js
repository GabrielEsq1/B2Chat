const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createConversation() {
    console.log('Creating conversation...');
    try {
        // Find the test user
        const user = await prisma.user.findUnique({
            where: { phone: '+573100000003' }
        });

        if (!user) {
            console.error('Test user not found');
            return;
        }

        // Find or create the bot
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
                avatar: '/avatars/bot.png'
            },
        });

        // Create conversation
        const conversation = await prisma.conversation.create({
            data: {
                userAId: user.id,
                userBId: bot.id,
                type: 'USER_USER'
            },
        });

        console.log('Conversation created:', conversation.id);
    } catch (e) {
        console.error('Error creating conversation:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createConversation();
