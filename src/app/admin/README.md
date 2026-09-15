# Claypresso Admin Dashboard & Operations (`src/app/admin/`)

The Admin Dashboard provides operations management for the Claypresso studio.

> **Design Principle**: While the customer-facing store prioritizes **Personality > Clarity**, the admin interface prioritizes **Clarity > Personality** while retaining the studio's tactile color palette and typography.

---

## Route Overview

- `/admin`: Studio operations overview with revenue metrics, pending order counts, custom commission inbox, and low-stock alerts.
- `/admin/orders`: Order fulfillment list. Filter by status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`), view customer shipping addresses, update fulfillment state, and assign courier tracking numbers (India Post / DTDC).
- `/admin/products`: Product catalog management. Add new products, update prices, manage stock quantities, toggle badges (`bestseller`, `new`), and edit descriptions.
- `/admin/custom-orders`: Bespoke custom commission manager. Inspect uploaded customer references, generate formal price quotes, and advance sculpting milestones (`SCULPTING`, `IN_KILN`, `GLAZING`, `PACKED`).
- `/admin/inventory`: Live stock adjustment screen with quick increment/decrement controls.
- `/admin/discounts`: Promotional engine. Create percentage or flat rupee discounts, set minimum cart amounts, configure expiration dates, and cap maximum usages.
- `/admin/reviews`: Community review moderation queue. Approve authentic customer reviews or reject spam before public display.
- `/admin/customers`: Customer database, purchase history, and lifetime spending.
- `/admin/settings`: Studio business rules, shipping fee thresholds, and studio contact configurations.

---

## Authentication & Authorization

All routes under `/admin` are guarded by the Next.js `middleware.ts`. Requests without an authenticated JWT possessing the `ADMIN` role are redirected to `/account/login`.
