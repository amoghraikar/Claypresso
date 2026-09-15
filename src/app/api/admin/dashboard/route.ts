import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return apiError('Unauthorized. Admin privileges required.', 403, 'FORBIDDEN');
    }

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      customRequestsCount,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }),
      prisma.order.count({
        where: { orderStatus: { in: ['PENDING', 'PROCESSING', 'IN_PRODUCTION'] } },
      }),
      prisma.customOrder.count({
        where: { status: { in: ['NEW', 'REVIEWING', 'QUOTED'] } },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 3 } },
        select: { id: true, name: true, stock: true, status: true },
        take: 10,
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    return apiSuccess({
      metrics: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        pendingCustomRequests: customRequestsCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return apiError('Failed to fetch dashboard metrics', 500);
  }
}
