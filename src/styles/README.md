# Global Styles & Design Tokens (`src/styles/`)

This directory houses the foundational CSS tokens, reset styles, stationery utilities, and tactile motion properties.

---

## Files

### 1. `tokens.css`
- Core design variables:
  - **Color Palette**: Espresso `#3E2A1F`, Warm Brown `#8D5A3C`, Blush `#E6A7A1`, Peach `#F6D9C8`, Ivory `#FFF6EE`, Cream `#F2E8DE`.
  - **Claymorphic Shadows**: `--shadow-clay-card`, `--shadow-clay-pill`, `--shadow-clay-button`, `--shadow-clay-pressed`.
  - **Glassmorphic Filters**: `--glass-blur`, `--glass-bg`, `--glass-border`, `--glass-shadow`.
  - **Neo-Brutalist Micro-Borders**: `--border-neo`, `--shadow-neo-sm`, `--shadow-neo-md`.
  - **Typography Scale**: Display, headings, body, and caption sizes configured via next/font (`Fraunces` and `DM Sans`).

### 2. `globals.css`
- Modern CSS reset and body paper-grain noise texture.
- Reusable utility classes:
  - `.clay-card`: Beveled clay container with smooth squish transitions.
  - `.clay-pill`: Rounded pill with inner highlight and active press depth.
  - `.washi-tape`: Authentic masking tape strips with polygonal cut edges.
  - `.stamp-seal`: Rubber postal postmark stamp badge.
  - `.polaroid-frame`: Classic white photo frame with drop shadow.
  - `.sticker-badge`: High-contrast Y2K sticker tag with offset drop shadow.
