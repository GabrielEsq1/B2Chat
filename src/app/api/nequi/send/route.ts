import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { nequiSendMoney } from '@/lib/nequi/client';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipientPhone, amount, message } = await req.json();

        if (!recipientPhone || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get sender's phone
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user?.phone) {
            return NextResponse.json({ error: 'Phone number not configured' }, { status: 400 });
        }

        // Send money via Nequi
        const transaction = await nequiSendMoney(
            user.phone,
            recipientPhone,
            amount,
            message || 'Pago desde B2BChat'
        );

        // Save transaction to database
        await prisma.transaction.create({
            data: {
                userId: session.user.id,
                type: 'SEND',
                amount,
                recipientPhone,
                status: transaction.status,
                externalId: transaction.transactionId,
                description: message
            }
        });

        return NextResponse.json({
            success: true,
            transaction
        });
    } catch (error: any) {
        console.error('Nequi send error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to send money'
        }, { status: 500 });
    }
}
