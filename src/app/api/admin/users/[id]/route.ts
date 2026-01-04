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

        // Cascading deletes usually handled by database, but we might want to manually clean up sensitive relations if not
        await prisma.user.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Error al eliminar usuario. Puede tener datos relacionados importantes." }, { status: 500 });
    }
}
