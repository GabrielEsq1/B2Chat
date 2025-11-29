import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Force load .env.local and override any existing env vars (e.g. from Prisma auto-load)
dotenv.config({ path: '.env.local', override: true });

const prisma = new PrismaClient();

async function ensureConversation() {
    // Find or create test user
    let user = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!user) {
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                name: 'Test User',
                phone: '0000000000',
                passwordHash: 'hashed',
                role: 'USUARIO'
            }
        });
    }
    // Find or create AI bot
    let bot = await prisma.user.findFirst({ where: { isBot: true, botPersonality: 'assistant' } });
    if (!bot) {
        bot = await prisma.user.create({
            data: {
                email: 'bot@example.com',
                name: 'AI Bot',
                phone: '0000000000',
                passwordHash: 'hashed',
                isBot: true,
                botPersonality: 'assistant',
                role: 'USUARIO'
            }
        });
    }
    // Find or create conversation between user and bot
    let conv = await prisma.conversation.findFirst({
        where: {
            OR: [
                { userAId: user.id, userBId: bot.id },
                { userAId: bot.id, userBId: user.id }
            ]
        }
    });
    if (!conv) {
        conv = await prisma.conversation.create({
            data: {
                type: 'USER_USER',
                userAId: user.id,
                userBId: bot.id
            }
        });
    }
    return { conversationId: conv.id, userId: user.id };
}

async function testAI() {
    try {
        const { conversationId, userId } = await ensureConversation();
        const payload = {
            conversationId,
            userId,
            messages: [{ role: 'user', content: 'Hola' }]
        };

        console.log('Sending request to AI chat endpoint...');
        const response = await fetch('http://localhost:3000/api/chat/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP Error: ${response.status} ${response.statusText}`);
            console.error('Response body:', errorText);
            return;
        }

        // The response is a stream, but for this test we can just read it as text
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testAI();
