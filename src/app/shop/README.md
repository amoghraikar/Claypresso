# Shop & Catalog Routes (`src/app/shop/`)

This directory powers the catalog discovery views of Claypresso.

---

## Routes

- `/shop`: Global product catalog displaying all handmade pieces with filter sidebar, sort dropdown, and active count badges.
- `/shop/[category]`: Dedicated category view (e.g. `/shop/charms`, `/shop/keychains`, `/shop/mini-phone-charms`) with custom category banner descriptions and specific piece collections.

---

## Server & Client Architecture

- **Page Shell**: Fetches categories and products from the Prisma database or static catalog fallback.
- **Client Filters**: Manages URL search parameters (`?category=...&filter=...&sort=...`) to allow shareable filtered catalog links without full page reloads.
