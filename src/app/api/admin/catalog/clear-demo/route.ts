import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

/**
 * Purge all demo/sample products so the owner starts with a completely clean catalog.
 */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);

    // Delete child relations first
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.inventory.deleteMany();

    // Delete products not tied to real customer orders
    const deleted = await prisma.product.deleteMany({
      where: {
        orderItems: { none: {} },
      },
    });

    await logAdminAudit(admin, 'PURGE_DEMO_PRODUCTS', 'Product', 'all', { count: deleted.count });

    return apiSuccess({
      success: true,
      message: `Cleared ${deleted.count} demo products. Your shop is now ready for your real creations!`,
      deletedCount: deleted.count,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    console.error('Failed to clear demo products:', err);
    return apiError(err.message || 'Failed to clear demo products', 500);
  }
}
