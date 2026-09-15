import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
      return apiSuccess({ orders: [], products: [], customOrders: [], customers: [] });
    }

    const [orders, products, customOrders, customers] = await Promise.all([
      prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: q } },
            { customerName: { contains: q } },
            { customerEmail: { contains: q } },
          ],
        },
        take: 5,
        select: { id: true, orderNumber: true, customerName: true, total: true, orderStatus: true },
      }),
      prisma.product.findMany({
        where: {
          OR: [{ name: { contains: q } }, { slug: { contains: q } }],
        },
        take: 5,
        select: { id: true, name: true, slug: true, price: true, stock: true, status: true },
      }),
      prisma.customOrder.findMany({
        where: {
          OR: [{ referenceNumber: { contains: q } }, { name: { contains: q } }, { email: { contains: q } }],
        },
        take: 5,
        select: { id: true, referenceNumber: true, name: true, category: true, status: true },
      }),
      prisma.user.findMany({
        where: {
          role: 'CUSTOMER',
          OR: [{ name: { contains: q } }, { email: { contains: q } }],
        },
        take: 5,
        select: { id: true, name: true, email: true, phone: true },
      }),
    ]);

    return apiSuccess({
      orders,
      products,
      customOrders,
      customers,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to execute search', 500);
  }
}
