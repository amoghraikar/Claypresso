import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim().toLowerCase();

    // 1. Fetch registered users (excluding ADMINs)
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { id: true, total: true, paymentStatus: true, createdAt: true },
        },
      },
    });

    // 2. Fetch unique guest order customer records
    const guestOrders = await prisma.order.findMany({
      where: { userId: null },
      orderBy: { createdAt: 'desc' },
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        total: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    const customerMap = new Map<string, any>();

    // Map registered users
    for (const u of users) {
      const paidOrders = u.orders.filter((o) => o.paymentStatus === 'PAID');
      const totalSpend = paidOrders.reduce((sum, o) => sum + o.total, 0);

      customerMap.set(u.email.toLowerCase(), {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '—',
        isRegistered: true,
        orderCount: u.orders.length,
        totalSpend,
        joinedAt: u.createdAt,
      });
    }

    // Map guest orders
    for (const g of guestOrders) {
      const email = g.customerEmail.toLowerCase();
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: `guest_${Buffer.from(email).toString('hex').slice(0, 12)}`,
          name: g.customerName,
          email: g.customerEmail,
          phone: g.customerPhone || '—',
          isRegistered: false,
          orderCount: 1,
          totalSpend: g.paymentStatus === 'PAID' ? g.total : 0,
          joinedAt: g.createdAt,
        });
      } else {
        const existing = customerMap.get(email);
        if (!existing.isRegistered) {
          existing.orderCount += 1;
          if (g.paymentStatus === 'PAID') existing.totalSpend += g.total;
        }
      }
    }

    let list = Array.from(customerMap.values());

    if (search) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.phone.includes(search)
      );
    }

    return apiSuccess({
      totalCustomers: list.length,
      customers: list,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch customers', 500);
  }
}
