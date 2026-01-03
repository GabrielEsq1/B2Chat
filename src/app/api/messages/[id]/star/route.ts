import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "No autenticado" }, { status: 401 });
        }

        const messageId = params.id;
        const { isStarred } = await req.json();

        const message = await prisma.message.update({
            where: { id: messageId },
            data: { isStarred }
        });

        return NextResponse.json({ success: true, message });
    } catch (error) {
        console.error("Error starring message:", error);
        return NextResponse.json({ error: "Error al destacar mensaje" }, { status: 500 });
    }
}
