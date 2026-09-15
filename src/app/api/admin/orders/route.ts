import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return apiError('Unauthorized', 403, 'FORBIDDEN');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
      },
    });

    return apiSuccess(orders);
  } catch (error: any) {
    console.error('Admin orders error:', error);
    return apiError('Failed to fetch orders', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return apiError('Unauthorized', 403, 'FORBIDDEN');
    }

    const body = await req.json();
    const { orderId, orderStatus, paymentStatus } = body;

    if (!orderId) {
      return apiError('Order ID is required', 400);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
      },
    });

    return apiSuccess(updated);
  } catch (error: any) {
    console.error('Admin update order error:', error);
    return apiError('Failed to update order', 500);
  }
}
