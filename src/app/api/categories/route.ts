import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      itemCount: c._count.products,
      coverImage: c.image || '',
    }));

    return apiSuccess(formatted);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return apiError('Failed to fetch categories', 500);
  }
}
