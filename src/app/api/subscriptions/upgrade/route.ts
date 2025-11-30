import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plan-limits";
import { PlanType, TransactionType } from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planId } = await req.json();

        if (!planId || !PLAN_LIMITS[planId as PlanType]) {
            return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
        }

        const newPlan = planId as PlanType;
        const planDetails = PLAN_LIMITS[newPlan];

        // In a real app, we would verify payment here (Stripe webhook)
        // For this autonomous system, we simulate a successful upgrade

        const result = await prisma.$transaction(async (tx) => {
            // Update user plan and credits
            const user = await tx.user.update({
                where: { id: session.user.id },
                data: {
                    planType: newPlan,
                    creditBalance: {
                        increment: planDetails.credits, // Add credits associated with the plan
                    },
                },
            });

            // Log transaction
            await tx.creditTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: planDetails.credits,
                    type: TransactionType.RECHARGE, // Or BONUS/PLAN_UPGRADE
                    description: `Upgrade to ${planDetails.name} Plan`,
                    referenceId: `PLAN_${newPlan}`,
                },
            });

            // Update or create subscription record
            await tx.subscription.upsert({
                where: { userId: session.user.id },
                create: {
                    userId: session.user.id,
                    plan: newPlan,
                    status: "active",
                },
                update: {
                    plan: newPlan,
                    status: "active",
                    updatedAt: new Date(),
                },
            });

            return user;
        });

        return NextResponse.json({ success: true, user: result });
    } catch (error) {
        console.error("Error upgrading plan:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
