import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, contact } = body;

    if (!orderNumber || !orderNumber.trim()) {
      return apiError('Order number is required.', 400);
    }
    if (!contact || !contact.trim()) {
      return apiError('Email or phone number is required.', 400);
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanContact = contact.trim().toLowerCase();
    const cleanPhoneDigits = contact.replace(/\D/g, '');

    // Search database for matching order
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanOrderNumber,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return apiError(
        "WE COULDN'T FIND THAT ORDER. Check the order number and email address or phone and try again.",
        404,
        'ORDER_NOT_FOUND'
      );
    }

    // Verify contact match server-side
    const dbEmail = order.customerEmail.toLowerCase();
    const dbPhoneDigits = order.customerPhone.replace(/\D/g, '');

    const emailMatches = dbEmail === cleanContact;
    const phoneMatches = cleanPhoneDigits.length >= 7 && dbPhoneDigits.includes(cleanPhoneDigits);

    if (!emailMatches && !phoneMatches) {
      return apiError(
        "WE COULDN'T FIND THAT ORDER. Check the order number and email address or phone and try again.",
        404,
        'ORDER_NOT_FOUND'
      );
    }

    const sanitizedAddress = JSON.parse(order.shippingAddress || '{}');

    // Check if any items are made-to-order
    const hasMadeToOrder = order.items.some(
      (item) => item.productionTypeSnapshot === 'MADE_TO_ORDER'
    );

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
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      customer: {
        fullName: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      shippingAddress: sanitizedAddress,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      discount: order.discount,
      total: order.total,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.productNameSnapshot,
        price: item.priceSnapshot,
        quantity: item.quantity,
        subtotal: item.subtotal,
        image: item.imageSnapshot,
        selectedVariant: item.selectedVariantSnapshot ? { name: item.selectedVariantSnapshot } : null,
        productionType: item.productionTypeSnapshot,
      })),
      deliveryExpectation: {
        hasMadeToOrder,
        productionTimeNotice: hasMadeToOrder
          ? 'Studio handcrafting: 3–5 business days before dispatch'
          : undefined,
        shippingTransitNotice: 'Courier transit: ~4 days across India',
      },
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return apiError('Failed to track order', 500, 'SERVER_ERROR');
  }
}
