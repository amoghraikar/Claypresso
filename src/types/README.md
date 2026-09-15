# Claypresso Domain Types & Interfaces (`src/types/`)

This directory defines all TypeScript types, domain interfaces, and validation schemas across the application.

---

## Type Files

### 1. `product.ts`
- `Product`: Core product model holding pricing, stock, categories, images, and metadata.
- `Category`: Category definition, item counts, and cover artwork.
- `BUSINESS_RULES`: Global studio business constants (currency `₹`, free shipping threshold `₹500`, standard shipping fee `₹60`, etc.).
- `ProductionType`: `'READY_MADE' | 'MADE_TO_ORDER' | 'CUSTOM'`.
- `ProductStatus`: `'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'`.

### 2. `order.ts`
- `Order`: Full customer order record with items, address, status, and payment summary.
- `OrderItem`: Snapshot of an individual purchased item.
- `OrderStatus`: `'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'`.
- `PaymentStatus`: `'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'`.
- `ShippingAddress`: Indian domestic address fields (fullName, addressLine1, city, state, pincode, country).

### 3. `custom.ts`
- `CustomOrder`: Bespoke customer commission request.
- `CustomOrderStatus`: `'INQUIRY_RECEIVED' | 'QUOTE_SENT' | 'COMMISSION_ACTIVE' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED'`.
- `CustomOrderCategory`: Category selection for bespoke orders (e.g. `CHARM`, `TRAY`, `BADGE`).

### 4. `user.ts`
- `User`: Profile entity (`id`, `email`, `name`, `role`).
- `UserRole`: `'CUSTOMER' | 'ADMIN'`.
