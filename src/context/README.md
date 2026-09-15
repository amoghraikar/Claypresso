# Global React State & Context Providers (`src/context/`)

This directory contains client-side React Context providers managing global UI state, user sessions, e-commerce cart storage, and pointer interactions.

---

## Providers

### 1. `CartContext.tsx`
- Manages client-side shopping cart items, quantities, and subtotal calculations.
- Persists items in browser `localStorage` (`claypresso_cart`).
- Provides fly-to-cart animation trigger coordinates.

### 2. `WishlistContext.tsx`
- Manages saved customer favorites.
- Syncs with local storage for guests and the `/api/wishlist` endpoint for logged-in accounts.

### 3. `MouseContext.tsx`
- Single global pointer event listener tracking mouse coordinates, velocity, and speed in a `requestAnimationFrame` loop.
- Manages custom cursor variants (`default`, `link`, `button`, `product`, `drag`).
- Gracefully deactivates on touch screens (`@media (pointer: coarse)`) and respects `prefers-reduced-motion`.
