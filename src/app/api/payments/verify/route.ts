import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentProvider } from '@/lib/payments';
import { notificationService } from '@/lib/notifications';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentId, signature, gatewayOrderId } = body;

    if (!orderId || !paymentId) {
      return apiError('Order ID and Payment ID are required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    // Idempotency: If already paid, return early with current order
    if (order.paymentStatus === 'PAID') {
      return apiSuccess({
        verified: true,
        alreadyProcessed: true,
        order,
      });
    }

    // Verify signature with Payment Provider
    const verification = await paymentProvider.verifyPayment({
      orderId: order.id,
      paymentId,
      signature,
      gatewayOrderId,
    });

    if (!verification.verified) {
      return apiError(verification.error || 'Payment signature verification failed', 400, 'VERIFICATION_FAILED');
    }

    // Atomic transaction: Update payment, order status, and decrement inventory safely
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Re-check order status inside transaction to prevent race conditions
      const freshOrder = await tx.order.findUnique({ where: { id: order.id } });
      if (!freshOrder || freshOrder.paymentStatus === 'PAID') {
        return freshOrder || order;
      }

      // 1. Update or create Payment record
      const existingPayment = await tx.payment.findFirst({
        where: { orderId: order.id },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPayment) {
        await tx.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'PAID',
            providerPaymentId: paymentId,
            metadata: JSON.stringify({
              verifiedAt: new Date().toISOString(),
              signature,
              gatewayOrderId,
            }),
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: paymentProvider.name,
            providerPaymentId: paymentId,
            amount: order.total,
            currency: 'INR',
            status: 'PAID',
            metadata: JSON.stringify({ verifiedAt: new Date().toISOString(), signature }),
          },
        });
      }

      // 2. Decrement inventory atomically (preventing negative stock)
      for (const item of order.items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (variant) {
            const nextStock = Math.max(0, variant.stock - item.quantity);
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: nextStock },
            });
          }
        }

        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const nextStock = Math.max(0, product.stock - item.quantity);
            const nextStatus = nextStock <= 0 ? 'OUT_OF_STOCK' : nextStock <= 3 ? 'LOW_STOCK' : 'IN_STOCK';
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: nextStock,
                status: nextStatus,
              },
            });

            // If low stock reached, trigger alert
            if (nextStock <= 3) {
              notificationService.notifyLowStockAlert({
                id: product.id,
                name: product.name,
                stock: nextStock,
              });
            }
          }
        }
      }

      // 3. Mark Order as PAID and PROCESSING
      const updated = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          orderStatus: 'PROCESSING',
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return updated;
    });

    // 4. Trigger asynchronous notifications (non-blocking)
    notificationService.notifyPaymentConfirmed(updatedOrder);

    return apiSuccess({
      verified: true,
      order: updatedOrder,
      message: 'Payment verified and order confirmed successfully.',
    });
  } catch (err: any) {
    console.error('Payment verification error:', err);
    return apiError(err.message || 'Payment verification failed', 500);
  }
}
