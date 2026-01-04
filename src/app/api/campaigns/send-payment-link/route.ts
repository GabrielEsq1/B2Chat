import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN_EMPRESA")) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const { campaignId } = await req.json();

        if (!campaignId) {
            return NextResponse.json(
                { error: "Campaign ID requerido" },
                { status: 400 }
            );
        }

        // Get campaign with user info
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
            include: {
                user: true,
                company: true
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        // Generate payment link (for now, simulate with a placeholder)
        const paymentAmount = campaign.totalBudget;
        const paymentLink = `https://pay.b2bchat.com/campaign/${campaign.id}?amount=${paymentAmount}`;

        // Create WhatsApp message
        const message = `🎉 *¡Tu campaña fue aprobada!*

*Campaña:* ${campaign.name}
*Presupuesto Total:* $${paymentAmount.toLocaleString('es-CO')} COP
*Duración:* ${campaign.durationDays} días

Para activar tu campaña, realiza el pago aquí:
${paymentLink}

Una vez confirmado el pago, tu campaña se activará automáticamente.

¿Tienes preguntas? Contáctanos al +57 300 123 4567`;

        // Encode message for WhatsApp
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${campaign.user.phone.replace('+', '')}&text=${encodedMessage}`;

        console.log(`📱 WhatsApp link generated for campaign ${campaign.id}`);
        console.log(`User: ${campaign.user.name} (${campaign.user.phone})`);

        // Update campaign with payment link
        await prisma.adCampaign.update({
            where: { id: campaignId },
            data: {
                // Store payment link in a custom field if needed
                // For now, we'll just log it
            }
        });

        return NextResponse.json({
            success: true,
            whatsappUrl,
            paymentLink,
            message: "Link de pago generado. Abre WhatsApp para enviar el mensaje."
        });
    } catch (error) {
        console.error("Error sending payment link:", error);
        return NextResponse.json(
            { error: "Error al enviar link de pago" },
            { status: 500 }
        );
    }
}
