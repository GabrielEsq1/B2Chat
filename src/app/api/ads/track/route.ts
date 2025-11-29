import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/ads/track - Track ad impressions and clicks
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { campaignId, creativeId, eventType } = body; // eventType: 'impression' | 'click'

        if (!campaignId || !eventType) {
            return NextResponse.json(
                { error: "campaignId and eventType required" },
                { status: 400 }
            );
        }

        // Validate event type
        if (!['impression', 'click'].includes(eventType)) {
            return NextResponse.json(
                { error: "eventType must be 'impression' or 'click'" },
                { status: 400 }
            );
        }

        // Get campaign with current metrics
        const campaign = await prisma.adCampaign.findUnique({
            where: { id: campaignId },
            include: {
                creatives: true,
            },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            );
        }

        // Check if campaign is active
        if (campaign.status !== "ACTIVE") {
            return NextResponse.json(
                { error: "Campaign is not active" },
                { status: 400 }
            );
        }

        // Calculate cost per event (simple model: $100 per impression, $500 per click)
        const costPerImpression = 100; // COP
        const costPerClick = 500; // COP
        const eventCost = eventType === 'impression' ? costPerImpression : costPerClick;

        // Check if budget allows this event
        const newSpent = campaign.spent + eventCost;
        if (newSpent > campaign.totalBudget) {
            // Budget exhausted - pause campaign
            await prisma.adCampaign.update({
                where: { id: campaignId },
                data: {
                    status: "COMPLETED",
                    spent: campaign.totalBudget, // Cap at total budget
                },
            });

            return NextResponse.json({
                success: true,
                campaignStatus: "COMPLETED",
                message: "Campaign budget exhausted and paused",
            });
        }

        // Update campaign metrics and spent
        const updateData: any = {
            spent: newSpent,
        };

        if (eventType === 'impression') {
            updateData.impressions = campaign.impressions + 1;
        } else if (eventType === 'click') {
            updateData.clicks = campaign.clicks + 1;
        }

        await prisma.adCampaign.update({
            where: { id: campaignId },
            data: updateData,
        });

        // If creative ID provided, track at creative level too
        if (creativeId) {
            const creative = await prisma.adCreative.findUnique({
                where: { id: creativeId },
                include: {
                    stats: true,
                },
            });

            if (creative?.stats) {
                await prisma.adStats.update({
                    where: { id: creative.stats.id },
                    data: {
                        impressions: eventType === 'impression'
                            ? creative.stats.impressions + 1
                            : creative.stats.impressions,
                        clicks: eventType === 'click'
                            ? creative.stats.clicks + 1
                            : creative.stats.clicks,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            eventType,
            newSpent,
            remainingBudget: campaign.totalBudget - newSpent,
            campaignStatus: "ACTIVE",
        });
    } catch (error) {
        console.error("Error tracking ad event:", error);
        return NextResponse.json(
            { error: "Error tracking event" },
            { status: 500 }
        );
    }
}
