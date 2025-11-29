import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (session?.user?.email !== "admin@b2bchat.com") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const campaignId = params.id;

        // Update campaign status to ACTIVE (approved)
        const campaign = await prisma.adCampaign.update({
            where: { id: campaignId },
            data: {
                status: "ACTIVE",
                startDate: new Date(),
            },
        });

        // Update all associated creatives to APPROVED
        await prisma.adCreative.updateMany({
            where: { campaignId: campaignId },
            data: {
                approvalStatus: "APPROVED",
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            campaign,
            message: "Campaña aprobada y activada"
        });
    } catch (error) {
        console.error("Error approving campaign:", error);
        return NextResponse.json(
            { error: "Error al aprobar campaña" },
            { status: 500 }
        );
    }
}
