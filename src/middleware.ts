import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE_NAME = 'claypresso_auth_token';

// Allowed origins for CORS in production
function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.push(process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, ''));
  }
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL.replace(/\/+$/, ''));
  }
  // Local development / testing origins
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
    origins.push('http://127.0.0.1:3000');
  }
  return origins;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const allowedOrigins = getAllowedOrigins();

  // 1. Handle Preflight OPTIONS for API routes
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const isAllowed = origin && allowedOrigins.includes(origin);
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0] || 'http://localhost:3000',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Razorpay-Signature',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Dedicated Admin Portal Route Protection Check
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Normal Request Pass-through with CORS & Security Headers
  const response = NextResponse.next();

  if (pathname.startsWith('/api/')) {
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
