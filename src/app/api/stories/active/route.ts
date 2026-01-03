import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Fetching active story campaigns...");
        const activeCampaigns = await prisma.adCampaign.findMany({
            where: {
                status: "ACTIVE",
            },
            include: {
                company: true,
                creatives: {
                    where: {
                        isActive: true,
                        // allow pending for demo purposes if needed, but in prod should be APPROVED
                        // approvalStatus: "APPROVED" 
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        const groupedStories = new Map();

        for (const campaign of activeCampaigns) {
            if (!campaign.company || campaign.creatives.length === 0) continue;

            const companyId = campaign.company.id;

            if (!groupedStories.has(companyId)) {
                groupedStories.set(companyId, {
                    companyId: companyId,
                    companyName: campaign.company.name,
                    // Use UI Avatars if no logo is available (Company model currently lacks logo)
                    companyLogo: `https://ui-avatars.com/api/?name=${encodeURIComponent(campaign.company.name)}&background=random`,
                    stories: []
                });
            }

            const group = groupedStories.get(companyId);

            for (const creative of campaign.creatives) {
                // Push story items to the group
                group.stories.push({
                    id: creative.id,
                    mediaUrl: creative.imageUrl || creative.videoUrl || "",
                    mediaType: creative.type, // IMAGE or VIDEO
                    duration: creative.type === 'VIDEO' ? (creative.videoDuration || 15) : (creative.duration || 5),
                    ctaLink: creative.destinationUrl || "",
                    ctaText: creative.ctaLabel || "Ver Más"
                });
            }
        }

        const result = Array.from(groupedStories.values());
        console.log(`Found ${result.length} story groups.`);

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error fetching stories:", error);
        return NextResponse.json({ error: "Error loading stories" }, { status: 500 });
    }
}
