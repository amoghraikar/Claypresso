# Payment Processing & Gateway Integrations

Claypresso supports online and offline payments tailored for the Indian e-commerce landscape.

---

## 1. Supported Payment Rails

- **UPI (Unified Payments Interface)**: Google Pay, PhonePe, Paytm, BHIM.
- **Credit / Debit Cards**: Visa, Mastercard, RuPay.
- **Net Banking**: Major Indian retail banks.
- **Cash on Delivery (COD)**: Optional post-purchase collection.

---

## 2. Gateway Integrations

### Razorpay Integration
1. **Session Creation**:
   - `POST /api/payments/create-session` initializes an order via Razorpay SDK with `amount` (in paise, `INR * 100`) and currency `INR`.
   - Attaches `notes: { orderId: "..." }`.
2. **Client Checkout Modal**:
   - Client triggers Razorpay Standard Checkout modal.
   - On completion, client submits `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/verify`.
3. **HMAC Signature Verification**:
   ```ts
   const expectedSignature = crypto
     .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
     .update(`${razorpay_order_id}|${razorpay_payment_id}`)
     .digest('hex');
   ```

### Stripe Integration
- Provides support for international credit cards (when configured).
- Validates webhook signatures via `stripe.webhooks.constructEvent(body, signature, secret)`.

---

## 3. Webhook Idempotency

All webhooks received at `/api/payments/webhook`:
- Verify cryptographic signature.
- Check event ID against recorded events in database.
- If duplicate, immediately returns HTTP 200 `{ duplicate: true }` without executing redundant order updates.
