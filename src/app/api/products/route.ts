import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const collection = searchParams.get('collection');
    const price = searchParams.get('price'); // 'under-100', '100-250', '250-500', 'above-500'
    const availability = searchParams.get('availability'); // 'in-stock', 'low-stock', 'made-to-order'
    const productType = searchParams.get('productType'); // 'ready-made', 'made-to-order'
    const sort = searchParams.get('sort') || 'featured';
    const query = searchParams.get('query') || searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const skip = (page - 1) * limit;

    // Build Prisma where clause
    const where: any = {};

    // 1. Category filter (by slug or name)
    if (category && category !== 'all') {
      where.category = {
        OR: [
          { slug: { equals: category } },
          { name: { equals: category } },
        ],
      };
    }

    // 2. Collection filter
    if (collection) {
      if (collection === 'new-arrivals') {
        where.badges = { contains: 'new' };
      } else if (collection === 'bestsellers') {
        where.badges = { contains: 'bestseller' };
      } else if (collection === 'under-100') {
        where.price = { lte: 100 };
      } else if (collection === 'under-250') {
        where.price = { lte: 250 };
      } else if (collection === 'under-500') {
        where.price = { lte: 500 };
      } else {
        where.collection = collection;
      }
    }

    // 3. Price range filter
    if (price) {
      if (price === 'under-100') {
        where.price = { ...where.price, lte: 100 };
      } else if (price === '100-250') {
        where.price = { ...where.price, gte: 100, lte: 250 };
      } else if (price === '250-500') {
        where.price = { ...where.price, gte: 250, lte: 500 };
      } else if (price === 'above-500') {
        where.price = { ...where.price, gt: 500 };
      }
    }

    // 4. Availability / Stock filter
    if (availability) {
      if (availability === 'in-stock') {
        where.status = 'IN_STOCK';
      } else if (availability === 'low-stock') {
        where.status = 'LOW_STOCK';
      } else if (availability === 'made-to-order') {
        where.productionType = 'MADE_TO_ORDER';
      }
    }

    // 5. Product Type filter
    if (productType) {
      if (productType === 'ready-made') {
        where.productionType = 'READY_MADE';
      } else if (productType === 'made-to-order') {
        where.productionType = 'MADE_TO_ORDER';
      }
    }

    // 6. Search Query
    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    // 7. Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'bestselling') {
      orderBy = { badges: 'desc' };
    }

    const [totalCount, rawProducts] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: true,
        },
      }),
    ]);

    // Format products for frontend consumption matching existing Product interface
    const products = rawProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      category: p.category.name,
      collection: p.collection || undefined,
      price: p.price,
      originalPrice: p.originalPrice || undefined,
      images: p.images.length > 0 ? p.images.map((img) => img.url) : ['/images/placeholder.png'],
      secondaryImage: p.images.length > 1 ? p.images[1].url : undefined,
      stock: p.stock,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || undefined,
        priceDelta: v.priceAdjustment,
        stock: v.stock,
      })),
      material: p.material,
      dimensions: p.dimensions,
      productionType: p.productionType,
      productionTime: p.productionTime,
      customizable: p.customizable,
      status: p.status,
      badges: p.badges ? p.badges.split(',').filter(Boolean) : [],
      weightGrams: p.weightGrams,
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasMore = page < totalPages;

    return apiSuccess({
      products,
      totalCount,
      page,
      limit,
      totalPages,
      hasMore,
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return apiError('Failed to fetch products', 500, 'SERVER_ERROR', error.message);
  }
}
