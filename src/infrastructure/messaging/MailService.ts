// src/infrastructure/messaging/mail.service.ts
import nodemailer from 'nodemailer';

export class MailService {
  private transporter;

  constructor() {
    // Configuramos Nodemailer con el servicio directo de Gmail SMTP
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  /**
   * Envía un correo con el enlace y token efímero para restablecer la contraseña.
   * @param to Dirección de correo del apoderado destino.
   * @param resetToken Token generado y almacenado en Redis.
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"IGOR Soporte" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Recuperación de Contraseña - Proyecto IGOR',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4A90E2;">Recuperación de Contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en la plataforma socioeducativa <strong>IGOR</strong>.</p>
          <p>Haz clic en el siguiente botón para continuar con el proceso:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer mi contraseña</a>
          </div>
          <p style="font-size: 0.9em; color: #666;">Este enlace es de un solo uso y expira automáticamente en <strong>15 minutos</strong>.</p>
          <p style="font-size: 0.9em; color: #999;">Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`[MailService] Correo de recuperación enviado con éxito a: ${to}`);
    } catch (error) {
      console.error('[MailService] Error al enviar correo mediante Gmail SMTP:', error);
      throw new Error('No se pudo enviar el correo de recuperación.');
    }
  }
}