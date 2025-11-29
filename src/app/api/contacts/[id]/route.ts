import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/contacts/[id] - Get single contact
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const params = await context.params;
        const contactId = params.id;

        const contact = await prisma.user.findUnique({
            where: { id: contactId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                position: true,
                bio: true,
                website: true,
                industry: true,
                profilePicture: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!contact) {
            return NextResponse.json(
                { error: "Contacto no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({ contact });
    } catch (error) {
        console.error("Error fetching contact:", error);
        return NextResponse.json(
            { error: "Error al obtener contacto" },
            { status: 500 }
        );
    }
}
