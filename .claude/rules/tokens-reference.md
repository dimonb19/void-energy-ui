---
paths:
  - "src/**/*.scss"
  - "src/**/*.svelte"
  - "src/**/*.ts"
  - "tailwind.config.mjs"
---

# Token Dictionary

Source of truth: `src/config/design-tokens.ts`. Regenerate with `npm run build:tokens`.

## Spacing (4px base unit, density-scaled)
```
--space-xs (8px)   --space-sm (16px)   --space-md (24px)   --space-lg (32px)
--space-xl (48px)  --space-2xl (64px)  --space-3xl (96px)  --space-4xl (128px)  --space-5xl (160px)
Tailwind: gap-xs, p-sm, m-lg, etc.  |  SCSS: var(--space-md)
```

## Colors (CSS variables, theme-reactive)
```
Canvas:     --bg-canvas  --bg-surface  --bg-sink  --bg-spotlight
Energy:     --energy-primary  --energy-secondary
Text:       --text-main  --text-dim  --text-mute
Border:     --border-color
Semantic:   --color-premium  --color-system  --color-success  --color-error
            (each has -light, -dark, -subtle variants)
```

## Physics (change per preset: glass / flat / retro)
```
Motion:     --speed-instant  --speed-fast  --speed-base  --speed-slow
Delay:      --delay-cascade  --delay-sequence
Easing:     --ease-spring-gentle  --ease-spring-snappy  --ease-spring-bounce  --ease-flow
Surface:    --physics-blur  --physics-border-width  --radius-base  --radius-full
Depth:      --shadow-float  --shadow-lift  --shadow-sunk  --focus-ring
Feedback:   --lift  --scale
```

## Z-Index (use z() function in SCSS)
```
sink(-1)  floor(0)  base(1)  decorate(2)  float(10)  sticky(20)  header(40)  dropdown(50)  overlay(90)
```

## Typography
```
Scales:   text-caption  text-small  text-body  text-h5  text-h4  text-h3  text-h2  text-h1
Weights:  --font-weight-regular(400)  --font-weight-medium(500)  --font-weight-semibold(600)  --font-weight-bold(700)
Families: --font-heading  --font-body  --font-code
Radius:   --radius-base(default, physics-adaptive)  --radius-full(pill, 0 in retro)
Scale:    --radius-sm(4px)  --radius-md(8px)  --radius-lg(16px)  --radius-xl(24px)  (all 0 in retro)
Default to --radius-base unless you need a specific size.
```
