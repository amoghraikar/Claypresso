# Product Detail Page Route (`src/app/product/`)

This directory powers the individual product inspection page (`/product/[slug]`).

---

## Technical Features

- **Static Generation (`generateStaticParams`)**: Statically pre-renders popular catalog items during production build for instant page load speeds.
- **Dynamic SEO Metadata (`generateMetadata`)**: Dynamically resolves product title, description, price currency, and primary image into OpenGraph and Twitter card tags.
- **Rich Snippets (JSON-LD)**: Injects schema.org `Product` structured data for Google Search rich results (price, in-stock status, and reviews).
- **Claymorphic Gallery**: Integrates `ProductGallery` with desktop cursor-following depth lens.
- **Cross-Sell Recommendations**: Displays 4 related pieces from the same collection or category at the bottom of the page.
