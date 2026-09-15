/**
 * Claypresso Payment Architecture Types
 * Defines the contract for payment gateways (Razorpay / Cashfree / Stripe).
 */

export type PaymentGatewayType = 'RAZORPAY' | 'CASHFREE' | 'STRIPE' | 'MOCK';

export interface CreatePaymentOrderParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in INR rupees
  currency?: string; // default "INR"
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  success: boolean;
  gatewayOrderId: string;
  amount: number; // in paise (cents) for Razorpay
  currency: string;
  keyId?: string;
  isTestMode: boolean;
  statusText?: string;
  error?: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  gatewayOrderId?: string;
}

export interface VerifyPaymentResult {
  verified: boolean;
  error?: string;
  amountPaid?: number;
  providerPaymentId?: string;
}

export interface WebhookVerificationResult {
  verified: boolean;
  eventId?: string;
  eventType?: string;
  orderId?: string;
  paymentId?: string;
  amount?: number;
  status?: string;
  rawPayload?: any;
  error?: string;
}

export interface IPaymentProvider {
  readonly name: string;
  readonly isConfigured: boolean;

  createOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<WebhookVerificationResult>;
}
