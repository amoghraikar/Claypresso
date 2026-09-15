import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'all') {
      where.category = {
        OR: [{ slug: category }, { name: category }],
      };
    }
    if (status && status !== 'all') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          category: true,
          images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          variants: true,
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      category: p.category.name,
      collection: p.collection || '—',
      productionType: p.productionType,
      stock: p.stock,
      status: p.status,
      image: p.images[0]?.url || '/images/placeholder.png',
      variantCount: p.variants.length,
      createdAt: p.createdAt,
    }));

    return apiSuccess({
      products: formatted,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch products', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);
    const body = await req.json();
    const {
      name,
      slug,
      description,
      categoryId,
      categoryName,
      collection,
      price,
      productionType = 'READY_MADE',
      productionTime = 'Ready to ship',
      customizable = false,
      material = 'Polymer Clay, Nickel-Free Hardware',
      dimensions = 'Varies',
      stock = 10,
      images = [],
      badges = '',
    } = body;

    if (!name?.trim() || !description?.trim() || price === undefined) {
      return apiError('Name, description, and price are required.', 400);
    }

    // Auto-generate or sanitize slug
    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).trim();

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return apiError('A product with this slug already exists.', 409);
    }

    // Resolve category
    let targetCatId = categoryId;
    if (!targetCatId && categoryName) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ name: categoryName }, { slug: categoryName }] },
      });
      targetCatId = cat?.id;
    }
    if (!targetCatId) {
      const firstCat = await prisma.category.findFirst();
      targetCatId = firstCat?.id;
    }

    const numPrice = parseFloat(String(price));
    const numStock = parseInt(String(stock), 10);
    const status = numStock <= 0 ? 'OUT_OF_STOCK' : numStock <= 3 ? 'LOW_STOCK' : 'IN_STOCK';

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description.trim(),
        categoryId: targetCatId,
        collection: collection || null,
        price: numPrice,
        productionType,
        productionTime,
        customizable: Boolean(customizable),
        material,
        dimensions,
        stock: numStock,
        status,
        badges: badges || '',
        images: {
          create: images.map((url: string, idx: number) => ({
            url,
            altText: `${name} photo ${idx + 1}`,
            sortOrder: idx,
          })),
        },
        inventories: {
          create: {
            stock: numStock,
            lowStockThreshold: 3,
          },
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    await logAdminAudit(admin, 'CREATE_PRODUCT', 'Product', product.id, {
      name: product.name,
      slug: product.slug,
      price: product.price,
      stock: product.stock,
    });

    return apiSuccess(product, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    console.error('Error creating product:', err);
    return apiError(err.message || 'Failed to create product', 500);
  }
}
