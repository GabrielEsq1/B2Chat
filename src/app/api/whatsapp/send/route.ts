import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendWhatsAppMessage, formatPhoneForWhatsApp } from '@/lib/whatsapp/twilio';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { conversationId, text, recipientPhone } = await req.json();

        if (!text || !recipientPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Save message to database first
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderUserId: session.user.id,
                text,
            }
        });

        // Send via WhatsApp
        const whatsappPhone = formatPhoneForWhatsApp(recipientPhone);
        const sent = await sendWhatsAppMessage({
            to: whatsappPhone,
            body: text
        });

        if (!sent) {
            return NextResponse.json({
                error: 'Failed to send WhatsApp message',
                message // Still return the saved message
            }, { status: 500 });
        }

        // Mark message as sent via WhatsApp
        await prisma.message.update({
            where: { id: message.id },
            data: {
                // You could add a 'sentViaWhatsApp' field to track this
            }
        });

        return NextResponse.json({
            success: true,
            message,
            sentViaWhatsApp: true
        });
    } catch (error) {
        console.error('Error in WhatsApp send API:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
