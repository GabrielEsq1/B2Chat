import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nequiDeposit } from '@/lib/nequi/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { amount, method } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user?.phone) {
            return NextResponse.json({ error: 'Phone number not configured' }, { status: 400 });
        }

        // Process deposit
        const transaction = await nequiDeposit(user.phone, amount);

        // Save to database
        const savedTransaction = await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: 'DEPOSIT',
                amount,
                status: transaction.status,
                externalId: transaction.transactionId,
                description: `Depósito vía ${method || 'PSE'}`
            }
        });

        return NextResponse.json({
            success: true,
            transaction
        });
    } catch (error: any) {
        console.error('Nequi deposit error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to process deposit'
        }, { status: 500 });
    }
}
