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
    const { status } = body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return apiError('Status must be APPROVED, REJECTED, or PENDING', 400);
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    await logAdminAudit(admin, 'MODERATE_REVIEW', 'Review', id, { status });

    return apiSuccess({
      success: true,
      review,
      message: `Review marked as ${status}.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to update review status', 500);
  }
}
