# Custom Cursor & Micro-Trail (`src/components/common/CustomCursor/`)

The `CustomCursor` provides desktop pointer styling matching Claypresso's tactile, handmade polymer clay identity ("The cursor is touching the website").

---

## Features

- **Soft Center Dot**: Small terracotta center dot following the mouse position directly.
- **Trailing Outer Ring**: Inertial outer ring tracking the cursor with soft spring interpolation (`lerp 0.18`).
- **Contextual Morphing States**:
  - **Link**: Outer ring expands smoothly (34px) with reduced opacity.
  - **Button**: Outer ring compresses (20px) with firm border to signal press readiness.
  - **Product**: Morphs into an organic editorial "VIEW" badge pill.
  - **Drag**: Expands to signal moodboard drag interaction.
- **Micro-Trail**: Exactly 3 restrained particles matching Claypresso's warm palette (`terracotta`, `warm-brown`, `peach`) that only follow during active motion and immediately fade when stationary (`speed < 0.2`).
- **Click Safety**: Always rendered with `pointer-events: none !important; z-index: 999999` so clicks and form inputs are never obstructed.
- **Automatic Deactivation**: Disabled on touch devices (`@media (pointer: coarse)`) and when `prefers-reduced-motion: reduce` is enabled.

---

## Files

- `CustomCursor.tsx`: Client component subscribing to `useMouse()` metrics.
- `CustomCursor.module.css`: Cursor shape classes, transitions, and particle animations.
