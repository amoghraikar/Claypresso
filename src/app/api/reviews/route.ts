import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('You must be logged in to leave a review.', 401);
    }

    const body = await req.json();
    const { productId, rating, title, content } = body;

    if (!productId) {
      return apiError('Product ID is required', 400);
    }
    if (!rating || rating < 1 || rating > 5) {
      return apiError('Rating must be between 1 and 5 stars.', 400);
    }
    if (!content || content.trim().length < 5) {
      return apiError('Review content must be at least 5 characters long.', 400);
    }

    // Check duplicate review
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: session.userId,
      },
    });

    if (existingReview) {
      return apiError('You have already submitted a review for this product.', 400, 'DUPLICATE_REVIEW');
    }

    // Check verified purchase
    const userOrderWithProduct = await prisma.order.findFirst({
      where: {
        userId: session.userId,
        paymentStatus: 'PAID',
        items: {
          some: { productId },
        },
      },
    });

    const status = session.role === 'ADMIN' ? 'APPROVED' : 'PENDING';

    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.userId,
        orderId: userOrderWithProduct?.id || null,
        authorName: session.name || 'Clay Lover',
        rating: Math.round(rating),
        title: title?.trim() || null,
        content: content.trim(),
        verifiedPurchase: !!userOrderWithProduct,
        status,
      },
    });

    return apiSuccess(
      {
        id: review.id,
        author: review.authorName,
        rating: review.rating,
        title: review.title,
        content: review.content,
        verifiedPurchase: review.verifiedPurchase,
        status: review.status,
        date: review.createdAt.toISOString().split('T')[0],
      },
      201
    );
  } catch (error: any) {
    console.error('Error submitting review:', error);
    return apiError('Failed to submit review', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const where: any = { status: 'APPROVED' };
    if (productId) {
      where.productId = productId;
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productId: true,
        authorName: true,
        rating: true,
        title: true,
        content: true,
        verifiedPurchase: true,
        createdAt: true,
      },
    });

    return apiSuccess(reviews);
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return apiError('Failed to fetch reviews', 500);
  }
}
