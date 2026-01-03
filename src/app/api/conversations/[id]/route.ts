import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const conversationId = params.id;

        // Verify conversation exists and user is a participant
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
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

        let isParticipant = false;

        if (conversation.type === "USER_USER") {
            isParticipant = conversation.userAId === session.user.id || conversation.userBId === session.user.id;
        } else if (conversation.groupId) {
            // Check if user is in the group
            isParticipant = conversation.group?.members.some((m: any) => m.userId === session.user.id) || false;
        }

        if (!isParticipant) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        // Delete the conversation
        await prisma.conversation.delete({
            where: { id: conversationId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting conversation:", error);
        return NextResponse.json(
            { error: "Error al eliminar conversación" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const body = await req.json();
        const { isPinned, isFavorite } = body;

        const conversation = await prisma.conversation.update({
            where: { id: params.id },
            data: {
                ...(typeof isPinned === 'boolean' ? { isPinned } : {}),
                ...(typeof isFavorite === 'boolean' ? { isFavorite } : {})
            }
        });

        return NextResponse.json({ success: true, conversation });
    } catch (error) {
        console.error("Error updating conversation:", error);
        return NextResponse.json(
            { error: "Error al actualizar conversación" },
            { status: 500 }
        );
    }
}
