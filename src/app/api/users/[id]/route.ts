import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                position: true,
                industry: true,
                bio: true,
                website: true,
                avatar: true,
                isBot: true,
                botPersonality: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error: any) {
        console.error("Error fetching user:", error);
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { name, position, industry, bio, website, avatar, phone } = body;

        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                ...(name && { name }),
                ...(position !== undefined && { position }),
                ...(industry !== undefined && { industry }),
                ...(bio !== undefined && { bio }),
                ...(website !== undefined && { website }),
                ...(avatar !== undefined && { avatar, profilePicture: avatar }),
                ...(phone !== undefined && { phone }),
            },
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        console.error("Error updating user:", error);
        return NextResponse.json({ error: "No se pudo actualizar el perfil" }, { status: 500 });
    }
}
