import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    let user: any = null;
    let customerEmail = '';

    if (id.startsWith('guest_')) {
      // Decode or find by order
      const orders = await prisma.order.findMany({
        where: { userId: null },
        orderBy: { createdAt: 'desc' },
      });
      const match = orders.find(
        (o) => `guest_${Buffer.from(o.customerEmail.toLowerCase()).toString('hex').slice(0, 12)}` === id
      );
      if (match) {
        customerEmail = match.customerEmail;
        user = {
          id,
          name: match.customerName,
          email: match.customerEmail,
          phone: match.customerPhone,
          isRegistered: false,
          createdAt: match.createdAt,
        };
      }
    } else {
      user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      });
      if (user) {
        customerEmail = user.email;
        user.isRegistered = true;
      }
    }

    if (!user && !customerEmail) {
      return apiError('Customer not found', 404);
    }

    // Fetch all orders for this customer
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: user?.id && !user.id.startsWith('guest_') ? user.id : undefined },
          { customerEmail: customerEmail.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalLifetimeSpend = paidOrders.reduce((sum, o) => sum + o.total, 0);

    return apiSuccess({
      customer: user,
      metrics: {
        totalOrders: orders.length,
        totalLifetimeSpend,
      },
      orders,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch customer profile', 500);
  }
}
