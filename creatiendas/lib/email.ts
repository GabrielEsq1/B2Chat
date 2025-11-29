import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ RESEND_API_KEY no está configurada. El correo no se enviará.');
    return false;
  }

  try {
    await resend.emails.send({
      from: 'Soporte <onboarding@resend.dev>', // Usamos el dominio de pruebas de Resend por defecto
      to: email,
      subject: 'Recuperación de Contraseña - Creatiendas',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recupera tu contraseña</h2>
          <p>Has solicitado restablecer tu contraseña en Creatiendas.</p>
          <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          <a href="${resetLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            Restablecer Contraseña
          </a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo.
            El enlace expirará en 1 hora.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error enviando correo:', error);
    return false;
  }
}
