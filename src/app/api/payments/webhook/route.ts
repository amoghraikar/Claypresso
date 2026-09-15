import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentProvider } from '@/lib/payments';
import { notificationService } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || req.headers.get('x-webhook-signature') || '';

    // 1. Verify Webhook Signature
    const verification = await paymentProvider.verifyWebhook(rawBody, signature);
    if (!verification.verified) {
      console.warn('[Payment Webhook] Rejected invalid webhook signature:', verification.error);
      return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 400 });
    }

    const { eventId, eventType, orderId, paymentId, rawPayload } = verification;

    // 2. Check Idempotency: Prevent duplicate processing
    if (eventId) {
      const existing = await prisma.webhookEvent.findUnique({
        where: { eventId },
      });

      if (existing) {
        console.log(`[Payment Webhook] Event ${eventId} already processed.`);
        return NextResponse.json({ success: true, duplicate: true, message: 'Event already processed' });
      }

      // Record this webhook event
      await prisma.webhookEvent.create({
        data: {
          eventId,
          provider: paymentProvider.name,
          eventType: eventType || 'unknown',
          payload: rawBody,
          processed: true,
          processedAt: new Date(),
        },
      });
    }

    // 3. Process Event
    console.log(`[Payment Webhook] Processing event: ${eventType} for order: ${orderId}`);

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      if (orderId) {
        const order = await prisma.order.findFirst({
          where: {
            OR: [{ id: orderId }, { orderNumber: orderId }],
          },
          include: { items: true },
        });

        if (order && order.paymentStatus !== 'PAID') {
          await prisma.$transaction(async (tx) => {
            const freshOrder = await tx.order.findUnique({ where: { id: order.id } });
            if (!freshOrder || freshOrder.paymentStatus === 'PAID') {
              return;
            }

            // Update order status
            await tx.order.update({
              where: { id: order.id },
              data: {
                paymentStatus: 'PAID',
                orderStatus: 'PROCESSING',
              },
            });

            // Update or create payment record
            await tx.payment.create({
              data: {
                orderId: order.id,
                provider: paymentProvider.name,
                providerPaymentId: paymentId || eventId,
                amount: order.total,
                currency: 'INR',
                status: 'PAID',
                metadata: JSON.stringify({ webhookEventId: eventId, eventType }),
              },
            });

            // Decrement inventory if not already decremented
            for (const item of order.items) {
              if (item.productId) {
                const prod = await tx.product.findUnique({ where: { id: item.productId } });
                if (prod) {
                  const nextStock = Math.max(0, prod.stock - item.quantity);
                  await tx.product.update({
                    where: { id: item.productId },
                    data: {
                      stock: nextStock,
                      status: nextStock <= 0 ? 'OUT_OF_STOCK' : nextStock <= 3 ? 'LOW_STOCK' : 'IN_STOCK',
                    },
                  });
                }
              }
            }
          });

          // Dispatch confirmation notifications
          notificationService.notifyPaymentConfirmed(order);
        }
      }
    } else if (eventType === 'payment.failed') {
      if (orderId) {
        const order = await prisma.order.findFirst({
          where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
        });
        if (order) {
          await prisma.payment.create({
            data: {
              orderId: order.id,
              provider: paymentProvider.name,
              providerPaymentId: paymentId || eventId,
              amount: order.total,
              currency: 'INR',
              status: 'FAILED',
              metadata: JSON.stringify({ webhookEventId: eventId, eventType, rawPayload }),
            },
          });
        }
      }
    } else if (eventType === 'refund.created') {
      if (orderId) {
        const order = await prisma.order.findFirst({
          where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
          include: { items: true },
        });

        if (order && order.paymentStatus === 'PAID') {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'REFUNDED', orderStatus: 'CANCELLED' },
            });

            // Restore inventory
            for (const item of order.items) {
              if (item.productId) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: { increment: item.quantity } },
                });
              }
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, processed: true });
  } catch (err: any) {
    console.error('[Payment Webhook] Handler error:', err);
    return NextResponse.json({ error: 'Internal webhook error' }, { status: 500 });
  }
}
