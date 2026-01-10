import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMessageNotification } from "@/lib/email";

// GET /api/conversations/[id]/messages - Get messages for a conversation
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findUnique({
            where: { id: params.id },
            include: {
                group: {
                    include: {
                        members: true
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversación no encontrada" },
                { status: 404 }
            );
        }

        const isParticipant =
            conversation.userAId === session.user.id ||
            conversation.userBId === session.user.id ||
            conversation.group?.members.some((m: any) => m.userId === session.user.id);

        if (!isParticipant) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const messages = await prisma.message.findMany({
            where: {
                conversationId: params.id,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
            take: 50, // Load last 50 messages for context
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Error al obtener mensajes" },
            { status: 500 }
        );
    }
}

// POST /api/conversations/[id]/messages - Send a message
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Verify user is part of conversation - include group info for AI logic
        const conversation = await prisma.conversation.findUnique({
            where: { id: params.id },
            include: {
                userA: { select: { id: true, isBot: true } },
                userB: { select: { id: true, isBot: true } },
                group: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, isBot: true }
                                }
                            }
                        }
                    }
                }
            },
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversación no encontrada" },
                { status: 404 }
            );
        }

        const isParticipant =
            conversation.userAId === session.user.id ||
            conversation.userBId === session.user.id ||
            conversation.group?.members.some((m: any) => m.userId === session.user.id);

        if (!isParticipant) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const text = formData.get('text') as string;
        const file = formData.get('file') as File | null;

        if (!text && !file) {
            return NextResponse.json(
                { error: "Mensaje o archivo requerido" },
                { status: 400 }
            );
        }

        let attachmentUrl: string | null = null;

        // Handle file upload if present
        if (file) {
            try {
                // Upload file using the upload API
                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('type', file.type.startsWith('image/') ? 'image' :
                    file.type.startsWith('video/') ? 'video' : 'file');

                const uploadRes = await fetch(`${process.env.B2BCHAT_AUTH_APP_BASEURL_PROD || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/upload`, {
                    method: 'POST',
                    body: uploadFormData,
                });

                if (uploadRes.ok) {
                    const uploadData = await uploadRes.json();
                    attachmentUrl = uploadData.url;
                } else {
                    console.error('File upload failed');
                }
            } catch (error) {
                console.error('Error uploading file:', error);
            }
        }

        // Create message
        const message = await prisma.message.create({
            data: {
                conversationId: params.id,
                senderUserId: session.user.id,
                text: text || (file ? `Archivo: ${file.name}` : ''),
                attachmentUrl,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
            },
        });

        // Send email notification to recipient(s)
        let emailSent = false;
        try {
            const baseUrl = process.env.B2BCHAT_AUTH_APP_BASEURL_PROD || process.env.NEXTAUTH_URL ||
                (req.headers.get('origin') || 'http://localhost:3000');

            if (conversation.groupId) {
                // ... existing group logic
                const otherMembers = conversation.group?.members.filter((m: any) => m.userId !== session.user.id && !m.user.isBot);
                if (otherMembers) {
                    for (const member of otherMembers) {
                        if (member.user.email) {
                            const result = await sendNewMessageNotification({
                                to: member.user.email,
                                senderName: session.user.name || 'Un usuario',
                                messageText: text || (file ? `Archivo: ${file.name}` : ''),
                                conversationLink: "https://b2bchat.co/chat"
                            });
                            if (result.success) emailSent = true;
                        }
                    }
                }
            } else {
                // Direct message
                const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
                const recipient = await prisma.user.findUnique({
                    where: { id: otherUser?.id },
                    select: { id: true, email: true, name: true, isBot: true, isGhost: true, ghostEmail: true, ghostPhone: true }
                });

                // --- MULTI-CHANNEL ROUTER (WhatsApp > Email > Internal) ---
                const isGhost = recipient?.isGhost;
                let channelUsed = "INTERNAL";
                let externalId = null;

                if (isGhost) {
                    // Check Credits (Gatekeeper)
                    const sender = await prisma.user.findUnique({ where: { id: session.user.id }, select: { creditBalance: true, company: { select: { name: true } } } });

                    if ((sender?.creditBalance || 0) < 1) {
                        // FAIL SILENTLY FOR NOW (or trigger UI warning via socket?)
                        // Ideally we should return 402 if strict, but to not break UI we just don't send external
                        console.warn("[Messages API] Not enough credits for external message");
                    } else {
                        // 1. WhatsApp Channel (Priority)
                        if (recipient?.ghostPhone) {
                            console.log(`[Messages API] Routing to WhatsApp: ${recipient.ghostPhone}`);
                            const { sendWhatsAppMessage } = await import('@/lib/whatsapp/twilio');

                            // Use Template if first contact? (Simplified for now: Just send text)
                            const waSuccess = await sendWhatsAppMessage({
                                to: recipient.ghostPhone, // Helper adds 'whatsapp:' if needed
                                body: `${sender?.company?.name || 'B2BChat User'}: ${text}`
                            });

                            if (waSuccess) {
                                channelUsed = "WHATSAPP";
                                // Deduct Credit
                                await prisma.user.update({
                                    where: { id: session.user.id },
                                    data: { creditBalance: { decrement: 1 } }
                                });
                                // Log Transaction
                                await prisma.creditTransaction.create({
                                    data: {
                                        userId: session.user.id,
                                        amount: -1,
                                        type: "MESSAGE_SENT_WA",
                                        status: "COMPLETED",
                                        description: `WhatsApp to ${recipient.ghostPhone}`
                                    }
                                });
                            }
                        }
                        // 2. Email Channel (Fallback)
                        else if (recipient?.ghostEmail) {
                            console.log(`[Messages API] Routing to Email: ${recipient.ghostEmail}`);
                            const { sendExternalGhostMessage } = await import('@/lib/email');
                            const result = await sendExternalGhostMessage({
                                to: recipient.ghostEmail,
                                senderName: session.user.name || 'Un usuario',
                                companyName: sender?.company?.name || "B2B Chat User",
                                messageText: text || (file ? `Archivo: ${file.name}` : ''),
                                conversationId: params.id,
                            });

                            if (result.success) {
                                channelUsed = "EMAIL";
                                emailSent = true;
                                // Deduct Credit (Optional: Email might be cheaper/free?)
                                // Let's charge for Email too to value the platform
                                await prisma.user.update({
                                    where: { id: session.user.id },
                                    data: { creditBalance: { decrement: 1 } }
                                });
                                await prisma.creditTransaction.create({
                                    data: {
                                        userId: session.user.id,
                                        amount: -1,
                                        type: "MESSAGE_SENT_EMAIL",
                                        status: "COMPLETED",
                                        description: `Email to ${recipient.ghostEmail}`
                                    }
                                });
                            }
                        }
                    }
                }
                // Normal User Email Notification
                else if (recipient?.email && !recipient.isBot) {
                    // Existing logic...
                    const result = await sendNewMessageNotification({
                        to: recipient.email,
                        senderName: session.user.name || 'Un usuario',
                        messageText: text || (file ? `Archivo: ${file.name}` : ''),
                        conversationLink: "https://b2bchat.co/chat"
                    });
                    if (result.success) emailSent = true;
                }

                // Update Message with Channel (if we could update it, sadly prisma create is done above)
                // We will do an update call if channel changed
                if (channelUsed !== "INTERNAL") {
                    await prisma.message.update({
                        where: { id: message.id },
                        data: { channel: channelUsed }
                    });

                    // Update Conversation Last Channel
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { lastChannel: channelUsed }
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail the message sending if email fails
        }

        // Update conversation updatedAt AND calculate simple intent score (Evolution Phase 1.5)
        const lowerText = text.toLowerCase();
        let intentBoost = 0;
        let nextStage = undefined;

        // Simple Keyword Heuristics for "Aha Moment"
        if (lowerText.match(/\b(precio|costo|cuánto|cuanto|vale|cotización|cotizacion|presupuesto)\b/)) {
            intentBoost = 10;
        }
        if (lowerText.match(/\b(comprar|interesa|quiero|necesito|contratar|pedido|orden)\b/)) {
            intentBoost = 20;
            nextStage = 'QUALIFIED';
        }
        if (lowerText.match(/\b(pago|pagar|cuenta|factura|transferencia|nequi|bancolombia)\b/)) {
            intentBoost = 30;
            nextStage = 'CLOSING';
        }

        // Only update if boost detected to avoid unnecessary writes, or just update lastMessageAt always
        const updateData: any = { updatedAt: new Date() };

        if (intentBoost > 0) {
            // Increment existing score (capped at 100)
            updateData.intentScore = {
                increment: intentBoost
            };
            // Cap logic would ideally be in a raw query or separate check, 
            // but for MVP Prisma atomic increment is fine, just won't cap easily without 2 steps.
            // Let's just set stage if needed.
            if (nextStage) {
                updateData.stage = nextStage;
            }
        }

        await prisma.conversation.update({
            where: { id: params.id },
            data: updateData,
        });

        // Determine which bots to trigger
        const botsToTrigger: string[] = [];

        if (conversation.groupId && conversation.group) {
            // Group chat: Find all bots in the group
            conversation.group.members.forEach((member: any) => {
                if (member.user.isBot && member.user.id !== session.user.id) {
                    botsToTrigger.push(member.user.id);
                }
            });
            console.log(`[Messages API] Found ${botsToTrigger.length} bots in group ${conversation.groupId}`);
        } else {
            // Direct chat
            const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
            if (otherUser?.isBot) {
                botsToTrigger.push(otherUser.id);
            }
        }

        // Trigger AI responses
        if (botsToTrigger.length > 0) {
            const baseUrl = process.env.B2BCHAT_AUTH_APP_BASEURL_PROD || process.env.NEXTAUTH_URL ||
                (req.headers.get('origin') || 'http://localhost:3000');

            console.log(`[Messages API] Triggering ${botsToTrigger.length} bots at ${baseUrl}`);

            botsToTrigger.forEach(botId => {
                fetch(`${baseUrl}/api/chat/bot-reply`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationId: params.id,
                        botUserId: botId,
                        userMessage: text || (file ? `Archivo: ${file.name}` : ''),
                    }),
                })
                    .then(res => {
                        if (!res.ok) console.error(`[Messages API] Bot ${botId} trigger failed: ${res.status}`);
                    })
                    .catch(err => console.error(`[Messages API] Error triggering bot ${botId}:`, err));
            });
        }

        return NextResponse.json({ message, emailSent });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Error al enviar mensaje" },
            { status: 500 }
        );
    }
}