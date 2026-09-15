# Input Component (`src/components/ui/Input/`)

Form input component designed with tactile clay focus rings and clear error feedback states.

---

## Features

- **Floating Focus Ring**: Smooth transition to `var(--color-warm-brown)` with soft ambient focus shadow.
- **Error State**: Displays inline validation errors with accessible `aria-invalid` and `aria-describedby` attributes.
- **Helper Text**: Support for descriptive guidance beneath the field.
- **Prefix & Suffix Slots**: Supports icons (e.g. search magnifying glass, currency symbol `₹`).

---

## Usage

```tsx
import { Input } from '@/components/ui/Input/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="name@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```
