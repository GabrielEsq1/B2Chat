import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Fetch single user with stores
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                stores: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Don't send password hash to frontend
        const { passwordHash, ...userWithoutPassword } = user;

        return NextResponse.json({ user: userWithoutPassword });
    } catch (error: any) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update user details
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, plan, role, newPassword } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (plan !== undefined) updateData.plan = plan;
        if (role !== undefined) updateData.role = role;

        // Handle password change if provided
        if (newPassword && newPassword.trim().length >= 6) {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            updateData.passwordHash = passwordHash;
        }

        const updated = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
        });

        const { passwordHash, ...userWithoutPassword } = updated;

        return NextResponse.json({
            success: true,
            user: userWithoutPassword,
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete user and all their stores
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Delete all user's stores first
        await prisma.store.deleteMany({
            where: { ownerId: params.id },
        });

        // Then delete the user
        await prisma.user.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            message: 'User and all their stores deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
