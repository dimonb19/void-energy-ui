# [Your Project Name] — Void Energy Migration
<!-- ADAPT: Replace [Your Project Name] with your actual project name -->

This codebase is being migrated to the **Void Energy UI** system. Migration is incremental — one component per session, preserving existing behavior. Both old and new patterns coexist during the transition.

**Style system:** SCSS owns visual physics (surfaces, shadows, blur, animations, state). Tailwind owns geometry (flex, grid, spacing, sizing). Every value flows through semantic tokens. Components adapt to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark).

Token dictionary and SCSS toolkit references are loaded on-demand via `.claude/rules/` when editing relevant files.

---

## 0. LEGACY PATTERNS (Replace With Your Own)

<!-- Fill in this section with YOUR repo's current patterns. -->
<!-- The more specific you are, the better /migrate will work. -->
<!-- Delete the placeholder examples and write your actual patterns. -->

### Current Component Pattern
```svelte
<!-- REPLACE: Paste a representative example of how your components look today -->
<script lang="ts">
  export let value: string;        // or $props() if already Svelte 5
  export let disabled = false;

  import { onMount } from 'svelte';
  import { myStore } from '../stores';

  onMount(() => { /* setup */ });
</script>

<div class="my-component {disabled ? 'is-disabled' : ''}">
  <!-- Your current markup pattern -->
</div>

<style>
  .my-component {
    /* scoped styles? global classes? utility classes? */
  }
</style>
```

### Current Styling Approach
<!-- REPLACE: Describe how styling works in your repo -->
```
- Where do styles live? (scoped <style>, global CSS, SCSS files, CSS modules?)
- What CSS framework? (Tailwind, Bootstrap, custom utilities, none?)
- How are variables defined? (CSS custom properties, SCSS variables, none?)
- Example variable names: --primary, --bg, $spacing-sm, etc.
- How is responsiveness handled? (media queries, container queries, framework breakpoints?)
```

### Current State Management
<!-- REPLACE: Describe how state works -->
```
- Svelte stores ($writable, $readable)?
- Context API (getContext/setContext)?
- Global state files?
- How is theme/mode handled? (if at all)
```

### Patterns to Recognize as "Legacy" During Migration
<!-- REPLACE: List the specific patterns Claude should find-and-replace -->
```
OLD PATTERN                          → NEW PATTERN
export let prop                      → let { prop }: Props = $props()
$: derived = expr                    → const derived = $derived(expr)
onMount(() => ...)                   → $effect(() => ...)
class="is-active"                    → data-state="active"
class:disabled={cond}                → data-state={cond ? 'disabled' : ''}
padding: 16px                        → padding: var(--space-sm)
color: #ffffff                       → color: var(--text-main)
<style> .component { ... } </style>  → External SCSS in src/styles/components/
import { writable }                  → let value = $state(initial)
```

### File Structure
<!-- REPLACE: Your repo's current structure -->
```
src/
  components/     Where components live
  styles/         Where styles live
  stores/         Where stores live
  lib/            Where utilities live
  ...
```

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

<!-- ADAPT: Replace with your repo's actual npm scripts -->
```
npm run dev            Start dev server
npm run build          Production build (runs build:tokens first)
npm run build:tokens   Regenerate _generated-themes.scss from design-tokens.ts
npm run check          Run svelte-check (TypeScript + Svelte type checking)
npm run scan           Scan for magic pixel violations in SCSS/Svelte
npm run format         Prettier format all files
npm run preview        Preview production build locally
```

---

## 3. FILE STRUCTURE

<!-- ADAPT: Replace with your repo's actual structure after Void Energy is imported -->
```
src/
  actions/          Svelte actions (morph, tooltip, kinetic, navlink)
  adapters/         VoidEngine singleton (theme/physics runtime state)
  components/
    core/           AtmosphereScope, ThemeScript
    icons/          Interactive animated SVG icons (icon-[name] namespace)
    modals/         Modal fragments
    ui/             Reusable UI components
  config/           Design tokens (SSOT), modal registry, font registry, constants
  layouts/          Layouts
  lib/              Modal manager, layer stack, transitions, tooltip logic, void-boot, password-validation, shortcut-registry, timing
  pages/            Pages
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
.loadExternalTheme(url)             Async: fetch + register a remote theme JSON
.availableAtmospheres               All registered theme IDs
.builtInAtmospheres                 Static (non-runtime) theme IDs
.hasTemporaryTheme                  Whether a temporary theme is active (getter)
.temporaryThemeInfo                 Label + ID of the temporary theme (getter)
```

### Modal (`import { modal } from '@lib/modal-manager.svelte'`)
```
.open(key, props, size?)            Open by registry key. Size: 'sm' | 'md' | 'lg'
.close()                            Close active modal (restores focus)
.confirm(title, body, { onConfirm, onCancel?, cost? })
.alert(title, body)
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
import { kinetic } from '@actions/kinetic'      use:kinetic={{ text, mode, speed, cursor }}
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
.unregister(key)                    Remove by key string
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
.login(userData)                    Set user + persist to localStorage
.logout()                           Clear user + storage + reset flags
.update(partial)                    Partial user update + persist
.refresh(fetcher)                   Two-phase: async verify cached user via API
.toggleDeveloperMode()              Toggle dev mode flag
```

### Path Aliases (tsconfig.json)
<!-- ADAPT: Confirm these match your tsconfig after setup -->
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
data-auth                   Present when user is authenticated (set by UserScript)
```

Physics constraint rules (auto-enforced):
- `glass` requires `dark` mode (glows need darkness)
- `retro` requires `dark` mode (CRT phosphor effect)
- `flat` works with both modes

Auth visibility utilities (FOUC-safe, set before first paint):
- `.auth-only` — visible only when `data-auth` is present
- `.guest-only` — visible only when `data-auth` is absent

---

## 7. MIGRATION PROTOCOL

This project uses a **strangler fig** migration pattern: Void Energy components have the clean names, old components are renamed with `-legacy` suffix.

### Naming Convention
```
Modal.svelte              ← NEW (Void Energy version)
Modal-legacy.svelte       ← OLD (original, read-only reference)
/styles/                  ← NEW (Void Energy SCSS)
/styles-legacy/           ← OLD (original utility classes, read-only)
```

### Rules

1. **SCOPE:** One component at a time. Run `/migrate ComponentName` to migrate all consumers of a `-legacy` component.
2. **READ BOTH:** Before migrating, read the NEW component (understand its API) and the `-legacy` component (understand what consumers expect).
3. **CONSUMERS ONLY:** Migration means updating the files that *use* a component — never the component itself. The `-legacy` file is read-only. The Void Energy file is already correct.
4. **PRESERVE BEHAVIOR:** Every consumer must work identically after migration — same UX, same interactions, same data flow.
5. **MAP THE API:** Build an explicit old→new transformation map before touching any files (import paths, prop names, event handlers, slots).
6. **NO INVENTIONS:** Do not create wrapper components, compatibility layers, or new abstractions. Direct migration only.
7. **FLAG BREAKING CHANGES:** If the new component's API is fundamentally different (different semantics, missing props), report it and ask before proceeding.
8. **COEXISTENCE:** Unmigrated consumers still use `-legacy` files. Do not remove `-legacy` files until zero consumers remain. Do not break unmigrated code.
9. **INCREMENTAL:** If a component has 20+ consumers, propose batching (e.g., 5 per session). Ask before proceeding.
10. **CLEANUP:** After migration, check for remaining `-legacy` references. Report which `-legacy` files are safe to delete.
11. **VERIFY:** After migration, the consumer must work correctly across all 3 physics presets (glass, flat, retro) and both modes (light, dark).

---

## 8. GOTCHAS

<!-- ADAPT: Update file paths if your repo structure differs -->
- **Generated files are read-only.** Never edit `_generated-themes.scss`, `void-registry.json`, or `void-physics.json`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.
- **`npm run scan` enforces Token Law.** It exits non-zero if magic pixel values are found in SCSS/Svelte files.
- **Glass and retro require dark mode.** VoidEngine auto-corrects invalid physics+mode combos. Do not manually set light mode with glass or retro physics.
- **SCSS import path:** Always `@use '../abstracts' as *;` — never import individual partial files.
- **Tailwind config is token-driven.** `tailwind.config.mjs` reads from `design-tokens.ts`. Add new values to design-tokens, not the Tailwind config.
- **Radius tokens in SCSS:** Default to `var(--radius-base)` for border-radius — it adapts per physics (8px glass, 4px flat, 0 retro). Use `var(--radius-full)` for pills. All radius tokens are force-zeroed in retro physics.
- **Modal dismiss buttons use `btn-ghost btn-error`** — not plain `btn-ghost`. Closing/canceling is a mildly destructive action; red ghost provides subtle signaling without the weight of a solid `btn-error`.
- **`btn-icon` vs `btn-ghost`:** If a button contains **only an icon** (no text), use `btn-icon` — it provides square hit targets (`var(--control-height)`), centered flex layout, and icon-appropriate hover feedback. `btn-ghost` is for **text-based** secondary actions (Cancel, Dismiss, Skip). Never use `btn-ghost` on an icon-only button.
- **`// void-ignore` annotation:** Some raw values in SCSS are intentional physical necessities (e.g., shimmer highlights, readability floors). These carry a `// void-ignore` comment and are exempt from Token Law enforcement by `npm run scan`. Do not replace them with tokens.
- **Old styles still work.** During migration, the old style system coexists with Void Energy. Do not remove old CSS variables or utility classes until all components using them are migrated.
