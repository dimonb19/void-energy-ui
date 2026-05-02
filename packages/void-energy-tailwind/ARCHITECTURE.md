# Architecture

How `@void-energy/tailwind` is structured, what lives inside the package, what ships across the `npm install` boundary, and how it composes with the rest of the Void Energy ecosystem.

This is a conceptual reference — for hands-on usage see [README.md](./README.md), [INTEGRATIONS.md](./INTEGRATIONS.md), and [CONFIG.md](./CONFIG.md).

---

## The three layers

Void Energy's value splits cleanly into three layers. `@void-energy/tailwind` **is** L0.

### L0 — The design system brain (this package)

Atmospheres, physics presets, density scaling, mode switching, semantic tokens, material constraints. Implemented as pure CSS custom properties plus a tiny vanilla JS runtime. Zero framework dependency.

**What's in it:** tokens, 4 atmospheres, 3 physics presets, 3 density levels, 2 color modes, a ~1 KB gzipped runtime, a FOUC prevention script, a Tailwind v4 `@theme` bridge.

**What it doesn't have:** components, transitions, view-transition animations, reactive state.

### L1 — The component library (Void Energy UI)

40+ Svelte 5 components that consume L0's decisions and add native transitions, scoped CSS, slot composition, TypeScript constraint enforcement. Deeply Svelte-specific. This is the flagship product — L0 is a subset of L1 expressed as CSS variables.

### L2 — The AI pipeline

`CLAUDE.md`, `component-registry.json`, composition recipes, page archetypes. Turns L1 into "an automated frontend engine." Depends on L1's constraint enforcement.

### The strategic shift

L0 sits **underneath** other component libraries. "shadcn + VE" instead of "shadcn vs VE." Every Tailwind user on every framework becomes a potential VE user. L0 is the gateway to L1.

---

## What ships across the npm boundary

When a consumer runs `npm install @void-energy/tailwind`, only the compiled `dist/` directory reaches their `node_modules/` — not source, not tests, not plans. That's controlled by the `files: ["dist", "README.md"]` entry in `package.json`.

```
node_modules/@void-energy/tailwind/
├── dist/
│   ├── tokens.css                  Foundation variables on :root (spacing, radius, z-index, typography).
│   ├── atmospheres/
│   │   ├── graphite.css            [data-atmosphere='graphite'] — palette + mode declaration.
│   │   ├── terminal.css            [data-atmosphere='terminal']
│   │   ├── meridian.css            [data-atmosphere='meridian']
│   │   └── frost.css               [data-atmosphere='frost']
│   ├── physics/
│   │   ├── glass.css               [data-physics='glass']       — shadows, blur, motion, radius.
│   │   ├── flat.css                [data-physics='flat']
│   │   └── retro.css               [data-physics='retro']
│   ├── density.css                 [data-density] multipliers (compact/default/comfortable).
│   ├── theme.css                   Tailwind v4 @theme bridge + default imports. Entry point.
│   ├── theme-no-container.css      Same as theme.css without the .container override.
│   ├── atmospheres.json            Manifest: { name: {physics, mode, label} } — importable at build time.
│   ├── runtime.{js,cjs,d.ts}       Vanilla runtime — atmosphere / physics / mode / density + manifest hydration.
│   ├── head.{js,cjs,d.ts}          FOUC_SCRIPT string + STORAGE_KEYS — inline into <head>.
│   ├── config.{js,cjs,d.ts}        defineConfig / defineAtmosphere helpers + types for void.config.ts.
│   ├── generator.{js,cjs,d.ts}     Pure (config, builtins) → { css, manifest } core.
│   ├── vite.{js,cjs,d.ts}          Vite plugin — virtual:void-energy/generated.css + /manifest.json, HMR.
│   └── builtins.json               Resolved built-in atmosphere data consumed by the plugin & CLI.
├── bin/
│   └── void-energy.js              CLI shebang — `void-energy build [--watch]`.
└── package.json
```

**Public exports (package.json `exports` map):**
- `./theme.css` — default Tailwind v4 bridge (imports tokens + frost + glass + density).
- `./theme-no-container.css` — variant without `.container` override.
- `./tokens.css`, `./density.css` — granular imports.
- `./participation.css` — wrapper-style attribute API (`data-ve-surface`, `data-ve-content`, `data-ve-emphasis`).
- `./atmospheres/*`, `./physics/*` — granular imports.
- `./atmospheres.json` — build-time manifest of the four built-ins.
- `./builtins.json` — resolved token/base data consumed internally by the generator (exposed for custom build integrations).
- `./runtime` — ESM + CJS + d.ts.
- `./head` — FOUC script + storage keys.
- `./config` — `defineConfig`, `defineAtmosphere`, and the config type surface.
- `./generator` — shared `generate()` function used by the plugin and CLI.
- `./vite` — the `voidEnergy()` Vite plugin.
- `bin: void-energy` — CLI mapped to `bin/void-energy.js`.

`sideEffects: ["*.css"]` marks CSS files as bundler side-effects so tree-shaking can't strip them; JS entries are side-effect-free.

---

## How the cascade works

Every surface in a VE app reads its material from three layers of CSS variables, stacked on top of each other:

```
:root                             ← tokens.css        (foundation — spacing, radius, typography)
[data-atmosphere='frost']         ← atmospheres/frost (palette — colors, --energy-primary, --bg-canvas)
[data-physics='glass']            ← physics/glass     (geometry — shadows, blur, motion, radius-base)
[data-density='default']          ← density.css       (multiplier — scales spacing via calc())
```

The root HTML element carries all four data attributes:

```html
<html
  data-atmosphere="frost"
  data-physics="glass"
  data-mode="dark"
  data-density="default"
>
```

Switching any attribute triggers a full cascade swap. There is **no runtime state mutation** — the runtime just sets attributes and persists them to `localStorage`. All visual change happens via CSS variable rebinding, which is essentially free (browsers re-resolve `var()` references in one paint).

This also means atmosphere switching works with SSR, static sites, and server-rendered HTML: the FOUC script pins the attributes before paint, then the runtime takes over for subsequent switches.

### Physics constraints

The runtime enforces two hard-coded material constraints:

- `glass` physics → forces `mode=dark` (glows need darkness).
- `retro` physics → forces `mode=dark` (CRT phosphor effect).
- `flat` → works with both modes.

Call `setPhysics('glass')` while `mode=light` and the runtime silently flips `mode=dark` too. Same for atmosphere selection: `setAtmosphere('terminal')` cascades `physics=retro, mode=dark` because terminal's built-in pairing declares those.

### The shadow split (D-L0.2)

Atmospheres own shadow **color**. Physics own shadow **geometry** (offset, blur, spread, motion curves). A `--shadow-float` like `0 6px 20px -4px var(--bg-canvas-tint)` lets 4 atmospheres × 3 physics × 3 shadow tiers resolve to 36 var() combinations at paint time — zero precomputation, fully composable.

---

## The Tailwind v4 bridge

Tailwind v4 has no JS preset config. A "preset" is a CSS file that uses `@theme`, `@utility`, and `@layer` directives. `dist/theme.css` is that file.

### Three `@theme` modes

| Mode | When to use | What it does |
|---|---|---|
| `@theme inline` | **Forwarder** — L0 token name differs from underlying variable. Example: `--spacing-md: var(--space-md)` → Tailwind emits `.gap-md { gap: var(--space-md) }`. | Tailwind inlines the variable reference in utility class output. |
| `@theme reference` | **Self-named** — L0 token name matches the underlying variable (atmosphere/physics CSS sets the real value). Example: `--radius-md: 8px` as placeholder; `physics/glass.css` overrides. | Tailwind generates utilities that reference the variable but does NOT re-emit the variable on `:root` — avoids the self-reference cycle that would invalidate the atmosphere's real value. |
| Plain `@theme` | **Literal-only** — no underlying variable, just a static value used to drive utility generation. | Tailwind emits the variable on `:root` and generates utilities. |

Phase 0a discovered these modes the hard way. Pick the wrong one and you either get an orphan `:root` variable with no utility class, or a self-referencing cycle that resolves to `unset`.

### Layer order

Both `theme.css` and L1's `global.scss` declare:

```css
@layer void-scss, properties, theme, base, components, utilities, void-overrides;
```

- `void-scss` (lowest) — reserved for SCSS consumers (L1 and anyone who mirrors the pattern); empty in L0's own CSS.
- `void-overrides` (highest) — defeats v4 utilities that are static/hardcoded and can't be overridden via `@utility` (which only APPENDS to existing utilities). Used for the bare `border` family's hardcoded 1px, the hardcoded `.container` widths. Do not add arbitrary SCSS here.

### Footgun fixes that ship in L0

L0 inherits five v4-specific footgun fixes from Phase 0a:

| Footgun | Fix |
|---|---|
| Bare `border` hardcoded 1px | `void-overrides` layer forces `border-width: var(--physics-border-width)`. |
| Bare `rounded` not driven by `--radius-*` | Overridden to resolve through `--radius-base`, which physics sets. |
| `min-h-control` namespace mismatch | Registered under the right v4 namespace so it actually generates. |
| `.container` shadowed by v4's built-in | Overridden to VE-scaled max-widths. Consumers who don't want this import `theme-no-container.css` instead. |
| `max-width > spacing > container` fallback chain | Handled via explicit registration order. |

---

## The runtime

`dist/runtime.js` (~1 KB gzipped). SSR-safe — no top-level `document`/`localStorage` access, every setter no-ops outside the browser.

### Public surface

| Function | Signature | What it does |
|---|---|---|
| `setAtmosphere` | `(name: string) => void` | Cascades the atmosphere's default physics + mode. Runtime-registered atmospheres honor the overrides passed at registration. |
| `setPhysics` | `(p: 'glass'\|'flat'\|'retro') => void` | Sets `data-physics`. `glass` and `retro` force `mode=dark`. |
| `setMode` | `(m: 'light'\|'dark'\|'auto') => void` | `auto` resolves via `prefers-color-scheme`; persists raw `'auto'`. |
| `setDensity` | `(d: 'compact'\|'default'\|'comfortable') => void` | Sets `data-density`. Multipliers: 0.75, 1, 1.25. |
| `init` | `({ manifest?, atmosphere?, physics?, mode?, density? }?) => void` | Ingests a generator-emitted manifest when provided, then restores state from `localStorage`. Default chain: storage > `manifest.defaults` > options > L0 fallback. |
| `getAtmospheres` | `() => AtmosphereEntry[]` | Full directory as an array with `source: 'builtin'\|'config'\|'runtime'` tags. Runtime wins over config wins over builtin on name collision. |
| `getAtmosphereBySource` | `(source) => AtmosphereEntry[]` | Filter the directory; the X-button discriminator lives here. |
| `registerAtmosphere` / `unregisterAtmosphere` | `(name, def) => void` / `(name) => void` | Runtime-add / remove. Emits a scoped `<style id="ve-custom-atmospheres">`. Persists to `localStorage['ve-custom-atmospheres']` so the FOUC script re-injects before first paint. |
| `getCustomAtmospheres` | `() => string[]` | Names of currently-registered runtime atmospheres. |
| `getState` / `subscribe` | `() => VoidState` / `(listener) => unsubscribe` | Snapshot + notification API. `subscribe` batches the internal setters of `setAtmosphere` / `init` into a single notification. |
| `STORAGE_KEYS` | `{atmosphere, physics, mode, density, customAtmospheres}` | The five `localStorage` keys (`ve-*`). |
| `MANIFEST_SCHEMA_VERSION` | `1` | Negotiated against `manifest.schemaVersion`; mismatches log one error and fall back to built-ins. |

### Persistence model

The runtime writes to `localStorage` under the `ve-` prefix. Every setter is try/caught so incognito Safari, quota-exceeded, and SSR environments silently no-op. Module-global state (listeners, custom atmospheres, manifest) is only mutated in the browser — SSR servers never leak per-request state across requests.

### FOUC script

`dist/head.js` exports `FOUC_SCRIPT` as a string literal. The consumer injects it inline in `<head>` **before** any stylesheet link. It reads `localStorage`, sets the four `data-*` attributes on `<html>`, and returns — total cost ~300 bytes, runs synchronously before first paint, and `try/catch`-wraps everything so it can't block rendering if storage is inaccessible.

See [INTEGRATIONS.md](./INTEGRATIONS.md) for framework-specific injection recipes (Next.js, Nuxt, Astro, SvelteKit, Vite, plain HTML).

---

## What's framework-agnostic vs Svelte-only

### Framework-agnostic (L0's scope)

Spacing, color palette, physics presets, typography clamps, breakpoints, z-index, radius, shadows, ambient tokens, density, atmosphere cascade, physics constraints, FOUC handling.

### Stays Svelte-only (L1's job)

VoidEngine reactive state, view transitions on theme switch, font preloading by atmosphere, user config persistence UI, the temporary-theme stack used by modals and previews, all 40+ components, kinetic typography, ambient layers, AI pipeline composition.

---

## Relationship to L1

L0 and L1 share a single source of truth: `src/config/design-tokens.ts` and `src/config/atmospheres.ts` in the monorepo root. A single generator (`scripts/generate-tokens.ts`) emits both outputs:

- `npm run build:tokens -- --target=l1` → L1's `_generated-themes.scss` (SCSS-aware, consumed by Svelte components).
- `npm run build:tokens -- --target=l0` → L0's `dist/*.css` (flat CSS, consumed by any framework).

A parity snapshot test (Session 1) catches drift between the two outputs. Full L1↔L0 unification — L1 importing L0 as a workspace package — is deferred to the monorepo restructure.

The practical consequence: when the design team changes a token value in `design-tokens.ts`, both L0 consumers and L1 consumers get the update in lockstep. No double-maintenance.

---

## Upgrade path

```
React dev installs L0        →  gets atmosphere switching in their existing app
     ↓
Loves the atmosphere system  →  starts next project
     ↓
Wants the full experience    →  scaffolds with create-void-energy (Svelte)
     ↓
Builds on L1                 →  gets 40+ components, transitions, ambient layers
     ↓
Opts into premium packages   →  kinetic typography, Rive CTA buttons, DGRS
```

L0 deliberately ships no components, which creates pull toward L1. The transition isn't a rewrite — it's an expansion.

---

## Current phase status

- **Sessions 1–7:** tokens + 4 atmospheres + 3 physics + density + vanilla runtime + FOUC script + Tailwind v4 bridge + runtime `registerAtmosphere` for end-user-added themes.
- **Sessions 8–9:** Consumer Config Layer — `void.config.ts`, shared generator, Vite plugin with virtual modules + HMR, `void-energy` CLI with `--watch`, `@font-face` emission with dedupe + format inference, font assignments merged into `--font-heading` / `--font-body` / `--font-mono`, provenance tiers (`builtin` / `config` / `runtime`) surfaced through `getAtmospheres()` / `getAtmosphereBySource()`, `init({ manifest })` with schema-version enforcement. See [CONFIG.md](./CONFIG.md).

Phase 1 is complete. L0 is a publishable package: consumers can ship their own branded atmospheres + fonts as first-class defaults, runtime-register end-user themes on top, and differentiate the two tiers in any framework's theme-picker UI.
