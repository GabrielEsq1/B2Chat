import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBotResponse } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
    try {
        const { conversationId, botUserId, userMessage } = await req.json();

        // Get bot user details
        const botUser = await prisma.user.findUnique({
            where: { id: botUserId },
            select: { isBot: true, botPersonality: true, name: true }
        });

        if (!botUser || !botUser.isBot || !botUser.botPersonality) {
            return NextResponse.json({ error: "Invalid bot user" }, { status: 400 });
        }

        // Get conversation history with enhanced sender info for context
        const messages = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: 5,
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        industry: true,
                        company: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Identify the user context from the last human message
        // Since we order by desc, the first message is the latest one (the trigger)
        const lastUserMessage = messages.find((m: any) => m.sender.id !== botUserId);

        const context = lastUserMessage ? {
            userName: lastUserMessage.sender.name,
            companyName: lastUserMessage.sender.company?.name,
            userRole: lastUserMessage.sender.role,
            industry: lastUserMessage.sender.industry || 'General' // Fallback if user doesn't have specific industry
        } : undefined;

        const history = messages.reverse().map((msg: any) => ({
            role: msg.sender.id === botUserId ? (botUser.name || "Bot") : "User",
            text: msg.text
        }));

        // Generate AI response
        const aiResponse = await generateBotResponse(
            botUser.botPersonality,
            userMessage,
            history,
            context
        );

        // Save bot's response
        const botMessage = await prisma.message.create({
            data: {
                conversationId,
                senderUserId: botUserId,
                text: aiResponse
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                        isBot: true
                    }
                }
            }
        });

        // Broadcast to Socket.IO
        try {
            const appUrl = process.env.NEXT_PUBLIC_B2BCHAT_APP_BASEURL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            await fetch(`${appUrl}/api/socket/broadcast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: conversationId,
                    event: 'new_message',
                    data: botMessage
                })
            });
        } catch (error) {
            console.error("Failed to broadcast bot message:", error);
        }

        return NextResponse.json({ message: botMessage });
    } catch (error: any) {
        console.error("Bot reply error:", error);
        return NextResponse.json({
            error: "Bot response failed",
            details: error.message
        }, { status: 500 });
    }
}
