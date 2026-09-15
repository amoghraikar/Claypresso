# Button Component (`src/components/ui/Button/`)

The core interactive button component across Claypresso, featuring magnetic cursor pull, claymorphic press states, and independent traveling arrows.

---

## Variants

- `primary`: Solid espresso background with warm ivory typography and white highlight border.
- `secondary`: Warm cream background with espresso text and clay pill shadow.
- `outline`: Bordered with `--color-espresso`, transparent background.
- `accent`: Terracotta/peach highlight button for custom orders and special CTAs.
- `ghost`: Borderless text button with underline reveal.

---

## Sizes

- `sm`: 32px height, compact padding.
- `md`: 44px height (default).
- `lg`: 52px height for hero and checkout CTAs.

---

## Magnetic Behavior

By default, non-full-width buttons are wrapped in `Magnetic`, pulling 8–14px towards the mouse on hover. Any right-aligned icon (`iconPosition="right"`) receives the `.magnetic-arrow` class and shifts an additional 6–8px in the direction of travel.

---

## Usage

```tsx
import { Button } from '@/components/ui/Button/Button';
import { ArrowRight } from 'lucide-react';

<Button
  variant="primary"
  size="lg"
  href="/shop"
  icon={<ArrowRight size={18} />}
  iconPosition="right"
>
  Shop All Charms
</Button>
```
