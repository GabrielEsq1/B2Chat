// Twilio WhatsApp Client
// Handles sending and receiving WhatsApp messages via Twilio API

const TWILIO_ACCOUNT_SID = process.env.B2BCHAT_MSG_TWILIO_SID_PROD || process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.B2BCHAT_MSG_TWILIO_TOKEN_PROD || process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.B2BCHAT_MSG_TWILIO_FROM_NUMBER_PROD || process.env.TWILIO_WHATSAPP_NUMBER; // Format: whatsapp:+14155238886

interface WhatsAppMessage {
    to: string; // Format: whatsapp:+573001234567
    body: string;
    mediaUrl?: string;
}

export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
        console.error('Twilio credentials not configured');
        return false;
    }

    try {
        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const formData = new URLSearchParams();
        formData.append('To', message.to);
        formData.append('From', TWILIO_WHATSAPP_NUMBER);
        formData.append('Body', message.body);

        if (message.mediaUrl) {
            formData.append('MediaUrl', message.mediaUrl);
        }

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Twilio API error:', error);
            return false;
        }

        const data = await response.json();
        console.log('WhatsApp message sent:', data.sid);
        return true;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return false;
    }
}

export function formatPhoneForWhatsApp(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Add + if missing
    if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
    }

    return `whatsapp:${cleaned}`;
}

export function extractPhoneFromWhatsApp(whatsappNumber: string): string {
    // Remove 'whatsapp:' prefix
    return whatsappNumber.replace('whatsapp:', '');
}
