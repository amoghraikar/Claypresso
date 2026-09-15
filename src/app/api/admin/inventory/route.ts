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

    const products = await prisma.product.findMany({
      orderBy: { stock: 'asc' },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        variants: true,
        inventories: true,
      },
    });

    let items = products.map((p) => {
      const lowThreshold = p.inventories[0]?.lowStockThreshold ?? 3;
      let state = 'IN_STOCK';
      if (p.stock <= 0) state = 'OUT_OF_STOCK';
      else if (p.stock <= lowThreshold) state = 'LOW_STOCK';

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category.name,
        price: p.price,
        stock: p.stock,
        lowStockThreshold: lowThreshold,
        state,
        image: p.images[0]?.url || '/images/placeholder.png',
        updatedAt: p.updatedAt,
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          stock: v.stock,
          sku: v.sku,
        })),
      };
    });

    if (status && status !== 'all') {
      items = items.filter((i) => i.state === status);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    const summary = {
      totalItems: items.length,
      outOfStockCount: items.filter((i) => i.state === 'OUT_OF_STOCK').length,
      lowStockCount: items.filter((i) => i.state === 'LOW_STOCK').length,
      inStockCount: items.filter((i) => i.state === 'IN_STOCK').length,
    };

    return apiSuccess({
      summary,
      items,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch inventory', 500);
  }
}
