# Token Vocabulary

> Generated from `src/config/design-tokens.ts`. Do not hand-edit. Edit `design-tokens.ts` and run `npm run build:skill` (and `npm run build:tokens` to regenerate the SCSS bridge).

The semantic-token dictionary that every Void Energy surface composes from. Names below match CSS variables (e.g. `xs` → `--space-xs`, exposed to Tailwind as `gap-xs`, `p-xs`, etc.). Atmospheres and physics presets remap colors and motion at runtime — names stay stable, values do not.

## Spacing — `--space-*`

Density-scaled (0.75x compact, 1x standard, 1.25x relaxed). Values shown are at standard density.

| Token | Value | Tailwind utilities | Purpose |
|---|---|---|---|
| `--space-xs` | 0.5rem (8px) | `gap-xs`, `p-xs`, `m-xs` | Icon gaps, label→input, inline icon+text |
| `--space-sm` | 1rem (16px) | `gap-sm`, `p-sm`, `m-sm` | Button padding, dense pickers |
| `--space-md` | 1.5rem (24px) | `gap-md`, `p-md`, `m-md` | Sunk surface default, form-field groups |
| `--space-lg` | 2rem (32px) | `gap-lg`, `p-lg`, `m-lg` | Floating surface default (Law 5 floor) |
| `--space-xl` | 3rem (48px) | `gap-xl`, `py-xl` | Between content blocks in a section |
| `--space-2xl` | 4rem (64px) | `gap-2xl`, `py-2xl` | Between page sections |
| `--space-3xl` | 6rem (96px) | `gap-3xl` | Layout-scale spacing |
| `--space-4xl` | 8rem (128px) | `gap-4xl` | Hero / large-spread sections |
| `--space-5xl` | 10rem (160px) | `gap-5xl` | Mega spacing |

Source values:

```ts
xs: '0.5rem', // 8px  (2 x 4px) - Tight padding, icon gaps
  sm: '1rem', // 16px (4 x 4px) - Button padding, small gaps
  md: '1.5rem', // 24px (6 x 4px) - Card padding, standard gaps (most common)
  lg: '2rem', // 32px (8 x 4px) - Section padding, large gaps
  xl: '3rem', // 48px (12 x 4px) - Page margins, hero spacing
  '2xl': '4rem', // 64px (16 x 4px) - Section dividers
  '3xl': '6rem', // 96px (24 x 4px) - Layout spacing
  '4xl': '8rem', // 128px (32 x 4px) - Hero sections
  '5xl': '10rem', // 160px (40 x 4px) - Mega spacing
```

## Breakpoints — `tablet:`, `small-desktop:`, etc.

Tailwind v4 custom breakpoint names. There is no `sm:` / `md:` / `lg:` — read this list before assuming Tailwind defaults.

```ts
mobile: '0px',
  tablet: '768px',
  'small-desktop': '1024px',
  'large-desktop': '1440px',
  'full-hd': '1920px',
  'quad-hd': '2560px',
```

## Container Max-Widths

Responsive container constraints. Used by `.container` Tailwind helper.

```ts
mobile: '100%',
  tablet: '720px',
  'small-desktop': '960px',
  'large-desktop': '1320px',
  'full-hd': '1600px',
  'quad-hd': '1920px',
```

## Z-Index Layers — `z()` in SCSS

Semantic z-index scale. Use `z()` in SCSS (e.g. `z-index: z('overlay');`).

```ts
sunk: '-1', // Below canvas (background patterns)
  floor: '0', // Canvas level
  base: '1', // Default element layer
  decorate: '2', // Decorative elements
  float: '10', // Floating UI elements
  sticky: '20', // Sticky headers/navigation
  header: '40', // Main header
  dropdown: '50', // Dropdown menus
  overlay: '90', // Modals, dialogs, overlays
```

## Border Radius — `--radius-*`

Default to `var(--radius-base)` (8px in glass/flat, 0 in retro). Use `var(--radius-full)` for pills. Retro physics force every radius to 0 — do not fight that with hardcoded values.

```ts
sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px', // Pill shape
```

## Colors (theme-reactive)

Color tokens are remapped per atmosphere. Names stay stable; values change. The runtime engine sets these at `<html>` level when `data-atmosphere` changes.

| Group | Tokens |
|---|---|
| Canvas | `--bg-canvas`, `--bg-surface`, `--bg-sunk`, `--bg-spotlight` |
| Energy | `--energy-primary`, `--energy-secondary` |
| Text | `--text-main`, `--text-dim`, `--text-mute` |
| Border | `--border-color` |
| Semantic | `--color-premium`, `--color-system`, `--color-success`, `--color-error` (each has `-light`, `-dark`, `-subtle` variants) |

Tailwind utilities exposed: `text-main`, `text-dim`, `text-mute`, `bg-surface`, `bg-sunk`, `bg-canvas`, `border-energy-primary`, etc. Source of atmosphere palettes: `src/config/atmospheres.ts`.

## Physics — `--physics-*`, `--speed-*`, `--ease-*`

Per-preset values. The runtime engine swaps these at `<html>` level when `data-physics` changes. Glass = blurred, organic motion. Flat = clean, no lift. Retro = instant, hard borders.

| Token | glass | flat | retro |
|---|---|---|---|
| `--physics-blur` | 20px | 0 | 0 |
| `--physics-border-width` | 1px | 1px | 2px |
| `--speed-instant` | 100ms | 80ms | 0 |
| `--speed-fast` | 200ms | 133ms | 0 |
| `--speed-base` | 300ms | 280ms | 0 |
| `--speed-slow` | 500ms | 350ms | 0 |
| `--delay-cascade` | 50ms | 40ms | 0 |
| `--delay-sequence` | 100ms | 80ms | 0 |
| `--lift` | -3px | 0 | -2px |
| `--scale` | 1.02 | 1 | 1 |
| `--radius-base` | 8px | 8px | 0 |
| `--ease-spring-gentle` | spring | ease-out | steps(2) |

Engine-enforced invariants — only four of six combinations are valid:

- `glass` + `dark` ✅, `flat` + `dark` ✅, `flat` + `light` ✅, `retro` + `dark` ✅
- `glass` + `light` → runtime downgrades physics to `flat` (glass needs darkness to glow)
- `retro` + `light` → runtime forces mode to `dark` (CRT requires a black canvas)

## Typography — `text-*` scales, `--font-*`

`clamp()`-based fluid scales. Font families remap per atmosphere via `--font-atmos-heading` and `--font-atmos-body`.

| Scale | Tailwind | Notes |
|---|---|---|
| `caption` | `text-caption` | Smallest legible label |
| `small` | `text-small` | Helper text, hints |
| `body` | `text-body` | Body copy ceiling (16px desktop) |
| `h6`–`h1` | `text-h6`–`text-h1` | Heading scales with `clamp()` fluid sizing |

Weights: `--font-weight-regular` (400), `medium` (500), `semibold` (600), `bold` (700), `extrabold` (800).
Families: `--font-heading`, `--font-body`, `--font-code` (atmosphere-overridable).

## Structural Constants

| Token | Value | Purpose |
|---|---|---|
| `--modal-width-xs` | 24rem | Modal: confirm/alert |
| `--modal-width-sm` | 32rem | Modal: small forms |
| `--modal-width-md` | 40rem | Modal: standard |
| `--modal-width-lg` | 64rem | Modal: settings, large content |
| `--modal-width-xl` | 75rem | Modal: command palette, wide |
| `--tooltip-max-width` | 250px | Tooltip ceiling |
| `--dialog-gutter` | `var(--space-xl)` | Dialog horizontal gutter |
| `--dialog-gutter-lg` | `var(--space-2xl)` | Dialog gutter (large) |

## Effect Overrides — Aura & Ambient

`use:aura` reads `--aura-color` (atmosphere-driven by default; consumer can pass `color` to override) and animates over `--aura-transition-duration` (1.5s). Spread / opacity tokens are tunable via the package.

`@void-energy/ambient-layers` carries its own raw-color tokens (`--ambient-sepia-shadow`, `--ambient-glitch-r`, `--ambient-night-top`, etc.) for sepia / glitch / night / neon / dawn presets. These are the only audited "raw color" tokens in the system; they are intentional package-internal constants and carry `// void-ignore` annotations in the SCSS.

## Common Raw-Value Substitutions

Diagnostic table for translating raw values into tokens. If you find yourself typing one of these, replace it with the named token.

| Raw value the model produced | Replace with |
|---|---|
| `padding: 32px` / `padding: 2rem` | `padding: var(--space-lg)` |
| `padding: 24px` / `padding: 1.5rem` | `padding: var(--space-md)` |
| `padding: 16px` / `padding: 1rem` | `padding: var(--space-sm)` |
| `gap: 8px` | `gap: var(--space-xs)` |
| `class="gap-[20px]"` | choose `gap-md` (24px) — never bracket-syntax utilities |
| `class="max-w-[400px]"` | use a container class or token-based width; bracket-syntax is banned |
| `color: #ffffff` | `color: var(--text-main)` (atmosphere-aware) |
| `color: #888` / `color: gray` | `color: var(--text-mute)` |
| `border: 1px solid #ccc` | `border: var(--physics-border-width) solid var(--border-color)` |
| `border-radius: 8px` | `border-radius: var(--radius-base)` |
| `border-radius: 9999px` | `border-radius: var(--radius-full)` |
| `transition: 200ms ease` | `transition: var(--speed-fast) var(--ease-flow)` |
| `box-shadow: 0 4px 12px rgba(0,0,0,0.2)` | use a `surface-*` mixin or `var(--shadow-float)` |
| `filter: blur(20px)` | `filter: blur(var(--physics-blur))` |
| `font-size: 16px` | `font-size: var(--font-body)` or use the `text-body` utility |
| `z-index: 50` | `z-index: z('dropdown')` (SCSS) |

## Hard Prohibitions (Token Law)

- Bracket-syntax Tailwind utilities (`gap-[20px]`, `max-w-[400px]`, `tablet:max-w-[400px]`).
- Inline visual styles (`style="color: #fff"`). Inline styles reserved for runtime positioning.
- Physics utilities in Tailwind (`shadow-lg`, `backdrop-blur-md`).
- `text-shadow: 0 0 Npx ...` — use a SCSS `@include shadow-*` mixin instead.
- `min-width: Nrem` / `min-height: Nrem` on controls — control sizing comes from `--control-height` / `--size-touch-min`.
- `inset: ±Npx` for runtime positioning is allowed inline; for static positioning use SCSS with tokens.
- Editing generated files: `_generated-themes.scss`, `_fonts.scss`, `void-registry.json`, `void-physics.json`, `font-registry.ts`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.

Reviewed exceptions carry `// void-ignore` with written justification (shimmer highlights, readability floors, browser-mandated constants, scan-line / dotted-pattern stripe widths). Do not add new ones casually.
