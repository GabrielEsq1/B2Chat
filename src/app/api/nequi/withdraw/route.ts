import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nequiWithdraw } from '@/lib/nequi/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, destination } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user?.phone) {
            return NextResponse.json({ error: 'Phone number not configured' }, { status: 400 });
        }

        // Process withdrawal
        const transaction = await nequiWithdraw(user.phone, amount);

        // Save to database
        await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: 'WITHDRAW',
                amount,
                status: transaction.status,
                externalId: transaction.transactionId,
                description: `Retiro a ${destination || 'cuenta bancaria'}`
            }
        });

        return NextResponse.json({
            success: true,
            transaction
        });
    } catch (error: any) {
        console.error('Nequi withdraw error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process withdrawal'
        }, { status: 500 });
    }
}
