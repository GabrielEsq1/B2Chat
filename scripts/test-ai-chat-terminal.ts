import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { generateBotResponse } from '../src/lib/ai-service';

// Force load .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local', override: true });

async function testAIChatTerminal() {
    console.log('🚀 Starting AI Chat Terminal Test\n');
    console.log('='.repeat(60));

    try {
        // 1. Create/Find Fake User
        console.log('\n👤 1. Setting up Fake User...');
        const fakeUserEmail = 'fakeuser@test.com';
        let fakeUser = await prisma.user.findUnique({ where: { email: fakeUserEmail } });

        if (!fakeUser) {
            // Check if phone exists
            const existingPhone = await prisma.user.findUnique({ where: { phone: '+1234567890' } });
            if (existingPhone) {
                console.log('ℹ️ Phone number already taken, using existing user with that phone...');
                fakeUser = existingPhone;
            } else {
                fakeUser = await prisma.user.create({
                    data: {
                        email: fakeUserEmail,
                        name: 'Fake User',
                        passwordHash: 'password123',
                        phone: '+1234567890',
                        role: 'USUARIO'
                    }
                });
                console.log('✅ Created new fake user:', fakeUser.id);
            }
        } else {
            console.log('✅ Found existing fake user:', fakeUser.id);
        }

        // 2. Create/Find AI Bot
        console.log('\n🤖 2. Setting up AI Bot...');
        let aiBot = await prisma.user.findFirst({
            where: { isBot: true, botPersonality: 'BUSINESS_ADVISOR' }
        });

        if (!aiBot) {
            aiBot = await prisma.user.create({
                data: {
                    email: 'ai_advisor@b2bchat.com',
                    name: 'Sofia (AI Advisor)',
                    passwordHash: 'bot_password',
                    role: 'USUARIO',
                    isBot: true,
                    botPersonality: 'BUSINESS_ADVISOR',
                    avatar: '/avatars/ai-advisor.png',
                    phone: '+1000000000' // Unique phone for AI bot
                }
            });
            console.log('✅ Created new AI bot:', aiBot.id);
        } else {
            console.log('✅ Found existing AI bot:', aiBot.id);
        }

        // 3. Create Conversation
        console.log('\n💬 3. Creating Conversation...');
        let conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { userAId: fakeUser.id, userBId: aiBot.id },
                    { userAId: aiBot.id, userBId: fakeUser.id }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    type: 'USER_USER',
                    userAId: fakeUser.id,
                    userBId: aiBot.id
                }
            });
            console.log('✅ Created new conversation:', conversation.id);
        } else {
            console.log('✅ Found existing conversation:', conversation.id);
        }

        // 4. Send Message from User
        console.log('\n📨 4. Sending User Message...');
        const userMessageText = "Hola Sofia, ¿cómo puedo mejorar mis ventas B2B?";
        const userMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: fakeUser.id,
                text: userMessageText
            }
        });
        console.log(`✅ User sent: "${userMessageText}"`);

        // 5. Simulate AI Response (Directly calling service to avoid HTTP dependency in terminal test)
        console.log('\n🧠 5. Generating AI Response...');

        // Fetch history for context
        const history = await prisma.message.findMany({
            where: { conversationId: conversation.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { sender: { select: { name: true } } }
        });

        const formattedHistory = history.reverse().map(msg => ({
            role: msg.sender.name || "User",
            text: msg.text
        }));

        console.log('   Context loaded:', formattedHistory.length, 'messages');

        const aiResponseText = await generateBotResponse(
            aiBot.botPersonality!,
            userMessageText,
            formattedHistory
        );

        console.log(`\n🤖 AI Generated Response:\n"${aiResponseText}"`);

        // 6. Save AI Response
        const botMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: aiBot.id,
                text: aiResponseText
            }
        });
        console.log(`\n✅ AI response saved to DB (ID: ${botMessage.id})`);

        console.log('\n✨ AI Chat Test Completed Successfully!');

    } catch (error) {
        console.error('\n❌ Test Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testAIChatTerminal();
