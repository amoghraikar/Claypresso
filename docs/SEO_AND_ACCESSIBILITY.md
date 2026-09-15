# SEO & Accessibility Standards

Claypresso is optimized for search visibility and WCAG 2.1 AA accessibility standards.

---

## 1. Search Engine Optimization (SEO)

### Dynamic Metadata & OpenGraph
- Every route provides semantic page titles formatted as `{Page Title} | Claypresso Studio`.
- OpenGraph and Twitter cards include high-resolution preview images (`1200x630`) hosted from `public/images/`.

### Structured Data (JSON-LD)
- Product detail pages (`/product/[slug]`) inject Google-compliant `schema.org/Product` JSON-LD schemas containing:
  - Product Name, Description, and Images.
  - Offers with price in `INR`, price currency, and availability (`InStock` / `PreOrder` / `OutOfStock`).
  - Aggregate ratings and customer reviews.

### Crawlability
- `robots.txt` (`/src/app/robots.ts`): Whitelists public catalog routes while blocking admin endpoints (`/admin/*`) and sensitive APIs.
- `sitemap.xml` (`/src/app/sitemap.ts`): Dynamically lists all product slugs, categories, and editorial brand pages with last modified timestamps.

---

## 2. Accessibility (WCAG 2.1 AA)

- **Contrast Ratios**: Body text (`--color-text-primary` on `--color-bg-primary`) exceeds 7:1 contrast ratio.
- **Focus Indicators**: Visible 2px outline on all focusable interactive controls via `:focus-visible`.
- **Screen Reader Support**: All image elements contain descriptive `alt` tags; icon-only buttons mandate `aria-label`.
- **Keyboard Navigation**: Drawers and modals can be navigated and closed using the `Tab` and `Escape` keys.
- **Motion Sensitivity**: Strictly honors `prefers-reduced-motion: reduce`, deactivating parallax, 3D tilt, and continuous cursor particle trails.
