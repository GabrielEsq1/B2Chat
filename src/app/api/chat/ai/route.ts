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
        const userMessage = messages[messages.length - 1].content;
        await prisma.message.create({
            data: {
                conversationId,
                senderUserId: userId,
                text: userMessage,
            },
        });

        // Procesar con Olivia (Local AI)
        const { olivia } = await import('@/lib/olivia');
        const aiResponseText = olivia.process(userMessage);

        // Simular streaming para compatibilidad con el cliente
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();

                // Simular delay de "pensamiento"
                await new Promise(resolve => setTimeout(resolve, 500));

                // Enviar respuesta
                controller.enqueue(encoder.encode(aiResponseText));

                // Guardar respuesta en BD
                try {
                    // Identificar el bot correcto para la conversación
                    // Si el usuario A es el humano, el B es el bot, y viceversa
                    const botUser = conversation.userAId === userId ? conversation.userB : conversation.userA;

                    if (botUser && botUser.isBot) {
                        await prisma.message.create({
                            data: {
                                conversationId,
                                senderUserId: botUser.id,
                                text: aiResponseText,
                            },
                        });
                    } else {
                        // Fallback: buscar cualquier bot si la conversación no tiene uno claro (raro)
                        const aiBot = await prisma.user.findFirst({
                            where: { isBot: true },
                        });
                        if (aiBot) {
                            await prisma.message.create({
                                data: {
                                    conversationId,
                                    senderUserId: aiBot.id,
                                    text: aiResponseText,
                                },
                            });
                        }
                    }

                    console.log('Olivia response saved:', {
                        conversationId,
                        textLength: aiResponseText.length,
                    });

                } catch (error) {
                    console.error('Error saving Olivia response:', error);
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
