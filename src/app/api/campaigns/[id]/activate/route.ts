import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// @ts-ignore
// POST /api/campaigns/[id]/activate - Activate campaign
export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const campaign = await prisma.adCampaign.findUnique({
            where: { id },
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

        // Calculate end date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + campaign.durationDays);

        const updatedCampaign = await prisma.adCampaign.update({
            where: { id },
            data: {
                status: "ACTIVE",
                startDate,
                endDate,
            },
        });

        return NextResponse.json({
            success: true,
            campaign: updatedCampaign,
            message: "Campaña activada exitosamente",
        });
    } catch (error) {
        console.error("Error activating campaign:", error);
        return NextResponse.json(
            { error: "Error al activar campaña" },
            { status: 500 }
        );
    }
}
