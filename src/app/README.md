# Next.js App Router Structure (`src/app/`)

This directory houses the page routes, layouts, error handlers, and metadata configurations for the Next.js 15 App Router.

---

## Routing Architecture

```
src/app/
├── layout.tsx              # Root HTML shell, fonts (Fraunces & DM Sans), providers
├── page.tsx                # Editorial Scrapbook Bento Homepage
├── page.module.css         # Bento grid layout and hero motion styles
│
├── shop/                   # Catalog browsing (/shop and /shop/[category])
├── product/[slug]/         # Individual product detail pages
├── cart/                   # Dedicated shopping bag page
├── checkout/               # Streamlined domestic checkout
├── order-confirmation/     # Post-purchase receipt & payment status
├── track-order/            # Public guest tracking with India Post / DTDC links
│
├── custom/                 # Bespoke commission intake (/custom, /custom/request)
├── account/                # Customer account portal (/account, /login, /orders)
├── admin/                  # Studio management operations dashboard
│
├── about/                  # Studio story, craft workflow, and Bangalore roots
├── shipping/               # Shipping policies & delivery transit timelines
├── faq/                    # Frequently asked questions & clay care advice
├── contact/                # Studio contact form & inquiries
│
└── api/                    # REST API route handlers
```

---

## Conventions

- **Server-First**: Every route is a Server Component unless interactive browser APIs, React state, or pointer motion hooks are required.
- **Dynamic Metadata**: Pages export static or dynamic `Metadata` objects containing SEO-optimized titles, OpenGraph images, and canonical descriptions.
- **Error Boundaries**: Root `error.tsx` and `not-found.tsx` catch unexpected runtime exceptions and missing product slugs.
