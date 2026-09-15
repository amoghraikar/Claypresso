# Claypresso Shipping Architecture & Courier Integration

This document details the domestic Indian shipping calculations, courier tracking integrations, and backend validation mechanisms.

---

## 1. Domestic-Only Constraint

Claypresso operates strictly within the Republic of India:
- **Server Enforcement**: `/api/orders` strictly validates `shippingAddress.country === "India"`.
- Any submission with a foreign country is rejected with HTTP 400 and code `UNSUPPORTED_COUNTRY`.
- Pincodes are verified against a 6-digit numeric pattern (`^[1-9][0-9]{5}$`).

---

## 2. Shipping Fee Calculation Engine

Calculated server-side in `src/lib/shipping.ts` using `calculateServerShipping`:

```ts
export function calculateServerShipping(subtotal: number, weightGrams: number = 50) {
  const FREE_SHIPPING_THRESHOLD = 500;
  const STANDARD_SHIPPING_FEE = 60;

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      fee: 0,
      isFree: true,
      appliedRule: 'FREE_OVER_500'
    };
  }

  return {
    fee: STANDARD_SHIPPING_FEE,
    isFree: false,
    appliedRule: 'STANDARD_DOMESTIC'
  };
}
```

---

## 3. Courier Tracking URLs

Tracking numbers assigned in `/admin/orders/[orderId]` generate direct courier inquiry links via `generateTrackingUrl`:

| Courier | URL Pattern | Example |
|---|---|---|
| **India Post (Speed Post)** | `https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx?consignmentNo={TRACKING_NUMBER}` | `ED123456789IN` |
| **DTDC** | `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno={TRACKING_NUMBER}` | `D98765432` |
| **Generic / Other** | `https://parcelsapp.com/en/tracking/{TRACKING_NUMBER}` | Custom AWB |
