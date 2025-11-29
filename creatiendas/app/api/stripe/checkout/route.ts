import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { priceId } = await req.json(); // ID del precio de Stripe

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stripeCustomer: true },
    });
    if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Crear cliente Stripe si no existe
    let stripeCustomerId = user.stripeCustomer?.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined });
        await prisma.stripeCustomer.create({ data: { userId: user.id, stripeCustomerId: customer.id } });
        stripeCustomerId = customer.id;
    }

    const checkout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: stripeCustomerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: checkout.url });
}
