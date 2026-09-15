import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId } = body;

    if (!orderId) {
      return apiError('Order ID is required', 400);
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    if (order.paymentStatus === 'PAID') {
      return apiError('Order is already paid', 400);
    }

    // Payment abstraction: In development/test mode, create payment intent
    const paymentProvider = process.env.PAYMENT_PROVIDER || 'MOCK_UPI';
    const amountInPaise = Math.round(order.total * 100);

    const paymentSession = {
      provider: paymentProvider,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      amountInPaise,
      currency: 'INR',
      key: process.env.PAYMENT_PROVIDER_KEY || 'rzp_test_placeholder',
      customer: {
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
    };

    return apiSuccess(paymentSession);
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return apiError('Failed to initialize payment', 500);
  }
}
