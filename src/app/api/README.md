# Next.js API Route Handlers (`src/app/api/`)

This directory contains all backend API route handlers powering the Claypresso client, customer portal, and admin dashboard.

---

## Route Map

```
src/app/api/
├── admin/                      # Role-restricted admin management APIs
│   ├── custom-orders/          # Custom commission quotes & milestone progression
│   ├── customers/              # Customer profile records & lifetime value
│   ├── dashboard/              # High-level revenue & fulfillment metrics
│   ├── discounts/              # Coupon creation, rules, and usage caps
│   ├── inventory/              # Real-time stock level adjustments
│   ├── orders/                 # Order status progression & courier dispatch
│   ├── products/               # Product CRUD & image reordering
│   ├── reviews/                # Customer review moderation queue
│   └── settings/               # Studio shipping & business rule configurations
├── auth/                       # Authentication handlers
│   ├── login/                  # Password verification & session cookie issuance
│   ├── logout/                 # Session revocation & cookie invalidation
│   ├── me/                     # Current session profile retrieval
│   └── register/               # New customer registration
├── checkout/                   # Pre-checkout validation
│   └── validate/               # Server-side subtotal, discount, and shipping check
├── custom/                     # Bespoke commissions
│   └── orders/                 # Custom request intake & customer approval handlers
├── orders/                     # Order processing & tracking
│   ├── [id]/                   # Individual order retrieval
│   ├── route.ts                # Atomic order placement with stock deduction
│   └── track/                  # Public guest tracking lookup
├── payments/                   # Payment gateway processing
│   ├── create-session/         # Razorpay / Stripe session initiation
│   ├── verify/                 # Signature verification & order payment update
│   └── webhook/                # Idempotent gateway capture event listener
├── products/                   # Public product catalog queries
│   ├── [slug]/                 # Individual product specification
│   └── route.ts                # Catalog filtering, search, and sorting
├── reviews/                    # Public product reviews & submission handler
├── upload/                     # File upload handler with binary magic-byte inspection
└── wishlist/                   # Customer wishlist synchronization
```

For complete request and response schema definitions, see the [REST API Reference](../../../docs/API.md).
