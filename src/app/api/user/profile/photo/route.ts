import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/user/profile/photo - Upload profile photo
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const { photoData } = await req.json();

        if (!photoData) {
            return NextResponse.json(
                { error: "No se proporcionó imagen" },
                { status: 400 }
            );
        }

        // Update user profile picture
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                profilePicture: photoData,
            },
            select: {
                id: true,
                name: true,
                profilePicture: true,
            },
        });

        return NextResponse.json({
            success: true,
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error uploading photo:", error);
        return NextResponse.json(
            { error: "Error al subir foto" },
            { status: 500 }
        );
    }
}
