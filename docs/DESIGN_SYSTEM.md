# Claypresso Design System & Visual Tokens

The Claypresso design system is defined purely using Vanilla CSS Custom Properties in `src/styles/tokens.css` and `src/styles/globals.css`.

It blends **Tactile Claymorphism, Bento Grid discipline, Editorial Typography, and Scrapbook Stationery**.

---

## 1. Color Palette

### Primary Studio Tones
```css
--color-espresso:    #3E2A1F; /* Primary typography & deep accents */
--color-warm-brown:  #8D5A3C; /* Secondary brand color & focus borders */
--color-blush:       #E6A7A1; /* Soft clay highlight & stickers */
--color-peach:       #F6D9C8; /* Delicate secondary tint & washi tape */
--color-ivory:       #FFF6EE; /* Primary background page canvas */
```

### Supporting Neutral Surfaces
```css
--color-cream:       #F2E8DE; /* Secondary card background */
--color-light-taupe: #D8C9BC; /* Hairline borders & muted indicators */
--color-muted-brown: #6F5749; /* Secondary body typography */
--color-deep-brown:  #281A14; /* Dark contrast states */
--color-white:       #FFFFFF; /* Polaroid photo borders */
```

---

## 2. Claymorphic & Neumorphic Shadow Architecture

The illusion of soft, squishy polymer clay is created using balanced dual-inner highlights and multi-stage ambient drop shadows:

```css
/* Tactile Clay Card Surface */
--shadow-clay-card: 
  inset 2px 2px 5px rgba(255, 255, 255, 0.9),
  inset -2px -3px 6px rgba(62, 42, 31, 0.07),
  0 10px 28px rgba(62, 42, 31, 0.08),
  0 2px 6px rgba(62, 42, 31, 0.04);

/* Card Hover Elevation */
--shadow-clay-card-hover: 
  inset 2px 2px 6px rgba(255, 255, 255, 0.95),
  inset -3px -4px 8px rgba(62, 42, 31, 0.09),
  0 20px 42px rgba(62, 42, 31, 0.14),
  0 4px 10px rgba(62, 42, 31, 0.06);

/* Button Bevel with Ambient Drop */
--shadow-clay-button: 
  inset 1px 2px 3px rgba(255, 255, 255, 0.4),
  inset -1px -2px 4px rgba(0, 0, 0, 0.18),
  0 6px 16px rgba(62, 42, 31, 0.18);

/* Pill Badge Highlight */
--shadow-clay-pill: 
  inset 1px 1px 3px rgba(255, 255, 255, 0.8),
  inset -1px -1px 3px rgba(62, 42, 31, 0.08),
  0 4px 12px rgba(62, 42, 31, 0.06);

/* Active Press Inset Depress */
--shadow-clay-pressed: 
  inset 2px 3px 6px rgba(62, 42, 31, 0.22),
  inset -1px -1px 3px rgba(255, 255, 255, 0.3),
  0 1px 2px rgba(62, 42, 31, 0.08);
```

---

## 3. Scrapbook & Stationery Elements

### Washi Tape (`.washi-tape`)
Semi-translucent masking tape strip with authentic polygon-clipped ends:
```css
.washi-tape {
  position: absolute;
  height: 18px;
  width: 72px;
  background-color: var(--tape-color-peach);
  opacity: 0.92;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  z-index: 10;
  pointer-events: none;
  backdrop-filter: blur(2px);
  clip-path: polygon(3% 0%, 97% 2%, 100% 98%, 0% 95%);
}
```

### Postal Rubber Stamp (`.stamp-seal`)
Dashed border seal angled at `-2.5deg` mimicking physical studio postmarks:
```css
.stamp-seal {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 14px;
  border: 1.5px dashed var(--color-warm-brown);
  border-radius: var(--radius-sm);
  color: var(--color-warm-brown);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: rotate(-2.5deg);
}
```

### Polaroid Photo Frames (`.polaroid-frame`)
White card frame with generous bottom margin for captioning:
```css
.polaroid-frame {
  background: var(--color-white);
  padding: 10px 10px 24px 10px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-polaroid);
  border: 1px solid var(--color-border-subtle);
}
```

---

## 4. Typography Scale

Configured through Next.js Google Fonts (`Fraunces` for luxury display headers, `DM Sans` for body copy).

| Token | Desktop Size | Line Height | Application |
|---|---|---|---|
| `--text-display-xl` | 72px | 0.95 | Hero flagship title |
| `--text-display` | 56px | 1.00 | Major section display headlines |
| `--text-h1` | 48px | 1.05 | Page headers (`/about`, `/custom`) |
| `--text-h2` | 38px | 1.10 | Section titles |
| `--text-h3` | 28px | 1.15 | Bento card titles |
| `--text-h4` | 22px | 1.20 | Subsection headers |
| `--text-body-lg` | 18px | 1.50 | Lead paragraphs & hero subtitles |
| `--text-body` | 16px | 1.50 | Standard body copy |
| `--text-body-sm` | 14px | 1.45 | Secondary copy & navigation |
| `--text-caption` | 12px | 1.30 | Product tags & badges |
| `--text-label` | 11px | 1.20 | Studio stamps & micro-labels |

---

## 5. Curvature & Radius System

```css
--radius-xs:     4px;
--radius-sm:     8px;
--radius-md:    14px;
--radius-lg:    20px;
--radius-xl:    28px;
--radius-bento: 26px; /* Primary modular bento compartment curve */
--radius-pill: 999px; /* CTAs, chips, badges */
```
