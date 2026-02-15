---
paths:
  - "src/styles/**/*.scss"
  - "src/components/**/*.svelte"
---

# SCSS Toolkit Reference

All available via `@use '../abstracts' as *;`

## Surfaces
```
glass-float($interactive: false)   Floating surface (cards, panels). $interactive=true adds hover lift/glow.
glass-blur                          Backdrop blur (@supports progressive enhancement).
glass-sunk                          Recessed surface (inputs, wells). Auto focus-ring on :focus-visible.
```

## Animation
```
entry-transition($duration, $delay)  Slide-up fade-in with @starting-style. Respects reduced-motion.
shimmer                               Loading skeleton animation. Auto-adapts to physics/mode.
```

## State Selectors
```
when-state($state)        States: 'active', 'open', 'loading', 'disabled', 'error'
when-physics($physics)    Values: 'glass', 'flat', 'retro'. Optional: $low-specificity: true
when-mode($mode)          Values: 'light', 'dark'. Optional: $low-specificity: true
when-physics-mode($p, $m) Combined physics + mode selector (use sparingly)
```

## Convenience Aliases
```
when-retro   when-glass   when-flat   when-light   when-dark
All accept optional $low-specificity: true for :where() wrapping.
```

## Responsive
```
respond-up($breakpoint)   Min-width query. Breakpoints: tablet, small-desktop, large-desktop, full-hd, quad-hd
mobile-only               Max-width: tablet
```

## Utilities
```
text-truncate($lines)     Ellipsis clamp. $lines=1 for single-line, >1 for multi-line.
text-wrap-force           Force word-break for hashes, API keys.
btn-reset                 Strip all button defaults. Preserves accessibility.
laser-scrollbar           Themed scrollbar (thin, energy colors).
```

## Functions
```
tint($color, $pct)            Mix with white. Works with CSS vars via color-mix(in oklch).
shade($color, $pct)           Mix with black. Same polymorphic behavior.
alpha($color, $opacity)       Set transparency. Accepts 0-1 or 0%-100%.
blend($color, $other, $pct)   Mix two colors.
z($layer)                     Semantic z-index lookup from layer map.
```
