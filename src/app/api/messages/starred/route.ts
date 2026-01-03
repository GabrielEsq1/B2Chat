import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        // Find messages where isStarred is true and the user is either the sender or receiver
        // Note: isStarred is a flag per message. For now, we show all starred messages in conversations the user is part of.
        const starredMessages = await prisma.message.findMany({
            where: {
                isStarred: true,
                conversation: {
                    OR: [
                        { userAId: session.user.id },
                        { userBId: session.user.id }
                    ]
                }
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true
                    }
                },
                conversation: {
                    include: {
                        userA: true,
                        userB: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formatted = starredMessages.map(msg => {
            const conversation = msg.conversation;
            const otherUser = conversation.userAId === session.user.id ? conversation.userB : conversation.userA;
            return {
                id: msg.id,
                text: msg.text,
                createdAt: msg.createdAt,
                sender: msg.sender,
                conversationId: msg.conversationId,
                otherUserName: otherUser?.name
            };
        });

        return NextResponse.json({ success: true, messages: formatted });
    } catch (error) {
        console.error("Error fetching starred messages:", error);
        return NextResponse.json({ error: "Error al obtener mensajes destacados" }, { status: 500 });
    }
}
