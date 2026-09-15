import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Not authenticated', 401, 'UNAUTHORIZED');
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!user) {
      return apiError('User not found', 404, 'NOT_FOUND');
    }

    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || 'Friend';
    const lastName = nameParts.slice(1).join(' ') || '';

    return apiSuccess({
      id: user.id,
      firstName,
      lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      orderCount: user._count.orders,
      createdAt: user.createdAt,
    });
  } catch (error: any) {
    console.error('Error in /api/auth/me:', error);
    return apiError('Internal server error', 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return apiError('Not authenticated', 401, 'UNAUTHORIZED');
    }

    const body = await req.json();
    const { firstName, lastName, phone } = body;

    const fullName = `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: fullName || undefined,
        phone: phone !== undefined ? phone.trim() : undefined,
      },
    });

    const nameParts = (updated.name || '').split(' ');

    return apiSuccess({
      id: updated.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return apiError('Failed to update profile', 500);
  }
}
