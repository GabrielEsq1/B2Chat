import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Get all users that have conversations with the current user OR are bots
        const contacts = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        // Users in my company (excluding self)
                        AND: [
                            { id: { not: session.user.id } },
                            { companyId: session.user.companyId }
                        ]
                    },
                    {
                        // AI Bots
                        isBot: true
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                position: true,
                industry: true,
                avatar: true,
                isBot: true,
                botPersonality: true,
                company: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { isBot: 'desc' }, // Show bots first
                { name: 'asc' }
            ]
        });

        console.log(`📇 Found ${contacts.length} contacts for user ${session.user.id}`);

        return NextResponse.json({
            contacts,
            total: contacts.length
        });
    } catch (error) {
        console.error("Error loading contacts:", error);
        return NextResponse.json(
            { error: "Error al cargar contactos" },
            { status: 500 }
        );
    }
}
