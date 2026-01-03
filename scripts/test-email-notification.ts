import { sendNewMessageNotification } from '../src/lib/email';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testEmail() {
    console.log('--- Testing Email Notification ---');

    if (!process.env.RESEND_API_KEY) {
        console.warn('WARNING: RESEND_API_KEY is not set in .env. The test will run but email won\'t be sent to the network.');
    }

    const testConfig = {
        to: 'test-recipient@example.com', // Replace with a real email for a real test
        senderName: 'Test System',
        messageText: '¡Hola! Este es un mensaje de prueba para verificar las nuevas notificaciones por correo de B2BChat.',
        conversationLink: 'http://localhost:3000/chat/test-conversation-id'
    };

    console.log(`Sending test email to: ${testConfig.to}`);

    const result = await sendNewMessageNotification(testConfig);

    if (result.success) {
        console.log('SUCCESS: Email notification triggered successfully.');
        console.log('Result data:', result.data);
    } else {
        console.error('FAILED: Could not trigger email notification.');
        console.error('Error:', result.error);
    }
}

testEmail().catch(console.error);
