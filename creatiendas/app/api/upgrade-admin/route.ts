import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TEMPORARY ROUTE - DELETE AFTER USE
export async function GET() {
    try {
        // Update admin1@creatiendas.com to ADMIN role
        const updated = await prisma.user.update({
            where: { email: 'admin1@creatiendas.com' },
            data: {
                role: 'ADMIN',
                plan: 'PRO',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'User updated to ADMIN successfully',
            user: {
                email: updated.email,
                name: updated.name,
                role: updated.role,
                plan: updated.plan,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
            },
            { status: 500 }
        );
    }
}
