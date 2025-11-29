import { streamText } from 'ai';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { aiModel, systemPrompt } from '@/lib/ai-config';

// export const runtime = 'edge'; // Disabled for Prisma compatibility

/**
 * API Route para Chat con IA usando Vercel AI SDK
 * Soporta Groq (Llama 3.1) y otros proveedores configurados en ai-config
 */
export async function POST(req: Request) {
    try {
        const { messages, userId, conversationId } = await req.json();

        // Validar datos requeridos
        if (!messages || !userId || !conversationId) {
            return NextResponse.json(
                { error: 'Missing required fields: messages, userId, conversationId' },
                { status: 400 }
            );
        }

        // Verificar que la conversación existe
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                userA: true,
                userB: true,
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        // Guardar mensaje del usuario en la base de datos
        await prisma.message.create({
            data: {
                conversationId,
                senderUserId: userId,
                text: messages[messages.length - 1].content,
            },
        });

        // Streaming de respuesta desde IA (Llama 3.1 via Groq)
        const result = streamText({
            model: aiModel,
            system: systemPrompt,
            messages,
            async onFinish({ text, usage }) {
                // Guardar respuesta de IA en la base de datos
                try {
                    // Buscar el bot de IA
                    const aiBot = await prisma.user.findFirst({
                        where: {
                            isBot: true,
                            botPersonality: 'assistant'
                        },
                    });

                    if (aiBot) {
                        await prisma.message.create({
                            data: {
                                conversationId,
                                senderUserId: aiBot.id,
                                text,
                            },
                        });
                    }

                    console.log('AI response saved:', {
                        conversationId,
                        textLength: text.length,
                        usage,
                    });
                } catch (error) {
                    console.error('Error saving AI response:', error);
                }
            },
        });

        // Retornar respuesta en streaming
        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Error in AI chat endpoint:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
