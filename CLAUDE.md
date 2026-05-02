# Void Energy UI — Monorepo Root

This file is loaded for every Claude Code session in this repo. It defines the universal rules. Specialized rules live in nearer `CLAUDE.md` files (walked up automatically) and in `.claude/rules/*.md` (loaded on file-type match).

---

## 0. Before any task

1. Read `src/config/component-registry.json` — find existing primitives before inventing.
2. Read the nearest `CLAUDE.md` for your CWD:
   - editing `src/` → also read [src/CLAUDE.md](src/CLAUDE.md) (strict library rules)
   - editing `src/pages/` or `src/components/app/` → also read [src/pages/CLAUDE.md](src/pages/CLAUDE.md) (consumer rules)
   - editing `packages/<name>/` → also read `packages/<name>/CLAUDE.md` (per-package rules)
3. Let `.claude/rules/*.md` files load on path match — they hold the toolkit references and per-domain checklists.

---

## 1. THE 5 LAWS (hard constraints, true everywhere)

### Law 1 — Hybrid Protocol
Tailwind = page composition and consumer-side geometry. SCSS = visual physics/materials plus approved primitive-internal geometry. Do not use SCSS for arbitrary page/layout composition.

```
CORRECT:  class="flex flex-col gap-md p-lg"            (composition in Tailwind)
CORRECT:  .card { @include surface-raised; }           (physics in SCSS)
CORRECT:  button { min-height: var(--control-height); display: inline-flex; }
WRONG:    .page-section { display: grid; gap: 24px; }  (page layout in SCSS)
WRONG:    class="shadow-lg bg-blue-500"                (physics in Tailwind)
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
Svelte 5 runes only. No legacy patterns. Full rule: [.claude/rules/svelte-runes.md](.claude/rules/svelte-runes.md).

```
CORRECT:  let { value = $bindable() }: Props = $props();
CORRECT:  let count = $state(0);
CORRECT:  const doubled = $derived(value * 2);
CORRECT:  $effect(() => { ... });            // replaces onMount
CORRECT:  $effect(() => { return () => cleanup(); });   // replaces onDestroy
WRONG:    export let value;
WRONG:    $: reactive = value * 2;
WRONG:    onMount(() => {}); onDestroy(() => {});
WRONG:    import { writable } from 'svelte/store';
```

### Law 4 — State Protocol
State visible to CSS via data attributes or ARIA, not utility classes. Full rule: [.claude/rules/state-protocol.md](.claude/rules/state-protocol.md).

```
CORRECT:  data-state="active"   aria-pressed="true"   aria-checked="true"
WRONG:    class="is-active"     class="open"           class="selected"

SCSS:     @include when-state('active') { ... }
```

### Law 5 — Spacing Gravity
Default to generous spacing. When uncertain, go ONE size up, never down.
Governs surface padding and layout gaps (`p-*`, `gap-*`). Control sizing and typography follow Modern-Chrome Defaults (see [src/CLAUDE.md](src/CLAUDE.md#gotchas)).

```
FLOOR:    Floating surface → p-lg gap-lg.    Sunk surface → p-md gap-md.
NEVER:    gap-sm on a card.  gap-xs between groups.  p-sm on a floating surface.
RULE:     Generous whitespace > cramped density. If it looks tight, go up a size.
```

---

## 2. Workspace Map (L0 / L1 / L2 layer architecture)

```
void-energy-ui/                              <- monorepo root
+-- src/                                       L1 — full Svelte 5 design system (this is "the library")
|   +-- components/{ui,icons,core}/            shipped primitives — read-only outside src/CLAUDE.md tasks
|   +-- components/app/                        app-level screens (consumer-side)
|   +-- pages/                                 Astro routes (consumer-side)
|   +-- styles/                                SCSS engine (mixins, themes, components)
|   +-- config/design-tokens.ts                SSOT for tokens — generators read this
|   +-- config/component-registry.json         SSOT for components — enforced by check:registry
+-- packages/
|   +-- void-energy-tailwind/                  L0 — framework-agnostic Tailwind preset (tokens + runtime)
|   +-- ambient-layers/                        L1 premium — ambient effects engine
|   +-- kinetic-text/                          L1 premium — kinetic text + narrative engine
|   +-- dgrs/                                  DGRS-org carve-out (premium-adjacent)
+-- .claude/                                   L2 — AI infrastructure (rules, agents, commands, hooks)
+-- AI-PLAYBOOK.md  COMPOSITION-RECIPES.md  CHEAT-SHEET.md  SYSTEM-PROMPT.md
```

- **L0** = framework-agnostic preset. Pure CSS + vanilla JS. No Svelte. Consumers in React/Vue/HTML take this.
- **L1** = full Svelte 5 system in `src/` plus premium packages. Constraints enforced by Svelte primitives.
- **L2** = the AI workflow on top: `.claude/` infra, `CLAUDE.md` files, registry, catalogs.

---

## 3. Native-First Protocol

Components are thin wrappers around **native HTML elements** — they add layout, labeling, and physics styling, never behavior reimplementations. The browser owns interaction, accessibility, and form integration; SCSS owns the material. Full rule: [.claude/rules/native-first.md](.claude/rules/native-first.md).

- **Always native:** `<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`, `<a>`, `<form>`.
- **Custom only when** no native element exists (combobox, multi-thumb slider, virtualized table, command palette, floating panels).
- **Reference:** `Selector.svelte` — wraps a native `<select>` with label association and SCSS physics. Zero custom dropdown JS.

---

## 4. State Management & Singletons (import — never re-instantiate)

Full API surface (methods, props, transitions, actions) in [CHEAT-SHEET.md](CHEAT-SHEET.md). Singleton imports:

```ts
import { voidEngine } from '@adapters/void-engine.svelte';        // theme/physics/atmosphere runtime
import { modal } from '@lib/modal-manager.svelte';                // open/close modal fragments
import { toast } from '@stores/toast.svelte';                     // info/success/error/warning + loading + promise
import { layerStack } from '@lib/layer-stack.svelte';             // dismissible-layer LIFO (Esc, Back gesture)
import { shortcutRegistry } from '@lib/shortcut-registry.svelte'; // keyboard shortcuts
import { user } from '@stores/user.svelte';                       // auth/user state
```

Transitions live in `@lib/transitions.svelte` (`emerge`, `dissolve`, `materialize`, `dematerialize`, `implode`, `live`). Actions live in `@actions/*` (`morph`, `tooltip`, `navlink`, `kinetic`, `narrative`, `draggable`/`dropTarget`).

Path aliases (`tsconfig.json`): `@actions/*  @adapters/*  @components/*  @config/*  @lib/*  @service/*  @stores/*  @styles/*`

---

## 5. DOM Contract

The `<html>` element carries the runtime state:
```
data-atmosphere="void"      Active theme ID
data-physics="glass"        glass | flat | retro
data-mode="dark"            light | dark
data-auth                   Present when any user is authenticated (Guest role included)
```

Physics constraints (auto-enforced by VoidEngine):
- `glass` requires `dark` mode (glows need darkness)
- `retro` requires `dark` mode (CRT phosphor effect)
- `flat` works with both modes

Auth visibility utilities (FOUC-safe, set before first paint): `.auth-only`, `.public-only`.

Physics participation contract (CSS-only opt-in for foreign markup):
```
data-ve-surface   raised | sunk | floating | flat     Apply VE surface physics
data-ve-content   primary | secondary | muted          Set color (cascades to descendants)
data-ve-emphasis  strong | subtle | none               Modulate border/shadow (requires data-ve-surface)
```
Wrapper-only contract — surface treatment does **not** propagate. Source of truth: [src/styles/components/_participation.scss](src/styles/components/_participation.scss). L0 ships via `@void-energy/tailwind/participation.css`.

---

## 6. Commands

```
npm run dev            Start dev server (auto-generates tokens, watches changes)
npm run build          Production build (runs build:tokens → astro build)
npm run build:tokens   Regenerate _generated-themes.scss from design-tokens.ts
npm run check          Full check chain: check:registry + svelte-check + lint:design-md + check:design-md + check:skill + check:mcp + test:mcp
npm run scan           Advisory raw-pixel scan (helper, not a complete Token Law gate)
npm run atmosphere-md  Atmosphere markdown CLI (export / import / spec-export / spec-verify)
npm run check:registry Verify component-registry.json is in sync with source files
npm run check:design-md Verify root DESIGN.md is byte-identical to atmosphere-md spec-export output
npm run test           Unit tests (vitest, jsdom)
npm run format         Prettier
```

---

## 7. Universal Gotchas

- **Generated files are read-only.** Never edit `src/styles/config/_generated-themes.scss`, `src/config/void-registry.json`, or `src/config/void-physics.json`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.
- **Two "design.md" formats — do not conflate.** Root `DESIGN.md` is the external Google `@google/design.md` snapshot regenerated by `npm run atmosphere-md -- spec-export --out DESIGN.md`. The `atmosphere-md` round-tripper used by `voidEngine.exportAtmosphereMd` / `importAtmosphereMd` is a different format. Regenerability gated by `npm run check:design-md`.
- **Glass and retro require dark mode.** VoidEngine auto-corrects invalid combos.
- **`// void-ignore` annotation:** intentional raw values in SCSS (shimmer highlights, readability floors, scrollbar constants) carry this comment and are exempt from `npm run scan`. Do not "tokenize" them — they have been reviewed.
- **TypeScript stance:** type-checked, not strict-mode. Avoid easy `any`; do not invent elaborate type machinery without payoff.
- **Shared type placement:** types reused across files belong in `src/types/` as ambient global declarations — do not import. Keep file-local types unexported.

---

## 8. Entry Points

| File | Purpose |
|------|---------|
| [AI-PLAYBOOK.md](AI-PLAYBOOK.md) | High-level AI working order |
| [COMPOSITION-RECIPES.md](COMPOSITION-RECIPES.md) | Page archetypes (dashboard, settings, list/detail) |
| [CHEAT-SHEET.md](CHEAT-SHEET.md) | Component + action + singleton catalog (full API surfaces) |
| [SYSTEM-PROMPT.md](SYSTEM-PROMPT.md) | Tool-agnostic portable spec for non-Claude-Code agents |
| [THEME-GUIDE.md](THEME-GUIDE.md) | Atmosphere authoring guide |
| [src/CLAUDE.md](src/CLAUDE.md) | Strict library rules (loaded when CWD is in `src/`) |
| [src/pages/CLAUDE.md](src/pages/CLAUDE.md) | Consumer composition rules (loaded when CWD is in `src/pages/`) |
| `packages/*/CLAUDE.md` | Per-package rules (loaded when CWD is in a package) |
| [.claude/rules/](.claude/rules/) | 13 path-triggered rule files (auto-loaded on file-type match) |
