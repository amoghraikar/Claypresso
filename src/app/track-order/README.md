# Order Tracking Route (`src/app/track-order/`)

Public tracking portal allowing customers to track package status without requiring an active user account.

---

## Features

- **Lookup Form**: Queries `/api/orders/track` by `Order Number` (e.g. `CLP-2026-00042`) and matching contact `Email` or `Phone`.
- **Milestone Timeline**: Step-by-step progress visualizer:
  1. `Order Placed`
  2. `Conditioning & Sculpting` (or `Preparing Ready Stock`)
  3. `Cured & Oven-Baked`
  4. `Glazed & Packed`
  5. `Dispatched via Courier`
  6. `Delivered`
- **Direct Courier Links**: Displays tracking number with direct tracking links to **India Post** or **DTDC**.
