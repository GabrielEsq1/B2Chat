import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST /api/admin/users/[id]/reset-password - Reset user password (admin only)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);

        if (session?.user?.role !== "SUPERADMIN" && session?.user?.email !== "admin@b2bchat.com") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const body = await req.json();
        const { password } = body;

        if (!password || password.length < 6) {
            return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id },
            data: {
                passwordHash: hashedPassword,
            },
        });

        return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" });
    } catch (error: any) {
        console.error("Error resetting password:", error);
        return NextResponse.json({ error: "Error al actualizar contraseña" }, { status: 500 });
    }
}
