import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: List all users (ADMIN only)
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        console.log('Admin API Session:', session?.user?.email);

        // 1. Authentication Check
        if (!session?.user?.email) {
            console.log('Admin API: Not authenticated');
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 2. Authorization Check (Role = ADMIN)
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });
        console.log('Admin API Role:', currentUser?.role);

        if (currentUser?.role !== 'ADMIN') {
            console.log('Admin API: Not authorized');
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        // 3. Fetch Users (Robust Mode)
        const usersRaw = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: { stores: true }
        });

        const users = usersRaw.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            plan: (u as any).plan || 'FREE', // Fallback to avoid type errors if client is stale
            createdAt: u.createdAt,
            _count: {
                stores: u.stores.length
            }
        }));
        console.log('Admin API: Fetched users', users.length);

        return NextResponse.json(users);
    } catch (error) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update user plan (ADMIN only)
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('Admin API PATCH Session:', session?.user?.email);

        // 1. Authentication Check
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
        }

        // 2. Authorization Check (Role = ADMIN)
        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { role: true }
        });

        if (currentUser?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
        }

        const body = await req.json();
        const { userId, plan } = body;

        if (!userId || !['FREE', 'PRO'].includes(plan)) {
            return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
        }

        // 3. Update User
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { plan },
            select: { id: true, email: true, plan: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Admin API PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
