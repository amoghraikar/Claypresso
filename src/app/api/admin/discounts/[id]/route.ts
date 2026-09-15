import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;
    const body = await req.json();
    const { active, usageLimit, expiresAt } = body;

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        active: active !== undefined ? Boolean(active) : undefined,
        usageLimit: usageLimit !== undefined ? parseInt(String(usageLimit), 10) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      },
    });

    await logAdminAudit(admin, 'UPDATE_DISCOUNT', 'Discount', id, { active, usageLimit });

    return apiSuccess({
      success: true,
      discount,
      message: `Discount ${discount.code} updated.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to update discount', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;

    await prisma.discount.delete({ where: { id } });

    await logAdminAudit(admin, 'DELETE_DISCOUNT', 'Discount', id);

    return apiSuccess({ success: true, message: 'Discount deleted.' });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to delete discount', 500);
  }
}
