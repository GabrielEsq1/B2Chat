import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id || session.user.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [
            totalUsers,
            totalCompanies,
            totalCampaigns,
            totalConversations,
            totalMessages,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.adCampaign.count(),
            prisma.conversation.count(),
            prisma.message.count(),
        ]);

        const stats = {
            totalUsers,
            totalCompanies,
            totalCampaigns,
            totalConversations,
            totalMessages,
            totalRevenue: await calculateRevenue(),
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch stats" },
            { status: 500 }
        );
    }
}

async function calculateRevenue() {
    // Calculate revenue based on active subscriptions
    // Prices: PRO=$29, BUSINESS=$99, ENTERPRISE=$299

    const subscriptions = await prisma.subscription.findMany({
        where: { status: 'active' },
        select: { plan: true }
    });

    let revenue = 0;

    for (const sub of subscriptions) {
        switch (sub.plan) {
            case 'PRO': revenue += 29; break;
            case 'BUSINESS': revenue += 99; break;
            case 'ENTERPRISE': revenue += 299; break;
        }
    }

    return revenue;
}
