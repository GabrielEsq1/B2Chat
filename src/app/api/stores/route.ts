import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stores - Get user's stores
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const stores = await prisma.store.findMany({
            where: {
                ownerUserId: session.user.id,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                category: true,
                logoUrl: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        return NextResponse.json(
            { error: "Error al obtener tiendas" },
            { status: 500 }
        );
    }
}

