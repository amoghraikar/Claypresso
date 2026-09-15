import { Product, ProductVariant, ProductionType } from './product';

export type PaymentMethod = 'UPI' | 'CARD';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: 'India';
}

export interface OrderItem {
  id: string; // unique item id (productId + variantId)
  productId: string;
  productSlug: string;
  name: string;
  price: number;
  quantity: number;
  selectedVariant?: ProductVariant;
  image: string;
  productionType: ProductionType;
  productionTime: string;
}

export interface DeliveryExpectation {
  hasMadeToOrder: boolean;
  productionTimeNotice?: string;
  shippingTransitNotice: string;
  estimatedDescription: string;
}

export interface OrderPayload {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO 8601
  customer: CustomerInfo;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryExpectation: DeliveryExpectation;
  termsAgreed: boolean;
  isGatewaySimulation?: boolean;
  courier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface CheckoutFormValues {
  // Contact
  fullName: string;
  email: string;
  phone: string;

  // Shipping
  shippingFullName: string;
  shippingPhone: string;
  sameAsContact: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;

  // Payment
  paymentMethod: PaymentMethod;

  // Consent
  termsAgreed: boolean;
}

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormValues, string>>;

export interface PaymentGatewayConfig {
  providerName: string;
  isConfigured: boolean;
  supportedMethods: PaymentMethod[];
}
