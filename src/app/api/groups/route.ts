import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/groups - Create a new group
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { name, description, memberIds } = await req.json();

        if (!name || !memberIds || memberIds.length === 0) {
            return NextResponse.json(
                { error: "Nombre y miembros son requeridos" },
                { status: 400 }
            );
        }

        // Create group with members
        const group = await prisma.group.create({
            data: {
                name,
                description,
                createdById: session.user.id,
                members: {
                    create: [
                        // Creator is admin
                        { userId: session.user.id, isAdmin: true },
                        // Other members
                        ...memberIds.map((userId: string) => ({
                            userId,
                            isAdmin: false,
                        })),
                    ],
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                    },
                },
            },
        });

        // Create the associated conversation for this group
        await prisma.conversation.create({
            data: {
                type: "GROUP",
                groupId: group.id,
            }
        });

        return NextResponse.json({ group });
    } catch (error) {
        console.error("Error creating group:", error);
        return NextResponse.json(
            { error: "Error al crear grupo" },
            { status: 500 }
        );
    }
}

// GET /api/groups - Get user's groups
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const groups = await prisma.group.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                phone: true,
                                avatar: true,
                            },
                        },
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ groups });
    } catch (error) {
        console.error("Error fetching groups:", error);
        return NextResponse.json(
            { error: "Error al obtener grupos" },
            { status: 500 }
        );
    }
}
