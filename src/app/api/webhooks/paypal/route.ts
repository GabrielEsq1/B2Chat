
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubscriptionDetails } from "@/lib/paypal";

// In production, use Webhook ID to verify signature
// const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event_type;
        const resource = body.resource;

        console.log(`[PayPal Webhook] Received event: ${eventType}`);

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
            // Subscription created/activated
            const customId = resource.custom_id; // Pass companyId here during creation
            const subscriptionId = resource.id;
            const planId = resource.plan_id;

            console.log(`[PayPal] Subscription Activated: ${subscriptionId} for Company: ${customId}`);

            // Update DB
            // Find plan by paypalPlanId
            const plan = await prisma.plan.findFirst({
                where: { paypalPlanId: planId }
            });

            if (plan && customId) {
                await prisma.subscription.update({
                    where: { companyId: customId }, // Assuming custom_id is companyId
                    data: {
                        status: 'ACTIVE',
                        paypalSubscriptionId: subscriptionId,
                        planId: plan.id,
                        billingProvider: 'PAYPAL',
                        currentPeriodStart: new Date(resource.start_time),
                    }
                });
            }
        }

        else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const subscriptionId = resource.id;
            console.log(`[PayPal] Subscription Cancelled: ${subscriptionId}`);

            await prisma.subscription.updateMany({
                where: { paypalSubscriptionId: subscriptionId },
                data: { status: 'CANCELED' }
            });
        }

        else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            // One-time payment (Add-on)
            // Logic to add credits based on amount
            const customId = resource.custom_id; // UserId or CompanyId
            const amount = resource.amount.value;

            console.log(`[PayPal] Payment Captured: $${amount} from User/Company: ${customId}`);

            // Logic to grant credits...
            // Use prisma to add credits to user/company linked to customId
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PayPal Webhook Error]", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
