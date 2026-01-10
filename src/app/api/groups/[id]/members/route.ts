import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendNewMessageNotification } from "@/lib/email";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params; // This is the conversation ID or Group ID? 
    // In ChatWindow, we have conversation.id, and conversation.groupId.
    // Let's assume the ID in the URL is the groupId.

    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();
        const { userId, identifier } = body; // identifier could be email or phone

        let targetUser = null;
        if (userId) {
            targetUser = await prisma.user.findUnique({ where: { id: userId } });
        } else if (identifier) {
            targetUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { phone: identifier }
                    ]
                }
            });
        }

        if (!targetUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        // Add to group
        const group = await prisma.group.findUnique({
            where: { id: id },
            include: { members: true }
        });

        if (!group) {
            return NextResponse.json({ error: "Grupo no encontrado" }, { status: 404 });
        }

        // Check if user is already a member
        const isMember = group.members.some(m => m.userId === targetUser.id);
        if (isMember) {
            return NextResponse.json({ error: "El usuario ya es parte del grupo" }, { status: 400 });
        }

        await prisma.groupMember.create({
            data: {
                groupId: id,
                userId: targetUser.id,
                isAdmin: false
            }
        });

        // Notify all members (including the new one)
        const allMembers = await prisma.groupMember.findMany({
            where: { groupId: id },
            include: { user: { select: { email: true, name: true } } }
        });

        await Promise.all(allMembers.map(async (m) => {
            if (m.user.email) {
                try {
                    await sendNewMessageNotification({
                        to: m.user.email,
                        senderName: session.user.name || 'B2BChat',
                        messageText: `${targetUser.name} ha sido añadido al grupo ${group.name}`,
                        conversationLink: "https://b2bchat.co/chat"
                    });
                } catch (e) {
                    console.error("Error sending notification:", e);
                }
            }
        }));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error adding member:", error);
        return NextResponse.json({ error: "Error al añadir miembro" }, { status: 500 });
    }
}
