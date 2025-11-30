import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nequiGetBalance } from '@/lib/nequi/client';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's phone number
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user?.phone) {
            return NextResponse.json({ error: 'Phone number not configured' }, { status: 400 });
        }

        // Get balance from Nequi
        const balance = await nequiGetBalance(user.phone);

        return NextResponse.json({
            balance,
            currency: 'COP',
            phone: user.phone
        });
    } catch (error: any) {
        console.error('Nequi balance error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to get balance'
        }, { status: 500 });
    }
}
