import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return apiError('Unauthorized', 403, 'FORBIDDEN');
    }

    const { id } = await params;
    const body = await req.json();
    const { price, productionDays = 25, notes, validityDays = 7 } = body;

    if (!price || price <= 0) {
      return apiError('Valid quote price is required', 400);
    }

    const customOrder = await prisma.customOrder.findUnique({
      where: { id },
    });

    if (!customOrder) {
      return apiError('Custom order not found', 404);
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validityDays);

    const [quote] = await prisma.$transaction([
      prisma.customQuote.create({
        data: {
          customOrderId: customOrder.id,
          price: parseFloat(String(price)),
          productionDays: parseInt(String(productionDays), 10),
          notes: notes || 'Hand-sculpted in polymer clay at our Bangalore studio.',
          expiresAt,
          status: 'PENDING',
        },
      }),
      prisma.customOrder.update({
        where: { id: customOrder.id },
        data: { status: 'QUOTED' },
      }),
    ]);

    return apiSuccess({
      quote,
      message: 'Quote created and custom order status updated to QUOTED.',
    });
  } catch (error: any) {
    console.error('Error creating custom quote:', error);
    return apiError('Failed to create quotation', 500);
  }
}
