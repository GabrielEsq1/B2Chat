import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { StoreService } from '@/lib/store-service';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        // Verificar autenticación
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: 'No autenticado' },
                { status: 401 }
            );
        }

        const store = await StoreService.getStore(params.slug);
        if (!store) {
            return NextResponse.json(
                { success: false, message: 'Tienda no encontrada' },
                { status: 404 }
            );
        }

        // Verificar que la tienda pertenece al usuario
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        const storeRecord = await prisma.store.findUnique({
            where: { slug: params.slug }
        });

        // Allow Admins to bypass ownership check
        if (storeRecord?.ownerId !== user?.id && user?.role !== 'ADMIN') {
            return NextResponse.json(
                { success: false, message: 'No autorizado' },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: true, store });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error interno' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const body = await request.json();
        const { data, products } = body;

        const updatedStore = await StoreService.updateStore(params.slug, data, products);

        if (!updatedStore) {
            return NextResponse.json(
                { success: false, message: 'Tienda no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, store: updatedStore });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: 'Error interno' },
            { status: 500 }
        );
    }
}
