import { emailService } from './emailService';
import { whatsappService } from './whatsappService';
import {
  renderOrderConfirmationEmail,
  renderOrderShippedEmail,
  renderCustomQuoteEmail,
} from './emailTemplates';

export class NotificationService {
  /**
   * Dispatches order and payment confirmation notifications across Email and WhatsApp.
   * Runs in non-blocking fire-and-forget mode.
   */
  public notifyPaymentConfirmed(order: any, payment?: any) {
    // Non-blocking async dispatch
    setImmediate(async () => {
      try {
        // Parse items and shipping address if needed
        let items = order.items || [];
        if (typeof items === 'string') {
          try { items = JSON.parse(items); } catch { items = []; }
        }

        let shippingAddress = order.shippingAddress;
        if (typeof shippingAddress === 'string') {
          try { shippingAddress = JSON.parse(shippingAddress); } catch { shippingAddress = {}; }
        }

        const emailData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: items.map((i: any) => ({
            name: i.productNameSnapshot || i.name || 'Handcrafted Clay Item',
            variant: i.selectedVariantSnapshot || i.variantName,
            quantity: i.quantity || 1,
            price: i.priceSnapshot || i.price || 0,
            subtotal: i.subtotal || (i.priceSnapshot || 0) * (i.quantity || 1),
          })),
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount || 0,
          total: order.total,
          shippingAddress,
        };

        const { html, text } = renderOrderConfirmationEmail(emailData);

        // 1. Send Email
        await emailService.sendEmail({
          to: order.customerEmail,
          subject: `Order Confirmed #${order.orderNumber} — Claypresso`,
          html,
          text,
        });

        // 2. Send Admin Alert Email
        const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'orders@claypresso.com';
        await emailService.sendEmail({
          to: adminEmail,
          subject: `[NEW ORDER] #${order.orderNumber} by ${order.customerName} (₹${order.total})`,
          html: `<p>New paid order received!</p><p>Order: <strong>${order.orderNumber}</strong></p><p>Customer: ${order.customerName} (${order.customerEmail})</p><p>Total: ₹${order.total}</p>`,
          text: `New order: ${order.orderNumber} by ${order.customerName} (₹${order.total})`,
        });

        // 3. Send WhatsApp
        if (order.customerPhone) {
          await whatsappService.sendNotification({
            toPhone: order.customerPhone,
            templateName: 'order_confirmed',
            parameters: {
              customerName: order.customerName,
              orderNumber: order.orderNumber,
              totalAmount: `₹${order.total}`,
            },
          });
        }
      } catch (err) {
        console.error('[NotificationService] notifyPaymentConfirmed error:', err);
      }
    });
  }

  /**
   * Dispatches shipment notification with courier tracking details.
   */
  public notifyOrderShipped(
    order: any,
    tracking: { courier: string; trackingNumber: string; trackingUrl?: string }
  ) {
    setImmediate(async () => {
      try {
        const emailData = {
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          items: order.items || [],
          subtotal: order.subtotal,
          shippingFee: order.shippingFee,
          discount: order.discount || 0,
          total: order.total,
          shippingAddress: order.shippingAddress,
          courier: tracking.courier,
          trackingNumber: tracking.trackingNumber,
          trackingUrl: tracking.trackingUrl,
        };

        const { html, text } = renderOrderShippedEmail(emailData);

        // 1. Send Email
        await emailService.sendEmail({
          to: order.customerEmail,
          subject: `Your Claypresso Order #${order.orderNumber} has Shipped!`,
          html,
          text,
        });

        // 2. Send WhatsApp
        if (order.customerPhone) {
          await whatsappService.sendNotification({
            toPhone: order.customerPhone,
            templateName: 'order_shipped',
            parameters: {
              customerName: order.customerName,
              orderNumber: order.orderNumber,
              courier: tracking.courier,
              trackingNumber: tracking.trackingNumber,
            },
          });
        }
      } catch (err) {
        console.error('[NotificationService] notifyOrderShipped error:', err);
      }
    });
  }

  /**
   * Dispatches custom commission quote ready notification.
   */
  public notifyCustomQuoteReady(customOrder: any, quote: any) {
    setImmediate(async () => {
      try {
        const quoteData = {
          referenceNumber: customOrder.referenceNumber,
          customerName: customOrder.name,
          category: customOrder.category,
          price: quote.price,
          productionDays: quote.productionDays,
          notes: quote.notes,
          expiryDate: new Date(quote.expiresAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };

        const { html, text } = renderCustomQuoteEmail(quoteData);

        // 1. Email customer
        await emailService.sendEmail({
          to: customOrder.email,
          subject: `Your Custom Creation Estimate is Ready! — ${customOrder.referenceNumber}`,
          html,
          text,
        });

        // 2. WhatsApp customer
        if (customOrder.phone) {
          await whatsappService.sendNotification({
            toPhone: customOrder.phone,
            templateName: 'custom_quote_ready',
            parameters: {
              customerName: customOrder.name,
              referenceNumber: customOrder.referenceNumber,
              price: `₹${quote.price}`,
              productionDays: `${quote.productionDays} days`,
            },
          });
        }
      } catch (err) {
        console.error('[NotificationService] notifyCustomQuoteReady error:', err);
      }
    });
  }

  /**
   * Alerts the studio admin when a product drops to low stock.
   */
  public notifyLowStockAlert(product: { id: string; name: string; stock: number }) {
    setImmediate(async () => {
      try {
        const adminEmail = process.env.ADMIN_ALERT_EMAIL || 'studio@claypresso.com';
        await emailService.sendEmail({
          to: adminEmail,
          subject: `[LOW STOCK ALERT] ${product.name} (Remaining: ${product.stock})`,
          html: `<p>Attention: Product <strong>${product.name}</strong> has reached low stock level.</p><p>Current stock: <strong>${product.stock} units</strong>.</p>`,
          text: `LOW STOCK ALERT: ${product.name} has only ${product.stock} units remaining.`,
        });
      } catch (err) {
        console.error('[NotificationService] notifyLowStockAlert error:', err);
      }
    });
  }
}

export const notificationService = new NotificationService();
