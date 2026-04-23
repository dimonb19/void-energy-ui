---
paths:
  - "src/**/*.scss"
  - "src/**/*.svelte"
  - "src/**/*.ts"
  - "src/styles/tailwind-theme.css"
---

# Token Dictionary

Source of truth: `src/config/design-tokens.ts` (orchestrator), `src/config/fonts.ts` (fonts), `src/config/atmospheres.ts` (themes). Regenerate with `npm run build:tokens`.

## Spacing (4px base unit, density-scaled)
```
--space-xs (8px)   --space-sm (16px)   --space-md (24px)   --space-lg (32px)
--space-xl (48px)  --space-2xl (64px)  --space-3xl (96px)  --space-4xl (128px)  --space-5xl (160px)
Tailwind: gap-xs, p-sm, m-lg, etc.  |  SCSS: var(--space-md)
```

## Colors (CSS variables, theme-reactive)
```
Canvas:     --bg-canvas  --bg-surface  --bg-sunk  --bg-spotlight
Energy:     --energy-primary  --energy-secondary
Text:       --text-main  --text-dim  --text-mute
Border:     --border-color
Semantic:   --color-premium  --color-system  --color-success  --color-error
            (each has -light, -dark, -subtle variants)
```

## Physics (change per preset: glass / flat / retro)
```
Motion:     --speed-instant  --speed-fast  --speed-base  --speed-slow
Delay:      --delay-cascade(glass:50ms flat:40ms retro:0s)  --delay-sequence(glass:100ms flat:80ms retro:0s)
Easing:     --ease-spring-gentle  --ease-spring-snappy  --ease-spring-bounce  --ease-flow
Surface:    --physics-blur  --physics-border-width
Depth:      --shadow-float  --shadow-lift  --shadow-sunk  --shadow-offset(retro: 3px)  --focus-ring
Feedback:   --lift(glass:-3px flat:0px retro:-2px)  --scale(glass:1.02 flat:1 retro:1)
Radius:     --radius-base(glass:8px flat:8px retro:0)  --radius-full(pill, 0 in retro)
            --radius-sm(4px)  --radius-md(8px)  --radius-lg(16px)  --radius-xl(24px)  (all 0 in retro)
            Default to --radius-base unless you need a specific size.
```

## Z-Index (use z() function in SCSS)
```
sunk(-1)  floor(0)  base(1)  decorate(2)  float(10)  sticky(20)  header(40)  dropdown(50)  overlay(90)
```

## Typography
```
Scales:   text-caption  text-small  text-body  text-h6  text-h5  text-h4  text-h3  text-h2  text-h1
Weights:  --font-weight-regular(400)  --font-weight-medium(500)  --font-weight-semibold(600)  --font-weight-bold(700)
Families: --font-heading  --font-body  --font-code
```

## Runtime Variables (set by reset/global, not design-tokens)
```
Layout:   --nav-height(64px density-scaled)  --control-height
          --size-touch-min(2.75rem coarse / 2.25rem fine)
          --control-height-min(2.25rem coarse / 2rem fine — Compact floor)
          --control-padding-x(--space-sm)  --control-padding-y  --scrollbar-width(6px)
          --breadcrumbs-height
Safe:     --safe-top  --safe-bottom  --safe-left  --safe-right  (env(safe-area-inset-*))
Modal:    --modal-width-xs(24rem)  --modal-width-sm(32rem)  --modal-width-md(40rem)
          --modal-width-lg(64rem)  --modal-width-xl(75rem)  --tooltip-max-width(250px)
          --dialog-gutter(--space-xl)  --dialog-gutter-lg(--space-2xl)
```

## Container Queries
```
Parent: class="@container" (or container-type: inline-size in SCSS)
Child:  @sm: (320px)  @md: (480px)  @lg: (640px)  @xl: (800px)
SCSS:   @include container-up('md') { ... }
```
