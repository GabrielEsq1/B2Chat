import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stripeCustomer: true },
    });

    if (!user?.stripeCustomer?.stripeCustomerId) {
        return NextResponse.json({ error: 'Cliente Stripe no encontrado' }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomer.stripeCustomerId,
        return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });

    return NextResponse.json({ url: portal.url });
}
