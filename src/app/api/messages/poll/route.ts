import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/messages/poll?conversationId=xxx&lastMessageId=xxx
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");
        const lastMessageId = searchParams.get("lastMessageId");

        if (!conversationId) {
            return NextResponse.json({ error: "conversationId requerido" }, { status: 400 });
        }

        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                OR: [
                    { userAId: session.user.id },
                    { userBId: session.user.id },
                ],
            },
        });

        if (!conversation) {
            return NextResponse.json({ error: "Conversación no encontrada" }, { status: 404 });
        }

        // Get new messages since lastMessageId
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
                ...(lastMessageId ? { id: { gt: lastMessageId } } : {}),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        isBot: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
            take: 50,
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error polling messages:", error);
        return NextResponse.json({ error: "Error al obtener mensajes" }, { status: 500 });
    }
}
