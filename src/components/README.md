# Claypresso Component Library (`src/components/`)

This directory houses the reusable UI and layout components for Claypresso, built using React 19, Vanilla CSS Modules, and the design token system.

---

## Directory Organization

```
src/components/
├── common/             # Global layout & shared application components
│   ├── Header/         # Frosted glassmorphic sticky navigation capsule
│   ├── Footer/         # Atelier footer with newsletter & studio notes
│   ├── CartDrawer/     # Slide-out interactive cart drawer with free shipping bar
│   ├── CustomCursor/   # Physical mouse cursor with trailing spring & particle trail
│   └── Motion/         # Centralized physics interaction primitives
├── product/            # E-commerce product display components
│   ├── ProductCard/    # Claymorphic polaroid card with washi tape & 3D tilt
│   ├── ProductDetail/  # High-res gallery with hover depth lens & spec accordion
│   └── ProductGrid/    # Responsive catalog grids with scroll reveal
├── shop/               # Catalog filtering & discovery widgets
│   ├── CatalogFilters/ # Multi-criteria category, collection, and price filters
│   └── CategoryBanners/# Editorial collection introduction headers
└── ui/                 # Atomic design primitives
    ├── Button/         # Magnetic buttons with variant hierarchy & arrow motion
    ├── Badge/          # Stock and promotional tags (Bestseller, Low Stock)
    ├── Input/          # Accessible form fields with floating clay states
    ├── Select/         # Custom stylized dropdown pickers
    ├── Modal/          # Accessible dialog overlays
    └── ScrollReveal/   # Intersection-observer driven staggered entry animators
```

---

## Component Guidelines

1. **Colocated Styles**: Each component must have its dedicated `[ComponentName].module.css` file.
2. **Token Adherence**: Never use hardcoded colors or arbitrary shadows; always reference `var(--color-*)` and `var(--shadow-clay-*)`.
3. **Responsive Design**: Ensure mobile breakpoints gracefully collapse without horizontal overflow.
4. **Zero Layout Shifts**: Never animate `top`, `left`, `width`, or `height` during continuous interaction loops; use GPU-accelerated `transform: translate3d(...)` and `opacity`.
