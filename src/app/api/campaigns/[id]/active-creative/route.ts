import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns/[campaignId]/active-creative - Get current active creative (for display)
export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: campaignId } = params;

    try {
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
            include: {
                creatives: {
                    where: { isActive: true },
                    orderBy: { displayOrder: "asc" },
                    include: {
                        stats: true,
                    },
                },
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        // Get the creative that should be displayed now
        const activeCreative = await getActiveCreative(campaignId);

        if (!activeCreative) {
            return NextResponse.json(
                { error: "No hay creativos activos" },
                { status: 404 }
            );
        }

        // Update impression count
        await prisma.adCreative.update({
            where: { id: activeCreative.id },
            data: {
                impressionsCount: { increment: 1 },
                lastShownAt: new Date(),
            },
        });

        return NextResponse.json({
            creative: activeCreative,
            rotationInfo: {
                totalCreatives: campaign.creatives.length,
                rotationHours: activeCreative.rotationHours,
                nextRotation: getNextRotationTime(activeCreative),
            },
        });
    } catch (error) {
        console.error("Error getting active creative:", error);
        return NextResponse.json(
            { error: "Error al obtener creative activo" },
            { status: 500 }
        );
    }
}

// Helper function to get the active creative based on rotation
async function getActiveCreative(campaignId: string) {
    const creatives = await prisma.adCreative.findMany({
        where: {
            campaignId,
            isActive: true,
        },
        orderBy: { displayOrder: "asc" },
    });

    if (creatives.length === 0) return null;
    if (creatives.length === 1) return creatives[0];

    // Find which creative should be shown based on rotation
    const now = new Date();

    for (const creative of creatives) {
        if (!creative.lastShownAt || !creative.rotationHours) {
            return creative; // First time showing or no rotation
        }

        const hoursSinceLastShown =
            (now.getTime() - creative.lastShownAt.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastShown < creative.rotationHours) {
            return creative; // Still within rotation window
        }
    }

    // All creatives have exceeded rotation time, return first one
    return creatives[0];
}

function getNextRotationTime(creative: any): Date | null {
    if (!creative.lastShownAt || !creative.rotationHours) return null;

    const nextRotation = new Date(creative.lastShownAt);
    nextRotation.setHours(nextRotation.getHours() + creative.rotationHours);

    return nextRotation;
}
