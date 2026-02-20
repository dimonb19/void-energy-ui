# Void Energy UI — Migration Context

This codebase is being migrated to the **Void Energy UI** system: a design system built on Svelte 5 (Runes), Astro, TypeScript, and a hybrid styling architecture where **SCSS owns visual physics** (surfaces, shadows, blur, animations, state) and **Tailwind owns geometry** (flex, grid, spacing, sizing). Every visual value flows through semantic tokens. Every component adapts to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark). Migration is incremental — one task per session, preserving existing behavior.

Token dictionary and SCSS toolkit references are loaded on-demand via `.claude/rules/` when editing relevant files.

---

## 1. THE 5 LAWS (Hard Constraints)

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

CORRECT:  const doubled = $derived(value * 2);
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

### Law 5 — Spacing Gravity
Default to generous spacing. When uncertain, go ONE size up, never down.

```
FLOOR:    Floating surface → p-lg gap-lg.    Sunk surface → p-md gap-md.
NEVER:    gap-sm on a card.  gap-xs between groups.  p-sm on a floating surface.
RULE:     Generous whitespace > cramped density. If it looks tight, go up a size.
```

---

## 2. COMMANDS

```
npm run dev            Start dev server (auto-generates tokens, watches changes)
npm run build          Production build (runs build:tokens → astro build)
npm run build:tokens   Regenerate _generated-themes.scss from design-tokens.ts
npm run check          Run svelte-check (TypeScript + Svelte type checking)
npm run scan           Scan for magic pixel violations in SCSS/Svelte
npm run format         Prettier format all files
npm run preview        Preview production build locally
```

---

## 3. FILE STRUCTURE

```
src/
  actions/          Svelte actions (morph, tooltip)
  adapters/         VoidEngine singleton (theme/physics runtime state)
  components/
    core/           AtmosphereScope, ThemeScript (Astro scaffolding)
    icons/          Interactive animated SVG icons (icon-[name] namespace)
    modals/         Modal fragments (Confirm, Settings, Themes)
    ui/             Reusable UI components (Button, Toggle, SearchField, Modal...)
    ui-library/     Showcase/demo pages for the component library
  config/           Design tokens (SSOT), modal registry, font registry, constants
  layouts/          Astro layouts
  lib/              Modal manager, transitions, tooltip logic, void-boot
  pages/            Astro pages
  stores/           Reactive state (toast)
  styles/
    abstracts/      SCSS engine, mixins, functions, keyframes
    base/           Reset, typography, themes, accessibility
    components/     SCSS for buttons, inputs, fields, icons, toasts, etc.
    config/         Generated themes (DO NOT EDIT manually)
  types/            TypeScript type definitions
```

---

## 4. COMPONENT PATTERNS

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

### Static Icon (Lucide)
Static icons come from `@lucide/svelte` (ISC license, commercial-safe). Browse all icons at [lucide.dev/icons](https://lucide.dev/icons).
```svelte
<script lang="ts">
  import { Heart, TriangleAlert } from '@lucide/svelte';
</script>
<Heart class="icon" data-size="lg" />
<TriangleAlert class="icon text-error" />
```

### Interactive Icon (Custom)
Animated icons with state-driven transitions live in `src/components/icons/`. They use scoped `<style>` blocks and the `icon-[name]` class namespace.
```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  let { class: className, ...rest }: HTMLAttributes<SVGElement> = $props();
</script>
<svg class="icon-burger icon {className ?? ''}" viewBox="0 0 24 24" aria-hidden="true" {...rest}>
  <!-- animated SVG elements with scoped <style> -->
</svg>
```

### Icon Color
Icons inherit color from their parent via `currentColor`. Color is always decided at the usage site.

- **Inside a button/container**: icon inherits parent color — no class needed
- **Standalone semantic indicator**: apply Tailwind class — `<Check class="icon text-success" />`
- **Icon button hover**: `.btn-icon` uses `filter: brightness()` — no `hover:text-*` needed
- **Inline icon hover** (non-btn-icon): set on parent — `<button class="text-mute hover:text-error"><X class="icon" /></button>`
- **Component-scoped color**: use SCSS on parent — `.toast-icon { color: var(--toast-accent); }`

### Icon Rules
- **Static icons**: Always from `@lucide/svelte`. Always `class="icon"`.
- **Interactive icons**: Custom components in `src/components/icons/`. Class pattern: `icon-[name] icon`.
- **Never create custom static SVG icon components** — use Lucide instead.
- **Sizing**: `data-size` attribute (sm | md | lg | xl | 2xl | 3xl | 4xl).

---

## 5. NATIVE-FIRST PROTOCOL

Components are thin wrappers around **native HTML elements** — they add layout, labeling, and physics styling, never behavior reimplementations. The browser owns interaction, accessibility, and form integration; SCSS owns the material.

### Always Native
`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`

### Custom Only When
No native element exists for the interaction (e.g., combobox/autocomplete, multi-thumb slider, virtualized data table).

### Reference Pattern
`Selector.svelte` — wraps a native `<select>` with label association and layout. Zero custom dropdown JS. SCSS handles all physics.

```
CORRECT:  <select onchange={handleChange}>           (native behavior)
CORRECT:  .select { @include glass-float; }           (SCSS physics on native element)
WRONG:    <div role="listbox" on:keydown={...}>       (reimplenting <select> from scratch)
```

---

## 6. STATE MANAGEMENT & SINGLETONS

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

## 7. DOM CONTRACT

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

## 8. MIGRATION PROTOCOL

1. **SCOPE:** Do exactly what is asked. One component, one file, one feature at a time.
2. **READ FIRST:** Before writing code, read the existing file and any related SCSS/types.
3. **PRESERVE:** Keep existing behavior. Migration changes HOW code is written, not WHAT it does.
4. **MATCH PATTERNS:** Find the nearest existing Void Energy component/style and replicate its patterns.
5. **NO INVENTIONS:** Do not create new abstractions, mixins, utilities, or architecture. Use only what exists in the system.
6. **INCREMENTAL:** If a task feels large, propose breaking it into steps. Ask before proceeding.
7. **VERIFY:** After migration, the component must work correctly across all 3 physics presets (glass, flat, retro) and both modes (light, dark).

---

## 9. GOTCHAS

- **Generated files are read-only.** Never edit `src/styles/config/_generated-themes.scss`, `void-registry.json`, or `void-physics.json`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.
- **`npm run scan` enforces Token Law.** It exits non-zero if magic pixel values are found in SCSS/Svelte files.
- **Glass and retro require dark mode.** VoidEngine auto-corrects invalid physics+mode combos. Do not manually set light mode with glass or retro physics.
- **SCSS import path:** Always `@use '../abstracts' as *;` — never import individual partial files.
- **Tailwind config is token-driven.** `tailwind.config.mjs` reads from `design-tokens.ts`. Add new values to design-tokens, not the Tailwind config.
- **Radius tokens in SCSS:** Default to `var(--radius-base)` for border-radius — it adapts per physics (8px glass, 4px flat, 0 retro). Use `var(--radius-full)` for pills. The scale tokens (`--radius-sm/md/lg/xl`) are available when you deliberately need a specific size, but all radius tokens are force-zeroed in retro physics.
- **Existing docs:** `CHEAT-SHEET.md` (component catalog), `THEME-GUIDE.md` (theme creation), `CONTRIBUTING.md` (PR process).
