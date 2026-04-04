# Copilot Instructions for Siren Song

## Project Context

Siren Song is a curated recommendation platform, not a storefront. Every recommendation must reflect a personally vetted, trust-first editorial stance.

## Architecture Rules

- Every repeated UI pattern MUST be extracted into a reusable Astro component in `src/components/`.
- No inline styles. All colors, spacing, and typography values MUST come from CSS custom properties in `src/styles/theme.css`.
- Keep components small and single-responsibility.
- Prefer `.astro` components unless interactivity explicitly requires framework islands.
- Use Astro Content Collections for static content and Keystatic for editor-managed content.

## TypeScript Rules

- Strict mode is required. Do not use `any` or `@ts-ignore`.
- All component props must be typed with interfaces.
- All Astro frontmatter must be typed.
- Use Zod schemas for all Keystatic collections and all API inputs.

## Accessibility Rules (WCAG 2.2 / Section 508)

- All images require meaningful `alt` text unless decorative; decorative images must use `role="presentation"`.
- All interactive elements must be keyboard reachable with visible focus indicators.
- Ensure WCAG AA contrast ratios.
- Use semantic landmarks: `nav`, `main`, `section`, `article`, `aside`, `header`, `footer`.
- The skip navigation link must be the first focusable element on every page.
- Forms must use proper `label` association via `for` and `id` (or `aria-labelledby` when needed).
- Only use ARIA where native semantics are insufficient.
- Never use `tabindex` values greater than `0`.
- Respect `prefers-reduced-motion`.

## Performance Rules

- Avoid render-blocking resources.
- Prefer Astro `Image` for optimized image delivery with explicit dimensions.
- Self-host fonts with `font-display: swap` and subset when possible.
- Ship no unused CSS.
- Use JavaScript only when interactivity requires it.
- Inline critical CSS and defer non-critical CSS where practical.

## Styling Rules

- Keep all CSS in `src/styles/` plus scoped component styles.
- `theme.css` is the source of truth for design tokens.
- No `!important`.
- Build mobile-first with `min-width` breakpoints.

## Testing Rules

- Unit test utility functions in `src/lib/`.
- Add component tests for interactive islands.
- Co-locate tests next to source files (`foo.ts` -> `foo.test.ts`).
- Tests must pass before any commit.

## ESLint Rules

- CI must have zero lint errors.
- Enable all `eslint-plugin-jsx-a11y` rules.
- Enable `eslint-plugin-astro` recommended rules.

## Git Rules

- Use conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
- Never commit secrets. Use `.env` and `.env.example`.

## Motion & Animation Rules

Siren Song's motion language should feel **calm, fluid, and atmospheric** — like water or smoke. Never jarring, never distracting.

### Principles

- **Always reduce motion first.** Every animation must be gated behind `prefers-reduced-motion: no-preference` or checked in JS before running. Users who prefer reduced motion receive the fully-functional, static design — not a broken layout.
- **Motion should enhance, not interrupt.** Animations should feel like a natural extension of the interface, not a performance.
- **Be tasteful.** Subtle fades, gentle upward reveals, and soft glows are preferred over slides, bounces, or flips.

### Scroll Reveal Pattern

- Add `data-reveal` to any element that should fade-and-rise on scroll. The global IntersectionObserver in `BaseLayout.astro` handles class toggling automatically.
- Use `data-reveal-delay="1"`, `"2"`, or `"3"` to stagger sibling elements (80 ms, 160 ms, 240 ms steps are defined in `theme.css`).
- Never set `opacity: 0` or `transform` directly in component styles — let the `[data-reveal]` / `.revealed` token pair in `theme.css` own that state. This keeps behaviour consistent across all pages.
- The IntersectionObserver exits early if `prefers-reduced-motion` is `reduce`, so `[data-reveal]` elements render fully visible on those devices.

### Canvas / Particle Animation

- The `WaterCanvas.tsx` React island powers the hero particle system. It respects `prefers-reduced-motion` by returning early (no canvas is activated). The `<canvas>` always carries `aria-hidden="true"`.
- Always use `client:load` for `WaterCanvas` so it mounts after hydration and can read `window.matchMedia`.
- The particle hue range is deliberately constrained to the teal→violet corridor (HSL 168–298) to stay on-brand. Do not introduce orange/red/warm hues here.
- Touch events must be `passive: true` on the canvas to avoid blocking scroll.
- Always cancel `requestAnimationFrame` and disconnect `ResizeObserver` in the cleanup function of `useEffect`.

### Hover Effects

- Card hover state: use the `--shadow-glow` token for a teal/violet ambient glow plus `translateY(-2px)`. Transition should be `320ms ease`.
- Icon wiggle on card hover: wrap the icon in `.card-icon-wrap`. The global CSS in `theme.css` (`@keyframes wiggle`) drives the animation. Gate the wiggle with `@media (prefers-reduced-motion: no-preference)` inside the component's scoped styles.
- Button hover: use box-shadow with `rgba(109, 40, 217, 0.3)` (primary) or `rgba(109, 40, 217, 0.12)` (ghost) and `translateY(-1px)`. Transition `200ms ease`.

### Adding New Animations

1. Define the `@keyframes` in `theme.css` unless it is genuinely component-specific.
2. Always wrap the `animation` property in `@media (prefers-reduced-motion: no-preference)`.
3. Any JS-driven animation (canvas, IntersectionObserver, requestAnimationFrame) must check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before executing.
4. Use `framer-motion` only inside React islands (`.tsx` files). Do not import it into `.astro` components.
5. Duration guidelines: reveals 500–700 ms, hovers 180–320 ms, wiggle 380–450 ms. Avoid durations above 800 ms for UI feedback.
