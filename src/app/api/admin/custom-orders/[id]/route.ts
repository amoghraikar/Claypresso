import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser(req);
    const { id } = await params;

    const customOrder = await prisma.customOrder.findFirst({
      where: {
        OR: [{ id }, { referenceNumber: id }],
      },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!customOrder) {
      return apiError('Custom order request not found', 404);
    }

    const referenceImages = JSON.parse(customOrder.referenceImages || '[]');

    return apiSuccess({
      ...customOrder,
      referenceImages,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch custom order', 500);
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
    const { status, notes } = body;

    const current = await prisma.customOrder.findFirst({
      where: { OR: [{ id }, { referenceNumber: id }] },
    });

    if (!current) {
      return apiError('Custom order not found', 404);
    }

    const updated = await prisma.customOrder.update({
      where: { id: current.id },
      data: { status: status || undefined },
    });

    await logAdminAudit(admin, 'UPDATE_CUSTOM_STATUS', 'CustomOrder', current.id, {
      fromStatus: current.status,
      toStatus: status,
      notes,
    });

    return apiSuccess({
      success: true,
      customOrder: updated,
      message: `Custom order ${updated.referenceNumber} updated to ${updated.status}.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to update custom order', 500);
  }
}
