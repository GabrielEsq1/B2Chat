import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import { aiModel, systemPrompt } from '@/lib/ai-config';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testChatAndAI() {
    console.log('🧪 Starting Chat and AI Integration Tests (Vercel AI SDK)...\n');

    try {
        // Test 1: Find or create test user
        console.log('1️⃣ Finding test user...');
        const testUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        });

        if (!testUser) {
            console.log('❌ Test user not found. Please register test@example.com first.');
            return;
        }
        console.log(`✅ Test user found: ${testUser.name} (${testUser.id})\n`);

        // Test 2: Find or create bot user
        console.log('2️⃣ Finding AI bot...');
        const botUser = await prisma.user.findFirst({
            where: {
                isBot: true,
                botPersonality: 'assistant' // Updated to match new setup
            }
        });

        if (!botUser) {
            console.log('❌ Bot user not found. Please run setup-ai-bot.ts first.');
            return;
        }
        console.log(`✅ Bot found: ${botUser.name} (${botUser.id})\n`);

        // Test 3: Find or create conversation
        console.log('3️⃣ Finding or creating conversation...');
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { userAId: testUser.id, userBId: botUser.id },
                    { userAId: botUser.id, userBId: testUser.id }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    type: 'USER_USER',
                    userAId: testUser.id,
                    userBId: botUser.id
                }
            });
            console.log(`✅ Created new conversation: ${conversation.id}\n`);
        } else {
            console.log(`✅ Found existing conversation: ${conversation.id}\n`);
        }

        // Test 4: Send a test message
        console.log('4️⃣ Sending test message...');
        const userMessageText = 'Hola, ¿cómo estás? Esta es una prueba de integración.';
        const testMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: testUser.id,
                text: userMessageText
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        isBot: true
                    }
                }
            }
        });
        console.log(`✅ Message sent: "${testMessage.text}"\n`);

        // Test 5: Generate AI response using Vercel AI SDK
        console.log('5️⃣ Generating AI bot response (Vercel AI SDK)...');

        // Fetch history for context
        const messages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { sender: { select: { name: true, isBot: true } } }
        });

        const history = messages.reverse().map(msg => ({
            role: msg.sender.isBot ? 'assistant' : 'user',
            content: msg.text
        }));

        // Generate text using the new SDK
        const { text: aiResponse } = await generateText({
            model: aiModel,
            system: systemPrompt,
            messages: history as any, // Cast to any to avoid strict type issues in script
        });

        console.log(`✅ AI Response generated: "${aiResponse}"\n`);

        // Test 6: Save bot response
        console.log('6️⃣ Saving bot response to database...');
        const botMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: botUser.id,
                text: aiResponse
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        isBot: true
                    }
                }
            }
        });
        console.log(`✅ Bot message saved: "${botMessage.text.substring(0, 50)}..."\n`);

        // Test 7: Retrieve all messages
        console.log('7️⃣ Retrieving all messages from conversation...');
        const allMessages = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: {
                    select: {
                        name: true,
                        isBot: true
                    }
                }
            }
        });

        console.log(`✅ Found ${allMessages.length} messages:\n`);
        allMessages.forEach((msg, idx) => {
            const sender = msg.sender.isBot ? '🤖' : '👤';
            console.log(`   ${sender} ${msg.sender.name}: ${msg.text.substring(0, 60)}${msg.text.length > 60 ? '...' : ''}`);
        });

        console.log('\n✅ ALL TESTS PASSED! Vercel AI SDK integration is working correctly.');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

testChatAndAI()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
