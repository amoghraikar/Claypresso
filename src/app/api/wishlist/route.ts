import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiSuccess({ items: [] }); // Guest returns empty server wishlist
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.userId },
        include: { items: { include: { product: { include: { images: true } } } } },
      });
    }

    const productIds = wishlist.items.map((i) => i.productId);

    return apiSuccess({
      productIds,
      items: wishlist.items.map((i) => ({
        id: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        price: i.product.price,
        image: i.product.images[0]?.url || '/images/placeholder.png',
        status: i.product.status,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching wishlist:', error);
    return apiError('Failed to fetch wishlist', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Authentication required to save items to account wishlist', 401);
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return apiError('Product ID is required', 400);
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: session.userId },
      });
    }

    // Add item (ignore if duplicate)
    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      create: {
        wishlistId: wishlist.id,
        productId,
      },
      update: {},
    });

    return apiSuccess({ success: true, message: 'Added to wishlist' });
  } catch (error: any) {
    console.error('Error adding to wishlist:', error);
    return apiError('Failed to add to wishlist', 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Authentication required', 401);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return apiError('Product ID is required', 400);
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.userId },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          productId,
        },
      });
    }

    return apiSuccess({ success: true, message: 'Removed from wishlist' });
  } catch (error: any) {
    console.error('Error removing from wishlist:', error);
    return apiError('Failed to remove from wishlist', 500);
  }
}
