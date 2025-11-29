import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET: list stores for the authenticated user
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true },
    });

    return NextResponse.json(user?.stores ?? []);
}

// POST: create a new store (or update if slug exists)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'No autenticado', message: 'Debes iniciar sesión para guardar tu tienda.' }, { status: 401 });
    }

    const body = await req.json();

    // Generate slug if not provided
    let slug = body.slug;
    if (!slug && body.name) {
        slug = body.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    const schema = z.object({
        name: z.string().min(2),
        slug: z.string().min(1),
        data: z.any().optional(),
        products: z.any().optional(),
    });

    const payload = { ...body, slug };
    const result = schema.safeParse(payload);

    if (!result.success) {
        console.error('Validation error:', result.error);
        return NextResponse.json(
            {
                error: 'Datos inválidos',
                message: 'Los datos de la tienda no son válidos.',
                details: result.error.issues,
            },
            { status: 400 }
        );
    }

    // Fetch user with role and existing stores
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { stores: true },
    });
    if (!user) {
        return NextResponse.json({ error: 'Usuario no encontrado', message: 'Tu sesión no es válida.' }, { status: 404 });
    }

    // Determine host for URL generation
    const host = req.headers.get('host') || 'creatiendasgit1.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Check if ID is provided for update
    if (body.id) {
        const existingStore = await prisma.store.findUnique({ where: { id: body.id } });
        if (existingStore) {
            // Allow Admins to bypass ownership check
            if (existingStore.ownerId !== user.id && user.role !== 'ADMIN') {
                return NextResponse.json({ error: 'No autorizado', message: 'No tienes permiso para editar esta tienda.' }, { status: 403 });
            }

            // Check if new slug is already taken by ANOTHER store
            if (result.data.slug !== existingStore.slug) {
                const slugTaken = await prisma.store.findUnique({ where: { slug: result.data.slug } });
                if (slugTaken) {
                    return NextResponse.json({
                        error: 'El nombre de la tienda ya está en uso',
                        message: 'Ese nombre de tienda ya existe. Por favor elige otro nombre.',
                    }, { status: 400 });
                }
            }

            const updated = await prisma.store.update({
                where: { id: body.id },
                data: {
                    name: result.data.name,
                    slug: result.data.slug,
                    data: result.data.data || null,
                    products: result.data.products || null,
                },
            });
            const pathUrl = `${baseUrl}/stores/${updated.slug}`;
            return NextResponse.json({
                success: true,
                url: pathUrl,
                publicUrl: pathUrl,
                message: `¡Tienda actualizada! Accede en: ${pathUrl}`,
            });
        }
    }

    // Check if slug already exists (Legacy update by slug)
    const existing = await prisma.store.findUnique({ where: { slug: result.data.slug } });
    if (existing) {
        if (existing.ownerId === user.id) {
            const updated = await prisma.store.update({
                where: { id: existing.id },
                data: {
                    name: result.data.name,
                    data: result.data.data || null,
                    products: result.data.products || null,
                },
            });
            const pathUrl = `${baseUrl}/stores/${updated.slug}`;
            return NextResponse.json({
                success: true,
                url: pathUrl,
                publicUrl: pathUrl,
                message: `¡Tienda actualizada! Accede en: ${pathUrl}`,
            });
        }
        return NextResponse.json({
            error: 'El nombre de la tienda ya está en uso',
            message: 'Ese nombre de tienda ya existe. Por favor elige otro nombre.',
        }, { status: 400 });
    }

    // Enforce limits: FREE=1, PRO=5, ADMIN=Infinity
    const storeCount = user.stores?.length ?? 0;
    const hasProPlan = user.plan === 'PRO';
    const isAdmin = user.role === 'ADMIN';
    const limit = hasProPlan ? 5 : 1;

    if (!isAdmin && storeCount >= limit) {
        return NextResponse.json(
            {
                error: 'Límite de tiendas alcanzado',
                message: hasProPlan
                    ? 'Has alcanzado el límite de 5 tiendas de tu plan PRO. Contáctanos para más capacidad.'
                    : 'Tu plan actual permite crear solo 1 tienda gratuita. Actualiza a PRO para crear hasta 5 tiendas.',
                upgradeUrl: 'https://wa.me/573026687991?text=Hola,%20necesito%20mas%20tiendas',
            },
            { status: 403 }
        );
    }

    // Create new store
    const store = await prisma.store.create({
        data: {
            name: result.data.name,
            slug: result.data.slug,
            ownerId: user.id,
            data: result.data.data || null,
            products: result.data.products || null,
        },
    });

    const pathUrl = `${baseUrl}/stores/${store.slug}`;
    return NextResponse.json({
        success: true,
        id: store.id,
        url: pathUrl,
        publicUrl: pathUrl,
        message: `¡Tienda creada! Accede en: ${pathUrl}`,
    }, { status: 201 });
}
