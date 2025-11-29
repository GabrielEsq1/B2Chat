import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch active/approved creatives directly to sort by their update time (approval time)
        const creatives = await prisma.adCreative.findMany({
            where: {
                isActive: true,
                approvalStatus: "APPROVED",
                campaign: {
                    status: "ACTIVE"
                }
            },
            include: {
                campaign: {
                    include: {
                        company: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                updatedAt: "desc", // Show newly approved/updated ads first
            },
            take: 20, // Limit to 20 ads
        });

        // Transform data for the frontend
        const ads = creatives.map((creative) => {
            return {
                id: creative.campaignId, // Use campaign ID for linking if needed, or creative.id
                title: creative.title || creative.campaign.name,
                image: creative.imageUrl || "/placeholder.png",
                description: creative.description || "Oferta especial",
                link: creative.destinationUrl || "#",
                cta: creative.ctaLabel || "Ver Más",
                companyName: creative.campaign.company.name,
            };
        });

        return NextResponse.json({ ads });
    } catch (error) {
        console.error("Error fetching marketplace ads:", error);
        return NextResponse.json(
            { error: "Error fetching ads" },
            { status: 500 }
        );
    }
}
