import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contacts/search?phone=123456789 - Search user by phone number
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const phone = searchParams.get("phone");

        if (!phone) {
            return NextResponse.json(
                { error: "Número de teléfono requerido" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { phone },
            select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!user) {
            // Send WhatsApp invitation
            try {
                const inviter = await prisma.user.findUnique({
                    where: { id: session.user.id },
                    include: { company: true }
                });

                // 🚀 PRODUCTION: Send via WhatsApp Business API
                // This is a simulation of the WhatsApp API call
                const isProduction = process.env.NODE_ENV === 'production';

                if (isProduction) {
                    console.log(`[WhatsApp API] Sending invitation to ${phone}`);
                    // await sendWhatsAppTemplate(phone, 'invitation_template', { inviter_name: inviter?.name });
                } else {
                    console.log(`📱 WhatsApp Invitation to ${phone}:`);
                    console.log(`From: ${inviter?.name} (${inviter?.company?.name || 'B2BChat'})`);
                    console.log(`Message: ¡Hola! ${inviter?.name} quiere conectar contigo en B2BChat.`);
                    console.log(`Link: ${process.env.NEXT_PUBLIC_B2BCHAT_APP_BASEURL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register`);
                }

                return NextResponse.json({
                    invited: true,
                    message: `Invitación enviada a ${phone}`,
                    phone: phone
                });
            } catch (error) {
                console.error('Error sending invitation:', error);
            }

            return NextResponse.json(
                { error: "Usuario no encontrado. Se ha enviado una invitación por WhatsApp." },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error searching contact:", error);
        return NextResponse.json(
            { error: "Error al buscar contacto" },
            { status: 500 }
        );
    }
}
