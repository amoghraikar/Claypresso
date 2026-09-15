# Cart Drawer Component (`src/components/common/CartDrawer/`)

The `CartDrawer` is a slide-out modal panel that provides immediate access to the customer's active shopping bag without navigating away from their current page.

---

## Features

- **Free Shipping Progress Meter**: Dynamically calculates distance to ₹500 threshold with celebration trigger when achieved.
- **Line Item Management**:
  - Incremental quantity controls with tactile hover response (`+`, `-`).
  - Item removal with confirmation feedback.
  - Variant specification and individual piece subtotals.
- **Empty State**: Playful clay-themed prompt guiding users back to bestsellers.
- **Checkout Action**: Magnetic primary CTA button navigating directly to `/checkout`.
- **Keyboard & Focus Trapping**: Closes on `Escape` key press or backdrop click.

---

## Files

- `CartDrawer.tsx`: Interactive client component consuming `useCart()` context.
- `CartDrawer.module.css`: Drawer slide-out transition animations and line item layouts.
