import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/user/profile - Update user profile
export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { name, email, position, bio, website, industry, profilePicture } = await req.json();

        // Update user - sync profilePicture to avatar for global visibility
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(position !== undefined && { position }),
                ...(bio !== undefined && { bio }),
                ...(website !== undefined && { website }),
                ...(industry !== undefined && { industry }),
                ...(profilePicture !== undefined && {
                    profilePicture,
                    avatar: profilePicture // SYNC to avatar for global visibility
                }),
            },
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
                avatar: true,
            },
        });

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Error al actualizar perfil" },
            { status: 500 }
        );
    }
}

// GET /api/user/profile - Get user profile
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
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

        return NextResponse.json({ user });
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Error al obtener perfil" },
            { status: 500 }
        );
    }
}
