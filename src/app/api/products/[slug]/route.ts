import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return apiError('Product slug is required', 400);
    }

    const p = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!p) {
      return apiError('Product not found', 404, 'NOT_FOUND');
    }

    const formatted = {
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
      reviews: p.reviews.map((r) => ({
        id: r.id,
        author: r.authorName,
        rating: r.rating,
        date: r.createdAt.toISOString().split('T')[0],
        content: r.content,
        verifiedPurchase: r.verifiedPurchase,
      })),
    };

    return apiSuccess(formatted);
  } catch (error: any) {
    console.error('Error fetching product by slug:', error);
    return apiError('Failed to fetch product details', 500, 'SERVER_ERROR');
  }
}
