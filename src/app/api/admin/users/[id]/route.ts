import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/users/[id] - Update user (admin only)
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN_EMPRESA") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const body = await req.json();
        const { name, email, phone, role, position, industry, companyId } = body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                role,
                position,
                industry,
                // Handle company connection/disconnection if needed, keeping it simple for now
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
    }
}

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN_EMPRESA") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        // Optional: Check if user is superadmin and prevent deletion
        const targetUser = await prisma.user.findUnique({ where: { id } });
        if (targetUser?.role === 'SUPERADMIN') {
            return NextResponse.json({ error: "No se puede eliminar a un Super Admin" }, { status: 400 });
        }

        // Manual cascading delete for relations without database-level cascade
        await prisma.$transaction(async (tx: any) => {
            // 1. Delete AdCampaigns (Creatives cascade from Campaign)
            await tx.adCampaign.deleteMany({ where: { userId: id } });

            // 2. Delete Stores (Products cascade from Store)
            await tx.store.deleteMany({ where: { ownerUserId: id } });

            // 3. Delete Subscriptions
            await tx.subscription.deleteMany({ where: { userId: id } });

            // 4. Delete Messages sent by user
            await tx.message.deleteMany({ where: { senderUserId: id } });

            // 5. Delete Conversations where user is A or B
            // Note: This is aggressive, it cleans up chats associated with the deleted user.
            // Messages in these conversations need to be deleted first if not cascading.
            const userConversations = await tx.conversation.findMany({
                where: { OR: [{ userAId: id }, { userBId: id }] },
                select: { id: true }
            });
            const conversationIds = userConversations.map((c: any) => c.id);

            if (conversationIds.length > 0) {
                await tx.message.deleteMany({ where: { conversationId: { in: conversationIds } } });
                await tx.conversation.deleteMany({ where: { id: { in: conversationIds } } });
            }

            // 6. Delete Group Memberships (Handled by DB cascade but good to be explicit/safe)
            // await tx.groupMember.deleteMany({ where: { userId: id } });

            // 7. Finally delete the User
            await tx.user.delete({ where: { id } });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Error al eliminar usuario. Puede tener datos relacionados importantes." }, { status: 500 });
    }
}
