# Scroll Reveal Component (`src/components/ui/ScrollReveal/`)

Provides staggered viewport entrance animations for grids, headlines, and bento cards as the user scrolls down the page.

---

## Features

- **Intersection Observer**: Observes when elements cross into the viewport (15% threshold).
- **Stagger Delays**: Configurable `stagger` prop (1 to 4) applying progressive transition delays (60ms, 120ms, 180ms, 240ms).
- **Graceful Degradation**: Automatically sets opacity to 1 and skips animations when `prefers-reduced-motion` is detected.
