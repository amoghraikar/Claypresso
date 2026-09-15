import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { calculateServerShipping } from '@/lib/shipping';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const body = await req.json();
    const { customer, shippingAddress, items, paymentMethod = 'UPI', discountCode, isSimulation = false } = body;

    // Validate customer and shipping fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customer?.fullName?.trim()) {
      return apiError('Customer full name is required.', 400);
    }
    if (!customer?.email?.trim() || !emailRegex.test(customer.email.trim())) {
      return apiError('A valid email address is required.', 400, 'INVALID_EMAIL');
    }
    const cleanPhone = (customer?.phone || '').replace(/[\s\-\(\)\+]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return apiError('A valid 10-digit phone number is required.', 400, 'INVALID_PHONE');
    }

    if (!shippingAddress?.addressLine1?.trim() || !shippingAddress?.city?.trim() || !shippingAddress?.pincode?.trim()) {
      return apiError('Valid shipping address (street, city, pincode) is required.', 400);
    }

    // India-only shipping validation
    const shippingCountry = (shippingAddress?.country || 'India').trim().toLowerCase();
    if (shippingCountry !== 'india' && shippingCountry !== 'in') {
      return apiError('Claypresso currently only ships to addresses within India.', 400, 'UNSUPPORTED_COUNTRY');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return apiError('Order must contain at least one item.', 400);
    }

    // Atomic order creation inside Prisma transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        if (!item.quantity || item.quantity <= 0) {
          throw new Error('Item quantity must be a positive integer.');
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
            variants: true,
          },
        });

        if (!product) {
          throw new Error(`Product "${item.productId}" no longer exists.`);
        }

        let unitPrice = product.price;
        let variantSnapshot: string | null = null;
        let currentStock = product.stock;

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            throw new Error(`Variant for "${product.name}" is no longer available.`);
          }
          unitPrice += variant.priceAdjustment;
          variantSnapshot = variant.name;
          currentStock = variant.stock;
        }

        // Authoritative stock verification
        if (item.quantity > currentStock) {
          throw new Error(
            `Insufficient stock for "${product.name}". Available: ${currentStock}, requested: ${item.quantity}.`
          );
        }

        const lineSubtotal = unitPrice * item.quantity;
        subtotal += lineSubtotal;

        orderItemsData.push({
          productId: product.id,
          variantId: item.variantId || null,
          productNameSnapshot: product.name,
          priceSnapshot: unitPrice,
          quantity: item.quantity,
          subtotal: lineSubtotal,
          imageSnapshot: product.images[0]?.url || '/images/placeholder.png',
          selectedVariantSnapshot: variantSnapshot,
          productionTypeSnapshot: product.productionType,
        });

        // Decrement stock if order is simulated/instant test payment
        if (isSimulation) {
          if (item.variantId) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { decrement: item.quantity } },
            });
          }
          const updatedP = await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          });
          if (updatedP.stock <= 0) {
            await tx.product.update({
              where: { id: product.id },
              data: { status: 'OUT_OF_STOCK' },
            });
          } else if (updatedP.stock <= 3) {
            await tx.product.update({
              where: { id: product.id },
              data: { status: 'LOW_STOCK' },
            });
          }
        }
      }

      // Authoritative Shipping Calculation
      const shipping = calculateServerShipping(subtotal);

      // Authoritative Discount Calculation with Expiry and Usage Limit Enforcement
      let discountAmount = 0;
      if (discountCode && discountCode.trim()) {
        const discount = await tx.discount.findUnique({
          where: { code: discountCode.trim().toUpperCase() },
        });

        const isExpired = discount?.expiresAt && new Date() > discount.expiresAt;
        const isUsageExceeded = discount?.usageLimit && discount.usedCount >= discount.usageLimit;

        if (discount && discount.active && !isExpired && !isUsageExceeded && subtotal >= discount.minimumOrderValue) {
          if (discount.type === 'PERCENTAGE') {
            discountAmount = (subtotal * discount.value) / 100;
            if (discount.maximumDiscount && discountAmount > discount.maximumDiscount) {
              discountAmount = discount.maximumDiscount;
            }
          } else {
            discountAmount = discount.value;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          // Increment used count
          await tx.discount.update({
            where: { id: discount.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const total = subtotal + shipping.fee - discountAmount;

      // Human-readable sequential + collision-resistant order number: CLP-2026-000001-A1B2
      const orderCount = await tx.order.count();
      const orderSeq = String(orderCount + 1).padStart(5, '0');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const orderNumber = `CLP-${new Date().getFullYear()}-${orderSeq}-${randomSuffix}`;

      const paymentStatus = isSimulation ? 'PAID' : 'PENDING';
      const orderStatus = isSimulation ? 'PROCESSING' : 'PENDING';

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.userId || null,
          customerName: customer.fullName.trim(),
          customerEmail: customer.email.trim().toLowerCase(),
          customerPhone: customer.phone.trim(),
          shippingAddress: JSON.stringify(shippingAddress),
          subtotal,
          shippingFee: shipping.fee,
          discount: discountAmount,
          total: Math.max(0, total),
          paymentMethod,
          paymentStatus,
          orderStatus,
          items: {
            create: orderItemsData,
          },
          payments: {
            create: [
              {
                provider: paymentMethod === 'CARD' ? 'MOCK_CARD' : 'MOCK_UPI',
                providerPaymentId: `pay_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
                amount: Math.max(0, total),
                currency: 'INR',
                status: paymentStatus,
              },
            ],
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return order;
    });

    return apiSuccess(createdOrder, 201);
  } catch (error: any) {
    console.error('Order creation error:', error);
    return apiError(error.message || 'Failed to place order', 400, 'ORDER_CREATION_FAILED');
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Authentication required to view order history', 401, 'UNAUTHORIZED');
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerEmail: session.email.toLowerCase() },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        payments: true,
      },
    });

    return apiSuccess(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return apiError('Failed to fetch orders', 500);
  }
}
