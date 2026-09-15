# Bespoke Custom Commissions Workflow

This document details the lifecycle, data schema, and technical implementation of bespoke custom clay orders at Claypresso.

---

## 1. Custom Commission Lifecycle State Machine

```
   [ INQUIRY_RECEIVED ]
             │
             ▼ (Admin reviews photos & sets quote amount)
       [ QUOTE_SENT ]
             │
    ┌────────┴────────┐
    ▼ (Customer accepts) ▼ (Customer declines / cancels)
[ COMMISSION_ACTIVE ]  [ CANCELLED ]
    │
    ▼ (Deposit / Payment confirmed)
[ IN_PRODUCTION ]
    │ (Sculpting -> In Kiln -> Glazed)
    ▼
[ COMPLETED ]
    │
    ▼ (Dispatched with tracking number)
  [ SHIPPED ]
```

---

## 2. API Endpoints

- `POST /api/custom/orders`: Initial commission request submission.
- `GET /api/custom/orders/[reference]`: Public inquiry status for the customer.
- `PATCH /api/admin/custom-orders/[id]/quote`: Admin quote generation (sets `quoteAmount`, `timelineDays`, and notes).
- `POST /api/custom/orders/[reference]/approve`: Customer quote acceptance.

---

## 3. Uploaded Media Security

Customer reference images uploaded through `/api/upload`:
1. Restricted to max 10MB per file.
2. Verified against binary magic bytes (JPEG, PNG, WebP) to block executable script exploits.
3. EXIF metadata stripped via Sharp.
4. Saved in sandboxed storage path (`public/uploads/custom/...`).
