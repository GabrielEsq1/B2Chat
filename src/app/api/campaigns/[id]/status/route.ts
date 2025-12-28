import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/campaigns/[id]/status - Toggle campaign status (ACTIVE/PAUSED)
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { status } = await req.json();

        if (!["ACTIVE", "PAUSED", "DRAFT"].includes(status)) {
            return NextResponse.json(
                { error: "Estado inválido. Use ACTIVE, PAUSED o DRAFT" },
                { status: 400 }
            );
        }

        // Verify campaign ownership
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: params.id },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        if (campaign.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        // Update campaign status
        const updatedCampaign = await prisma.adCampaign.update({
            where: { id: params.id },
            data: { status },
        });

        return NextResponse.json({
            success: true,
            campaign: updatedCampaign,
        });
    } catch (error) {
        console.error("Error updating campaign status:", error);
        return NextResponse.json(
            { error: "Error al actualizar estado de campaña" },
            { status: 500 }
        );
    }
}
