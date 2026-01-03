import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contacts/search?query=val - Search user by name, email, or phone
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
        const query = searchParams.get("query");

        if (!query || query.length < 2) {
            return NextResponse.json(
                { error: "La búsqueda debe tener al menos 2 caracteres" },
                { status: 400 }
            );
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } }
                ],
                NOT: { id: session.user.id } // Don't find yourself
            },
            select: {
                id: true,
                name: true,
                phone: true,
                avatar: true,
                email: true,
                profilePicture: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            take: 10
        });

        if (users.length === 0) {
            return NextResponse.json({
                success: true,
                users: [],
                message: "No se encontraron usuarios"
            });
        }

        return NextResponse.json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error searching contact:", error);
        return NextResponse.json(
            { error: "Error al buscar contacto" },
            { status: 500 }
        );
    }
}
