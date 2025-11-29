import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (user?.role !== "SUPERADMIN") {
            return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || 'PENDING';

        const ads = await prisma.adCreative.findMany({
            where: {
                approvalStatus: status
            },
            include: {
                campaign: {
                    include: {
                        company: true,
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ success: true, ads });
    } catch (error) {
        console.error("Error fetching ads:", error);
        return NextResponse.json({ error: "Error al obtener anuncios" }, { status: 500 });
    }
}
