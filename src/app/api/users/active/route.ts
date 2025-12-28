import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users/active - Get active users for recommendations
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const limit = parseInt(searchParams.get("limit") || "10");

        // Get active users (excluding current user and bots)
        const users = await prisma.user.findMany({
            where: {
                id: { not: session.user.id },
                isBot: false,
                profilePicture: { not: null }, // Has profile picture
            },
            select: {
                id: true,
                name: true,
                position: true,
                industry: true,
                profilePicture: true,
                bio: true,
            },
            take: limit,
            orderBy: {
                updatedAt: 'desc' // Most recently active
            }
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching active users:", error);
        return NextResponse.json(
            { error: "Error al obtener usuarios" },
            { status: 500 }
        );
    }
}
