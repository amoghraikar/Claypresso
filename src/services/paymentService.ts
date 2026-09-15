import { PaymentMethod, OrderPayload } from '@/types/order';

export interface PaymentProviderResult {
  success: boolean;
  gatewayOrderId?: string;
  paymentId?: string;
  errorMessage?: string;
  isMockPending?: boolean;
}

export interface PaymentProviderDefinition {
  id: PaymentMethod;
  name: string;
  headline: string;
  description: string;
  badge: string;
  supportedLogos: string[];
}

export const PAYMENT_METHODS: PaymentProviderDefinition[] = [
  {
    id: 'UPI',
    name: 'UPI (Instant & Free)',
    headline: 'Pay securely using UPI',
    description: 'Instant zero-fee payment via Google Pay, PhonePe, Paytm, CRED or any UPI App.',
    badge: 'Popular',
    supportedLogos: ['GPay', 'PhonePe', 'Paytm', 'BHIM'],
  },
  {
    id: 'CARD',
    name: 'Credit or Debit Card',
    headline: 'Pay securely using your card',
    description: 'Visa, Mastercard, RuPay & American Express processed via secure gateway.',
    badge: 'Encrypted',
    supportedLogos: ['Visa', 'Mastercard', 'RuPay'],
  },
];

export const paymentGatewayService = {
  /**
   * Evaluates if a real production payment gateway (e.g. Razorpay, Stripe, Cashfree)
   * is connected via environment variables.
   */
  isGatewayConfigured(): boolean {
    return Boolean(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_KEY
    );
  },

  /**
   * Gateway information boundary.
   */
  getGatewayConfig() {
    const isConfigured = this.isGatewayConfigured();
    return {
      isConfigured,
      gatewayName: isConfigured
        ? (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER || 'Razorpay')
        : 'Payment Gateway Integration Ready',
      statusText: isConfigured
        ? 'Live Payment Gateway Connected'
        : 'Gateway Integration Boundary Active (Awaiting Production Keys)',
      supportedMethods: ['UPI', 'CARD'] as PaymentMethod[],
    };
  },

  /**
   * Payment Initiation Hook.
   * When live credentials are added in the future, this triggers the official
   * SDK modal (e.g., Razorpay standard checkout or Stripe Elements).
   *
   * If live credentials are NOT connected, it clearly reports that the gateway
   * is in setup mode and prevents fabricating a fake payment confirmation.
   */
  async processPayment(
    method: PaymentMethod,
    orderPayload: OrderPayload
  ): Promise<PaymentProviderResult> {
    const isConfigured = this.isGatewayConfigured();

    if (!isConfigured) {
      // Return clear honest status: provider boundary ready, but not claiming money received
      return {
        success: false,
        errorMessage:
          'Payment Gateway is ready for production integration. Please attach Razorpay / Stripe credentials to process live transactions.',
        isMockPending: true,
      };
    }

    // Future hook for window.Razorpay or stripe.confirmCardPayment
    try {
      // Example production trigger hook point
      return {
        success: false,
        errorMessage: 'Live gateway client not yet initialized.',
      };
    } catch (err: unknown) {
      return {
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Payment gateway communication failed.',
      };
    }
  },
};
