/**
 * Claypresso WhatsApp Business Notification Service
 * Designed for official Meta WhatsApp Cloud API / Gupshup / Twilio.
 */

export interface WhatsAppNotificationParams {
  toPhone: string; // Indian mobile number with country code +91
  templateName: 'order_confirmed' | 'order_shipped' | 'custom_quote_ready';
  parameters: Record<string, string>;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export class WhatsAppService {
  private get apiToken(): string | undefined {
    return process.env.WHATSAPP_API_TOKEN;
  }

  private get phoneNumberId(): string | undefined {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  public get isConfigured(): boolean {
    return Boolean(this.apiToken && this.phoneNumberId);
  }

  /**
   * Formats an Indian mobile phone number into standard E.164 without spaces or dashes.
   */
  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+91')) return cleaned.replace('+', '');
    if (cleaned.startsWith('91') && cleaned.length === 12) return cleaned;
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned.replace('+', '');
  }

  /**
   * Dispatches WhatsApp notification via Meta Cloud API or simulates if credentials are pending.
   */
  public async sendNotification(params: WhatsAppNotificationParams): Promise<WhatsAppSendResult> {
    const formattedPhone = this.formatPhoneNumber(params.toPhone);

    if (this.isConfigured) {
      try {
        const url = `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
              name: params.templateName,
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: Object.values(params.parameters).map((text) => ({
                    type: 'text',
                    text,
                  })),
                },
              ],
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.error('[WhatsAppService] API error:', errData);
          return { success: false, error: errData.error?.message || `WhatsApp error ${res.status}` };
        }

        const data = await res.json();
        return { success: true, messageId: data.messages?.[0]?.id };
      } catch (err: any) {
        console.error('[WhatsAppService] Dispatch failed:', err);
        return { success: false, error: err.message };
      }
    }

    // Honest Integration Mode: Credentials pending in environment
    console.log(
      `[WhatsAppService: Simulated (Awaiting Live Credentials)]\n` +
      `  To: +${formattedPhone}\n` +
      `  Template: ${params.templateName}\n` +
      `  Parameters: ${JSON.stringify(params.parameters)}\n`
    );

    return {
      success: true,
      messageId: `wa_sim_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      simulated: true,
    };
  }
}

export const whatsappService = new WhatsAppService();
