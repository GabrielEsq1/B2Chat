import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-11-20.acacia' as any,
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { planId } = await req.json();

    // Mapeo de planes a precios de Stripe (estos son IDs de prueba, deberás crear los productos en Stripe)
    const plans: Record<string, { priceId: string; months: number; name: string }> = {
        trimestral: {
            priceId: 'price_trimestral', // Reemplazar con ID real de Stripe
            months: 3,
            name: 'Plan Trimestral'
        },
        semestral: {
            priceId: 'price_semestral', // Reemplazar con ID real de Stripe
            months: 6,
            name: 'Plan Semestral'
        },
        anual: {
            priceId: 'price_anual', // Reemplazar con ID real de Stripe
            months: 12,
            name: 'Plan Anual'
        },
    };

    if (!plans[planId]) {
        return NextResponse.json({ error: 'Plan inválido' }, { status: 400 });
    }

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            customer_email: session.user.email,
            line_items: [
                {
                    price: plans[planId].priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/billing?payment=cancelled`,
            metadata: {
                userId: session.user.email,
                planId,
                planName: plans[planId].name,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json({ error: 'Error al crear sesión de pago' }, { status: 500 });
    }
}
