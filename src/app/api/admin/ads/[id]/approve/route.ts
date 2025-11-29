import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
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

        const ad = await prisma.adCreative.update({
            where: { id: params.id },
            data: { approvalStatus: "APPROVED" }
        });

        return NextResponse.json({ success: true, ad });
    } catch (error) {
        console.error("Error approving ad:", error);
        return NextResponse.json({ error: "Error al aprobar anuncio" }, { status: 500 });
    }
}
