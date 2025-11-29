import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const slug = params.slug;

        await prisma.store.update({
            where: { slug },
            data: {
                views: {
                    increment: 1
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error incrementing views:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
