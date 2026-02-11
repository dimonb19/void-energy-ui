# Void Energy UI — Migration Context

This codebase is being migrated to the **Void Energy UI** system: a design system built on Svelte 5 (Runes), Astro, TypeScript, and a hybrid styling architecture where **SCSS owns visual physics** (surfaces, shadows, blur, animations, state) and **Tailwind owns geometry** (flex, grid, spacing, sizing). Every visual value flows through semantic tokens. Every component adapts to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark). Migration is incremental — one task per session, preserving existing behavior.

---

## 1. THE 4 LAWS (Hard Constraints)

### Law 1 — Hybrid Protocol
Tailwind = layout/geometry. SCSS = visual physics/materials. Never mix.

```
CORRECT:  class="flex flex-col gap-md p-lg"       (layout in Tailwind)
CORRECT:  .card { @include glass-float; }          (physics in SCSS)
WRONG:    .card { display: flex; gap: 24px; }      (layout in SCSS)
WRONG:    class="shadow-lg bg-blue-500"            (physics in Tailwind)
```

### Law 2 — Token Law
No raw values (px, #hex, rgb). Only semantic tokens.

```
CORRECT:  padding: var(--space-lg);  color: var(--text-main);
WRONG:    padding: 32px;             color: #ffffff;
CORRECT:  class="gap-md p-lg text-body"
WRONG:    class="gap-[20px] p-[32px]"
```

### Law 3 — Runes Doctrine
Svelte 5 runes only. No legacy patterns.

```
CORRECT:  let { value = $bindable() }: Props = $props();
WRONG:    export let value;

CORRECT:  let count = $state(0);
WRONG:    import { writable } from 'svelte/store';

CORRECT:  $effect(() => { ... });
WRONG:    $: reactive = value * 2;
WRONG:    onMount(() => { ... }); onDestroy(() => { ... });
```

### Law 4 — State Protocol
State visible to CSS via data attributes or ARIA, not utility classes.

```
CORRECT:  data-state="active"   aria-pressed="true"   aria-checked="true"
WRONG:    class="is-active"     class="open"           class="selected"

SCSS:     @include when-state('active') { ... }
```

---

## 2. TOKEN DICTIONARY

### Spacing (4px base unit, density-scaled)
```
--space-xs (8px)   --space-sm (16px)   --space-md (24px)   --space-lg (32px)
--space-xl (48px)  --space-2xl (64px)  --space-3xl (96px)  --space-4xl (128px)  --space-5xl (160px)
Tailwind: gap-xs, p-sm, m-lg, etc.  |  SCSS: var(--space-md)
```

### Colors (CSS variables, theme-reactive)
```
Canvas:     --bg-canvas  --bg-surface  --bg-sink  --bg-spotlight
Energy:     --energy-primary  --energy-secondary
Text:       --text-main  --text-dim  --text-mute
Border:     --border-color
Semantic:   --color-premium  --color-system  --color-success  --color-error
            (each has -light, -dark, -subtle variants)
```

### Physics (change per preset: glass / flat / retro)
```
Motion:     --speed-instant  --speed-fast  --speed-base  --speed-slow
Delay:      --delay-cascade  --delay-sequence
Easing:     --ease-spring-gentle  --ease-spring-snappy  --ease-spring-bounce  --ease-flow
Surface:    --physics-blur  --physics-border-width  --radius-base  --radius-full
Depth:      --shadow-float  --shadow-lift  --shadow-sunk  --focus-ring
Feedback:   --lift  --scale
```

### Z-Index (use z() function in SCSS)
```
sink(-1)  floor(0)  base(1)  decorate(2)  float(10)  sticky(20)  header(40)  dropdown(50)  overlay(90)
```

### Typography
```
Scales:   text-caption  text-small  text-body  text-h5  text-h4  text-h3  text-h2  text-h1
Weights:  --font-weight-regular(400)  --font-weight-medium(500)  --font-weight-semibold(600)  --font-weight-bold(700)
Families: --font-heading  --font-body  --font-code
Radius:   --radius-sm(4px)  --radius-md(8px)  --radius-lg(16px)  --radius-xl(24px)  --radius-full(pill)
```

---

## 3. COMPONENT PATTERNS

### Svelte Component
```svelte
<script lang="ts">
  interface MyComponentProps {
    value: string;
    checked?: boolean;
    onchange?: (value: string) => void;
    class?: string;
  }

  let {
    value,
    checked = $bindable(false),
    onchange,
    class: className = '',
  }: MyComponentProps = $props();
</script>

<div class="my-component flex gap-md {className}" data-state={checked ? 'active' : ''}>
  <!-- Layout = Tailwind. State = data attributes. Visual physics = SCSS class. -->
</div>
```

### SCSS Component
```scss
@use '../abstracts' as *;

.my-component {
  @include glass-float;

  @include when-state('active') {
    border-color: var(--energy-primary);
  }

  @include when-retro {
    border-width: var(--physics-border-width);
  }

  @include when-light {
    background: var(--bg-surface);
  }
}
```

### Icon Component
```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>
<svg class="icon {className ?? ''}" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
  <!-- paths -->
</svg>
```

### Icon Color
Icons inherit color from their parent via `currentColor`. Color is always decided at the usage site.

- **Inside a button/container**: icon inherits parent color — no class needed
- **Standalone semantic indicator**: apply Tailwind class — `<Checkmark class="text-success" />`
- **Hover color transitions**: set on parent — `<button class="text-mute hover:text-error"><XMark /></button>`
- **Component-scoped color**: use SCSS on parent — `.toast-icon { color: var(--toast-accent); }`

---

## 4. SCSS TOOLKIT

All available via `@use '../abstracts' as *;`

### Surfaces
```
glass-float($interactive: false)   Floating surface (cards, panels). $interactive=true adds hover lift/glow.
glass-blur                          Backdrop blur (@supports progressive enhancement).
glass-sunk                          Recessed surface (inputs, wells). Auto focus-ring on :focus-visible.
```

### Animation
```
entry-transition($duration, $delay)  Slide-up fade-in with @starting-style. Respects reduced-motion.
shimmer                               Loading skeleton animation. Auto-adapts to physics/mode.
```

### State Selectors
```
when-state($state)        States: 'active', 'open', 'loading', 'disabled', 'error'
when-physics($physics)    Values: 'glass', 'flat', 'retro'. Optional: $low-specificity: true
when-mode($mode)          Values: 'light', 'dark'. Optional: $low-specificity: true
when-physics-mode($p, $m) Combined physics + mode selector (use sparingly)
```

### Convenience Aliases
```
when-retro   when-glass   when-flat   when-light   when-dark
All accept optional $low-specificity: true for :where() wrapping.
```

### Responsive
```
respond-up($breakpoint)   Min-width query. Breakpoints: tablet, small-desktop, large-desktop, full-hd, quad-hd
mobile-only               Max-width: tablet
```

### Utilities
```
text-truncate($lines)     Ellipsis clamp. $lines=1 for single-line, >1 for multi-line.
text-wrap-force           Force word-break for hashes, API keys.
btn-reset                 Strip all button defaults. Preserves accessibility.
laser-scrollbar           Themed scrollbar (thin, energy colors).
```

### Functions
```
tint($color, $pct)            Mix with white. Works with CSS vars via color-mix(in oklch).
shade($color, $pct)           Mix with black. Same polymorphic behavior.
alpha($color, $opacity)       Set transparency. Accepts 0-1 or 0%-100%.
blend($color, $other, $pct)   Mix two colors.
z($layer)                     Semantic z-index lookup from layer map.
```

---

## 5. STATE MANAGEMENT & SINGLETONS

Import and use — never re-instantiate.

### VoidEngine (`import { voidEngine } from '@adapters/void-engine.svelte'`)
```
.atmosphere                         Current theme ID (reactive)
.currentTheme                       Derived theme definition (reactive)
.userConfig                         User preferences (reactive)
.setAtmosphere(name)                Switch theme (persists, clears temp)
.setPreferences(prefs)              Update user config (density, scale, fonts)
.registerTheme(id, partialDef)      Register runtime theme (Safety Merge)
.applyTemporaryTheme(id, label)     Temporary theme (respects adaptAtmosphere)
.restoreUserTheme()                 Exit temporary theme
.availableAtmospheres               All registered theme IDs
.builtInAtmospheres                 Static (non-runtime) theme IDs
```

### Modal (`import { modal } from '@lib/modal-manager.svelte'`)
```
.open(key, props, size?)            Open by registry key. Size: 'sm' | 'md' | 'lg'
.close()                            Close active modal (restores focus)
.confirm(title, body, { onConfirm, onCancel?, cost? })
.alert(title, body)
.settings(options?)
.themes()
Registry: src/config/modal-registry.ts (add new fragments here)
```

### Toast (`import { toast } from '@stores/toast.svelte'`)
```
.show(message, type?, duration?)    Types: 'info' | 'success' | 'error' | 'warning'
.close(id)                          Remove specific toast
.clearAll()                         Remove all toasts
.loading(message)                   Returns controller: { update, success, error, warning, close }
.promise(promise, { loading, success, error })
```

### Transitions (`import { materialize, dematerialize, implode, live } from '@lib/transitions.svelte'`)
```
in:materialize     Physics-aware entry (blur + scale + Y). Retro: instant.
out:dematerialize  Physics-aware exit (upward float + blur). Retro: stepped dissolve.
out:implode        Horizontal collapse with dissolution.
animate:live       FLIP list reflow animation.
```

### Actions
```
import { morph } from '@actions/morph'          use:morph={{ width, height, threshold }}
import { tooltip } from '@actions/tooltip'      use:tooltip={{ content, placement }}
```

### Path Aliases (tsconfig.json)
```
@actions/*  @adapters/*  @components/*  @config/*  @lib/*  @stores/*  @styles/*  @types/*
```

---

## 6. DOM CONTRACT

The `<html>` element carries the runtime state:
```
data-atmosphere="void"      Active theme ID
data-physics="glass"        Active physics preset (glass | flat | retro)
data-mode="dark"            Active color mode (light | dark)
```

Physics constraint rules (auto-enforced):
- `glass` requires `dark` mode (glows need darkness)
- `retro` requires `dark` mode (CRT phosphor effect)
- `flat` works with both modes

---

## 7. MIGRATION PROTOCOL

1. **SCOPE:** Do exactly what is asked. One component, one file, one feature at a time.
2. **READ FIRST:** Before writing code, read the existing file and any related SCSS/types.
3. **PRESERVE:** Keep existing behavior. Migration changes HOW code is written, not WHAT it does.
4. **MATCH PATTERNS:** Find the nearest existing Void Energy component/style and replicate its patterns.
5. **NO INVENTIONS:** Do not create new abstractions, mixins, utilities, or architecture. Use only what exists in the system.
6. **INCREMENTAL:** If a task feels large, propose breaking it into steps. Ask before proceeding.
7. **VERIFY:** After migration, the component must work correctly across all 3 physics presets (glass, flat, retro) and both modes (light, dark).
