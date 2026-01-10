import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPusherServer } from '@/lib/pusher';

// This webhook handles incoming emails routed from SendGrid/Mailgun/etc.
// Expected payload format (generic approximation of SendGrid Inbound Parse):
// {
//   "to": "reply-CONVERSATIONID@inbound.b2bchat.co",
//   "from": "user@externalcompany.com",
//   "subject": "Re: ...",
//   "text": "The actual email content...",
//   ...
// }
// Note: Real implementations often use multipart/form-data. We'll handle JSON for simplicity 
// or assume a serverless function adapter normalizes it to JSON.

export async function POST(req: NextRequest) {
    try {
        // Validation of webhook signature/secret could be added here for security
        // const signature = req.headers.get('x-webhook-signature'); 

        let body;
        const contentType = req.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            body = await req.json();
        } else if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            body = Object.fromEntries(formData.entries());
        } else {
            return NextResponse.json({ error: 'Unsupported Content-Type' }, { status: 400 });
        }

        const { to, from, text, subject } = body;
        console.log('[Inbound Email] Received email:', { to, from, subject });

        if (!to || !from || !text) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Extract Conversation ID from "to" address
        // Format: reply-{conversationId}@... or {conversationId}@...
        const toAddress = typeof to === 'string' ? to : (to as any).text || ''; // Handle potential object formats
        const match = toAddress.match(/reply-([a-zA-Z0-9-]+)@/);

        if (!match || !match[1]) {
            console.error('[Inbound Email] Could not extract conversation ID from:', toAddress);
            return NextResponse.json({ error: 'Invalid recipient format' }, { status: 400 });
        }

        const conversationId = match[1];

        // 2. Validate Conversation and Ghost User
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: {
                userA: true,
                userB: true
            }
        });

        if (!conversation) {
            console.error('[Inbound Email] Conversation not found:', conversationId);
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Identify which user is the Ghost
        // The sender email 'from' should match, or we assume trust based on the unique conversation ID token
        // For security, checking that 'from' contains the ghost's email is recommended.

        const ghostUser = conversation.userA?.isGhost ? conversation.userA :
            conversation.userB?.isGhost ? conversation.userB : null;

        if (!ghostUser) {
            console.error('[Inbound Email] No ghost user in conversation');
            return NextResponse.json({ error: 'Not a ghost conversation' }, { status: 400 });
        }

        // Optional: Verify sender matches ghost email (loose check for now to allow aliases)
        // if (!from.includes(ghostUser.ghostEmail || '')) { ... }

        // 3. Create Message in Database
        // We strip quoted text usually found in email replies to keep chat clean.
        // Simple regex strategy for now (e.g. remove lines starting with > or "On ... wrote:")
        const cleanText = stripEmailReplyComponents(text as string);

        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: ghostUser.id,
                text: cleanText,
                // No attachment support in this MVP inbound
            },
            include: {
                sender: {
                    select: { id: true, name: true, phone: true, avatar: true }
                }
            }
        });

        // 4. Trigger Real-time Update (Pusher)
        const pusher = getPusherServer();
        if (pusher) {
            await pusher.trigger(`conversation-${conversation.id}`, 'new-message', newMessage);

            // Allow notifying the dashboard list as well
            const otherUserId = conversation.userAId === ghostUser.id ? conversation.userBId : conversation.userAId;
            if (otherUserId) {
                await pusher.trigger(`user-${otherUserId}`, 'conversation-update', {
                    id: conversation.id,
                    lastMessage: newMessage,
                    unreadCount: 1 // Logic to increment usually handled by frontend or separate query
                });
            }
        }

        console.log('[Inbound Email] Message created successfully:', newMessage.id);
        return NextResponse.json({ success: true, messageId: newMessage.id });

    } catch (error) {
        console.error('[Inbound Email] Error processing webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Helper to clean email replies
function stripEmailReplyComponents(text: string): string {
    // Basic heuristics to remove "On [date], [User] wrote:" and everything after
    // And standard email dividers
    const lines = text.split('\n');
    let cleanLines = [];

    for (const line of lines) {
        const trimmed = line.trim();
        // Check for common reply markers
        if (trimmed.match(/^On.*wrote:$/i) ||
            trimmed.match(/^From:.*$/i) ||
            trimmed.match(/^Sent from my iPhone/i) ||
            trimmed.match(/^-{3,}.*Original Message.*-{3,}$/i) ||
            trimmed.startsWith('>')) {
            break; // Stop processing at the first sign of a reply chain
        }
        cleanLines.push(line);
    }

    return cleanLines.join('\n').trim();
}
