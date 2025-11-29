import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate a 6-digit OTP
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
    try {
        const { phone } = await req.json();

        if (!phone) {
            return NextResponse.json(
                { success: false, error: "Número de teléfono requerido" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { phone },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "Usuario no encontrado con este número" },
                { status: 404 }
            );
        }

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save OTP to database
        await prisma.user.update({
            where: { phone },
            data: {
                otpCode,
                otpExpiresAt,
            },
        });

        // 🚀 PRODUCTION: Send via WhatsApp Business API
        // This is a simulation of the WhatsApp API call
        // In a real scenario, you would use Twilio or Meta Graph API here

        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction) {
            console.log(`[WhatsApp API] Sending OTP ${otpCode} to ${phone}`);
            // await sendWhatsAppMessage(phone, `Tu código de verificación B2BChat es: ${otpCode}`);
        } else {
            console.log(`\n📱 WhatsApp OTP for ${phone}: ${otpCode}`);
            console.log(`⏱️  Expires at: ${otpExpiresAt.toLocaleTimeString()}\n`);
        }

        return NextResponse.json({
            success: true,
            message: "Código OTP enviado exitosamente",
            // In dev mode, return the OTP (remove in production!)
            ...(process.env.NODE_ENV === 'development' && { otpCode }),
        });
    } catch (error: any) {
        console.error("Error sending OTP:", error);
        return NextResponse.json(
            { success: false, error: "Error al enviar OTP", details: error.message },
            { status: 500 }
        );
    }
}
