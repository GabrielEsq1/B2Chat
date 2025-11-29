import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email requerido" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found to prevent enumeration
            return NextResponse.json({ success: true });
        }

        // Generate a 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Calculate expiration (15 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 15);

        // Store code in database
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetCode,
                resetCodeExpiresAt: expiresAt,
            },
        });

        console.log(`\n=== PASSWORD RESET CODE ===\nUser: ${email}\nCode: ${resetCode}\n===========================\n`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 });
    }
}
