# Badge Component (`src/components/ui/Badge/`)

The `Badge` component displays contextual metadata such as promotional tags, craft production methods, and live inventory status.

---

## Badge Types

- `bestseller`: Terracotta highlight badge.
- `new`: Sage green pill badge.
- `low-stock`: Amber warning pill ("Only X left!").
- `made-to-order`: Editorial studio badge ("Made to Order").
- `ready-made`: Fast dispatch badge ("Ready to Ship").
- `out-of-stock`: Neutral muted badge.

---

## Props

```ts
interface BadgeProps {
  type?: 'bestseller' | 'new' | 'low-stock' | 'sale' | 'custom' | string;
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  stock?: number;
  className?: string;
}
```
