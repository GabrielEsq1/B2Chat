import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractPhoneFromWhatsApp } from '@/lib/whatsapp/twilio';

// Twilio Webhook - Receives incoming WhatsApp messages
// Twilio will POST to this endpoint when a WhatsApp message is received

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const from = formData.get('From') as string; // whatsapp:+573001234567
        const body = formData.get('Body') as string;
        const mediaUrl = formData.get('MediaUrl0') as string | null;
        const messageSid = formData.get('MessageSid') as string;

        console.log('WhatsApp webhook received:', { from, body, messageSid });

        // Extract phone number
        const senderPhone = extractPhoneFromWhatsApp(from);

        // Find user by phone
        const sender = await prisma.user.findUnique({
            where: { phone: senderPhone }
        });

        if (!sender) {
            console.warn('WhatsApp message from unknown phone:', senderPhone);

            // Optionally: Send a welcome message or create a lead
            return NextResponse.json({
                message: 'User not found',
                action: 'ignored'
            });
        }

        // Find or create conversation with bot or support
        const oliviaBot = await prisma.user.findFirst({
            where: {
                isBot: true,
                name: { contains: 'Olivia' }
            }
        });

        if (!oliviaBot) {
            console.error('Olivia bot not found');
            return NextResponse.json({ error: 'Bot not configured' }, { status: 500 });
        }

        // Find existing conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                type: 'direct',
                OR: [
                    { userAId: sender.id, userBId: oliviaBot.id },
                    { userAId: oliviaBot.id, userBId: sender.id }
                ]
            }
        });

        // Create conversation if doesn't exist
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    type: 'direct',
                    userAId: sender.id,
                    userBId: oliviaBot.id
                }
            });
        }

        // Save incoming message
        const message = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderUserId: sender.id,
                text: body,
                attachmentUrl: mediaUrl
            }
        });

        console.log('WhatsApp message saved:', message.id);

        // TODO: Trigger AI response if bot conversation
        // You could emit a socket event here to update the UI in real-time

        // Respond with TwiML (optional)
        return new Response(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            {
                headers: { 'Content-Type': 'text/xml' },
                status: 200
            }
        );
    } catch (error) {
        console.error('WhatsApp webhook error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
