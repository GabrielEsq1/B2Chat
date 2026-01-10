
const PAYPAL_API = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;

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

export async function createProduct(name: string, description: string) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/catalogs/products`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            description,
            type: "SERVICE",
            category: "SOFTWARE",
        }),
    });
    return response.json();
}

export async function createPlan(productId: string, name: string, price: number) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/billing/plans`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            product_id: productId,
            name: name,
            description: `Monthly subscription for ${name}`,
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: "MONTH",
                        interval_count: 1,
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0, // Infinite
                    pricing_scheme: {
                        fixed_price: {
                            value: price.toString(),
                            currency_code: "USD",
                        },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: {
                    value: "0",
                    currency_code: "USD",
                },
                setup_fee_failure_action: "CONTINUE",
                payment_failure_threshold: 3,
            },
        }),
    });
    return response.json();
}

export async function createAddonOrder(amount: number) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: amount.toString(),
                    },
                    description: "B2BChat WhatsApp Credits Add-on",
                },
            ],
        }),
    });
    return response.json(); // Returns order ID and approval link
}

export async function captureOrder(orderId: string) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.json();
}

export async function getSubscriptionDetails(subscriptionId: string) {
    const token = await getAccessToken();
    const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    return response.json();
}
