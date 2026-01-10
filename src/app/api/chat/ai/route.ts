import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// export const runtime = 'edge'; // Disabled for Prisma compatibility

/**
 * API Route para Chat con IA usando Olivia AI Local
 * Integración nativa de Olivia en español
 */
export async function POST(req: Request) {
    try {
        const { messages, userId, conversationId } = await req.json();

        if (!messages || !userId || !conversationId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get User and Company Context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { company: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { userA: true, userB: true },
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Save User Message
        const userMessage = messages[messages.length - 1].content;
        await prisma.message.create({
            data: {
                conversationId,
                senderUserId: userId,
                text: userMessage,
            },
        });

        // Prepare History for AI (Last 10 messages to keep context)
        // We use the 'messages' array from the client which usually has the history
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role,
            text: m.content
        }));

        // Generate Contextual Response (Mohny)
        const { generateBotResponse } = await import('@/lib/ai-service');

        const aiResponseText = await generateBotResponse(
            "MOHNY",
            userMessage,
            history,
            undefined, // Use default system prompt for Mohny
            {
                userName: user.name || undefined,
                companyName: user.company?.name,
                userRole: user.role,
                industry: user.company?.industry || undefined
            }
        );

        // Simulate Stream
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // Chunk the response to simulate typing
                const chunks = aiResponseText.match(/.{1,20}/g) || [aiResponseText];

                for (const chunk of chunks) {
                    await new Promise(r => setTimeout(r, 30)); // Slight delay
                    controller.enqueue(encoder.encode(chunk));
                }

                try {
                    // Find or Assign Bot User
                    // If conversation is USER-USER, one might be the bot. If not, find the global system bot.
                    let botUserId = conversation.userA.isBot ? conversation.userA.id : (conversation.userB.isBot ? conversation.userB.id : null);

                    if (!botUserId) {
                        const systemBot = await prisma.user.findFirst({ where: { isBot: true } });
                        if (systemBot) botUserId = systemBot.id;
                    }

                    if (botUserId) {
                        await prisma.message.create({
                            data: {
                                conversationId,
                                senderUserId: botUserId,
                                text: aiResponseText,
                            },
                        });
                    }
                } catch (error) {
                    console.error('Error saving AI response:', error);
                }

                controller.close();
            },
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });

    } catch (error: any) {
        console.error('Error in AI chat endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
