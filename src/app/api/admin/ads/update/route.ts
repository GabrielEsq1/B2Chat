import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, title, description, destinationUrl, imageUrl } = body;

        if (!id) {
            return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
        }

        const updatedAd = await prisma.adCreative.update({
            where: { id },
            data: {
                title,
                description,
                destinationUrl,
                imageUrl: imageUrl || undefined, // Only update if provided
            },
        });

        return NextResponse.json({ success: true, ad: updatedAd });
    } catch (error) {
        console.error("Error updating ad:", error);
        return NextResponse.json({ error: "Error updating ad" }, { status: 500 });
    }
}
