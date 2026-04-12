## 0. MANDATORY PRE-FLIGHT (Do This Before Every Task)

Before writing a single line of code, you MUST complete this audit and report findings:

1. **Read the task-relevant component directory** (`src/components/ui/`, `src/components/icons/`, etc.) — list every existing component that could relate to this task.
2. **Read the relevant SCSS file** in `src/styles/components/` for the component you're touching or creating.
3. **Find the nearest existing analog** — the component whose patterns you will replicate. Name it explicitly.
4. **Check `src/config/design-tokens.ts`** for any tokens relevant to this task.
5. **Read `.claude/rules/`** for any domain-specific rules loaded for this file type.

**Format your pre-flight report as:**
> Analog: [component name + file path]
> Related SCSS: [file path]  
> Relevant tokens: [list]
> Plan: [what you will do, where, and why it fits the system]

**Do NOT proceed to implementation until I respond with "go" or "looks good".**

---

# Void Energy UI — Migration Context

This codebase is being migrated to the **Void Energy UI** system: a design system built on Svelte 5 (Runes), Astro, TypeScript, and a hybrid styling architecture where **SCSS owns visual physics plus token-driven primitive-internal geometry** and **Tailwind owns page composition and consumer-side geometry**. Every visual value flows through semantic tokens. Every component adapts to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark). Migration is incremental — one task per session, preserving existing behavior.

Token dictionary and SCSS toolkit references are loaded on-demand via `.claude/rules/` when editing relevant files.

---

## 1. THE 5 LAWS (Hard Constraints)

### Law 1 — Hybrid Protocol
Tailwind = page composition and consumer-side geometry. SCSS = visual physics/materials plus approved primitive-internal geometry. Do not use SCSS for arbitrary page/layout composition.

```
CORRECT:  class="flex flex-col gap-md p-lg"       (composition in Tailwind)
CORRECT:  .card { @include surface-raised; }         (physics in SCSS)
CORRECT:  button { min-height: var(--control-height); display: inline-flex; }
WRONG:    .page-section { display: grid; gap: 24px; }   (page layout in SCSS)
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
CORRECT:  $effect(() => { setupSomething(); });  // Replaces onMount
CORRECT:  $effect(() => {                    // Cleanup replaces onDestroy
            const id = layerStack.push(dismiss);
            return () => layerStack.remove(id);
          });
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
npm run scan           Advisory scan for common raw pixel-value misses in SCSS/Svelte
npm run check:registry Verify component-registry.json is in sync with source files
npm run test           Run unit tests (vitest — jsdom, no browser needed)
npm run format         Prettier format all files
npm run preview        Preview production build locally
```

## 2A. AI-BUILD ORDER

When the task is page or app composition rather than design-system work, read in this order:

1. `src/config/component-registry.json`
2. `AI-PLAYBOOK.md`
3. `COMPOSITION-RECIPES.md`
4. nearest local analog in `src/pages/`, `src/layouts/`, or app-level `src/components/`
5. relevant `.claude/rules/*.md`

Default to editing consumer files. Do not edit `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the user explicitly asks for system-level work.

---

## 3. FILE STRUCTURE

```
src/
  actions/          Svelte actions (morph, tooltip, kinetic, navlink)
  adapters/         VoidEngine singleton (theme/physics runtime state)
  components/
    core/           AtmosphereScope, ThemeScript (Astro scaffolding)
    icons/          Interactive animated SVG icons (icon-[name] namespace)
    modals/         Modal fragments (Alert, Confirm, CommandPalette, Settings, Shortcuts, Themes)
    ui/             Reusable UI components (Button, Toggle, SearchField, Modal...)
    ui-library/     Showcase/demo pages for the component library
    *.svelte        App-level components (Modal, Toast, Navigation, index, CoNexus, Components)
  config/           Design tokens (SSOT), modal registry, font registry, constants
  layouts/          Astro layouts
  lib/              Modal manager, layer stack, transitions, tooltip logic, void-boot, password-validation, shortcut-registry, timing
  pages/            Astro pages
  service/          Server-side API service layer (Anthropic, etc.)
  stores/           Reactive state (toast, user)
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
  @include surface-raised;

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

### Empty States
Plain text, muted color, centered, generous padding. No italic — italic is reserved for prose semantics.
```html
<p class="text-mute text-center p-lg">No items yet</p>
```

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
CORRECT:  .select { @include surface-raised; }           (SCSS physics on native element)
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
.setAtmosphere(name)                Switch theme (persists, clears temp stack)
.setPreferences(prefs)              Update user config (density, scale, fonts)
.registerTheme(id, partialDef)      Register runtime theme (Safety Merge, persists to cache)
.unregisterTheme(id)                Remove a custom theme (clears cache, falls back if active)
.registerEphemeralTheme(id, def)    Register scope-owned theme (no localStorage, no console)
.unregisterEphemeralTheme(id)       Remove a previously registered ephemeral theme
.applyTemporaryTheme(id, label)     One-shot temporary theme (respects adaptAtmosphere)
.restoreUserTheme()                 Pop the top temporary theme (LIFO)
.pushTemporaryTheme(id, label)      Scoped temporary theme; returns handle (number | null)
.updateTemporaryTheme(h, id, label) Update an existing scoped handle in place
.releaseTemporaryTheme(handle)      Release a specific scoped handle (idempotent, stack-safe)
.loadExternalTheme(url)             Async: fetch + validate + register remote theme JSON (returns VoidResult)
.availableAtmospheres               All registered theme IDs
.builtInAtmospheres                 Static (non-runtime) theme IDs
.customAtmospheres                  User-registered themes (excludes built-in and ephemeral)
.hasTemporaryTheme                  Whether any temporary theme is active (getter)
.temporaryThemeInfo                 Top-of-stack label + ID + returnTo (getter)
```

**Temporary theme usage patterns:**
- **Scoped** (AtmosphereScope): Use `pushTemporaryTheme` / `releaseTemporaryTheme` with handles. The stack ensures nested scopes restore correctly on unmount.
- **Imperative** (toggle buttons, theme switchers): Call `restoreUserTheme()` before `applyTemporaryTheme()` to ensure only one preview is active. Without the restore, repeated calls stack entries and the user must click "Return to..." multiple times in the Themes modal.

```
CORRECT:  voidEngine.restoreUserTheme();                          // clear any active preview
          voidEngine.applyTemporaryTheme('crimson', 'Blood Moon'); // push the new one
WRONG:    voidEngine.applyTemporaryTheme('crimson', 'Blood Moon'); // stacks on top of previous!
```

### Modal (`import { modal } from '@lib/modal-manager.svelte'`)
```
.open(key, props, size?)            Open by registry key. Size: 'sm' | 'md' | 'lg'
.close()                            Close active modal (restores focus)
.confirm(title, body, { onConfirm, onCancel?, cost? })   // body = plain text only
.alert(title, body)                                      // body = plain text only
// For trusted internal HTML: modal.open(key, { bodyHtml: '...' }, size)
// bodyHtml is rendered unsanitized — caller must sanitize. Never use with user input.
.settings(options?)
.themes()
.shortcuts()                        Open keyboard shortcuts modal
.palette()                          Open command palette modal
Registry: src/config/modal-registry.ts (add new fragments here)
```

### Toast (`import { toast } from '@stores/toast.svelte'`)
```
.show(message, type?, duration?, action?)  Types: 'info' | 'success' | 'error' | 'warning'
.undo(message, callback, duration?)        Success toast with Undo action button (6s default)
.close(id)                                 Remove specific toast
.clearAll()                                Remove all toasts
.loading(message)                          Returns controller: { update, success, error, warning, close }
.promise(promise, { loading, success, error })
.pause(id)                                 Pause auto-dismiss timer (called on hover and focus)
.resume(id)                                Resume auto-dismiss timer (called on mouse/focus leave)
```

### Layer Stack (`import { layerStack } from '@lib/layer-stack.svelte'`)
```
.push(dismiss)                      Push a dismissible layer. Returns layer ID.
.remove(id)                         Remove a layer by ID (safe for stale IDs).
.hasLayers                          Whether any layers are on the stack (getter).
```
Escape pops the topmost layer (LIFO). Registered layers: Modal, Dropdown, Sidebar.
Element-scoped handlers (EditField, EditTextarea, GenerateField) use `e.preventDefault()`
which the stack respects via `defaultPrevented` check — no double-dismissal.

### Shortcut Registry (`import { shortcutRegistry } from '@lib/shortcut-registry.svelte'`)
```
.register(entry)                    Register { key, label, group, action }
.unregister(key, modifier?)         Remove by key (+ optional modifier)
.entries                            All registered shortcuts ($state array)
.grouped                            Entries grouped by group field (getter)
.handle(event)                      Process KeyboardEvent (internal, document listener)
```

### User (`import { user } from '@stores/user.svelte'`)
```
.current                            Current VoidUser object or null (reactive)
.loading                            True during async refresh ($state)
.isAuthenticated                    Derived: user !== null
.isAdmin / .isCreator / .isPlayer / .isGuest    Derived role flags
.approvedTester                     Derived from user.approved_tester
.developerMode                      Local preference toggle ($state)
.login(userData)                    Validate, set, and persist user data (returns VoidResult)
.logout()                           Clear user + storage + reset flags
.update(partial)                    Validate merged user state + persist
.refresh(fetcher)                   Two-phase: async verify cached user via VoidResult fetcher
.toggleDeveloperMode()              Toggle dev mode flag
```

### Transitions (`import { emerge, dissolve, materialize, dematerialize, implode, live } from '@lib/transitions.svelte'`)
```
in:emerge          Layout-aware entry (height + blur + scale + Y). For elements in document flow.
out:dissolve       Layout-aware exit (height collapse + blur). For elements in document flow.
in:materialize     Visual-only entry (blur + scale + Y). For positioned/overlaid elements.
out:dematerialize  Visual-only exit (upward float + blur). For positioned/overlaid elements.
out:implode        Horizontal collapse with dissolution.
animate:live       FLIP list reflow animation.
```

### Actions
```
import { morph } from '@actions/morph'          use:morph={{ width, height, threshold }}
import { tooltip } from '@actions/tooltip'      use:tooltip={{ content, placement }}
import { navlink } from '@actions/navlink'      use:navlink (no options — click sets loading state)
import { kinetic } from '@actions/kinetic'      use:kinetic={{ text, mode, speed, charSpeed }}
import { narrative, isOneShotEffect } from '@actions/narrative'  use:narrative={{ effect, enabled, onComplete }}
import { draggable, dropTarget, reorderByDrop } from '@actions/drag'
  use:draggable={{ id, data, group, axis, handle, disabled, onDragStart, onDragMove, onDragEnd }}
  use:dropTarget={{ id, group, mode, axis, accepts, onDragEnter, onDragLeave, onDrop, disabled }}
```

### Path Aliases (tsconfig.json)
```
@actions/*  @adapters/*  @components/*  @config/*  @lib/*  @service/*  @stores/*  @styles/*
```

---

## 7. DOM CONTRACT

The `<html>` element carries the runtime state:
```
data-atmosphere="void"      Active theme ID
data-physics="glass"        Active physics preset (glass | flat | retro)
data-mode="dark"            Active color mode (light | dark)
data-auth                   Present when any user is authenticated, including Guest role (set by UserScript)
```

Physics constraint rules (auto-enforced):
- `glass` requires `dark` mode (glows need darkness)
- `retro` requires `dark` mode (CRT phosphor effect)
- `flat` works with both modes

Auth visibility utilities (FOUC-safe, set before first paint):
- `.auth-only` — visible when any authenticated user (including Guest role) sets `data-auth`
- `.public-only` — visible only when unauthenticated (`data-auth` absent)

---

## 8. MIGRATION PROTOCOL

1. **SCOPE:** Do exactly what is asked. One component, one file, one feature at a time.
2. **READ FIRST:** Before writing code, read:
   - The target file
   - All files in the same directory
   - The corresponding SCSS file in `src/styles/components/`
   - At least 2 existing components as pattern references
   Report what you found before proceeding.
3. **PRESERVE:** Keep existing behavior. Migration changes HOW code is written, not WHAT it does.
4. **MATCH PATTERNS:** Find the nearest existing Void Energy component/style and replicate its patterns.
5. **NO INVENTIONS:** Do not create new abstractions, mixins, utilities, or architecture. Use only what exists in the system.
6. **INCREMENTAL:** If a task feels large, propose breaking it into steps. Ask before proceeding.
7. **VERIFY:** After migration, the component must work correctly across all 3 physics presets (glass, flat, retro) and both modes (light, dark).

---

## 9. GOTCHAS

- **Generated files are read-only.** Never edit `src/styles/config/_generated-themes.scss`, `src/config/void-registry.json`, or `src/config/void-physics.json`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.
- **`npm run scan` is advisory.** It currently scans `.scss` and `.svelte` files for common raw pixel-value misses. Treat it as a helper, not a complete Token Law gate.
- **Glass and retro require dark mode.** VoidEngine auto-corrects invalid physics+mode combos. Do not manually set light mode with glass or retro physics.
- **SCSS import path:** Always `@use '../abstracts' as *;` — never import individual partial files.
- **Tailwind v4 token bridge:** the system runs on Tailwind CSS v4 via `@tailwindcss/vite`. There is no `tailwind.config.mjs` — the bridge file is [src/styles/tailwind-theme.css](src/styles/tailwind-theme.css), which uses `@theme`, `@utility`, and `@layer` directives to wire CSS variables (from `design-tokens.ts` via SCSS) into Tailwind utilities. Add semantic design values to `design-tokens.ts` and regenerate; only touch `tailwind-theme.css` when changing the framework bridge itself (namespace resets, utility overrides, layer order).
- **Tailwind v4 cascade layers.** `src/styles/global.scss` and `src/styles/tailwind-theme.css` both declare the same layer order: `void-scss, properties, theme, base, components, utilities, void-overrides`. `void-scss` (lowest) holds all Void Energy SCSS; `void-overrides` (highest) holds a small set of rules that must defeat v4's hardcoded static utilities (bare `border` family hardcoded 1px, v4's built-in `.container` with breakpoint widths). Do not reorder these layers, and do not put arbitrary SCSS into `void-overrides` — it is reserved for true v4-vs-system conflicts.
- **v4 namespace modes matter.** If a token name already exists on `:root` (set by SCSS or atmosphere CSS), register it in `tailwind-theme.css` under `@theme reference` — never `@theme inline`, which creates a self-reference cycle that invalidates the value. Forwarders (different names) go in `@theme inline`. Literal values go in plain `@theme`. See the comments in `tailwind-theme.css` for per-family assignments.
- **TypeScript stance:** The repo is type-checked but not a strict-mode migration target. Avoid easy `any`; do not invent elaborate type machinery without payoff.
- **Shared type placement:** If a type is reused across files, it belongs in `src/types/` as an ambient global declaration. Do not import it into app code. Keep file-local types unexported inside the implementation file.
- **Radius tokens in SCSS:** Default to `var(--radius-base)` for border-radius — it adapts per physics (8px glass, 8px flat, 0 retro). Use `var(--radius-full)` for pills. The scale tokens (`--radius-sm/md/lg/xl`) are available when you deliberately need a specific size, but all radius tokens are force-zeroed in retro physics.
- **Modal dismiss buttons use `btn-ghost btn-error`** — not plain `btn-ghost`. Closing/canceling is a mildly destructive action; red ghost provides subtle signaling without the weight of a solid `btn-error`.
- **`btn-icon` vs `btn-ghost`:** If a button contains **only an icon** (no text), use `btn-icon` — it provides square hit targets (`var(--control-height)`), centered flex layout, and icon-appropriate hover feedback. `btn-ghost` is for **text-based** secondary actions (Cancel, Dismiss, Skip). Never use `btn-ghost` on an icon-only button.
- **Button typography is sentence case by default** (Phase 0b modernization, 2025-2026 alignment with MD3/shadcn/Linear). Buttons use `font-weight: medium` (500), `letter-spacing: 0.02em`, `text-transform: none`. CTA (`.btn-cta`) retains uppercase as a deliberate "shout." For consumers who need the old uppercase treatment, use `.btn-loud` (uppercase + 0.05em tracking + semibold).
- **Flat physics has no hover lift/scale.** Flat buttons use background tint changes only on hover (12% secondary blend) — no `translateY` or `scale()`. This matches the modern minimal UI pattern (shadcn, Linear). Glass retains lift (-3px) and scale (1.02). Retro has no transitions.
- **Icon-backed actions:** If a labeled action would benefit from an icon, default to `ActionBtn` with a custom interactive icon instead of hand-rolling `<button><Icon />Label</button>`. AI/generation actions should default to `Sparkle` unless a more specific interactive icon already exists.
- **`// void-ignore` annotation:** Some raw values in SCSS are intentional physical necessities (shimmer highlights, readability floors, scrollbar constants). These carry a `// void-ignore` comment and are exempt from Token Law enforcement by `npm run scan`. Do not replace them with tokens — they have been reviewed and confirmed as intentional.
- **Existing docs:** `CHEAT-SHEET.md` (component and action catalog, including narrative effects), `THEME-GUIDE.md` (theme creation), `README.md` (project overview), `CONTRIBUTING.md` (PR process).
- **Never guess patterns.** If you haven't read the analog component and its SCSS, stop and read them first. Inventing patterns that "seem right" is the most common source of system inconsistency.
