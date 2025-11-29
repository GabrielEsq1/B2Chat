import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns - List user's campaigns
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const campaigns = await prisma.adCampaign.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate stats
        const stats = {
            total: campaigns.length,
            active: campaigns.filter(c => c.status === "ACTIVE").length,
            draft: campaigns.filter(c => c.status === "DRAFT").length,
            paused: campaigns.filter(c => c.status === "PAUSED").length,
            completed: campaigns.filter(c => c.status === "COMPLETED").length,
            totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
            totalBudget: campaigns.reduce((sum, c) => sum + c.totalBudget, 0),
            totalImpressions: campaigns.reduce((sum, c) => sum + c.impressions, 0),
            totalClicks: campaigns.reduce((sum, c) => sum + c.clicks, 0),
            totalConversions: campaigns.reduce((sum, c) => sum + c.conversions, 0),
        };

        return NextResponse.json({
            campaigns,
            stats,
        });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json(
            { error: "Error al obtener campañas" },
            { status: 500 }
        );
    }
}
