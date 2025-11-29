import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/campaigns - Get all campaigns (admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || user.role !== "SUPERADMIN") {
            return NextResponse.json(
                { error: "No autorizado - Solo administradores" },
                { status: 403 }
            );
        }

        // Get all campaigns with related data
        const campaigns = await prisma.adCampaign.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                creatives: {
                    include: {
                        stats: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // Calculate aggregate stats
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
        console.error("Error fetching admin campaigns:", error);
        return NextResponse.json(
            { error: "Error al obtener campañas" },
            { status: 500 }
        );
    }
}
