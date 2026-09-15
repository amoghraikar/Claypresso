import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { id: true, name: true, slug: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
        },
      },
    });

    const formatted = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      productSlug: r.product.slug,
      productImage: r.product.images[0]?.url || '/images/placeholder.png',
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      content: r.content,
      verifiedPurchase: r.verifiedPurchase,
      status: r.status,
      createdAt: r.createdAt,
    }));

    return apiSuccess(formatted);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch reviews', 500);
  }
}
