import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentProvider } from '@/lib/payments';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return apiError('Order ID is required to create a payment session', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    if (order.paymentStatus === 'PAID') {
      return apiError('This order is already marked as paid.', 400, 'ORDER_ALREADY_PAID');
    }

    // Call payment provider to initialize order
    const session = await paymentProvider.createOrder({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      currency: 'INR',
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      notes: {
        orderNumber: order.orderNumber,
        itemsCount: String(order.items?.length || 0),
      },
    });

    if (!session.success) {
      return apiError(session.error || 'Failed to initialize payment gateway order', 502);
    }

    // Record or update pending payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: paymentProvider.name,
        providerPaymentId: session.gatewayOrderId,
        amount: order.total,
        currency: 'INR',
        status: 'PENDING',
        metadata: JSON.stringify({
          gatewayOrderId: session.gatewayOrderId,
          isTestMode: session.isTestMode,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return apiSuccess({
      gatewayOrderId: session.gatewayOrderId,
      amount: session.amount,
      currency: session.currency,
      keyId: session.keyId,
      isTestMode: session.isTestMode,
      statusText: session.statusText,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
      },
    });
  } catch (err: any) {
    console.error('Payment session creation error:', err);
    return apiError(err.message || 'Failed to initiate payment session', 500);
  }
}
