import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateServerShipping } from '@/lib/shipping';
import { apiSuccess, apiError } from '@/lib/response';

export interface CheckoutValidateItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, discountCode } = body as {
      items: CheckoutValidateItem[];
      discountCode?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('Cart is empty. Please add items before checking out.', 400, 'EMPTY_CART');
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];
    const stockErrors: string[] = [];

    // Retrieve all products requested
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        images: { take: 1, orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    for (const item of items) {
      if (item.quantity <= 0) {
        return apiError('Item quantity must be greater than zero.', 400, 'INVALID_QUANTITY');
      }

      const product = productMap.get(item.productId);
      if (!product) {
        return apiError(`Product "${item.productId}" is no longer available.`, 404, 'PRODUCT_NOT_FOUND');
      }

      // Check variant if specified
      let itemPrice = product.price;
      let variantName: string | undefined;
      let availableStock = product.stock;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return apiError(`Selected variant for "${product.name}" is no longer available.`, 404, 'VARIANT_NOT_FOUND');
        }
        itemPrice += variant.priceAdjustment;
        variantName = variant.name;
        availableStock = variant.stock;
      }

      // Authoritative stock verification
      if (item.quantity > availableStock) {
        stockErrors.push(
          `Only ${availableStock} in stock for "${product.name}${variantName ? ` (${variantName})` : ''}". You requested ${item.quantity}.`
        );
      }

      const itemSubtotal = itemPrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        variantName: variantName || null,
        unitPrice: itemPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        image: product.images[0]?.url || '/images/placeholder.png',
        availableStock,
        productionType: product.productionType,
        productionTime: product.productionTime,
      });
    }

    if (stockErrors.length > 0) {
      return apiError(
        'Some items in your bag exceed available studio stock.',
        400,
        'INSUFFICIENT_STOCK',
        { errors: stockErrors }
      );
    }

    // Authoritative Shipping Calculation
    const shipping = calculateServerShipping(calculatedSubtotal);

    // Authoritative Discount Code Calculation
    let discountAmount = 0;
    let appliedDiscount: any = null;

    if (discountCode && discountCode.trim()) {
      const code = discountCode.trim().toUpperCase();
      const dbDiscount = await prisma.discount.findUnique({
        where: { code },
      });

      if (!dbDiscount || !dbDiscount.active) {
        // We report invalid code without crashing
        appliedDiscount = { valid: false, message: 'Invalid or expired promo code.' };
      } else if (dbDiscount.expiresAt && new Date() > dbDiscount.expiresAt) {
        appliedDiscount = { valid: false, message: 'This promo code has expired.' };
      } else if (calculatedSubtotal < dbDiscount.minimumOrderValue) {
        appliedDiscount = {
          valid: false,
          message: `Code requires a minimum order of ₹${dbDiscount.minimumOrderValue}.`,
        };
      } else if (dbDiscount.usageLimit && dbDiscount.usedCount >= dbDiscount.usageLimit) {
        appliedDiscount = { valid: false, message: 'This promo code has reached its usage limit.' };
      } else {
        // Valid discount
        if (dbDiscount.type === 'PERCENTAGE') {
          discountAmount = (calculatedSubtotal * dbDiscount.value) / 100;
          if (dbDiscount.maximumDiscount && discountAmount > dbDiscount.maximumDiscount) {
            discountAmount = dbDiscount.maximumDiscount;
          }
        } else {
          discountAmount = dbDiscount.value;
        }

        // Cap discount so total is not negative
        discountAmount = Math.min(discountAmount, calculatedSubtotal);
        appliedDiscount = {
          valid: true,
          code: dbDiscount.code,
          type: dbDiscount.type,
          amount: discountAmount,
          message: `${dbDiscount.code} applied!`,
        };
      }
    }

    const calculatedTotal = calculatedSubtotal + shipping.fee - discountAmount;

    return apiSuccess({
      subtotal: calculatedSubtotal,
      shippingFee: shipping.fee,
      isFreeShipping: shipping.isFree,
      shippingNotice: shipping.transitNotice,
      discount: discountAmount,
      appliedDiscount,
      total: Math.max(0, calculatedTotal),
      items: validatedItems,
    });
  } catch (error: any) {
    console.error('Checkout validation error:', error);
    return apiError('Failed to validate checkout items', 500, 'SERVER_ERROR');
  }
}
