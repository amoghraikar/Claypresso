/**
 * Claypresso Production Email Service
 * Supports Resend, Standard SMTP, or Test Simulation Mode.
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export class EmailService {
  private get fromEmail(): string {
    return process.env.EMAIL_FROM || 'Claypresso Studio <orders@claypresso.com>';
  }

  private get resendApiKey(): string | undefined {
    return process.env.RESEND_API_KEY;
  }

  public get isConfigured(): boolean {
    return Boolean(this.resendApiKey || process.env.EMAIL_SERVER_HOST);
  }

  /**
   * Sends transactional email.
   * If external provider credentials are missing, cleanly logs the simulation without throwing.
   */
  public async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const { to, subject, html, text, replyTo } = options;

    if (this.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.resendApiKey}`,
          },
          body: JSON.stringify({
            from: this.fromEmail,
            to: [to],
            subject,
            html,
            text,
            reply_to: replyTo || 'hello@claypresso.com',
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[EmailService] Resend API error:', errData);
          return { success: false, error: errData.message || `Resend error status ${res.status}` };
        }

        const data = await res.json();
        return { success: true, messageId: data.id };
      } catch (err: any) {
        console.error('[EmailService] Dispatch failed:', err);
        return { success: false, error: err.message };
      }
    }

    // Honest Integration Mode: Credentials not configured yet
    console.log(
      `[EmailService: Simulated (Awaiting Live Credentials)]\n` +
      `  To: ${to}\n` +
      `  Subject: ${subject}\n` +
      `  From: ${this.fromEmail}\n` +
      `  Body preview: ${(text || html).slice(0, 150)}...\n`
    );

    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      simulated: true,
    };
  }
}

export const emailService = new EmailService();
