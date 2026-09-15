import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const session = await getSessionUser(req);

    if (!reference) {
      return apiError('Reference is required', 400);
    }

    const customOrder = await prisma.customOrder.findFirst({
      where: {
        OR: [{ id: reference }, { referenceNumber: reference }],
      },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!customOrder) {
      return apiError('Custom order request not found', 404);
    }

    // IDOR Protection:
    const isAdmin = session?.role === 'ADMIN';
    const { searchParams } = new URL(req.url);
    const verifyContact = (searchParams.get('contact') || searchParams.get('email') || searchParams.get('phone') || '').trim().toLowerCase();

    const isOwner = session && (
      customOrder.userId === session.userId ||
      customOrder.email.toLowerCase() === session.email.toLowerCase()
    );

    const matchesContact = verifyContact && (
      customOrder.email.toLowerCase() === verifyContact ||
      customOrder.phone.replace(/\D/g, '') === verifyContact.replace(/\D/g, '')
    );

    if (!isAdmin && !isOwner && !matchesContact) {
      return apiError('Verification required. Please provide your contact email or log in to view this custom commission inquiry.', 403, 'FORBIDDEN');
    }

    const referenceImages = JSON.parse(customOrder.referenceImages || '[]');

    return apiSuccess({
      ...customOrder,
      referenceImages,
    });
  } catch (error: any) {
    console.error('Error fetching custom order:', error);
    return apiError('Failed to fetch custom order details', 500);
  }
}
