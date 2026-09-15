# Security Policy

## Reporting a Vulnerability

We take the security of Claypresso and our customers' data seriously. If you discover a security vulnerability, please notify our team privately rather than opening a public issue.

- **Email**: `security@claypresso.com`
- **Response Time**: We aim to acknowledge receipt within **24 hours** and provide a resolution timeframe within **72 hours**.

Please include:
1. Description of the vulnerability.
2. Step-by-step reproduction instructions or proof-of-concept.
3. Potential impact on customer accounts, orders, or database records.

---

## Security Architecture & Defenses

Claypresso incorporates multiple layers of security to safeguard transactions, authentication, and user data:

### 1. Zero Client-Trusted Calculations
- All cart subtotals, tax rates, coupon discounts, and shipping fees are recalculated and validated server-side within atomic Prisma database transactions.
- Client payloads specifying prices or free items are strictly ignored.

### 2. Concurrency & Oversell Protection
- Inventory deductions use atomic conditions (`WHERE stock >= requestedQuantity`).
- In concurrent purchase scenarios, only orders with available physical inventory can succeed; competing requests are rolled back with an out-of-stock notification.

### 3. File Upload Sandbox & Magic-Byte Validation
- Files uploaded through `/api/upload` (for bespoke custom commissions) are inspected at the binary level.
- Extensions alone are not trusted; headers must match the registered magic bytes for JPEG, PNG, or WebP. Files containing executable scripts disguised as images are rejected immediately with HTTP 400.
- Uploads are sanitized, stripped of EXIF metadata via Sharp, and stored outside of executable paths.

### 4. Authentication & Authorization (RBAC)
- Password hashes are computed using `bcryptjs` with salt rounds.
- Stateless session tokens are generated using `jose` with `HS256` signatures.
- Cookies are transmitted with `HttpOnly`, `Secure` (in production), and `SameSite=Lax` flags to prevent XSS credential theft.
- Role-based middleware prevents unauthorized access to `/admin` routes.

### 5. Cryptographic Webhook Verification
- Inbound payment webhooks from Razorpay and Stripe are verified against HMAC SHA-256 signatures using configured secret keys.
- Unique event IDs are tracked to prevent replay attacks and double-credit scenarios.

### 6. Rate Limiting & Denial-of-Service Defense
- Sensitive endpoints (`/api/auth/login`, `/api/upload`, `/api/orders`) enforce sliding-window IP rate limiting to mitigate brute-force credential stuffing and denial-of-service attempts.

---

## Supported Versions

| Version | Supported |
|---|---|
| 0.1.x (Current) | :white_check_mark: |
