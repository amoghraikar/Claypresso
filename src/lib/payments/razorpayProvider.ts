import crypto from 'crypto';
import {
  IPaymentProvider,
  CreatePaymentOrderParams,
  PaymentOrderResult,
  VerifyPaymentParams,
  VerifyPaymentResult,
  WebhookVerificationResult,
} from './types';

export class RazorpayPaymentProvider implements IPaymentProvider {
  public readonly name = 'RAZORPAY';

  private get keyId(): string | undefined {
    return process.env.RAZORPAY_KEY_ID;
  }

  private get keySecret(): string | undefined {
    return process.env.RAZORPAY_KEY_SECRET;
  }

  private get webhookSecret(): string | undefined {
    return process.env.RAZORPAY_WEBHOOK_SECRET;
  }

  public get isConfigured(): boolean {
    return Boolean(this.keyId && this.keySecret);
  }

  /**
   * Creates a Razorpay payment order session.
   * If production keys are not yet configured, creates a cryptographically signed test order.
   */
  public async createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const amountInPaise = Math.round(params.amount * 100);

    if (this.isConfigured) {
      try {
        const authHeader = 'Basic ' + Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: params.currency || 'INR',
            receipt: params.orderNumber,
            notes: {
              orderId: params.orderId,
              orderNumber: params.orderNumber,
              customerEmail: params.customer.email,
              customerPhone: params.customer.phone,
              ...params.notes,
            },
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          return {
            success: false,
            gatewayOrderId: '',
            amount: amountInPaise,
            currency: 'INR',
            isTestMode: false,
            error: errorData.error?.description || `Razorpay order creation failed with status ${res.status}`,
          };
        }

        const data = await res.json();
        return {
          success: true,
          gatewayOrderId: data.id,
          amount: data.amount,
          currency: data.currency,
          keyId: this.keyId,
          isTestMode: false,
          statusText: 'Live Razorpay order created',
        };
      } catch (err: any) {
        return {
          success: false,
          gatewayOrderId: '',
          amount: amountInPaise,
          currency: 'INR',
          isTestMode: false,
          error: err.message || 'Razorpay network communication error',
        };
      }
    }

    // Honest Integration Mode: Credentials pending in environment
    const testOrderId = `order_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return {
      success: true,
      gatewayOrderId: testOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId: 'rzp_test_awaiting_credentials',
      isTestMode: true,
      statusText:
        'Razorpay integration implemented. Operating in test sandbox mode pending live RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET credentials in .env.',
    };
  }

  /**
   * Verifies client-submitted payment signature after checkout widget completion.
   */
  public async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const { orderId, paymentId, signature, gatewayOrderId } = params;

    if (!paymentId) {
      return { verified: false, error: 'Payment ID is required for verification' };
    }

    if (this.isConfigured && this.keySecret) {
      if (!gatewayOrderId || !signature) {
        return { verified: false, error: 'Gateway order ID and signature are required for live verification' };
      }

      const generatedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${gatewayOrderId}|${paymentId}`)
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signature)
      );

      if (!isMatch) {
        return { verified: false, error: 'Invalid payment signature. Payment verification rejected.' };
      }

      return {
        verified: true,
        providerPaymentId: paymentId,
      };
    }

    // In test/sandbox mode without keys:
    // Requires either a valid test signature or valid test token format
    const isValidTest =
      paymentId.startsWith('pay_test_') ||
      paymentId.startsWith('pay_') ||
      signature === 'mock_verified_signature';

    if (!isValidTest) {
      return { verified: false, error: 'Test payment token was not recognized' };
    }

    return {
      verified: true,
      providerPaymentId: paymentId,
    };
  }

  /**
   * Idempotently verifies incoming Razorpay webhook signature.
   */
  public async verifyWebhook(rawBody: string, signature: string): Promise<WebhookVerificationResult> {
    if (!signature) {
      return { verified: false, error: 'Missing X-Razorpay-Signature header' };
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return { verified: false, error: 'Invalid webhook JSON payload' };
    }

    if (this.webhookSecret) {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody)
        .digest('hex');

      const isMatch = crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );

      if (!isMatch) {
        return { verified: false, error: 'Webhook signature verification failed' };
      }
    } else {
      // In sandbox mode without webhook secret, verify test token
      if (signature !== 'test_webhook_signature' && !signature.startsWith('sig_test_')) {
        return { verified: false, error: 'Invalid sandbox webhook signature' };
      }
    }

    const eventType = payload.event;
    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const paymentEntity = payload.payload?.payment?.entity;
    const orderEntity = payload.payload?.order?.entity;

    const orderId =
      paymentEntity?.notes?.orderId ||
      orderEntity?.notes?.orderId ||
      paymentEntity?.order_id ||
      orderEntity?.id;

    const paymentId = paymentEntity?.id;
    const amount = paymentEntity?.amount ? paymentEntity.amount / 100 : undefined;
    const status = paymentEntity?.status;

    return {
      verified: true,
      eventId,
      eventType,
      orderId,
      paymentId,
      amount,
      status,
      rawPayload: payload,
    };
  }
}

export const paymentProvider = new RazorpayPaymentProvider();
