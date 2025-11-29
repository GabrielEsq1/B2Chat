import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { phone, otpCode } = await req.json();

        if (!phone || !otpCode) {
            return NextResponse.json(
                { success: false, error: "Teléfono y código OTP requeridos" },
                { status: 400 }
            );
        }

        // Find user with matching phone
        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Usuario no encontrado" },
                { status: 404 }
            );
        }

        // Check if OTP exists
        if (!user.otpCode || !user.otpExpiresAt) {
            return NextResponse.json(
                { success: false, error: "No hay código OTP activo. Solicita uno nuevo." },
                { status: 400 }
            );
        }

        // Check if OTP has expired
        if (new Date() > user.otpExpiresAt) {
            return NextResponse.json(
                { success: false, error: "El código OTP ha expirado. Solicita uno nuevo." },
                { status: 400 }
            );
        }

        // Verify OTP
        if (user.otpCode !== otpCode) {
            return NextResponse.json(
                { success: false, error: "Código OTP incorrecto" },
                { status: 400 }
            );
        }

        // Clear OTP after successful verification
        await prisma.user.update({
            where: { phone },
            data: {
                otpCode: null,
                otpExpiresAt: null,
            },
        });

        console.log(`✅ OTP verified successfully for ${phone}`);

        return NextResponse.json({
            success: true,
            message: "Código OTP verificado exitosamente",
            userId: user.id,
        });
    } catch (error: any) {
        console.error("Error verifying OTP:", error);
        return NextResponse.json(
            { success: false, error: "Error al verificar OTP", details: error.message },
            { status: 500 }
        );
    }
}
