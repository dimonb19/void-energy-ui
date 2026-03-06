---
paths:
  - "src/styles/**/*.scss"
  - "src/components/**/*.svelte"
---

# SCSS Toolkit Reference

All available via `@use '../abstracts' as *;`

## Protocol Note
Use SCSS for:
- visuals, physics, state styling
- token-driven primitive-internal geometry that ships with the component out of the box

Do not use SCSS for:
- arbitrary page/layout composition
- one-off consumer layout wrappers
- raw geometry values that bypass tokens

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
text-shimmer                          Text-clipped loading shimmer. Two-layer: solid --text-mute base + --text-main beam sweep. Utility class: .text-shimmer
navlink-loading($mode)                Navigation loading shimmer paired with use:navlink action. $mode: surface (::after overlay) or text (background-clip). 150ms delay prevents flicker.
stagger-enter (keyframe)              Staggered list item entry (opacity + translateY + scale). Use with:
                                      animation: stagger-enter var(--speed-base) var(--ease-spring-snappy) backwards;
                                      animation-delay: calc(var(--item-index, 0) * var(--delay-cascade));
                                      Set --item-index per element: style="--item-index: {i}"
```

## State Selectors
```
when-state($state)        States: 'active', 'open', 'loading', 'disabled', 'error', 'met'
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
container-up($breakpoint) Min-width container query. Breakpoints: sm(320), md(480), lg(640), xl(800). Parent needs container-type: inline-size.
```

## Utilities
```
text-truncate($lines)     Ellipsis clamp. $lines=1 for single-line, >1 for multi-line.
text-wrap-force           Force word-break for hashes, API keys.
btn-reset                 Strip all button defaults. Preserves accessibility.
btn-base                  Structural button base (size, typography, layout). No physics or color. For CSS-only .btn-fake elements.
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
