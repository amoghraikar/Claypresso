import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET() {
  try {
    const [bestsellersCount, newArrivalsCount, under100Count, under250Count, under500Count] =
      await Promise.all([
        prisma.product.count({ where: { badges: { contains: 'bestseller' } } }),
        prisma.product.count({ where: { badges: { contains: 'new' } } }),
        prisma.product.count({ where: { price: { lte: 100 } } }),
        prisma.product.count({ where: { price: { lte: 250 } } }),
        prisma.product.count({ where: { price: { lte: 500 } } }),
      ]);

    const collections = [
      {
        id: 'new-arrivals',
        name: 'New Arrivals',
        description: 'Fresh out of the studio kiln.',
        itemCount: newArrivalsCount,
      },
      {
        id: 'bestsellers',
        name: 'Bestsellers',
        description: 'Beloved designs ordered again and again.',
        itemCount: bestsellersCount,
      },
      {
        id: 'under-100',
        name: 'Under ₹100',
        description: 'Pocket-friendly charms.',
        itemCount: under100Count,
      },
      {
        id: 'under-250',
        name: 'Under ₹250',
        description: 'Affordable tactile accents.',
        itemCount: under250Count,
      },
      {
        id: 'under-500',
        name: 'Under ₹500',
        description: 'Everyday companions.',
        itemCount: under500Count,
      },
    ];

    return apiSuccess(collections);
  } catch (error: any) {
    console.error('Error fetching collections:', error);
    return apiError('Failed to fetch collections', 500);
  }
}
