import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/users - Get all users for discovery
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const industry = searchParams.get("industry") || "";

        const users = await prisma.user.findMany({
            where: {
                id: { not: session.user.id }, // Exclude current user
                OR: search ? [
                    { name: { contains: search, mode: "insensitive" } },
                    { position: { contains: search, mode: "insensitive" } },
                    { industry: { contains: search, mode: "insensitive" } },
                    { bio: { contains: search, mode: "insensitive" } }
                ] : undefined,
                industry: industry ? { contains: industry, mode: "insensitive" } : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                position: true,
                industry: true,
                bio: true,
                avatar: true,
                isBot: true,
                website: true,
                profilePicture: true
            },
            take: 50
        });

        // Get friend request status for each user
        const sentRequests = await prisma.friendRequest.findMany({
            where: {
                requesterId: session.user.id,
                receiverId: { in: users.map(u => u.id) }
            },
            select: { receiverId: true, status: true }
        });

        const receivedRequests = await prisma.friendRequest.findMany({
            where: {
                receiverId: session.user.id,
                requesterId: { in: users.map(u => u.id) }
            },
            select: { requesterId: true, status: true }
        });

        const requestMap = new Map();
        sentRequests.forEach(r => requestMap.set(r.receiverId, { type: "sent", status: r.status }));
        receivedRequests.forEach(r => requestMap.set(r.requesterId, { type: "received", status: r.status }));

        const usersWithStatus = users.map(user => ({
            ...user,
            friendStatus: requestMap.get(user.id) || null
        }));

        return NextResponse.json({ users: usersWithStatus });
    } catch (error: any) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}
