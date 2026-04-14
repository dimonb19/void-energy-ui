# Tokens

Every semantic CSS variable shipped by `@void-energy/tailwind`, grouped by layer. "Layer" refers to which CSS file owns the declaration:

- **tokens** — `dist/tokens.css`, the shared foundation (structural, typographic, geometric). Identical across atmospheres/physics.
- **atmosphere** — `dist/atmospheres/{name}.css`, palette + mode (color).
- **physics** — `dist/physics/{name}.css`, geometry + motion (shadows, blur, motion curves, radius base).
- **density** — `dist/density.css`, the multiplier applied to spacing.

---

## Spacing

Physics-independent, atmosphere-independent. Scales with `--density`.

| Token | Base value | Tailwind utility |
|---|---|---|
| `--space-xs` | `calc(2 × 0.25rem × density)` = 8 px | `p-xs`, `gap-xs`, `m-xs` |
| `--space-sm` | `calc(4 × 0.25rem × density)` = 16 px | `p-sm`, `gap-sm`, `m-sm` |
| `--space-md` | `calc(6 × 0.25rem × density)` = 24 px | `p-md`, `gap-md`, `m-md` |
| `--space-lg` | `calc(8 × 0.25rem × density)` = 32 px | `p-lg`, `gap-lg`, `m-lg` |
| `--space-xl` | `calc(12 × 0.25rem × density)` = 48 px | `p-xl`, `gap-xl`, `m-xl` |
| `--space-2xl` | `calc(16 × 0.25rem × density)` = 64 px | `p-2xl`, `gap-2xl` |
| `--space-3xl` | `calc(24 × 0.25rem × density)` = 96 px | `p-3xl`, `gap-3xl` |
| `--space-4xl` | `calc(32 × 0.25rem × density)` = 128 px | `p-4xl`, `gap-4xl` |
| `--space-5xl` | `calc(40 × 0.25rem × density)` = 160 px | `p-5xl`, `gap-5xl` |

Density multipliers: `compact` = 0.75, `default` = 1, `comfortable` = 1.25.

---

## Control geometry

Density-scaled. Physics-independent.

| Token | Value | Purpose |
|---|---|---|
| `--control-height` | `max(2.25rem, 2.75rem × density)` | Buttons, inputs, selects (`min-h-control`) |
| `--control-padding-x` | `var(--space-sm)` | Button/input inline padding |
| `--control-padding-y` | `calc(var(--space-xs) × 0.75)` | Button/input block padding |
| `--size-touch-min` | `2.75rem` | Hard floor for touch targets |
| `--nav-height` | `calc(16 × 0.25rem × density)` = 64 px | Top nav bar |
| `--breadcrumbs-height` | `var(--space-md) + var(--space-xs) × 2` | Breadcrumb bar |

---

## Radius

Physics-adaptive. The scale (`--radius-sm` through `--radius-xl`) is defined in tokens.css and force-zeroed in retro physics.

| Token | Value (glass/flat) | Value (retro) | Tailwind utility |
|---|---|---|---|
| `--radius-sm` | `4px` | `0` | `rounded-sm` |
| `--radius-md` | `8px` | `0` | `rounded-md` or `rounded` |
| `--radius-lg` | `16px` | `0` | `rounded-lg` |
| `--radius-xl` | `24px` | `0` | `rounded-xl` |
| `--radius-full` | `9999px` | `0` | `rounded-full` |
| `--radius-base` | `8px` | `0` | (SCSS only — use `var(--radius-base)` directly) |

`--radius-base` is the physics-adaptive default, declared by each physics preset. Use it inside component SCSS when you want "the right radius for this physics." The scale tokens are for consumers who need a specific size.

---

## Z-index

Semantic, numeric values. Physics-independent.

| Token | Value | Tailwind utility |
|---|---|---|
| `--z-sunk` | `-1` | `z-sunk` |
| `--z-floor` | `0` | `z-floor` |
| `--z-base` | `1` | `z-base` |
| `--z-decorate` | `2` | `z-decorate` |
| `--z-float` | `10` | `z-float` |
| `--z-sticky` | `20` | `z-sticky` |
| `--z-header` | `40` | `z-header` |
| `--z-dropdown` | `50` | `z-dropdown` |
| `--z-overlay` | `90` | `z-overlay` |

---

## Typography

### Font sizes (fluid clamps)

| Token | Value | Utility |
|---|---|---|
| `--font-size-caption` | `clamp(0.6875rem, …)` — 11–14 px | `text-caption` |
| `--font-size-small` | `clamp(0.75rem, …)` — 12–16 px | `text-small` |
| `--font-size-body` | `clamp(0.875rem, …)` — 14–18 px | `text-base` |
| `--font-size-h6` | fluid | `text-h6` |
| `--font-size-h5` | fluid | `text-h5` |
| `--font-size-h4` | fluid | `text-h4` |
| `--font-size-h3` | fluid | `text-h3` |
| `--font-size-h2` | fluid | `text-h2` |
| `--font-size-h1` | fluid | `text-h1` |

### Line heights

`--line-height-caption`, `-small`, `-body`, `-title`, `-subtitle`, `-h1` … `-h4`, `-none`
Tailwind: `leading-caption`, `leading-body`, `leading-h1`, etc.

### Letter spacing

`--letter-spacing-caption`, `-small`, `-body`, `-title`, `-subtitle`, `-h1` … `-h4`
Tailwind: `tracking-caption`, `tracking-body`, `tracking-h1`, etc.

### Font weights

| Token | Value | Utility |
|---|---|---|
| `--font-weight-regular` | `400` | `font-regular` |
| `--font-weight-medium` | `500` | `font-medium` |
| `--font-weight-semibold` | `600` | `font-semibold` |
| `--font-weight-bold` | `700` | `font-bold` |
| `--font-weight-extrabold` | `800` | (no utility; use `style="font-weight: var(--font-weight-extrabold)"`) |

### Font families

| Token | Default | Utility |
|---|---|---|
| `--font-heading` | `'Hanken Grotesk', sans-serif` | `font-heading` |
| `--font-body` | `'Inter', sans-serif` | `font-body` |
| `--font-mono` | `'Courier Prime', monospace` | `font-mono` |

Atmospheres override these. The `terminal` atmosphere, for instance, sets both heading and body to a monospace stack.

---

## Color — atmosphere-owned

These tokens are **defined per-atmosphere**. See [ATMOSPHERES.md](./ATMOSPHERES.md) for exact palettes per atmosphere.

### Canvas & surfaces

| Token | Purpose | Tailwind utility |
|---|---|---|
| `--bg-canvas` | Page background | `bg-canvas` |
| `--bg-surface` | Card/panel background | `bg-surface` |
| `--bg-sunk` | Inset well background | `bg-sunk` |
| `--bg-spotlight` | Highlighted surface | `bg-spotlight` |

### Energy (brand)

| Token | Purpose | Tailwind utility |
|---|---|---|
| `--energy-primary` | Primary brand color | `bg-primary`, `text-primary` |
| `--energy-secondary` | Secondary brand color | `bg-secondary`, `text-secondary` |

### Text

| Token | Purpose | Tailwind utility |
|---|---|---|
| `--text-main` | Primary text | `text-main` |
| `--text-dim` | Secondary text | `text-dim` |
| `--text-mute` | Tertiary / disabled text | `text-mute` |

### Structure

| Token | Purpose | Tailwind utility |
|---|---|---|
| `--border-color` | Default border color | `border-border` |

### Semantics

Every variant in `{premium, system, success, error} × {base, -light, -dark, -subtle}`:

```
--color-premium           --color-system           --color-success           --color-error
--color-premium-light     --color-system-light     --color-success-light     --color-error-light
--color-premium-dark      --color-system-dark      --color-success-dark      --color-error-dark
--color-premium-subtle    --color-system-subtle    --color-success-subtle    --color-error-subtle
```

Tailwind: `bg-premium`, `text-premium-dark`, `bg-error-subtle`, etc.

---

## Physics — physics-owned

Defined per-physics preset. Values shown below are the `glass` / `flat` / `retro` triples.

| Token | glass | flat | retro |
|---|---|---|---|
| `--physics-blur` | `20px` | `0px` | `0px` |
| `--physics-border-width` | `1px` | `1px` | `2px` |
| `--radius-base` | `8px` | `8px` | `0px` |
| `--radius-full` | `9999px` | `9999px` | `0px` |
| `--lift` | `-3px` | `0px` | `-2px` |
| `--scale` | `1.02` | `1` | `1` |
| `--speed-instant` | `0.1s` | `0.08s` | `0s` |
| `--speed-fast` | `0.2s` | `0.133s` | `0s` |
| `--speed-base` | `0.3s` | `0.28s` | `0s` |
| `--speed-slow` | `0.5s` | `0.35s` | `0s` |
| `--ease-flow` | `linear` | `ease-in-out` | `steps(4)` |
| `--shadow-float` | atmospheric | subtle rgba | `none` |
| `--shadow-lift` | atmospheric | subtle rgba | `none` |
| `--shadow-sunk` | inset | inset | `none` |
| `--surface-bg` | gradient | `var(--bg-surface)` | `var(--bg-surface)` |

Also per-physics: `--delay-cascade`, `--delay-sequence`, `--ease-spring-gentle`, `--ease-spring-snappy`, `--ease-spring-bounce`.

Tailwind utilities: `backdrop-blur-physics`, `duration-instant`, `duration-fast`, `duration-base`, `duration-slow`, `delay-cascade`, `delay-sequence`, `ease-flow`, `ease-spring-gentle`, `ease-spring-snappy`, `ease-spring-bounce`.

---

## Structural (tokens.css, shared)

| Token | Value | Purpose |
|---|---|---|
| `--unit` | `0.25rem` | Base unit for the spacing calc chain |
| `--density` | `1` (default) / `0.75` / `1.25` | Set by `[data-density]` selectors |
| `--modal-width-xs` | `24rem` | Modal `size='xs'` |
| `--modal-width-sm` | `32rem` | Modal `size='sm'` |
| `--modal-width-md` | `40rem` | Modal `size='md'` |
| `--modal-width-lg` | `64rem` | Modal `size='lg'` |
| `--modal-width-xl` | `75rem` | Modal `size='xl'` |
| `--tooltip-max-width` | `250px` | Tooltip text wrapping |
| `--dialog-gutter` | `var(--space-xl)` | Dialog content inset |
| `--dialog-gutter-lg` | `var(--space-2xl)` | Dialog content inset (large modals) |
| `--scrollbar-width` | `6px` | Decorative scrollbar width |
| `--safe-top` | `env(safe-area-inset-top, 0)` | iOS notch inset |
| `--safe-bottom` | `env(safe-area-inset-bottom, 0)` | iOS home-indicator inset |
| `--safe-left` / `--safe-right` | `env(safe-area-inset-*, 0)` | Landscape safe areas |

---

## Customizing

Override any token by redeclaring it under a higher-specificity rule:

```css
:root {
  --energy-primary: #ff00ff;  /* global override */
}

[data-atmosphere='slate'] {
  --energy-primary: #00ffff;  /* atmosphere-specific override */
}

.my-component {
  --energy-primary: #ffff00;  /* component-scoped override */
}
```

The cascade wins; the runtime doesn't need to know about your customizations. This is also how you add a **new atmosphere** without forking the package: write a `[data-atmosphere='yours']` block that sets all the color tokens, then call `setAtmosphere('yours')`.

For physics customization the same pattern works with `[data-physics='yours']` rules — see [the physics files](./dist/physics/) for the full token set to override.
