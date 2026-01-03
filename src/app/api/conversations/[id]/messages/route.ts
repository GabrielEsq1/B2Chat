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
        try {
            const baseUrl = process.env.B2BCHAT_AUTH_APP_BASEURL_PROD || process.env.NEXTAUTH_URL ||
                (req.headers.get('origin') || 'http://localhost:3000');

            if (conversation.groupId) {
                // Group notification: Send to all members except sender
                const otherMembers = conversation.group?.members.filter((m: any) => m.userId !== session.user.id && !m.user.isBot);
                if (otherMembers) {
                    for (const member of otherMembers) {
                        if (member.user.email) {
                            await sendNewMessageNotification({
                                to: member.user.email,
                                senderName: session.user.name || 'Un usuario',
                                messageText: text || (file ? `Archivo: ${file.name}` : ''),
                                conversationLink: `${baseUrl}/chat/${params.id}`
                            });
                        }
                    }
                }
            } else {
                // Direct message: Send to the other user
                const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
                // We need to fetch the email because it might not be in the initial conversation query (if we didn't select it)
                // Actually conversation.userA/userB were fetched but without email. Let's ensure we have it.
                const recipient = await prisma.user.findUnique({
                    where: { id: otherUser?.id },
                    select: { email: true, name: true, isBot: true }
                });

                if (recipient?.email && !recipient.isBot) {
                    await sendNewMessageNotification({
                        to: recipient.email,
                        senderName: session.user.name || 'Un usuario',
                        messageText: text || (file ? `Archivo: ${file.name}` : ''),
                        conversationLink: `${baseUrl}/chat/${params.id}`
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send email notification:", emailError);
            // Don't fail the message sending if email fails
        }

        // Update conversation updatedAt
        await prisma.conversation.update({
            where: { id: params.id },
            data: { updatedAt: new Date() },
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

        return NextResponse.json({ message });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Error al enviar mensaje" },
            { status: 500 }
        );
    }
}