import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// POST - Reset user password
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(tempPassword, 10);

        await prisma.user.update({
            where: { id: params.id },
            data: { passwordHash },
        });

        return NextResponse.json({
            success: true,
            temporaryPassword: tempPassword,
            message: 'Password reset successfully. Share this temporary password with the user.',
        });
    } catch (error: any) {
        console.error('Error resetting password:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
