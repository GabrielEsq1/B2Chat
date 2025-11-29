import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        // Check if user is admin
        if (session?.user?.email !== "admin@b2bchat.com") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const campaignId = params.id;

        // Update campaign status to REJECTED
        const campaign = await prisma.adCampaign.update({
            where: { id: campaignId },
            data: {
                status: "REJECTED",
            },
        });

        // Update all associated creatives to REJECTED
        await prisma.adCreative.updateMany({
            where: { campaignId: campaignId },
            data: {
                approvalStatus: "REJECTED",
                isActive: false,
            },
        });

        return NextResponse.json({
            success: true,
            campaign,
            message: "Campaña rechazada"
        });
    } catch (error) {
        console.error("Error rejecting campaign:", error);
        return NextResponse.json(
            { error: "Error al rechazar campaña" },
            { status: 500 }
        );
    }
}
