import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plan-limits";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                creditBalance: true,
                planType: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const planDetails = PLAN_LIMITS[user.planType];

        return NextResponse.json({
            balance: user.creditBalance,
            plan: user.planType,
            planDetails,
        });
    } catch (error) {
        console.error("Error fetching credit balance:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
