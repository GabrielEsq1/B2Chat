import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const ads = await prisma.adCreative.findMany({
            where: {
                approvalStatus: 'PENDING'
            },
            include: {
                campaign: {
                    include: {
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ ads });
    } catch (error) {
        console.error('Error fetching pending ads:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
