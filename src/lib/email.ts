import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);
import { prisma } from './prisma';

interface SendMessageEmailProps {
  to: string;
  senderName: string;
  messageText: string;
  conversationLink: string;
}

export async function sendNewMessageNotification({
  to,
  senderName,
  messageText,
  conversationLink
}: SendMessageEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY is not defined. Email notification skipped.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'B2BChat <notifications@b2bchat.io>', // Note: Needs verified domain in production
      to: [to],
      subject: `Nuevo mensaje de ${senderName} en B2BChat`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">¡Hola! Tienes un nuevo mensaje</h2>
          <p style="font-size: 16px; color: #555;">
            <strong>${senderName}</strong> te ha enviado el siguiente mensaje:
          </p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0; font-style: italic;">
            "${messageText}"
          </div>
          <p style="font-size: 16px; color: #555;">
            Te invitamos cordialmente a seguir la conversación y descubrir todas las herramientas que B2BChat tiene para potenciar tu negocio.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${conversationLink}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Responder ahora
            </a>
          </div>
          <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Este es un mensaje automático de B2BChat. Si no deseas recibir estas notificaciones, puedes ajustar tu perfil en la plataforma.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error sending email:', error);
    return { success: false, error };
  }
}
