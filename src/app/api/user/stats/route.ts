import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "No autenticado" },
                { status: 401 }
            );
        }

        const userId = session.user.id;

        const [
            conversations,
            campaigns,
            receivedFriendRequests,
            sentFriendRequests,
            sentMessages
        ] = await Promise.all([
            // Count active conversations (where user is A or B)
            prisma.conversation.count({
                where: {
                    OR: [
                        { userAId: userId },
                        { userBId: userId }
                    ]
                }
            }),
            // Count active campaigns
            prisma.adCampaign.count({
                where: {
                    userId: userId,
                    status: "ACTIVE"
                }
            }),
            // Count accepted connections (friend requests)
            prisma.friendRequest.count({
                where: {
                    OR: [
                        { requesterId: userId, status: "ACCEPTED" },
                        { receiverId: userId, status: "ACCEPTED" }
                    ]
                }
            }),
            // Just for reference if needed later
            prisma.friendRequest.count({
                where: { requesterId: userId, status: "ACCEPTED" }
            }),
            // Count total messages sent by user
            prisma.message.count({
                where: {
                    senderUserId: userId
                }
            })
        ]);

        return NextResponse.json({
            conversations,
            campaigns,
            socialConnections: receivedFriendRequests, // Total accepted connections
            messages: sentMessages
        });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        return NextResponse.json(
            { error: "Error al obtener estadísticas" },
            { status: 500 }
        );
    }
}
