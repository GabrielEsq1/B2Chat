import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher-server";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, isTyping } = await req.json();

        if (!conversationId) {
            return NextResponse.json({ error: "Conversation ID required" }, { status: 400 });
        }

        // Trigger Pusher event directly (no DB storage needed for typing status)
        await pusherServer.trigger(`conversation-${conversationId}`, "typing", {
            userId: session.user.id,
            isTyping: !!isTyping
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error sending typing indicator:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
