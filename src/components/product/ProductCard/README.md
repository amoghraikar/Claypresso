# Product Card Component (`src/components/product/ProductCard/`)

The `ProductCard` component displays an individual product within catalog listings, bestseller showcases, and category bento grids.

---

## Features

- **Claymorphic Polaroid Frame**: Soft clay-embossed container (`--shadow-clay-card`) with generous corner radii and authentic washi-tape clips.
- **3D Cursor Tilt & Image Follow**: Wrapped in `TiltCard`, tilting 2–3.2° towards the pointer while the product image shifts 4–6px with dynamic opposite shadow casting.
- **Contextual Cursor Trigger**: Sets `data-cursor="product"` and `data-cursor-text="VIEW"`, morphing the desktop cursor into an editorial pill.
- **Tactile Secondary Image Reveal**: Crossfades to a secondary detail image on hover with subtle scale (`1.04`) and elevation lift.
- **Quick-Add Overlay**: Desktop slide-up quick add bar with flying clay animation into the header cart icon.
- **Wishlist Toggle**: Heart button with celebratory clay particle burst animation.
- **Stock Badges**: Displays "Low Stock", "Made to Order", or "Out of Stock" status indicators.

---

## Props

```ts
interface ProductCardProps {
  product: Product;
  priority?: boolean;
}
```

---

## Files

- `ProductCard.tsx`: Client component with quick-add and wishlist event handling.
- `ProductCard.module.css`: Polaroid styling, secondary image transitions, and particle burst keyframes.
