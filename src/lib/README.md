# Claypresso Backend Utilities (`src/lib/`)

This directory houses backend modules, integrations, and helper libraries used by Server Components and API Route Handlers.

---

## Modules Overview

### 1. `db.ts`
- Global singleton instance of `PrismaClient` with connection reuse in Next.js development hot-reloading.
- Exports configured `prisma` client for transactional queries.

### 2. `auth.ts`
- Stateless authentication utilities powered by `jose` JWT and `bcryptjs`.
- Functions:
  - `signJwtToken(payload)`: Signs JWT using `HS256` and `JWT_SECRET`.
  - `verifyJwtToken(token)`: Validates signature and expiration.
  - `getSessionUser(request)`: Extracts and verifies user session from HTTP-only cookie.
  - `hashPassword(plain)` / `comparePassword(plain, hash)`: Secure password cryptography.

### 3. `shipping.ts`
- Domestic shipping fee calculator and courier tracking integration.
- Functions:
  - `calculateServerShipping(subtotal, weightGrams)`: Free shipping at ₹500+, flat ₹60 under ₹500.
  - `generateTrackingUrl(courier, trackingNumber)`: Generates tracking URL for India Post (`Speed Post`) or DTDC.
  - `validatePincode(pincode)`: Enforces valid 6-digit Indian postal codes.

### 4. `storage.ts`
- File upload handling and security sanitization.
- Functions:
  - `validateMagicBytes(buffer)`: Verifies binary signature against JPEG, PNG, and WebP magic numbers.
  - `saveUploadedFile(file, folder)`: Processes and stores uploads in sandboxed public media folders.

### 5. `rateLimit.ts`
- In-memory sliding-window rate limiter for sensitive API routes (auth, uploads, orders).
- Blocks IP addresses exceeding defined thresholds with reset windows.

### 6. `email.ts`
- Order confirmation and custom commission quote notifications.
- Supports SMTP / Resend in production, with fallback to structured console logging in development.
