import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAddCreative, getRotationHours } from "@/lib/plan-limits";

// POST /api/campaigns/[id]/creatives - Add creative to campaign
export async function POST(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: campaignId } = params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Get campaign and verify ownership
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
            include: {
                creatives: true,
                user: {
                    include: {
                        subscription: true,
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

        if (campaign.userId !== session.user.id) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        // Check plan limits
        const userPlan = campaign.user.subscription?.plan || "FREE";
        const currentCreativeCount = campaign.creatives.length;

        if (!canAddCreative(currentCreativeCount, userPlan as any)) {
            return NextResponse.json(
                {
                    error: `Has alcanzado el límite de creativos para tu plan ${userPlan}`,
                    currentCount: currentCreativeCount,
                    plan: userPlan,
                },
                { status: 403 }
            );
        }

        const data = await req.json();

        // Get rotation hours based on plan
        const rotationHours = getRotationHours(userPlan as any);

        // Create creative
        const creative = await prisma.adCreative.create({
            data: {
                campaignId,
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                type: data.type || "IMAGE",
                ctaLabel: data.ctaLabel,
                displayOrder: currentCreativeCount,
                rotationHours,
                isActive: true,
            },
        });

        return NextResponse.json({
            success: true,
            creative,
            message: "Creative agregado exitosamente",
        });
    } catch (error) {
        console.error("Error adding creative:", error);
        return NextResponse.json(
            { error: "Error al agregar creative" },
            { status: 500 }
        );
    }
}

// GET /api/campaigns/[id]/creatives - Get all creatives for campaign
export async function GET(
    req: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const { id: campaignId } = params;

    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Verify campaign ownership
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
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

        // Get all creatives
        const creatives = await prisma.adCreative.findMany({
            where: { campaignId },
            orderBy: { displayOrder: "asc" },
            include: {
                stats: true,
            },
        });

        return NextResponse.json({ creatives });
    } catch (error) {
        console.error("Error fetching creatives:", error);
        return NextResponse.json(
            { error: "Error al obtener creativos" },
            { status: 500 }
        );
    }
}
