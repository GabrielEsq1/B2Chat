import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPayPalWebhook } from "@/lib/paypal-security";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event_type;
        const eventId = body.id; // PayPal's unique event ID
        const resource = body.resource;

        // 🛡️ SECURITY CHECK #1: Verify PayPal Signature
        const headers: Record<string, string> = {};
        req.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });

        const isValidSignature = await verifyPayPalWebhook(headers, body);
        if (!isValidSignature) {
            console.error(`[PayPal Webhook] REJECTED - Invalid signature for event: ${eventId}`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log(`[PayPal Webhook] ✅ Signature verified for event: ${eventType}`);

        // 🛡️ SECURITY CHECK #2: Idempotency - Check if already processed
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: {
                provider_eventId: {
                    provider: 'PAYPAL',
                    eventId: eventId
                }
            }
        });

        if (existingEvent) {
            console.log(`[PayPal Webhook] Event ${eventId} already processed. Skipping.`);
            return NextResponse.json({ success: true, message: 'Already processed' });
        }

        // Store event for idempotency
        await prisma.webhookEvent.create({
            data: {
                provider: 'PAYPAL',
                eventId: eventId,
                eventType: eventType,
                payload: body,
                processed: false
            }
        });

        // Process the event
        console.log(`[PayPal Webhook] Processing new event: ${eventType}`);

        if (eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
            const customId = resource.custom_id; // Company ID
            const subscriptionId = resource.id;
            const planId = resource.plan_id;

            console.log(`[PayPal] Subscription Activated: ${subscriptionId} for Company: ${customId}`);

            const plan = await prisma.plan.findFirst({
                where: { paypalPlanId: planId }
            });

            if (plan && customId) {
                await prisma.subscription.update({
                    where: { companyId: customId },
                    data: {
                        status: 'ACTIVE',
                        paypalSubscriptionId: subscriptionId,
                        planId: plan.id,
                        billingProvider: 'PAYPAL',
                        currentPeriodStart: new Date(resource.start_time),
                    }
                });

                // Mark event as processed
                await prisma.webhookEvent.update({
                    where: {
                        provider_eventId: {
                            provider: 'PAYPAL',
                            eventId: eventId
                        }
                    },
                    data: {
                        processed: true,
                        processedAt: new Date()
                    }
                });

                console.log(`[PayPal] ✅ Subscription ${subscriptionId} activated successfully`);
            }
        }

        else if (eventType === 'BILLING.SUBSCRIPTION.CANCELLED') {
            const subscriptionId = resource.id;
            console.log(`[PayPal] Subscription Cancelled: ${subscriptionId}`);

            await prisma.subscription.updateMany({
                where: { paypalSubscriptionId: subscriptionId },
                data: { status: 'CANCELED' }
            });

            await prisma.webhookEvent.update({
                where: {
                    provider_eventId: {
                        provider: 'PAYPAL',
                        eventId: eventId
                    }
                },
                data: {
                    processed: true,
                    processedAt: new Date()
                }
            });

            console.log(`[PayPal] ✅ Subscription ${subscriptionId} cancelled successfully`);
        }

        else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
            const customId = resource.custom_id; // Company ID
            const amount = parseFloat(resource.amount.value);
            const captureId = resource.id;

            console.log(`[PayPal] Payment Captured: $${amount} from Company: ${customId}`);

            // Grant WhatsApp credits based on amount
            // Example: $15 = 100 credits, $60 = 500 credits
            let credits = 0;
            if (amount === 15) credits = 100;
            else if (amount === 60) credits = 500;
            else if (amount === 150) credits = 1000;

            if (credits > 0 && customId) {
                const subscription = await prisma.subscription.findUnique({
                    where: { companyId: customId }
                });

                if (subscription) {
                    await prisma.addonPurchase.create({
                        data: {
                            subscriptionId: subscription.id,
                            type: `WHATSAPP_CREDITS_${credits}`,
                            amount: credits,
                            remaining: credits,
                            paypalOrderId: captureId
                        }
                    });

                    await prisma.webhookEvent.update({
                        where: {
                            provider_eventId: {
                                provider: 'PAYPAL',
                                eventId: eventId
                            }
                        },
                        data: {
                            processed: true,
                            processedAt: new Date()
                        }
                    });

                    console.log(`[PayPal] ✅ Granted ${credits} WhatsApp credits to company ${customId}`);
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PayPal Webhook Error]", error);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
