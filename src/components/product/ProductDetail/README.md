# Product Detail Components (`src/components/product/ProductDetail/`)

This directory contains components powering the individual product page (`/product/[slug]`).

---

## Components

### 1. `ProductGallery.tsx`
- **Claymorphic Image Container**: Displays high-resolution photos and product video clips inside a beveled frame with washi tape accents.
- **Hover Depth Lens**: On desktop, pointer movement over the active image creates a subtle 6px translation and 1.025 zoom with smooth spring settle, allowing inspection without obstruction.
- **Vertical Thumbnails**: Side navigation thumbnails with active clay pill highlight.
- **Mobile Swipe**: Touch gesture swipe support for mobile viewports.

### 2. `ProductInfo.tsx`
- **Pricing & Stock**: Displays original vs. discounted prices, currency badge, and live inventory status.
- **Variant Selector**: Pill radio group for selecting hardware or color variations.
- **Quantity Selector**: Stepper controls with minimum and stock-capped maximums.
- **Accordion Specifications**: Collapsible sections for Craft Process, Materials & Care, and Pan-India Shipping timelines.

---

## Files

- `ProductGallery.tsx`: Interactive gallery with RAF depth lens.
- `ProductInfo.tsx`: Specification, variant, and purchase controller.
- `ProductDetail.module.css`: Layout grid, accordion transitions, and gallery styling.
