import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { apiSuccess, apiError } from '@/lib/response';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone } = body;

    // Validation
    if (!firstName || !firstName.trim()) {
      return apiError('First name is required', 400);
    }
    if (!email || !email.trim()) {
      return apiError('Email is required', 400);
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return apiError('Please enter a valid email address', 400);
    }
    if (!password || password.length < 6) {
      return apiError('Password must be at least 6 characters long', 400);
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return apiError('An account with this email address already exists', 409, 'USER_EXISTS');
    }

    const passwordHash = await hashPassword(password);
    const fullName = `${firstName.trim()} ${lastName ? lastName.trim() : ''}`.trim();

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: fullName,
        phone: phone ? phone.trim() : null,
        role: 'CUSTOMER',
      },
    });

    // Create empty wishlist for new user
    await prisma.wishlist.create({
      data: { userId: user.id },
    });

    // Sign JWT token
    const token = await signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
    });

    const response = apiSuccess(
      {
        user: {
          id: user.id,
          firstName: firstName.trim(),
          lastName: lastName ? lastName.trim() : '',
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
      },
      201
    );

    // Set HttpOnly cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    return apiError('Failed to create account', 500, 'SERVER_ERROR');
  }
}
