# Contributing to Claypresso

Thank you for your interest in contributing to Claypresso! We welcome bug fixes, performance improvements, and documentation enhancements that align with our design philosophy.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Treat all contributors and community members with kindness, empathy, and respect.

---

## Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/your-username/claypresso.git
cd claypresso
```

### 2. Environment Setup
```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
```

### 3. Create a Feature Branch
Use descriptive branch naming:
- `feat/custom-order-timeline`
- `fix/shipping-pincode-validation`
- `docs/api-reference-update`

```bash
git checkout -b feat/your-feature-name
```

### 4. Running the Project
```bash
# Start Next.js in development mode
npm run dev
```

---

## Coding Standards & Guidelines

### TypeScript
- **Strict Typing**: All new code must be fully typed. Avoid using `any`; define explicit interfaces in `src/types/`.
- **Type Checking**: Before submitting, ensure that `npx tsc --noEmit` exits with `0` errors.

### CSS & Styling
- **Design Tokens**: Always use CSS variables from `src/styles/tokens.css` (e.g. `var(--color-espresso)`, `var(--shadow-clay-card)`, `var(--radius-bento)`). Do not hardcode arbitrary hex colors or pixel values.
- **CSS Modules**: Component styles should reside in `*.module.css` files colocated with their respective components.
- **No Tailwind**: This project uses pure Vanilla CSS and CSS Modules for handcrafted control over tactile micro-animations and physical spring physics.

### Architecture & Components
- **Server Components by Default**: Place components that do not need interactive mouse physics or browser APIs in Server Components.
- **Interaction Primitives**: When adding cursor or magnetic interactions, use the centralized primitives in `src/components/common/Motion/` (`Magnetic`, `TiltCard`, `ParallaxLayer`). Do not attach ad-hoc `mousemove` listeners to hundreds of elements.
- **Touch & Accessibility Guard**: All pointer effects must gracefully deactivate on coarse pointers (`@media (pointer: coarse)`) and honor `prefers-reduced-motion: reduce`.

---

## Testing & Quality Assurance

Before opening a pull request, run the verification suite:

```bash
# 1. Type verification
npx tsc --noEmit

# 2. Linting
npm run lint

# 3. Production Build
npm run build
```

---

## Commit Message Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat: add order tracking SMS notification webhook`
- `fix: prevent coupon code double redemption in concurrent checkout`
- `perf: debounce mouse coordinates in RAF interaction loop`
- `docs: update deployment and environment variable guide`
- `style: refine washi tape polygon cut angles on category cards`

---

## Pull Request Checklist

Before submitting your PR, verify the following:

- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run lint` passes with zero warnings.
- [ ] `npm run build` generates all static and dynamic routes cleanly.
- [ ] Changes adhere to the Claypresso Design System tokens and color palette.
- [ ] Touch devices and keyboard navigation remain fully functional.
- [ ] Documentation is updated where applicable.
