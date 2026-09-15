# Studio Automation & Verification Scripts (`scripts/`)

This directory contains standalone execution scripts used for end-to-end API verification, integration testing, and studio automation.

---

## Scripts

### 1. `test-backend.ts`
Integration testing script validating:
- Customer authentication & JWT issuance.
- Product catalog query resolution.
- Order creation transaction integrity and stock level decrementing.
- Pre-checkout validation and shipping fee tier evaluation.
- Custom commission order submission.

### Running Scripts

Execute TypeScript scripts directly using `tsx`:

```bash
npx tsx scripts/test-backend.ts
```
