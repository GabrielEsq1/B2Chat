import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - Update store (activate/deactivate)
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
        const { active } = body;

        // Note: We don't have an 'active' field in the schema yet
        // For now, we can use this to update store name or other fields
        // If you want active/inactive, we need to add it to the schema

        const updated = await prisma.store.update({
            where: { id: params.id },
            data: {
                // Add fields to update here
                // For now, just return success
            },
        });

        return NextResponse.json({
            success: true,
            store: updated,
        });
    } catch (error: any) {
        console.error('Error updating store:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Delete store
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.store.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            message: 'Store deleted successfully',
        });
    } catch (error: any) {
        console.error('Error deleting store:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
