import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/friends/request - Send friend request
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { receiverId } = await req.json();

        // Check if request already exists
        const existing = await prisma.friendRequest.findFirst({
            where: {
                OR: [
                    { requesterId: session.user.id, receiverId },
                    { requesterId: receiverId, receiverId: session.user.id }
                ]
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Request already exists" }, { status: 400 });
        }

        const friendRequest = await prisma.friendRequest.create({
            data: {
                requesterId: session.user.id,
                receiverId,
                status: "PENDING"
            }
        });

        return NextResponse.json({ friendRequest });
    } catch (error: any) {
        console.error("Error creating friend request:", error);
        return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
    }
}

// GET /api/friends/request - Get friend requests
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requests = await prisma.friendRequest.findMany({
            where: {
                receiverId: session.user.id,
                status: "PENDING"
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        position: true,
                        industry: true,
                        avatar: true,
                        isBot: true
                    }
                }
            }
        });

        return NextResponse.json({ requests });
    } catch (error: any) {
        console.error("Error fetching requests:", error);
        return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 });
    }
}
