import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { referenceNumber: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const requests = await prisma.customOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const formatted = requests.map((r) => ({
      id: r.id,
      referenceNumber: r.referenceNumber,
      name: r.name,
      email: r.email,
      phone: r.phone,
      category: r.category,
      description: r.description,
      quantity: r.quantity,
      status: r.status,
      createdAt: r.createdAt,
      latestQuote: r.quotes[0] || null,
      imageCount: JSON.parse(r.referenceImages || '[]').length,
    }));

    return apiSuccess(formatted);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch custom orders', 500);
  }
}
