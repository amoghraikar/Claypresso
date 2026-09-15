import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const {
      customer,
      category,
      customCategoryDetails,
      description,
      preferredColors,
      theme,
      textToInclude,
      quantity = 1,
      approximateSize,
      additionalInstructions,
      referenceImages = [],
    } = body;

    // Validation
    if (!customer?.fullName?.trim() || !customer?.email?.trim() || !customer?.phone?.trim()) {
      return apiError('Contact details (full name, email, phone) are required.', 400);
    }
    if (!category) {
      return apiError('Category selection is required.', 400);
    }
    if (!description || description.trim().length < 10) {
      return apiError('Please provide a description of at least 10 characters for your custom idea.', 400);
    }

    // Generate human-friendly reference: CP-CUSTOM-XXXX
    const count = await prisma.customOrder.count();
    const referenceNumber = `CP-CUSTOM-${String(count + 1001)}`;

    const customOrder = await prisma.customOrder.create({
      data: {
        referenceNumber,
        userId: session?.userId || null,
        name: customer.fullName.trim(),
        email: customer.email.trim().toLowerCase(),
        phone: customer.phone.trim(),
        category,
        customCategoryDetails: customCategoryDetails || null,
        description: description.trim(),
        preferredColors: preferredColors || null,
        theme: theme || null,
        textToInclude: textToInclude || null,
        quantity: Math.max(1, parseInt(String(quantity), 10) || 1),
        approximateSize: approximateSize || null,
        additionalInstructions: additionalInstructions || null,
        referenceImages: JSON.stringify(referenceImages),
        status: 'NEW',
      },
    });

    return apiSuccess(
      {
        id: customOrder.id,
        referenceNumber: customOrder.referenceNumber,
        createdAt: customOrder.createdAt,
        status: customOrder.status,
      },
      201
    );
  } catch (error: any) {
    console.error('Custom order creation error:', error);
    return apiError('Failed to submit custom creation request', 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Authentication required to list custom requests', 401);
    }

    const requests = await prisma.customOrder.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { email: session.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        quotes: true,
      },
    });

    return apiSuccess(requests);
  } catch (error: any) {
    console.error('Error fetching custom orders:', error);
    return apiError('Failed to fetch custom orders', 500);
  }
}
