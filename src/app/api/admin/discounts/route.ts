import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, logAdminAudit } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser(req);

    const discounts = await prisma.discount.findMany({
      orderBy: { startsAt: 'desc' },
    });

    return apiSuccess(discounts);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to fetch discounts', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdminUser(req);
    const body = await req.json();
    const {
      code,
      type = 'PERCENTAGE',
      value,
      minimumOrderValue = 0,
      maximumDiscount,
      usageLimit,
      active = true,
      expiresAt,
    } = body;

    if (!code?.trim() || value === undefined || value <= 0) {
      return apiError('Promo code and positive value are required.', 400);
    }

    const cleanCode = code.trim().toUpperCase();

    const existing = await prisma.discount.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return apiError('A discount code with this name already exists.', 409);
    }

    const discount = await prisma.discount.create({
      data: {
        code: cleanCode,
        type,
        value: parseFloat(String(value)),
        minimumOrderValue: parseFloat(String(minimumOrderValue || 0)),
        maximumDiscount: maximumDiscount ? parseFloat(String(maximumDiscount)) : null,
        usageLimit: usageLimit ? parseInt(String(usageLimit), 10) : null,
        active: Boolean(active),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    await logAdminAudit(admin, 'CREATE_DISCOUNT', 'Discount', discount.id, { code: discount.code });

    return apiSuccess(discount, 201);
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_ADMIN') {
      return apiError('Admin authorization required', 403, 'FORBIDDEN');
    }
    return apiError('Failed to create discount code', 500);
  }
}
