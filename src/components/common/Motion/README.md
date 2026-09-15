# Claypresso Physics & Interaction Primitives (`src/components/common/Motion/`)

This directory contains the core interaction and physics primitives that give Claypresso its signature tactile responsiveness ("Why does this website feel so satisfying to move around?").

---

## Primitives Overview

### 1. `Magnetic.tsx`
Wraps interactive elements (e.g. CTA buttons, navigation links) with spring-like magnetic attraction.
- **Pull Distance**: 8–14px maximum translation for primary CTAs; 3–5px for navigation items.
- **Nested Arrow Physics**: Elements with class `.magnetic-arrow` travel an additional 6–8px independently in the direction of cursor travel.
- **Props**:
  - `strength`: Maximum translation in pixels (default: `10`).
  - `active`: Boolean toggle to enable/disable magnetism.

### 2. `TiltCard.tsx`
Applies subtle 3D perspective tilt to product cards based on mouse position within the card bounding box.
- **Perspective Tilt**: 2–3.2° `rotateX` / `rotateY`.
- **Image Follow**: Child elements with `.tilt-image-follow` shift 4–6px towards the cursor.
- **Dynamic Shadow**: Box shadow dynamically offsets in the opposite direction of the cursor.

### 3. `HeroParallax.tsx` (`ParallaxLayer`)
Creates multi-depth parallax scenes that respond to global normalized pointer coordinates `[-1, 1]` from `MouseContext`.
- **Multi-Layer Stacking**: Different layers receive different `speed` multipliers (e.g., background 3px, midground 8px, hero object 12px with 3D tilt).
- **Smooth Lerp**: Updates occur in a `requestAnimationFrame` loop using exponential smoothing (`lerp(current, target, 0.12)`).

### 4. `ProximityElement.tsx`
Detects cursor distance (<130px) and smoothly pushes reactive decorative elements (clay blobs, stars, coffee beans) away from the cursor with subtle rotation, boosted by cursor velocity.

### 5. `CurvedLoop.tsx` (`CurvedLoop` & `CurvedCircularBadge`)
Continuous infinite looping text and ribbon paths rendered on undulating organic Bezier curves and circular badge seals:
- **`CurvedLoop`**:
  - **Infinite Bezier Ribbon**: Animates typography on an organic S-curve SVG `<path>` (`M -600 70 C -200 15, 200 125, 600 70...`) using continuous `requestAnimationFrame` updates on `<textPath startOffset>`.
  - **Zero Re-Render Virtual Offset**: Directly drives DOM attributes without React re-renders for silky 60/120 FPS GPU performance.
  - **Interactive Scrubbing & Physics**: Pointer drag scrubbing allows users to pull and fling the curved loop. Hovering provides 1.4x acceleration; cursor velocity adds subtle impulse.
  - **Tactile Washi/Clay Backing**: Optional warm washi ribbon background stroke underneath the text path with soft ambient shadows.
  - **Props**:
    - `text`: Repeating marquee string (defaults to Claypresso artisan motto).
    - `speed`: Continuous baseline velocity (default: `1`).
    - `direction`: `'left'` or `'right'` (default: `'left'`).
    - `interactive`: Enable pointer drag / hover boost (default: `true`).
    - `showRibbon`: Display tactile clay washi ribbon underlay (default: `true`).
    - `height`: SVG view height in px (default: `120`).
- **`CurvedCircularBadge`**:
  - **Rotating Potter's Seal**: Renders text along a circular SVG path (`<textPath>`) that continuously spins around a tactile clay pill center icon.
  - **Interactive Hover & Drag**: Hovering triggers spring scale (`1.08x`) and speed multiplication; pointer dragging spins the badge directly.
  - **Props**:
    - `text`: Circular text string.
    - `size`: Badge diameter in px (default: `110`).
    - `centerIcon`: Inner clay badge glyph/icon (default: `✦`).
    - `speed`: Rotation speed in seconds per turn (default: `22s`).

---

## Global Mouse Context (`src/context/MouseContext.tsx`)

All primitives subscribe to a **single global listener**:
- Tracks raw `(x, y)`, normalized `[-1, 1]` window coordinates, velocity, and scalar speed.
- Detects hovered interactive elements via event delegation (`[data-cursor]`).
- Automatically disables on touch screens (`@media (pointer: coarse)`) and respects `prefers-reduced-motion: reduce`.
