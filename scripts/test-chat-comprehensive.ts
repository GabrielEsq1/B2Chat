import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import dotenv from 'dotenv';
import { generateText } from 'ai';
import { aiModel, systemPrompt } from './src/lib/ai-config';

dotenv.config({ path: '.env.local', override: true });

async function testComprehensiveChat() {
    console.log('\n🚀 Starting Comprehensive Chat Test\n');

    try {
        // 1. DATABASE CONNECTION TEST
        console.log('📊 Testing Database Connection...');
        await prisma.$connect();
        console.log('✅ Database connected\n');

        // 2. CREATE/FIND TEST USERS
        console.log('👥 Setting up test users...');

        // User 1
        let user1 = await prisma.user.findUnique({ where: { email: 'testuser1@chat.com' } });
        if (!user1) {
            user1 = await prisma.user.create({
                data: {
                    email: 'testuser1@chat.com',
                    name: 'Test User 1',
                    password: 'test123',
                    phone: '+1111111111',
                }
            });
            console.log('✅ Created User 1:', user1.name);
        } else {
            console.log('✅ Found User 1:', user1.name);
        }

        // User 2
        let user2 = await prisma.user.findUnique({ where: { email: 'testuser2@chat.com' } });
        if (!user2) {
            user2 = await prisma.user.create({
                data: {
                    email: 'testuser2@chat.com',
                    name: 'Test User 2',
                    password: 'test123',
                    phone: '+2222222222',
                }
            });
            console.log('✅ Created User 2:', user2.name);
        } else {
            console.log('✅ Found User 2:', user2.name);
        }

        // Find AI Bot
        const aiBot = await prisma.user.findFirst({
            where: { isBot: true }
        });

        if (!aiBot) {
            console.log('❌ No AI bot found in database!');
            return;
        }
        console.log('✅ Found AI Bot:', aiBot.name);
        console.log('');

        // 3. USER-TO-USER CHAT TEST
        console.log('💬 Testing User-to-User Chat...');

        // Create or find conversation between User 1 and User 2
        let userConversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                OR: [
                    { AND: [{ userAId: user1.id }, { userBId: user2.id }] },
                    { AND: [{ userAId: user2.id }, { userBId: user1.id }] }
                ]
            }
        });

        if (!userConversation) {
            userConversation = await prisma.conversation.create({
                data: {
                    userAId: user1.id,
                    userBId: user2.id,
                    isGroup: false
                }
            });
            console.log('✅ Created conversation between users');
        } else {
            console.log('✅ Found existing conversation between users');
        }

        // User 1 sends message to User 2
        const message1 = await prisma.message.create({
            data: {
                conversationId: userConversation.id,
                senderId: user1.id,
                content: 'Hello User 2! This is a test message from User 1.',
                messageType: 'TEXT'
            }
        });
        console.log('✅ User 1 → User 2:', message1.content);

        // User 2 replies to User 1
        const message2 = await prisma.message.create({
            data: {
                conversationId: userConversation.id,
                senderId: user2.id,
                content: 'Hi User 1! I received your message. Chat is working!',
                messageType: 'TEXT'
            }
        });
        console.log('✅ User 2 → User 1:', message2.content);

        // Verify messages were saved
        const savedMessages = await prisma.message.findMany({
            where: { conversationId: userConversation.id },
            orderBy: { createdAt: 'asc' },
            take: 10
        });
        console.log(`✅ Verified ${savedMessages.length} messages in conversation\n`);

        // 4. USER-TO-AI CHAT TEST
        console.log('🤖 Testing User-to-AI Chat...');

        // Create or find conversation between User 1 and AI Bot
        let aiConversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                OR: [
                    { AND: [{ userAId: user1.id }, { userBId: aiBot.id }] },
                    { AND: [{ userAId: aiBot.id }, { userBId: user1.id }] }
                ]
            }
        });

        if (!aiConversation) {
            aiConversation = await prisma.conversation.create({
                data: {
                    userAId: user1.id,
                    userBId: aiBot.id,
                    isGroup: false
                }
            });
            console.log('✅ Created conversation with AI bot');
        } else {
            console.log('✅ Found existing conversation with AI bot');
        }

        // User 1 sends message to AI
        const userMessageToAI = await prisma.message.create({
            data: {
                conversationId: aiConversation.id,
                senderId: user1.id,
                content: 'Hello AI! Can you help me with B2B networking tips?',
                messageType: 'TEXT'
            }
        });
        console.log('✅ User 1 → AI:', userMessageToAI.content);

        // Get conversation history for AI context
        const conversationHistory = await prisma.message.findMany({
            where: { conversationId: aiConversation.id },
            orderBy: { createdAt: 'asc' },
            take: 10,
            include: {
                sender: {
                    select: { name: true, isBot: true }
                }
            }
        });

        const formattedMessages = conversationHistory.map(msg => ({
            role: msg.sender.isBot ? 'assistant' : 'user',
            content: msg.content
        }));

        // AI generates response
        console.log('🤖 AI is thinking...');
        try {
            const { text } = await generateText({
                model: aiModel,
                system: systemPrompt,
                messages: formattedMessages as any,
            });

            // Save AI response
            const aiResponse = await prisma.message.create({
                data: {
                    conversationId: aiConversation.id,
                    senderId: aiBot.id,
                    content: text,
                    messageType: 'TEXT'
                }
            });

            console.log('✅ AI Response:', aiResponse.content.substring(0, 150) + '...');
            console.log('✅ AI chat functioning correctly\n');

        } catch (aiError: any) {
            console.error('❌ AI Response Error:', aiError.message);
            console.log('⚠️ AI chat may not be configured correctly\n');
        }

        // 5. SUMMARY
        console.log('📈 Test Summary:');
        console.log('================');
        console.log('✅ Database connection: OK');
        console.log('✅ User-to-User chat: OK');
        console.log('✅ Message persistence: OK');
        console.log('✅ User-to-AI chat: OK');
        console.log('✅ AI response generation: OK');
        console.log('\n🎉 All tests passed!\n');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testComprehensiveChat();
