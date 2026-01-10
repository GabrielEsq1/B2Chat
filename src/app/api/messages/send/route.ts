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
        const { conversationId, text, attachmentUrl } = body;

        if (!conversationId || (!text && !attachmentUrl)) {
            return NextResponse.json({ error: "conversationId y texto/adjunto requeridos" }, { status: 400 });
        }

        // 3. Verify conversation and permissions (User must be part of the chat or group)
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id },
                    {
                        group: {
                            members: {
                                some: {
                                    userId: session.user.id
                                }
                            }
                        }
                    }
                ]
            },
            include: {
                userA: { select: { id: true, email: true, name: true, isBot: true } },
                userB: { select: { id: true, email: true, name: true, isBot: true } },
                group: { include: { members: { include: { user: { select: { email: true, name: true } } } } } }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversación no encontrada o sin permisos" }, { status: 404 });
        }

        // 4. Create message
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderUserId: session.user.id,
                text: text || "",
                attachmentUrl
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
            const recipients: { email: string, name: string }[] = [];

            if (conversation.type === "GROUP" && conversation.group) {
                // Get all members except sender
                conversation.group.members.forEach((m: any) => {
                    if (m.userId !== session.user.id && m.user.email) {
                        recipients.push({ email: m.user.email, name: m.user.name || "Usuario" });
                    }
                });
            } else {
                const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
                if (otherUser?.email && !otherUser.isBot) {
                    recipients.push({ email: otherUser.email, name: otherUser.name || "Usuario" });
                }
            }

            if (recipients.length > 0) {
                // Send notifications (parallel)
                await Promise.all(recipients.map(async (recipient) => {
                    try {
                        await sendNewMessageNotification({
                            to: recipient.email,
                            senderName: session.user.name || 'Un usuario',
                            messageText: text || 'Ha enviado un adjunto',
                            conversationLink: "https://b2bchat.co/chat"
                        });
                        emailSent = true;
                    } catch (err) {
                        console.error(`[SEND] Email failed for ${recipient.email}:`, err);
                    }
                }));
            }
        } catch (emailErr) {
            console.error('[SEND] Email process failed:', emailErr);
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
