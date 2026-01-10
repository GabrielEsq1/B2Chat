import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const messages = await prisma.message.findMany({
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
                        name: true,
                        avatar: true,
                        profilePicture: true
                    }
                },
                conversation: {
                    include: {
                        userA: {
                            select: { id: true, name: true }
                        },
                        userB: {
                            select: { id: true, name: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map to include other user name for display
        const mappedMessages = messages.map((msg: any) => {
            const otherUser = msg.conversation.userAId === session.user.id
                ? msg.conversation.userB
                : msg.conversation.userA;

            return {
                ...msg,
                otherUserName: otherUser?.name || "Usuario"
            };
        });

        return NextResponse.json({ messages: mappedMessages });

    } catch (error: any) {
        console.error("Error fetching starred messages:", error);
        return NextResponse.json({ error: "No se pudieron cargar los mensajes destacados" }, { status: 500 });
    }
}
