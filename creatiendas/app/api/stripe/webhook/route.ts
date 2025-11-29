import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('⚠️ Verificación de webhook falló:', err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                const subscriptionId = session.subscription as string;
                const customerId = session.customer as string;
                // Aquí podrías guardar la suscripción en la BD si lo deseas.
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                await prisma.stripeCustomer.updateMany({
                    where: { stripeCustomerId: subscription.customer as string },
                    data: {}, // puedes actualizar status, plan, etc.
                });
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                // Opcional: marcar como cancelada en la BD.
                break;
            }
        }
    } catch (e) {
        console.error('Error handling webhook:', e);
        return new NextResponse('Webhook handler failed', { status: 500 });
    }

    return new NextResponse(null, { status: 200 });
}
