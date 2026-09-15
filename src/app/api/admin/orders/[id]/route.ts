import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

// Valid order status transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAID', 'PROCESSING', 'CANCELLED'],
  PAID: ['PROCESSING', 'IN_PRODUCTION', 'CANCELLED'],
  PROCESSING: ['IN_PRODUCTION', 'SHIPPED', 'CANCELLED'],
  IN_PRODUCTION: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['COMPLETED', 'REFUNDED'],
  COMPLETED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
        payments: true,
        user: {
          select: { id: true, name: true, email: true, phone: true, createdAt: true },
        },
      },
    });

    if (!order) {
      return apiError('Order not found', 404);
    }

    const shippingAddress = JSON.parse(order.shippingAddress || '{}');

    return apiSuccess({
      ...order,
      shippingAddress,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch order', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus, notes, courier, trackingNumber } = body;

    const currentOrder = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: true },
    });

    if (!currentOrder) {
      return apiError('Order not found', 404);
    }

    // Validate order status transition if changing
    if (orderStatus && orderStatus !== currentOrder.orderStatus) {
      const allowed = VALID_TRANSITIONS[currentOrder.orderStatus] || [];
      if (!allowed.includes(orderStatus)) {
        return apiError(
          `Invalid status transition from "${currentOrder.orderStatus}" to "${orderStatus}".`,
          400,
          'INVALID_STATUS_TRANSITION'
        );
      }
    }

    // If order is marked CANCELLED or REFUNDED, restore inventory if needed
    if (
      orderStatus === 'CANCELLED' &&
      currentOrder.orderStatus !== 'CANCELLED' &&
      currentOrder.paymentStatus === 'PAID'
    ) {
      for (const item of currentOrder.items) {
        if (item.variantId) {
          await prisma.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        if (item.productId) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }

    // Prepare fulfillment updates
    const { generateTrackingUrl } = await import('@/lib/shipping');
    const { notificationService } = await import('@/lib/notifications');

    let trackingUrl = currentOrder.trackingUrl;
    if (trackingNumber && courier) {
      trackingUrl = generateTrackingUrl(courier, trackingNumber);
    }

    const updated = await prisma.order.update({
      where: { id: currentOrder.id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        courier: courier || undefined,
        trackingNumber: trackingNumber || undefined,
        trackingUrl: trackingUrl || undefined,
        shippedAt: orderStatus === 'SHIPPED' && !currentOrder.shippedAt ? new Date() : undefined,
        deliveredAt: orderStatus === 'DELIVERED' && !currentOrder.deliveredAt ? new Date() : undefined,
      },
    });

    // If order just moved to SHIPPED, trigger shipment notification
    if (orderStatus === 'SHIPPED' && (trackingNumber || currentOrder.trackingNumber)) {
      notificationService.notifyOrderShipped(updated, {
        courier: courier || currentOrder.courier || 'India Post',
        trackingNumber: trackingNumber || currentOrder.trackingNumber || '',
        trackingUrl: trackingUrl || undefined,
      });
    }

    // Write to audit log
    await logAdminAudit(admin, 'UPDATE_ORDER_STATUS', 'Order', currentOrder.id, {
      fromStatus: currentOrder.orderStatus,
      toStatus: orderStatus || currentOrder.orderStatus,
      paymentStatus: paymentStatus || currentOrder.paymentStatus,
      courier,
      trackingNumber,
      notes,
    });

    return apiSuccess({
      success: true,
      order: updated,
      message: `Order #${updated.orderNumber} updated to ${updated.orderStatus}.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError(err.message || 'Failed to update order', 500);
  }
}
