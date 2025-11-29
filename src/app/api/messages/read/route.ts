import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
        }

        // Update all unread messages in this conversation sent by OTHER users
        const result = await prisma.message.updateMany({
            where: {
                conversationId,
                senderUserId: { not: session.user.id },
                readAt: null
            },
            data: {
                readAt: new Date()
            }
        });

        if (result.count > 0) {
            // Notify via Pusher
            await pusherServer.trigger(`conversation-${conversationId}`, "messages-read", {
                userId: session.user.id,
                conversationId,
                readAt: new Date().toISOString()
            });
        }

        return NextResponse.json({ success: true, count: result.count });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
