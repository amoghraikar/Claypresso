import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const body = await req.json();
    const { quoteId } = body;

    const customOrder = await prisma.customOrder.findFirst({
      where: {
        OR: [{ id: reference }, { referenceNumber: reference }],
      },
      include: {
        quotes: true,
      },
    });

    if (!customOrder) {
      return apiError('Custom order not found', 404);
    }

    const quote = customOrder.quotes.find(
      (q) => q.id === quoteId || (!quoteId && q.status === 'PENDING')
    );

    if (!quote) {
      return apiError('No active quote found to approve', 400);
    }

    if (new Date() > quote.expiresAt) {
      return apiError('This quote has expired. Please request an updated quotation.', 400);
    }

    await prisma.$transaction([
      prisma.customQuote.update({
        where: { id: quote.id },
        data: { status: 'ACCEPTED' },
      }),
      prisma.customOrder.update({
        where: { id: customOrder.id },
        data: { status: 'APPROVED' },
      }),
    ]);

    return apiSuccess({
      success: true,
      message: 'Quotation approved. Ready for payment and studio crafting.',
      customOrderId: customOrder.id,
      price: quote.price,
    });
  } catch (error: any) {
    console.error('Error approving quote:', error);
    return apiError('Failed to approve quote', 500);
  }
}
