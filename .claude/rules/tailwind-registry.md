---
paths:
  - "src/**/*.svelte"
  - "src/**/*.astro"
  - "src/pages/**"
  - "src/layouts/**"
  - "src/components/**"
---

# Tailwind Registry

Quick-reference of every Tailwind utility available in this system. Standard Tailwind numeric scales and color palettes are **fully replaced** — only the classes listed here resolve to real values. If a class isn't here and isn't a standard layout/display utility, it won't work.

**Tailwind v4 setup.** The system runs on Tailwind CSS v4 via `@tailwindcss/vite`. There is no `tailwind.config.mjs`. All theme registration, namespace resets, `@utility` declarations, and the `void-overrides` cascade layer live in [src/styles/tailwind-theme.css](../../src/styles/tailwind-theme.css). Cascade layer order is `void-scss, properties, theme, base, components, utilities, void-overrides` (declared identically in `tailwind-theme.css` and `global.scss`).

## Spacing — `p-*`, `m-*`, `gap-*`, `space-x-*`, `space-y-*`, `inset-*`, `top-*`, etc.

```
xs     0.5rem (8px)       sm     1rem (16px)       md     1.5rem (24px)
lg     2rem (32px)        xl     3rem (48px)        2xl    4rem (64px)
3xl    6rem (96px)        4xl    8rem (128px)       5xl    10rem (160px)
0      0                  px     1px                auto   auto (margins only: m-auto, mx-auto, my-auto — not valid for gap or padding)
```

All spacing scales with `--density` (compact 0.75x, standard 1x, relaxed 1.25x).

**Not available:** `gap-4`, `p-8`, `m-12`, `gap-[20px]`, `p-[32px]` — no numeric scale, no arbitrary values.

## Colors — `text-*`, `bg-*`, `border-*`, `ring-*`, `divide-*`, `accent-*`, etc.

### Canvas (backgrounds)
```
canvas       --bg-canvas         surface      --bg-surface
sunk         --bg-sunk           spotlight    --bg-spotlight
```

### Energy (brand)
```
primary      --energy-primary    secondary    --energy-secondary
```

### Text
```
main         --text-main         dim          --text-dim         mute         --text-mute
```

### Structure
```
border       --border-color
```

### Semantics (base + variants)
```
premium         system          success         error
premium-light   system-light    success-light   error-light
premium-dark    system-dark     success-dark    error-dark
premium-subtle  system-subtle   success-subtle  error-subtle
```

### Foundation
```
transparent     current (currentColor)     inherit
```

**Not available:** `bg-blue-500`, `text-red-400`, `border-gray-200`, `bg-white`, `text-black` — no stock palette.

### Common patterns
```
text-main              Primary text
text-dim               Secondary text
text-mute              Tertiary/disabled text
text-primary           Brand-colored text
text-error             Error/destructive text
text-success           Success/confirmed text
bg-canvas              Page background
bg-surface             Card/panel background
bg-sunk                Inset/well background
border-border          Standard border color
```

**Not available:** `text-warning`, `bg-warning` — the toast system supports a `'warning'` type internally, but there is no `warning` color token in Tailwind. Use `text-error` or a semantic color for warning-like UI.

## Breakpoints — responsive prefixes

```
mobile:          0px (implicit base — rarely needed explicitly)
tablet:          768px           small-desktop:   1024px
large-desktop:   1440px          full-hd:         1920px
quad-hd:         2560px
```

Mobile-first: no prefix = mobile base. Example: `flex-col tablet:flex-row`.

**Not available:** `sm:`, `md:`, `lg:`, `xl:`, `2xl:` — not registered.

## Container Queries — `@container` parent, `@*:` children

```
@sm:    320px     @md:    480px     @lg:    640px     @xl:    800px
```

Parent needs `class="@container"`. Children use `@md:flex-row`, `@lg:grid-cols-2`, etc.

## Typography

### Font size — `text-*`
```
text-caption    text-small    text-base (body)
text-h6         text-h5       text-h4       text-h3       text-h2       text-h1
```

**Not available:** `text-xs`, `text-sm`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl` — no stock scale.

### Font family — `font-*`
```
font-heading     font-body     font-mono
```

**Not available:** `font-sans`, `font-serif` — use `font-heading` or `font-body`.

### Font weight — `font-*`
```
font-regular (400)     font-medium (500)     font-semibold (600)     font-bold (700)
```

**Not available:** `font-normal`, `font-light`, `font-thin`, `font-extrabold`, `font-black`.

### Line height — `leading-*`
```
leading-none     leading-h1     leading-h2     leading-h3     leading-h4
leading-title    leading-subtitle    leading-body    leading-small    leading-caption
leading-tight (alias → h1)     leading-normal (alias → body)
```

**Not available:** `leading-3`, `leading-4`, `leading-relaxed`, `leading-loose`.

### Letter spacing — `tracking-*`
```
tracking-h1     tracking-h2     tracking-h3     tracking-h4
tracking-title  tracking-subtitle    tracking-body    tracking-small    tracking-caption
```

**Not available:** `tracking-tighter`, `tracking-tight`, `tracking-normal`, `tracking-wide`, `tracking-widest`.

## Border Radius — `rounded-*`

```
rounded          var(--radius-md)   — 8px (0 in retro)  [provided via @utility override in tailwind-theme.css — v4 has no --radius-DEFAULT namespace]
rounded-none     0
rounded-sm       var(--radius-sm)   — 4px (0 in retro)
rounded-md       var(--radius-md)   — 8px (0 in retro)
rounded-lg       var(--radius-lg)   — 16px (0 in retro)
rounded-xl       var(--radius-xl)   — 24px (0 in retro)
rounded-full     var(--radius-full) — 9999px (0 in retro)
```

**Note:** All radius tokens except `rounded-none` are force-zeroed in retro physics. The bare `rounded` utility is physics-adaptive (same as `rounded-md`) — it is an explicit `@utility` override in `tailwind-theme.css` because v4 has no `--radius-DEFAULT` namespace and bare `rounded` would otherwise be a hardcoded static utility. For physics-adaptive radius in SCSS, use `var(--radius-base)` directly — it is not exposed as a Tailwind class.

**Not available:** `rounded-2xl`, `rounded-3xl` — not in scale.

## Border Width — `border-*`

```
border           var(--physics-border-width) — adapts per physics (1px glass/flat, 2px retro)
border-x         var(--physics-border-width) — adapts per physics
border-y         var(--physics-border-width) — adapts per physics
border-l / -r / -t / -b   var(--physics-border-width) — adapts per physics (directional)
border-0         0
border-2         2px
```

**Not available:** `border-4`, `border-8` — only 0, default, and 2.

**How the physics-adaptive bare family works.** In v4, `border` and `border-{l,r,t,b,x,y}` are hardcoded 1px static utilities. `tailwind-theme.css` restores v3's physics-aware behavior by declaring these rules in the `void-overrides` cascade layer (highest priority), which wins over Tailwind's static values regardless of source order or specificity.

**TRAP:** do not combine `border` (or `border-l`/`border-t`/etc.) with a numeric directional like `border-l-2` on the same element. The bare family sets the width via the shorthand, which expands to all four longhand `border-*-width` declarations in a higher layer than `utilities`. `border-l-2`'s `border-left-width: 2px` then silently loses to physics width. Use **either** the bare family **or** numeric directionals, not both. (In v3 source order let `border-l-2` win; v4 cascade layers don't honor source order across layers.)

## Z-Index — `z-*`

```
z-sunk (-1)      z-floor (0)       z-base (1)       z-decorate (2)
z-float (10)     z-sticky (20)     z-header (40)    z-dropdown (50)    z-overlay (90)
```

**Not available:** `z-0`, `z-10`, `z-20`, `z-30`, `z-40`, `z-50`, `z-auto` — only semantic names.

## Transitions

### Duration — `duration-*`
```
duration-0          0ms
duration-instant    80–100ms (physics-dependent)
duration-fast       133–200ms
duration-base       280–300ms
duration-slow       350–500ms
```

**Not available:** `duration-75`, `duration-150`, `duration-300`, `duration-500`, `duration-1000`.

### Delay — `delay-*`
```
delay-0          0ms
delay-cascade    40–50ms (physics-dependent)
delay-sequence   80–100ms
```

### Timing function — `ease-*`
```
ease-flow              ease-in-out or linear per physics
ease-spring-gentle     ease-spring-snappy     ease-spring-bounce
ease-linear            linear
```

**Not available:** `ease-in`, `ease-out`, `ease-in-out` — use `ease-flow` (physics-adaptive).

## Min-Height

```
min-h-control    var(--control-height) — ~44px, density-scaled
```

Provided via `@utility min-h-control` in `tailwind-theme.css`. In v4 the `min-h-*` namespace reads from `--min-height-*` (not `--min-h-*`), so a theme entry would emit the variable at `:root` without generating a class. The `@utility` declaration is the correct way to register custom `min-h-*` names.

## Physics Bridge

```
backdrop-blur-physics    blur(var(--physics-blur)) — 20px glass, 0 flat/retro
```

Provided via `@utility backdrop-blur-physics` in `tailwind-theme.css`. Replaces the v3 JS plugin approach.

**Not available:** `backdrop-blur-sm`, `backdrop-blur-md`, `backdrop-blur-lg` — use `backdrop-blur-physics` or SCSS.

## Standard Tailwind That Works Normally

These categories are **not overridden** — standard Tailwind classes work as expected:

- **Display:** `flex`, `grid`, `block`, `inline-flex`, `inline-block`, `hidden`, `contents`
- **Flex/Grid:** `flex-col`, `flex-row`, `flex-wrap`, `items-center`, `justify-between`, `grid-cols-*`, `col-span-*`, `place-items-*`, `flex-1`, `flex-none`, `flex-shrink-0`, `grow`, `shrink-0`
- **Positioning:** `absolute`, `relative`, `fixed`, `sticky`, `inset-0`, `top-0`, `right-0`, `bottom-0`, `left-0` (values use spacing scale: `top-sm`, `right-md`, etc.)
- **Sizing:** `w-full`, `h-full`, `w-screen`, `h-screen`, `min-w-0`, `max-w-full`, `w-auto`, `h-auto`, `aspect-video`, `aspect-square`
- **Overflow:** `overflow-hidden`, `overflow-auto`, `overflow-x-auto`, `overflow-y-scroll`, `truncate`
- **Visibility/Opacity:** `invisible`, `visible`, `opacity-0` through `opacity-100` (standard 0–100 scale, not overridden — `opacity-25`, `opacity-50`, `opacity-75`, etc. all work)
- **Transforms:** `scale-*`, `rotate-*`, `translate-x-*`, `translate-y-*`
- **Cursors:** `cursor-pointer`, `cursor-default`, `cursor-not-allowed`, `cursor-grab`
- **Pointer events:** `pointer-events-none`, `pointer-events-auto`
- **User select:** `select-none`, `select-text`, `select-all`
- **Text alignment:** `text-center`, `text-left`, `text-right`, `text-start`, `text-end`
- **Text decoration:** `underline`, `no-underline`, `line-through`
- **Text transform:** `uppercase`, `lowercase`, `capitalize`, `normal-case`
- **Text wrap:** `whitespace-nowrap`, `whitespace-pre-wrap`, `break-words`, `break-all`
- **List style:** `list-disc`, `list-decimal`, `list-none`
- **Borders (style):** `border-solid`, `border-dashed`, `border-dotted`, `border-none`
- **Divide:** `divide-x`, `divide-y` (width uses border-width scale)
- **Outline:** `outline-none`, `outline`
- **Ring:** `ring-0` (colors use the semantic palette)

## Hover, Focus, and State Modifiers

Standard Tailwind modifiers work for **composition concerns**:

```
hover:opacity-80        focus:outline-none       group-hover:visible
focus-visible:ring-2    active:scale-95          disabled:opacity-50
first:mt-0              last:mb-0                dark: (DO NOT USE — system uses data-mode)
```

**Do not use modifiers for physics:** color transitions, shadows, background materials, glows — those belong in SCSS with `@include when-state()`, `@include when-hover`, etc.

**Do not use `dark:`** — the system uses `[data-mode="dark"]` and `[data-mode="light"]` in SCSS, not Tailwind's dark mode.

## SCSS-Only (Never in Tailwind)

These visual concerns are handled exclusively by SCSS mixins and CSS variables:

- Shadows: `surface-raised`, `surface-float` (not `shadow-*`)
- Glass/blur: `@include glass-surface` (not `backdrop-blur-*` except `backdrop-blur-physics`)
- Glows: `@include glow-*` (not `ring-*` for decorative glow)
- Border colors: `@include surface-*` auto-sets borders (not `border-blue-500`)
- Background materials: `@include surface-raised`, `surface-sunk`, etc. (not `bg-gradient-*`)
- Color mode switching: `@include when-light`, `@include when-dark` (not `dark:`)
- Physics adaptation: `@include when-glass`, `@include when-retro`, `@include when-flat`
- Hover/active materials: `@include when-hover`, `@include when-state('active')`
