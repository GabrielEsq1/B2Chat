import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/campaigns/[id] - Get campaign by ID
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });
        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

        const campaign = await prisma.adCampaign.findUnique({
            where: {
                id: params.id,
            },
            include: {
                creatives: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        company: true
                    }
                }
            }
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        // Verify ownership or admin
        if (campaign.userId !== session.user.id && !isAdmin) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        return NextResponse.json({ campaign });
    } catch (error) {
        console.error("Error fetching campaign:", error);
        return NextResponse.json(
            { error: "Error al obtener campaña" },
            { status: 500 }
        );
    }
}

// ... PUT method remains same (omitted for brevity)

// PATCH /api/campaigns/[id] - Partial update campaign (e.g., status change)
export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const campaign = await prisma.adCampaign.findUnique({
            where: { id: params.id },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        // Check if user is admin or campaign owner
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";
        const isOwner = campaign.userId === session.user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        const data = await req.json();

        const updatedCampaign = await prisma.adCampaign.update({
            where: { id: params.id },
            data,
        });

        return NextResponse.json({
            success: true,
            campaign: updatedCampaign,
        });
    } catch (error) {
        console.error("Error updating campaign:", error);
        return NextResponse.json(
            { error: "Error al actualizar campaña" },
            { status: 500 }
        );
    }
}

// DELETE /api/campaigns/[id] - Delete campaign
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const campaign = await prisma.adCampaign.findUnique({
            where: { id: params.id },
        });

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaña no encontrada" },
                { status: 404 }
            );
        }

        // Check if user is admin or campaign owner
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        const isAdmin = user?.role === "SUPERADMIN";
        const isOwner = campaign.userId === session.user.id;

        if (!isAdmin && !isOwner) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 403 }
            );
        }

        await prisma.adCampaign.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            message: "Campaña eliminada",
        });
    } catch (error) {
        console.error("Error deleting campaign:", error);
        return NextResponse.json(
            { error: "Error al eliminar campaña" },
            { status: 500 }
        );
    }
}
