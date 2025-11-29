import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/test-message - Test message creation
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log('[TEST-MESSAGE] Session:', session?.user?.id ? 'Found' : 'Not found');

        if (!session?.user?.id) {
            return NextResponse.json({
                error: "No autenticado",
                step: "auth_check"
            }, { status: 401 });
        }

        const { conversationId, text } = await req.json();

        console.log('[TEST-MESSAGE] Request:', { conversationId, text, userId: session.user.id });

        if (!conversationId || !text) {
            return NextResponse.json({
                error: "conversationId y text requeridos",
                step: "validation",
                received: { conversationId, text }
            }, { status: 400 });
        }

        // Check conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
        });

        console.log('[TEST-MESSAGE] Conversation:', conversation ? 'Found' : 'Not found');

        if (!conversation) {
            return NextResponse.json({
                error: "Conversación no encontrada",
                step: "conversation_check",
                conversationId
            }, { status: 404 });
        }

        // Check user is part of conversation
        const isParticipant = conversation.userAId === session.user.id || conversation.userBId === session.user.id;

        console.log('[TEST-MESSAGE] Is participant:', isParticipant);

        if (!isParticipant) {
            return NextResponse.json({
                error: "No autorizado",
                step: "authorization",
                userId: session.user.id,
                conversationUsers: [conversation.userAId, conversation.userBId]
            }, { status: 403 });
        }

        // Create message
        console.log('[TEST-MESSAGE] Creating message...');

        const message = await prisma.message.create({
            data: {
                conversationId,
                senderUserId: session.user.id,
                text,
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

        console.log('[TEST-MESSAGE] Message created:', message.id);

        // Update conversation
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        console.log('[TEST-MESSAGE] Conversation updated');

        return NextResponse.json({
            success: true,
            message,
            step: "complete"
        });
    } catch (error: any) {
        console.error("[TEST-MESSAGE] Error:", error);
        return NextResponse.json({
            error: error.message,
            step: "exception",
            stack: error.stack
        }, { status: 500 });
    }
}
