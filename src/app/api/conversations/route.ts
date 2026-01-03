import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/conversations - List user's conversations
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            console.log("[API/Conversations] Unauthorized access attempt");
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        console.log(`[API/Conversations] Fetching for userId: ${session.user.id}`);

        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id },
                    {
                        group: {
                            members: {
                                some: { userId: session.user.id }
                            }
                        }
                    }
                ],
            },
            include: {
                userA: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                        isBot: true,
                    },
                },
                userB: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                        isBot: true,
                    },
                },
                group: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        console.log(`[API/Conversations] Found ${conversations.length} conversations for user ${session.user.id}`);

        // Format conversations with other user info or group info
        const formattedConversations = conversations.map((conv: any) => {
            const isGroup = conv.type === "GROUP";
            const lastMessage = conv.messages[0];

            if (isGroup && conv.group) {
                return {
                    id: conv.id,
                    type: "GROUP",
                    name: conv.group.name,
                    avatar: conv.group.avatar,
                    memberCount: conv.group.members.length,
                    lastMessage: lastMessage ? {
                        text: lastMessage.text,
                        createdAt: lastMessage.createdAt,
                        isRead: lastMessage.readAt !== null,
                    } : null,
                    updatedAt: conv.updatedAt,
                    group: conv.group,
                    isPinned: conv.isPinned,
                    isFavorite: conv.isFavorite,
                };
            }

            const otherUser = conv.userAId === session.user.id ? conv.userB : conv.userA;
            return {
                id: conv.id,
                type: "USER_USER",
                otherUser,
                lastMessage: lastMessage ? {
                    text: lastMessage.text,
                    createdAt: lastMessage.createdAt,
                    isRead: lastMessage.readAt !== null,
                } : null,
                updatedAt: conv.updatedAt,
                isPinned: conv.isPinned,
                isFavorite: conv.isFavorite,
            };
        });

        return NextResponse.json({ conversations: formattedConversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        return NextResponse.json(
            { error: "Error al obtener conversaciones" },
            { status: 500 }
        );
    }
}

// POST /api/conversations - Create new conversation
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { phone, participantId, type } = await req.json();

        if (!phone && !participantId && type !== 'USER_AI') {
            return NextResponse.json(
                { error: "Número de teléfono o ID de participante requerido" },
                { status: 400 }
            );
        }

        let otherUser;

        // Handle AI Bot conversation
        if (type === 'USER_AI') {
            otherUser = await prisma.user.findFirst({
                where: {
                    isBot: true,
                    botPersonality: 'assistant'
                }
            });

            if (!otherUser) {
                return NextResponse.json(
                    { error: "Bot de IA no configurado" },
                    { status: 404 }
                );
            }
        } else if (participantId) {
            otherUser = await prisma.user.findUnique({
                where: { id: participantId },
            });
        } else {
            otherUser = await prisma.user.findUnique({
                where: { phone },
            });
        }

        if (!otherUser) {
            return NextResponse.json(
                { error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        if (otherUser.id === session.user.id) {
            return NextResponse.json(
                { error: "No puedes crear una conversación contigo mismo" },
                { status: 400 }
            );
        }

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { userAId: session.user.id, userBId: otherUser.id },
                    { userAId: otherUser.id, userBId: session.user.id },
                ],
            },
        });

        if (existingConversation) {
            return NextResponse.json({
                conversation: existingConversation,
                message: "Conversación ya existe",
            });
        }

        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                type: "USER_USER",
                userAId: session.user.id,
                userBId: otherUser.id,
            },
            include: {
                userA: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
                userB: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        avatar: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            conversation,
        });
    } catch (error) {
        console.error("Error creating conversation:", error);
        return NextResponse.json(
            { error: "Error al crear conversación" },
            { status: 500 }
        );
    }
}

// DELETE /api/conversations - Delete conversations
export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { conversationIds } = await req.json();

        if (!conversationIds || !Array.isArray(conversationIds) || conversationIds.length === 0) {
            return NextResponse.json(
                { error: "IDs de conversación requeridos" },
                { status: 400 }
            );
        }

        // 1. Delete all messages associated with these conversations first
        await prisma.message.deleteMany({
            where: {
                conversationId: { in: conversationIds }
            }
        });

        // 2. Delete the conversations themselves
        const result = await prisma.conversation.deleteMany({
            where: {
                id: { in: conversationIds },
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id }
                ]
            }
        });

        return NextResponse.json({
            success: true,
            count: result.count,
            message: `${result.count} conversaciones eliminadas`
        });
    } catch (error) {
        console.error("Error deleting conversations:", error);
        return NextResponse.json(
            { error: "Error al eliminar conversaciones" },
            { status: 500 }
        );
    }
}
