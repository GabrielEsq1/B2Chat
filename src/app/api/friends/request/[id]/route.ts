import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { status } = await req.json(); // "ACCEPTED" or "REJECTED"

        const friendRequest = await prisma.friendRequest.update({
            where: {
                id: id,
                receiverId: session.user.id
            },
            data: { status }
        });

        // If accepted, create a conversation
        if (status === "ACCEPTED") {
            const existingConv = await prisma.conversation.findFirst({
                where: {
                    type: "USER_USER",
                    OR: [
                        { userAId: friendRequest.requesterId, userBId: session.user.id },
                        { userAId: session.user.id, userBId: friendRequest.requesterId }
                    ]
                }
            });

            if (!existingConv) {
                await prisma.conversation.create({
                    data: {
                        type: "USER_USER",
                        userAId: session.user.id,
                        userBId: friendRequest.requesterId
                    }
                });
            }
        }

        return NextResponse.json({ friendRequest });
    } catch (error: any) {
        console.error("Error updating request:", error);
        return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }
}
