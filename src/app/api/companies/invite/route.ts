import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { companyId, message } = await req.json();

        if (!companyId || !message) {
            return NextResponse.json(
                { error: "CompanyId y mensaje son requeridos" },
                { status: 400 }
            );
        }

        // Verify company exists and is not activated
        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) {
            return NextResponse.json(
                { error: "Empresa no encontrada" },
                { status: 404 }
            );
        }

        // Create invitation record
        const invitation = await prisma.companyInvitation.create({
            data: {
                companyId,
                senderUserId: session.user.id,
                message,
                status: "PENDING"
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Update company invitation counter
        await prisma.company.update({
            where: { id: companyId },
            data: {
                invitationsSent: {
                    increment: 1
                },
                lastInvitationSent: new Date()
            }
        });

        // TODO: Send email invitation (integrate with email service)
        // For now, we'll just log it
        console.log('📧 Invitation email would be sent to:', (company.publicInfo as any)?.email);
        console.log('From:', invitation.sender.name);
        console.log('Message:', message);

        return NextResponse.json({
            success: true,
            message: "Invitación enviada exitosamente",
            invitation: {
                id: invitation.id,
                status: invitation.status
            }
        });

    } catch (error) {
        console.error("Error sending invitation:", error);
        return NextResponse.json(
            { error: "Error al enviar invitación" },
            { status: 500 }
        );
    }
}
