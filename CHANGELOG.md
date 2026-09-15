# Changelog

All notable changes to Claypresso are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-14

### Added
- **Editorial Scrapbook Bento Rebuild**:
  - Implemented Claymorphic dual-shadow token system (`--shadow-clay-card`, `--shadow-clay-pill`, `--shadow-clay-pressed`).
  - Added authentic washi tape corner attachments (`.washi-tape`), postmark rubber stamps (`.stamp-seal`), and polaroid frames (`.polaroid-frame`).
  - Redesigned homepage with modular bento grid layout, studio quick-stat chips, and editorial numbering across category cards (`01 / ARCHIVE`, `02 / BESTSELLER`, etc.).
  - Floating frosted glass capsule header with `backdrop-filter: blur(16px)` and tactile claymorphic cart button.
- **Dedicated Mouse Effects & Interactive Motion Pass**:
  - Single-listener global pointer engine in `MouseContext.tsx` calculating normalized position, velocity, and speed in a shared `requestAnimationFrame` loop.
  - Soft clay custom cursor with trailing spring ring, contextual morphing states (`VIEW` badge on product cards, expand on links, compress on buttons), and restrained 3-particle warm micro-trail.
  - Magnetic physics primitives (`Magnetic.tsx`) with 8–14px CTA pull and independent nested arrow motion.
  - Product card 3D tilt with image follow (`TiltCard.tsx`) and dynamic shadow response.
  - Hero scene multi-layer parallax with 3D object tilt on hero cat charm composition and counter-drifting dragon tile.
  - Desktop product detail gallery hover depth lens with 6px cursor follow and 1.025 slight zoom.
  - Auto-deactivation on touch devices (`@media (pointer: coarse)`) and respect for `prefers-reduced-motion`.
- **Quality Assurance & Security Hardening (Step 14)**:
  - Atomic database transactions in `/api/orders` verifying real-time stock levels, preventing oversell under concurrency.
  - Enforced domestic India-only shipping destination validation (`UNSUPPORTED_COUNTRY`).
  - Cryptographic magic-bytes inspection for uploaded custom order reference images (JPEG, PNG, WebP) in `/api/upload`.
  - Collision-resistant order numbers (`CLP-YYYY-XXXXX-SUFFIX`).
  - Review moderation workflow defaulting customer submissions to `PENDING` queue with duplicate review prevention (`DUPLICATE_REVIEW`).
- **Production Backend & External Integrations (Step 12-13)**:
  - Payment gateway session creation and HMAC signature verification for Razorpay and Stripe.
  - Webhook handlers with event ID recording for replay attack prevention.
  - Courier tracking URL generation for India Post and DTDC.
  - Sliding-window IP rate limiting utility on sensitive endpoints.
- **Admin Operations Dashboard (Step 11)**:
  - Analytics overview (revenue, order status breakdown, inventory warnings).
  - Product catalog manager, variant adjustment, and stock replenishment.
  - Custom commission quote workflow and status milestone updater.
  - Discount coupon engine with percentage/fixed rupee rules, expiration dates, and usage limits.
- **Bespoke Custom Creation (Step 7)**:
  - Interactive multi-step commission request flow at `/custom/request`.
  - Multi-file image upload, reference corkboard layout, and customer quote approval screen.
- **Core E-Commerce Foundation (Steps 1-6)**:
  - Next.js 15 App Router structure with React 19.
  - Complete product catalog, category discovery, search, and filtering.
  - Slide-out cart drawer with free-shipping threshold tracker (₹500+).
  - Indian domestic checkout flow and guest order tracking at `/track-order`.
