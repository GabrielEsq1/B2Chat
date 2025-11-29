import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

        // 6. Return
        return NextResponse.json({
            success: true,
            message
        });

    } catch (error: any) {
        console.error('[SEND] Error:', error);
        return NextResponse.json(
            { error: error.message || "Error al enviar mensaje" },
            { status: 500 }
        );
    }
}
