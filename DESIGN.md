---
name: Void Energy
version: 0.1.0
description: Physics-based, theme-reactive design system for narrative software. Separates composition from material; every pixel is the intersection of Atmosphere × Physics × Mode.
authors: [DGRS Labs]
license: BSL-1.1
framework: Svelte 5 + Astro (L1), framework-agnostic (L0)
---

# Void Energy

Void Energy is a design-system runtime. It treats visual output as the intersection of three environmental variables — an **Atmosphere** (color + font), a **Physics** preset (texture + motion), and a **Mode** (light/dark polarity) — exposed as attributes on the `<html>` element and enforced at runtime.

This DESIGN.md describes the system. For the AI-build contract, see [SYSTEM-PROMPT.md](./SYSTEM-PROMPT.md). For per-atmosphere declarations, use the CLI: `npm run design-md -- export --atmosphere <id>`.

## Foundations

### Atmospheres

Four free atmospheres cover both modes and all three physics presets.

| Atmosphere | Mode | Physics | Tagline |
| --- | --- | --- | --- |
| slate | dark | flat | Professional / Clean |
| terminal | dark | retro | Hacker / Retro |
| meridian | light | flat | Fintech / Brand |
| frost | dark | glass | Arctic / Glass |

Additional atmospheres register at runtime via `voidEngine.registerTheme(id, definition)` or `voidEngine.importDesignMd(content)`.

### Physics

| Preset | Blur | Motion | Borders | Valid modes |
| --- | --- | --- | --- | --- |
| glass | 20px backdrop | organic cubic-bezier, 0.3s | 1px glow | dark only |
| flat | none | clean ease-out, 0.2s | 1px solid | light, dark |
| retro | none | instant steps, 0s | 2px hard | dark only |

Invalid combinations (glass+light, retro+light) are auto-corrected by the engine via Safety Merge.

### Modes

`light` and `dark`. Toggled independently of atmosphere when physics permits.

### Density

Three scales: `high`, `standard`, `low`. Scale every spacing token, `--nav-height`, `--control-height`, and `--size-touch-min`.

## Tokens

### Colors

Semantic, theme-reactive. Every token is a CSS custom property on `:root`. Per-atmosphere values live in [src/config/atmospheres.ts](./src/config/atmospheres.ts).

| Family | Tokens |
| --- | --- |
| Canvas | `--bg-canvas`, `--bg-surface`, `--bg-sunk`, `--bg-spotlight` |
| Energy | `--energy-primary`, `--energy-secondary` |
| Structure | `--border-color` |
| Signal | `--text-main`, `--text-dim`, `--text-mute` |
| Semantic | `--color-premium`, `--color-system`, `--color-success`, `--color-error` (each with `-light`, `-dark`, `-subtle` variants) |

### Typography

| Token | Purpose |
| --- | --- |
| `--font-atmos-heading` | Atmosphere-specific heading font stack |
| `--font-atmos-body` | Atmosphere-specific body font stack |
| `--font-weight-regular` | 400 |
| `--font-weight-medium` | 500 |
| `--font-weight-semibold` | 600 |
| `--font-weight-bold` | 700 |

Scales: `text-caption`, `text-small`, `text-body`, `text-h6` through `text-h1`.

### Spacing

Base unit 4px, density-scaled.

| Token | Value |
| --- | --- |
| `--space-xs` | 8px |
| `--space-sm` | 16px |
| `--space-md` | 24px |
| `--space-lg` | 32px |
| `--space-xl` | 48px |
| `--space-2xl` | 64px |
| `--space-3xl` | 96px |
| `--space-4xl` | 128px |
| `--space-5xl` | 160px |

### Radii

Force-zeroed under retro physics.

| Token | Glass | Flat | Retro |
| --- | --- | --- | --- |
| `--radius-base` | 8px | 8px | 0 |
| `--radius-full` | pill | pill | 0 |
| `--radius-sm` | 4px | 4px | 0 |
| `--radius-md` | 8px | 8px | 0 |
| `--radius-lg` | 16px | 16px | 0 |
| `--radius-xl` | 24px | 24px | 0 |

### Motion

Physics-reactive. Values change per preset.

| Token | Purpose |
| --- | --- |
| `--speed-instant`, `--speed-fast`, `--speed-base`, `--speed-slow` | Transition durations |
| `--delay-cascade`, `--delay-sequence` | List/stagger delays |
| `--ease-spring-gentle`, `--ease-spring-snappy`, `--ease-spring-bounce`, `--ease-flow` | Easing functions |
| `--lift`, `--scale` | Hover feedback offsets |

### Shadows

| Token | Purpose |
| --- | --- |
| `--shadow-float` | Default raised surfaces |
| `--shadow-lift` | Hover/elevated state |
| `--shadow-sunk` | Recessed surfaces |
| `--shadow-offset` | Retro hard-drop shadow (3px) |
| `--focus-ring` | Focus state outline |

## Patterns

### Hybrid Protocol

Tailwind owns composition and consumer-side geometry. SCSS owns visual physics, materials, and primitive-internal geometry. They never mix.

- Tailwind: `flex`, `gap-md`, `p-lg`, responsive breakpoints
- SCSS: shadows, blur, glows, border physics, primitive defaults

### Native-First

Components are thin wrappers around native HTML. The browser owns interaction, accessibility, and form integration. SCSS owns the material.

### State Protocol

State is visible to CSS via `data-*` attributes and ARIA. Never via utility classes like `.is-active` or `.open`.

### Safety Merge

When a partial theme is registered, missing palette tokens inherit from the mode-compatible base theme. Invalid physics+mode combinations auto-correct. The engine never renders an invalid state.

## Do / Don't

**Do**
- Default generous on spacing — when unsure, go one size up
- Use semantic tokens everywhere — `var(--space-lg)`, `var(--text-main)`
- Let the engine enforce physics+mode constraints
- Wrap native HTML rather than rebuilding behavior
- Expose state through `data-*` and ARIA

**Don't**
- Mix Tailwind with visual physics (`class="shadow-lg"`) or SCSS with page layout (`.section { display: grid }`)
- Use raw values (`padding: 32px`, `color: #ffffff`, `gap-[20px]`)
- Set `glass` or `retro` physics in light mode — the engine will override
- Ship utility-class state toggles (`.is-open`) — CSS can't read them reliably across contexts

## Interop

- **Import a DESIGN.md atmosphere** — `voidEngine.importDesignMd(content)` registers a theme via Safety Merge.
- **Export an atmosphere as DESIGN.md** — `voidEngine.exportDesignMd(id?)` returns serialized DESIGN.md.
- **CLI** — `npm run design-md -- export|import|validate|list`.

## References

- [SYSTEM-PROMPT.md](./SYSTEM-PROMPT.md) — the tool-agnostic AI contract for generating code inside Void Energy
- [CLAUDE.md](./CLAUDE.md) — the Claude Code harness configuration
- [src/config/atmospheres.ts](./src/config/atmospheres.ts) — atmosphere palette source of truth
- [src/config/design-tokens.ts](./src/config/design-tokens.ts) — token orchestrator
