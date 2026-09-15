# Claypresso Quality Assurance & Testing Guide

This document outlines the testing architecture, automated test suites, manual verification flows, and quality checklists for Claypresso.

---

## 1. Automated Verification Suite

Claypresso is verified through three primary automated test barriers:

### A. TypeScript Type Safety
```bash
npx tsc --noEmit
```
Verifies strict null safety, generic parameters, component props, and database client models across all client and server files.

### B. ESLint Static Code Analysis
```bash
npm run lint
```
Enforces React 19 hook dependency correctness, Next.js optimization best practices, and code hygiene rules.

### C. Full Production Bundle Compilation
```bash
npm run build
```
Validates that all 90 static, dynamic, SSG, and API route handlers compile and bundle with zero errors.

---

## 2. Automated Integration Test Suite

The repository includes end-to-end integration test runners verifying critical e-commerce flows:

### Test Execution
```bash
# Run against active server (http://localhost:3000)
node scripts/test-step12.js   # Production payment, webhook, courier & upload tests
node scripts/test-step14.js   # Advanced bug hunt & concurrency audit
```

### Coverage Matrix

| Test Group | Target Module | Scenarios Validated |
|---|---|---|
| **Group 1: Shipping & Delivery** | `/src/lib/shipping.ts`, `/api/orders` | - Subtotal ₹499 -> ₹60 shipping fee<br>- Subtotal ₹500+ -> ₹0 free shipping<br>- Non-India country rejection (`UNSUPPORTED_COUNTRY`)<br>- Courier tracking URL generation (DTDC, India Post) |
| **Group 2: Concurrency & Inventory** | `/api/orders` | - Race conditions on last remaining item (Stock = 1)<br>- Exactly 1 order succeeds, 1 fails with `INSUFFICIENT_STOCK`<br>- Prevents negative stock counts<br>- Status transitions to `OUT_OF_STOCK` |
| **Group 3: Discount Engine** | `/api/checkout/validate` | - Expired discounts rejected with `COUPON_EXPIRED`<br>- Usage limits enforced<br>- Percentage vs. fixed amount calculations |
| **Group 4: Review Moderation** | `/api/reviews` | - Customer submission created with `PENDING` status<br>- Unapproved reviews omitted from public product page<br>- Duplicate review prevention (`DUPLICATE_REVIEW`) |
| **Group 5: Anti-Exploit Uploads** | `/api/upload` | - Real PNG buffer passes magic byte inspection<br>- Script/text buffer disguised as `.png` rejected<br>- Sandboxed public URL generation |
| **Group 6: Security & RBAC** | `/api/admin/*` | - Unauthenticated access blocked with HTTP 401/403<br>- Customer token accessing admin routes blocked with HTTP 403<br>- Private custom commission IDOR isolation |
| **Group 7: Webhook Idempotency** | `/api/payments/webhook` | - Signature verification via HMAC SHA-256<br>- Replay attack delivery detected and flagged as duplicate |
| **Group 8: Rate Limiter** | `/src/lib/rateLimit.ts` | - Sliding window blocks excessive requests (>10 requests/min) |

---

## 3. Manual UI & Interaction Verification Checklist

Perform manual testing with a real mouse:

- [ ] **Custom Cursor**: Soft center dot follows mouse smoothly; outer ring expands on links, compresses on buttons, and morphs into a pill badge ("VIEW") on product cards.
- [ ] **Micro-Trail**: Exactly 3 warm particles follow with soft delay; disappear immediately when cursor stops moving.
- [ ] **Magnetic CTAs**: "Shop Bestsellers", "Make it Custom", and "Add to Cart" pull 8–14px toward pointer and settle smoothly on exit.
- [ ] **Hero Parallax & 3D Tilt**: Move pointer across hero; background badge drifts 3–4px, floating dragon tile counter-drifts 8px, and cat charm composition tilts 3–4deg with perspective.
- [ ] **Product Detail Hover Depth**: Hover over active product gallery photo on desktop; image subtly shifts 6px with 1.025 slight zoom without blocking inspection.
- [ ] **Touch Devices**: Verify on mobile / Chrome DevTools touch emulation; custom cursor and tilt are disabled cleanly.
- [ ] **Reduced Motion**: Enable `prefers-reduced-motion: reduce` in OS settings; all parallax, tilt, and spring movement deactivates.
