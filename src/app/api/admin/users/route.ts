import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/users - Get all users (admin only)
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Only admin can access
        if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN_EMPRESA") {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                position: true,
                industry: true,
                company: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Error al obtener usuarios" },
            { status: 500 }
        );
    }
}
