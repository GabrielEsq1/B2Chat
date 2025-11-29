import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || user.resetCode !== code) {
            return NextResponse.json({ error: "Código inválido" }, { status: 400 });
        }

        if (!user.resetCodeExpiresAt || new Date() > user.resetCodeExpiresAt) {
            return NextResponse.json({ error: "El código ha expirado" }, { status: 400 });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetCode: null,
                resetCodeExpiresAt: null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Error al restablecer contraseña" }, { status: 500 });
    }
}
