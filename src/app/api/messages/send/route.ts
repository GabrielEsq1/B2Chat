import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMessageNotification } from "@/lib/email";
import { chatWithAI } from "@/lib/apis/huggingface";

/**
 * POST /api/messages/send
 * Enviar mensajes de texto
 */
export async function POST(req: NextRequest) {
    try {
        // 1. Auth
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // 2. Get data
        const body = await req.json();
        const { conversationId, text } = body;

        if (!conversationId || !text) {
            return NextResponse.json({ error: "conversationId y text requeridos" }, { status: 400 });
        }

        // 3. Verify conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id }
                ]
            },
            include: {
                userA: { select: { id: true, email: true, name: true, isBot: true } },
                userB: { select: { id: true, email: true, name: true, isBot: true } }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
        }

        // 4. Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderUserId: session.user.id,
                text
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                }
            }
        });

        // 5. Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() }
        });

        // 6. Send email notification
        let emailSent = false;
        try {
            const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
            if (otherUser?.email && !otherUser.isBot) {
                const baseUrl = process.env.B2BCHAT_AUTH_APP_BASEURL_PROD || process.env.NEXTAUTH_URL ||
                    (req.headers.get('origin') || 'http://localhost:3000');

                await sendNewMessageNotification({
                    to: otherUser.email,
                    senderName: session.user.name || 'Un usuario',
                    messageText: text,
                    conversationLink: `${baseUrl}/chat/${conversationId}`
                });
                emailSent = true;
            }
        } catch (emailErr) {
            console.error('[SEND] Email failed:', emailErr);
        }

        // 7. Handle AI Bot Response
        let aiResponse = null;
        const otherUserForBot = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;

        if (otherUserForBot?.isBot) {
            try {
                const history = await prisma.message.findMany({
                    where: { conversationId },
                    orderBy: { createdAt: 'desc' },
                    take: 5
                });
                const historyTexts = history.reverse().map((m: any) => m.text);

                const aiText = await chatWithAI(text, historyTexts);
                if (aiText) {
                    aiResponse = await prisma.message.create({
                        data: {
                            conversationId,
                            senderUserId: otherUserForBot.id,
                            text: aiText
                        },
                        include: { sender: { select: { id: true, name: true, avatar: true } } }
                    });

                    await prisma.conversation.update({
                        where: { id: conversationId },
                        data: { updatedAt: new Date() }
                    });
                }
            } catch (aiError) {
                console.error('[SEND] AI error:', aiError);
            }
        }

        // 7. Return
        return NextResponse.json({
            success: true,
            message,
            aiResponse,
            emailSent
        });

    } catch (error: any) {
        console.error('[SEND] Error:', error);
        return NextResponse.json(
            { error: error.message || "Error al enviar mensaje" },
            { status: 500 }
        );
    }
}
