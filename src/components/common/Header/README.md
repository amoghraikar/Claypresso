# Header Component (`src/components/common/Header/`)

The `Header` is the sticky top navigation bar of Claypresso. It is styled as a floating frosted clay glass capsule with an editorial announcement ticker, brand logo, desktop/mobile navigation links, and an interactive magnetic cart button.

---

## Features

- **Frosted Glass Capsule**: Uses `var(--glass-bg)` with `backdrop-filter: blur(16px)` and subtle white inner light.
- **Editorial Ticker**: Announcement bar displaying free shipping thresholds (`₹500+`) and studio origin (`Bangalore, India`).
- **Tactile Cart Button**:
  - Claymorphic espresso pill button with `--shadow-clay-button`.
  - Peach count pill with squishy bounce animation when products are added.
  - Micro-magnetic attraction to cursor on desktop.
- **Micro-Magnetic Nav Links**: Navigation links pull subtly (3–5px) towards the pointer on hover with spring settle.
- **Mobile Responsive Drawer**: Smooth animated slide-down navigation drawer for mobile and tablet viewports (<900px).

---

## Files

- `Header.tsx`: Main React component with scroll detection, cart bounce synchronization, and mobile menu state.
- `Header.module.css`: Vanilla CSS Module containing glassmorphic styling, keyframe animations, and responsive media queries.

---

## Usage

```tsx
import { Header } from '@/components/common/Header/Header';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```
