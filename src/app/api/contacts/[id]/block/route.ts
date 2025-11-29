import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/contacts/[id]/block - Block/unblock a contact
export async function POST(
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

        const { action } = await req.json(); // 'block' or 'unblock'
        const params = await context.params;
        const contactId = params.id;

        // For now, we'll just return success
        // In a full implementation, you'd create a BlockedContacts table
        console.log(`${action} contact ${contactId} by user ${session.user.id}`);

        return NextResponse.json({
            success: true,
            action,
            contactId,
        });
    } catch (error) {
        console.error("Error blocking/unblocking contact:", error);
        return NextResponse.json(
            { error: "Error al procesar solicitud" },
            { status: 500 }
        );
    }
}
