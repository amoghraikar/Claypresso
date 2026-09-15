import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rateCheck = checkRateLimit(`login_${clientIp}`, { limit: 10, windowMs: 60000 });
    if (!rateCheck.allowed) {
      return apiError('Too many login attempts. Please try again in 1 minute.', 429, 'RATE_LIMITED');
    }

    const body = await req.json();
    const { email, password, remember = true } = body;

    if (!email || !password) {
      return apiError('Please enter both email and password', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return apiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Split name into first and last
    const nameParts = (user.name || '').split(' ');
    const firstName = nameParts[0] || 'Friend';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Sign JWT token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = apiSuccess({
      user: {
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });

    // Set HttpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: remember ? 7 * 24 * 60 * 60 : undefined, // 7 days or session
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return apiError('Failed to sign in', 500, 'SERVER_ERROR');
  }
}
