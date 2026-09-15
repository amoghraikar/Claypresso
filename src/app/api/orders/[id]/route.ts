import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const contact = searchParams.get('contact')?.trim().toLowerCase();

    if (!id) {
      return apiError('Order reference is required', 400);
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order) {
      return apiError('Order not found', 404, 'NOT_FOUND');
    }

    // Strict IDOR Protection:
    const isAdmin = session?.role === 'ADMIN';
    const isOwner = session && (order.userId === session.userId || order.customerEmail.toLowerCase() === session.email.toLowerCase());
    const matchesContact = contact && (
      order.customerEmail.toLowerCase() === contact ||
      order.customerPhone.replace(/\D/g, '') === contact.replace(/\D/g, '')
    );

    // If caller is logged in as a different customer and does not own the order, deny access
    if (session && !isAdmin && !isOwner) {
      return apiError('Access denied. You do not have permission to view this order.', 403, 'FORBIDDEN');
    }

    const sanitizedAddress = JSON.parse(order.shippingAddress || '{}');

    // If caller is an unauthenticated guest without contact verification, mask phone and address
    if (!isAdmin && !isOwner && !matchesContact) {
      const maskedEmail = order.customerEmail.replace(/^(.)(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c);
      const maskedPhone = order.customerPhone.slice(-4).padStart(order.customerPhone.length, '*');
      
      return apiSuccess({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        courier: order.courier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        customerName: order.customerName,
        customerEmail: maskedEmail,
        customerPhone: maskedPhone,
        items: order.items,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        total: order.total,
        shippingAddress: {
          city: sanitizedAddress.city,
          state: sanitizedAddress.state,
          pincode: sanitizedAddress.pincode,
          country: 'India',
        },
      });
    }

    return apiSuccess({
      ...order,
      shippingAddress: sanitizedAddress,
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return apiError('Failed to fetch order details', 500);
  }
}
