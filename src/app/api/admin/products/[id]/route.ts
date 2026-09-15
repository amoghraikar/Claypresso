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

    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
        inventories: true,
      },
    });

    if (!product) {
      return apiError('Product not found', 404);
    }

    return apiSuccess(product);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch product', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug,
      description,
      categoryId,
      collection,
      price,
      productionType,
      productionTime,
      customizable,
      material,
      dimensions,
      stock,
      status,
      badges,
      images,
    } = body;

    const current = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { images: true },
    });

    if (!current) {
      return apiError('Product not found', 404);
    }

    // Determine status automatically if stock changed
    let finalStatus = status || current.status;
    const numStock = stock !== undefined ? parseInt(String(stock), 10) : current.stock;
    if (stock !== undefined) {
      if (numStock <= 0) finalStatus = 'OUT_OF_STOCK';
      else if (numStock <= 3) finalStatus = 'LOW_STOCK';
      else if (finalStatus === 'OUT_OF_STOCK') finalStatus = 'IN_STOCK';
    }

    const updated = await prisma.product.update({
      where: { id: current.id },
      data: {
        name: name ? name.trim() : undefined,
        slug: slug ? slug.trim() : undefined,
        description: description ? description.trim() : undefined,
        categoryId: categoryId || undefined,
        collection: collection !== undefined ? collection : undefined,
        price: price !== undefined ? parseFloat(String(price)) : undefined,
        productionType: productionType || undefined,
        productionTime: productionTime || undefined,
        customizable: customizable !== undefined ? Boolean(customizable) : undefined,
        material: material || undefined,
        dimensions: dimensions || undefined,
        stock: numStock,
        status: finalStatus,
        badges: badges !== undefined ? badges : undefined,
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Update images if provided
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: current.id } });
      for (let idx = 0; idx < images.length; idx++) {
        await prisma.productImage.create({
          data: {
            productId: current.id,
            url: images[idx],
            altText: `${updated.name} image ${idx + 1}`,
            sortOrder: idx,
          },
        });
      }
    }

    await logAdminAudit(admin, 'UPDATE_PRODUCT', 'Product', current.id, {
      name: updated.name,
      price: updated.price,
      stock: updated.stock,
      status: updated.status,
    });

    return apiSuccess({
      success: true,
      product: updated,
      message: `Product "${updated.name}" updated successfully.`,
    });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    console.error('Error updating product:', err);
    return apiError(err.message || 'Failed to update product', 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdminUser(req);
    const { id } = await params;

    const current = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { orderItems: true },
    });

    if (!current) {
      return apiError('Product not found', 404);
    }

    // If product is associated with historical orders, mark as OUT_OF_STOCK / archived rather than hard deleting
    if (current.orderItems.length > 0) {
      await prisma.product.update({
        where: { id: current.id },
        data: { status: 'OUT_OF_STOCK', stock: 0 },
      });
      await logAdminAudit(admin, 'ARCHIVE_PRODUCT', 'Product', current.id, { reason: 'Has historical orders' });
      return apiSuccess({ success: true, message: `Product "${current.name}" archived to preserve historical orders.` });
    }

    await prisma.product.delete({
      where: { id: current.id },
    });

    await logAdminAudit(admin, 'DELETE_PRODUCT', 'Product', current.id, { name: current.name });

    return apiSuccess({ success: true, message: `Product "${current.name}" deleted.` });
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to delete product', 500);
  }
}
