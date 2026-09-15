import { CartItem, BUSINESS_RULES } from '@/types/product';
import {
  OrderPayload,
  CheckoutFormValues,
  OrderItem,
  DeliveryExpectation,
  PaymentStatus,
  OrderStatus,
} from '@/types/order';
import { apiClient, ApiResponse } from './apiClient';

const ORDERS_STORAGE_KEY = 'claypresso_placed_orders';

export const orderService = {
  /**
   * Validates cart items, verifies inventory, and calculates authoritative total on the server.
   */
  async validateCheckout(
    items: { productId: string; variantId?: string; quantity: number }[],
    discountCode?: string
  ): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/api/checkout/validate', { items, discountCode });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Creates real order on the server database.
   */
  async createOrderOnServer(
    cart: CartItem[],
    form: CheckoutFormValues,
    options?: { isSimulation?: boolean; discountCode?: string }
  ): Promise<ApiResponse<any>> {
    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        variantId: item.selectedVariant?.id,
        quantity: item.quantity,
      }));

      return await apiClient.post('/api/orders', {
        customer: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        },
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          addressLine1: form.addressLine1,
          addressLine2: form.addressLine2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        items: itemsPayload,
        paymentMethod: form.paymentMethod === 'CARD' ? 'CARD' : 'UPI',
        discountCode: options?.discountCode,
        isSimulation: options?.isSimulation ?? false,
      });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Tracks order by number and contact via real server API.
   */
  async trackOrderOnServer(orderNumber: string, contact: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post('/api/orders/track', { orderNumber, contact });
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  /**
   * Builds an immutable OrderPayload from current cart items and validated form values.
   */
  buildOrderPayload(
    cart: CartItem[],
    form: CheckoutFormValues,
    subtotal: number,
    shippingFee: number,
    options?: { isSimulation?: boolean; paymentStatus?: PaymentStatus }
  ): OrderPayload {
    // Generate human-friendly order reference
    const timestamp = Date.now();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CP-${new Date().getFullYear()}-${randomSuffix}`;
    const orderId = `order_${timestamp}_${randomSuffix}`;

    // Map cart items to immutable order snapshot
    const items: OrderItem[] = cart.map((item) => ({
      id: `${item.product.id}${item.selectedVariant ? `-${item.selectedVariant.id}` : ''}`,
      productId: item.product.id,
      productSlug: item.product.slug,
      name: item.product.name,
      price: item.product.price + (item.selectedVariant?.priceDelta || 0),
      quantity: item.quantity,
      selectedVariant: item.selectedVariant,
      image: item.product.images[0] || '/images/placeholder.png',
      productionType: item.product.productionType,
      productionTime: item.product.productionTime,
    }));

    // Check delivery expectations
    const madeToOrderItems = cart.filter(
      (item) => item.product.productionType === 'MADE_TO_ORDER'
    );
    const hasMadeToOrder = madeToOrderItems.length > 0;

    let productionTimeNotice: string | undefined;
    if (hasMadeToOrder) {
      // Find the longest production window mentioned
      const sampleProd = madeToOrderItems[0].product.productionTime || '3–5 business days';
      productionTimeNotice = `Production time applies before shipping: ${sampleProd} handcrafting window.`;
    }

    const shippingTransitNotice = `Standard shipping transit: ~${BUSINESS_RULES.transitDaysReadyMade} days across India.`;

    const deliveryExpectation: DeliveryExpectation = {
      hasMadeToOrder,
      productionTimeNotice,
      shippingTransitNotice,
      estimatedDescription: hasMadeToOrder
        ? `Handmade to order (${productionTimeNotice}) + ~${BUSINESS_RULES.transitDaysReadyMade} days shipping transit`
        : `Ready to ship: ~${BUSINESS_RULES.transitDaysReadyMade} business days delivery across India`,
    };

    const paymentStatus: PaymentStatus = options?.paymentStatus || 'pending';
    const orderStatus: OrderStatus = 'pending';

    const order: OrderPayload = {
      id: orderId,
      orderNumber,
      createdAt: new Date().toISOString(),
      customer: {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      },
      shippingAddress: {
        fullName: form.shippingFullName.trim() || form.fullName.trim(),
        phone: form.shippingPhone.trim() || form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim() || undefined,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        country: 'India',
      },
      items,
      subtotal,
      shippingFee,
      discount: 0,
      total: subtotal + shippingFee,
      paymentMethod: form.paymentMethod,
      paymentStatus,
      orderStatus,
      deliveryExpectation,
      termsAgreed: form.termsAgreed,
      isGatewaySimulation: options?.isSimulation ?? false,
    };

    return order;
  },

  /**
   * Persists an order to client storage for confirmation display and account history.
   */
  saveOrder(order: OrderPayload): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getAllOrders();
      const updated = [order, ...existing.filter((o) => o.id !== order.id)];
      sessionStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage unavailable or full
    }
  },

  /**
   * Retrieves an order by its ID or order number.
   */
  getOrderById(orderId: string): OrderPayload | null {
    if (typeof window === 'undefined') return null;
    try {
      const orders = this.getAllOrders();
      return (
        orders.find(
          (o) =>
            o.id.toLowerCase() === orderId.toLowerCase() ||
            o.orderNumber.toLowerCase() === orderId.toLowerCase()
        ) || null
      );
    } catch {
      return null;
    }
  },

  /**
   * Guest order tracking lookup: checks matching Order Number AND (Email or Phone).
   */
  findOrderByTracking(orderNumber: string, contact: string): OrderPayload | null {
    if (typeof window === 'undefined') return null;
    const cleanNum = orderNumber.trim().toLowerCase().replace(/^#/, '');
    const cleanContact = contact.trim().toLowerCase();
    const cleanDigits = contact.replace(/\D/g, '');

    const orders = this.getAllOrders();
    return (
      orders.find((o) => {
        const matchesNum =
          o.orderNumber.toLowerCase().replace(/^#/, '') === cleanNum ||
          o.id.toLowerCase() === cleanNum;
        if (!matchesNum) return false;

        const emailMatch = o.customer.email.toLowerCase() === cleanContact;
        const phoneDigits = o.customer.phone.replace(/\D/g, '');
        const phoneMatch =
          cleanDigits.length >= 10 &&
          (phoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(phoneDigits));

        return emailMatch || phoneMatch;
      }) || null
    );
  },

  /**
   * Retrieves all orders for a specific user email.
   */
  getOrdersForUser(email: string): OrderPayload[] {
    if (typeof window === 'undefined' || !email) return [];
    const normalized = email.trim().toLowerCase();
    const orders = this.getAllOrders();
    return orders.filter((o) => o.customer.email.toLowerCase() === normalized);
  },

  /**
   * Retrieves all placed orders across storage.
   */
  getAllOrders(): OrderPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const sessionRaw = sessionStorage.getItem(ORDERS_STORAGE_KEY);
      const localRaw = localStorage.getItem(ORDERS_STORAGE_KEY);
      const sessionOrders: OrderPayload[] = sessionRaw ? JSON.parse(sessionRaw) : [];
      const localOrders: OrderPayload[] = localRaw ? JSON.parse(localRaw) : [];

      const map = new Map<string, OrderPayload>();
      [...sessionOrders, ...localOrders].forEach((o) => map.set(o.id, o));
      return Array.from(map.values());
    } catch {
      return [];
    }
  },
};
