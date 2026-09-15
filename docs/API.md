# Claypresso REST API Reference

All API routes are implemented as Next.js 15 App Router Route Handlers located under `src/app/api/`.

Base URL: `http://localhost:3000/api` (Development) or `https://claypresso.com/api` (Production)

---

## Table of Contents

- [Authentication](#1-authentication)
- [Products & Catalog](#2-products--catalog)
- [Orders & Checkout](#3-orders--checkout)
- [Payments & Webhooks](#4-payments--webhooks)
- [Custom Commissions](#5-custom-commissions)
- [Admin Endpoints](#6-admin-endpoints)
- [Reviews & Wishlist](#7-reviews--wishlist)
- [File Uploads](#8-file-uploads)

---

## 1. Authentication

### `POST /api/auth/register`
Register a new customer account.

**Request Body:**
```json
{
  "name": "Priya Patel",
  "email": "priya@example.com",
  "password": "SecurePassword123!",
  "phone": "+91 98765 43210"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid_123",
      "email": "priya@example.com",
      "name": "Priya Patel",
      "role": "CUSTOMER"
    }
  }
}
```

### `POST /api/auth/login`
Authenticate customer or admin user. Sets HTTP-only `claypresso_token` session cookie.

**Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "SecurePassword123!"
}
```

### `GET /api/auth/me`
Retrieve authenticated profile from active session cookie.

### `POST /api/auth/logout`
Clears session cookie.

---

## 2. Products & Catalog

### `GET /api/products`
Query catalog items with optional filtering and pagination.

**Query Parameters:**
- `category`: Category slug (e.g. `charms`, `keychains`)
- `collection`: Collection filter (`bestsellers`, `new-arrivals`, `under-500`)
- `status`: Stock status (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`)
- `sort`: `price_asc`, `price_desc`, `newest`

### `GET /api/products/[slug]`
Retrieve full detail of an individual piece by URL slug.

### `GET /api/categories`
List all active product categories and counts.

---

## 3. Orders & Checkout

### `POST /api/checkout/validate`
Validate cart items, coupon code, and destination before order creation.

**Request Body:**
```json
{
  "items": [
    { "productId": "prod_1", "quantity": 1 }
  ],
  "couponCode": "CLAYLOVE10",
  "shippingAddress": {
    "country": "India",
    "pincode": "560038"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "subtotal": 520,
    "discount": 52,
    "shippingFee": 0,
    "isFreeShipping": true,
    "total": 468
  }
}
```

### `POST /api/orders`
Create an order. Executes atomic transaction validating stock availability and deducting inventory.

**Request Body:**
```json
{
  "customer": {
    "fullName": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "phone": "+91 98765 11223"
  },
  "shippingAddress": {
    "fullName": "Aarav Sharma",
    "addressLine1": "124 Indiranagar 100ft Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560038",
    "country": "India"
  },
  "items": [
    { "productId": "c-15", "quantity": 1 }
  ],
  "paymentMethod": "UPI",
  "couponCode": "WELCOME10"
}
```

### `POST /api/orders/track`
Public guest order lookup by order number and email.

---

## 4. Payments & Webhooks

### `POST /api/payments/create-session`
Generate payment gateway session ID (Razorpay Order or Stripe Session) from pending order ID.

### `POST /api/payments/verify`
Verify HMAC signature returned from client SDK completion.

### `POST /api/payments/webhook`
Asynchronous payment capture webhook receiver with signature validation and replay defense.

---

## 5. Custom Commissions

### `POST /api/custom/orders`
Submit bespoke creation request with uploaded references.

### `GET /api/custom/orders/[reference]`
Fetch custom order status, uploaded references, and quote details.

### `POST /api/custom/orders/[reference]/approve`
Customer approval for proposed custom quote.

---

## 6. Admin Endpoints

All admin endpoints require an authenticated `ADMIN` session token.

- `GET /api/admin/dashboard`: Metrics, revenue, sales charts, low-stock count.
- `GET/POST /api/admin/products`: Product catalog CRUD.
- `PATCH /api/admin/inventory/adjust`: Manual stock increments/decrements.
- `GET/PATCH /api/admin/orders/[id]`: Update fulfillment status, courier (`India Post`, `DTDC`), and tracking number.
- `GET/POST /api/admin/discounts`: Coupon code creation, usage limits, expiry.
- `GET/PATCH /api/admin/reviews/[id]`: Review moderation queue (`APPROVED`, `REJECTED`).

---

## 7. Reviews & Wishlist

- `GET /api/reviews?productId=...`: Retrieve approved reviews for a product.
- `POST /api/reviews`: Submit review (defaults to `PENDING` moderation).
- `GET/POST/DELETE /api/wishlist`: Customer wishlist management.

---

## 8. File Uploads

### `POST /api/upload`
Upload an image with multipart/form-data.

- **Restrictions**: Max 10MB, JPEG/PNG/WebP only.
- **Security**: Binary magic-bytes inspection prevents script execution.
- **Output**: Returns public URL (e.g. `/images/custom/ref-1726321.webp`).
