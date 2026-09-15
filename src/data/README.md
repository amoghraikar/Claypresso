# Static Studio Datasets & Seed Catalog (`src/data/`)

This directory contains static domain definitions, fallback datasets, category schemas, and business constants used during development and database seeding.

---

## Files

### 1. `products.ts`
- `BESTSELLERS`: Most-loved handcrafted charms and accessories.
- `NEW_ARRIVALS`: Fresh small-batch seasonal drops.
- `CATEGORIES`: Full list of studio categories (`charms`, `keychain-charms`, `mini-phone-charms`, `magnets`, `trays`, `badges`, `hair-pins`).
- `BUSINESS_RULES`: Canonical business constants:
  - `currency`: `'₹'` (Indian Rupee)
  - `freeShippingThreshold`: `500`
  - `standardShippingFee`: `60`
  - `defaultCountry`: `'India'`
  - `transitDays`: `'~4 Days across India'`
  - `customLeadDays`: `'~25 Days'`
