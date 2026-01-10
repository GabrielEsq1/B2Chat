import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PAYPAL_API = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function getAccessToken() {
    if (!PAYPAL_CLIENT || !PAYPAL_SECRET) {
        throw new Error("Missing PayPal Credentials");
    }

    const auth = Buffer.from(PAYPAL_CLIENT + ":" + PAYPAL_SECRET).toString("base64");
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`PayPal Auth Failed: ${data.error_description || data.message}`);
    }
    return data.access_token;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { planCode } = await req.json();

        // Get User + Company
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { company: true }
        });

        if (!user?.company) {
            return NextResponse.json({ error: "No company found" }, { status: 400 });
        }

        // Get Plan
        const plan = await prisma.plan.findUnique({
            where: { code: planCode }
        });

        if (!plan || !plan.paypalPlanId) {
            return NextResponse.json({ error: "Plan not configured for PayPal" }, { status: 400 });
        }

        // Create Subscription via PayPal
        const token = await getAccessToken();
        const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify({
                plan_id: plan.paypalPlanId,
                custom_id: user.company.id, // Pass companyId for webhook tracking
                application_context: {
                    brand_name: "B2BChat",
                    locale: "es-ES",
                    shipping_preference: "NO_SHIPPING",
                    user_action: "SUBSCRIBE_NOW",
                    return_url: `${APP_URL}/dashboard?payment=success`,
                    cancel_url: `${APP_URL}/pricing?payment=cancelled`
                }
            })
        });

        const subscription = await response.json();

        if (!response.ok) {
            console.error("PayPal Subscription Error:", subscription);
            return NextResponse.json({ error: "PayPal Error" }, { status: 500 });
        }

        // Find approval link
        const approveLink = subscription.links?.find((l: any) => l.rel === "approve")?.href;

        return NextResponse.json({
            success: true,
            approvalUrl: approveLink,
            subscriptionId: subscription.id
        });

    } catch (error) {
        console.error("[Billing API Error]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
