# Checkout Page Route (`src/app/checkout/`)

The streamlined, single-page domestic checkout experience for Claypresso.

---

## Features

- **Guest-First Checkout**: Does not force account creation; customers can complete orders using simply their email and delivery phone number.
- **Indian Domestic Validation**: Enforces valid 6-digit Indian pincodes, recognized Indian state selections, and India as the country.
- **Coupon Code Engine**: Real-time validation against `/api/checkout/validate` applying percentage or flat rupee discounts.
- **Payment Method Selection**: Supports UPI, Debit/Credit Cards, Net Banking, and optional Cash on Delivery (COD).
- **Payment Gateway Integration**: Triggers Razorpay / Stripe modal session upon clicking "Place Order".
- **Order Placement**: Executes atomic transaction via `/api/orders` deducting inventory.
