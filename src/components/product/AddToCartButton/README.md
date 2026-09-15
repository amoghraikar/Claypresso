# Add To Cart Button (`src/components/product/AddToCartButton/`)

A specialized magnetic CTA button that coordinates adding a product to the cart with the flying clay particle animation.

---

## Features

- **Magnetic Physics**: Pulls 8–12px towards the cursor on hover.
- **Flying Thumbnail Effect**: Triggers an animated flying orb that travels from the button coordinates towards the header cart icon.
- **Stock Guard**: Automatically disables when stock is 0, displaying "Out of Stock".
- **Loading State**: Displays spinner when processing server cart validations.

---

## Props

```ts
interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  selectedVariant?: string;
  disabled?: boolean;
  className?: string;
}
```
