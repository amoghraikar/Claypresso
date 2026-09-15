import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const AUTH_COOKIE_NAME = 'claypresso_auth_token';
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'claypresso-handcrafted-secure-secret-2026-bangalore-studio'
);

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  name: string;
}

/**
 * Hash plain password with bcrypt (salt rounds = 10).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verify plaintext password against stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT session token.
 */
export async function signAuthToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify JWT session token and extract payload.
 */
export async function verifyAuthToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user session from NextRequest (via cookies or Bearer Authorization header).
 */
export async function getSessionUser(req?: NextRequest): Promise<TokenPayload | null> {
  let token: string | undefined;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookie = req.cookies.get(AUTH_COOKIE_NAME);
      token = cookie?.value;
    }
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    } catch {
      // Running in environment without cookies()
    }
  }

  if (!token) return null;
  return verifyAuthToken(token);
}

/**
 * Requires the current session to have ADMIN role. Throws Error if unauthorized.
 */
export async function requireAdminUser(req?: NextRequest): Promise<TokenPayload> {
  const user = await getSessionUser(req);
  if (!user || user.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return user;
}

/**
 * Records an entry into the admin AuditLog.
 */
export async function logAdminAudit(
  admin: TokenPayload,
  action: string,
  entity: string,
  entityId: string,
  details?: any
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: admin.userId,
        userName: admin.name,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
}

export { AUTH_COOKIE_NAME };

