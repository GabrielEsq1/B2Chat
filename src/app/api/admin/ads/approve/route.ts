import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { adId, action } = await req.json();

        if (!adId || !action || !['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const updatedAd = await prisma.adCreative.update({
            where: { id: adId },
            data: {
                approvalStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                isActive: action === 'APPROVE'
            }
        });

        return NextResponse.json({ success: true, ad: updatedAd });
    } catch (error) {
        console.error('Error updating ad status:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
