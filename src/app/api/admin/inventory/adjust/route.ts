import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);
    const body = await req.json();
    const { productId, variantId, adjustment, newStock, reason = 'Manual correction' } = body;

    if (!productId) {
      return apiError('Product ID is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    let resultingStock = product.stock;

    if (newStock !== undefined) {
      resultingStock = parseInt(String(newStock), 10);
    } else if (adjustment !== undefined) {
      resultingStock = product.stock + parseInt(String(adjustment), 10);
    } else {
      return apiError('Either adjustment or newStock must be provided.', 400);
    }

    if (resultingStock < 0) {
      return apiError(
        `Stock cannot become negative. Attempted resulting stock: ${resultingStock}.`,
        400,
        'NEGATIVE_STOCK_PREVENTED'
      );
    }

    let nextStatus = product.status;
    if (resultingStock <= 0) nextStatus = 'OUT_OF_STOCK';
    else if (resultingStock <= 3) nextStatus = 'LOW_STOCK';
    else nextStatus = 'IN_STOCK';

    // Update Product and Inventory
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id: productId },
        data: {
          stock: resultingStock,
          status: nextStatus,
        },
      });

      // Update base or variant inventory record
      if (variantId) {
        await tx.productVariant.update({
          where: { id: variantId },
          data: { stock: resultingStock },
        });
        await tx.inventory.updateMany({
          where: { productId, variantId },
          data: { stock: resultingStock },
        });
      } else {
        await tx.inventory.updateMany({
          where: { productId },
          data: { stock: resultingStock },
        });
      }

      return p;
    });

    await logAdminAudit(admin, 'ADJUST_INVENTORY', 'Product', productId, {
      fromStock: product.stock,
      toStock: resultingStock,
      reason,
    });

    return apiSuccess({
      success: true,
      product: updated,
      message: `Stock for "${updated.name}" adjusted from ${product.stock} to ${resultingStock} (${reason}).`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    console.error('Inventory adjustment error:', err);
    return apiError(err.message || 'Failed to adjust inventory', 500);
  }
}
