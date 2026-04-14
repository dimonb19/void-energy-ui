# Phase 1 — L0: The Framework-Agnostic Tailwind Preset

> Extract Void Energy's design system brain as `@void-energy/tailwind` — a Tailwind CSS v4 preset that brings atmosphere switching, physics presets, density scaling, and semantic tokens to any framework. React, Vue, vanilla HTML — anything that uses Tailwind.

**Status:** Planning (revised 2026-04-14 — Consumer Config Layer added, Sessions 8–9 appended)
**Depends on:** Phase 0 (Tailwind v4 migration) and Phase 0a (v4 footgun fixes) — both complete
**Blocks:** Phase 2 (AI automation references L0 as the universal layer), Phase 3 (monorepo ships L0 as a workspace package)

**2026-04-14 revision scope.** Sessions 1–7 originally treated L0 as "built-in atmospheres + a runtime `registerAtmosphere` escape hatch." A real-world DX audit showed that ships a crap platform: consumers can't replace VE's four themes with their own brand set, can't ship config-file themes as first-class defaults (runtime-registered themes inherently feel like user-added extras with X-to-remove affordances), and can't manage fonts at all. This revision adds a **Consumer Config Layer** — a `void.config.ts` in the consumer's project, a build-time generator (Vite plugin + CLI), three theme provenance tiers (builtin / config / runtime), and config-time font loading via generated `@font-face`. See D-L0.6, D-L0.7, D-L0.8 below and Sessions 8–9 at the bottom of the plan.

---

## Why this exists

Void Energy is currently Svelte-only (~3% of frontend developers). The token system — atmospheres, physics presets, density scaling, semantic colors — is pure CSS custom properties with zero framework dependency. Extracting it as a Tailwind v4 preset turns "VE vs shadcn" into "VE *plus* shadcn." Every Tailwind user across every framework becomes a potential VE user, and L0 is the gateway to L1.

This phase has one twist: Phase 0/0a uncovered several v4-specific traps (namespace mismatches, hardcoded static utilities, layer cascade quirks) that the original Phase 1 draft didn't anticipate. This revision folds those learnings into the implementation plan so L0 ships clean instead of repeating Phase 0a from scratch.

---

## The Layer Architecture

Void Energy's value has three distinct layers:

**L0 — The Design System Brain (this phase)**
Atmosphere definitions, physics presets, density scaling, mode switching, semantic token resolution, material constraints. Pure CSS custom properties + a tiny vanilla JS runtime. Zero framework dependency.

**L1 — The Component Library (existing product)**
40+ Svelte 5 components that implement L0's decisions with native transitions, scoped CSS, slot composition, TypeScript constraint enforcement. Deeply Svelte-specific.

**L2 — The AI Pipeline (Phase 2)**
CLAUDE.md, component-registry.json, composition recipes, page archetypes. Turns L1 from "a good component library" into "an automated frontend engine." Only works on top of L1's constraint enforcement.

**The strategic shift:** L0 sits *underneath* other component libraries. "shadcn + VE" instead of "shadcn vs VE." Every Tailwind user across every framework becomes a potential VE user. L0 is the gateway to L1.

---

## Why This Matters

### 1. VE stops competing with component libraries
Right now VE competes with shadcn, Radix, MUI — and loses on ecosystem size. With L0, VE sits *underneath* those libraries. shadcn + VE. Radix + VE. You're upgrading their design system, not replacing their components. Complementary, not competitive.

### 2. Every Tailwind user is a potential VE user
A Tailwind preset is the most natural distribution channel. Developers already know how to install Tailwind plugins. The adoption path: install, import, use `bg-surface` instead of `bg-gray-800`, and you've got atmosphere switching. Zero learning curve for the first step.

### 3. Existing apps can adopt VE incrementally
A React app with 200 components installs L0, starts using VE tokens in new components, gradually migrates old ones from hardcoded colors to semantic tokens. No big bang. No framework switch.

### 4. AI agents get a universal VE interface
When any AI agent generates Tailwind, it's potentially generating VE-compatible code. `bg-surface`, `text-main`, `shadow-float` are just Tailwind utility classes. No custom CLAUDE.md needed for L0.

### 5. The upgrade path to full VE becomes natural
Developer uses L0 in React. Loves atmosphere switching. Starts a new project — wants the full experience: components, transitions, ambient layers. They scaffold with `create-void-energy` and build in Svelte. L0 is the gateway to L1. L0 deliberately doesn't give you components, which creates pull toward L1.

---

## What Already Exists (Current Architecture)

The token pipeline is already structured for extraction. Brief inventory:

- **`src/config/design-tokens.ts`** — SSOT for spacing, responsive breakpoints, layers, radius, typography, physics presets, ambient tokens.
- **`src/config/atmospheres.ts`** — palette + mode + physics for the four free atmospheres (slate, terminal, meridian, frost) plus the SEMANTIC_DARK / SEMANTIC_LIGHT bases.
- **`scripts/generate-tokens.ts`** — reads `design-tokens.ts` and emits `_generated-themes.scss`, `_fonts.scss`, `font-registry.ts`, `void-registry.json`, `void-physics.json`. The L0 build extends this script with a new `--target=l0` mode that emits CSS instead of SCSS.
- **`src/styles/base/_themes.scss` + `_engine.scss`** — emits `:root` defaults, `[data-physics]`, `[data-atmosphere]`, density scaling. The shadow computation lives here today; Session 2 ports it.
- **`src/adapters/void-engine.svelte.ts`** — Svelte 5 reactive runtime. L0 ships a vanilla equivalent (Session 4) that does the same DOM-attribute writes minus the framework state.
- **Phase 0a's `src/styles/tailwind-theme.css`** — the canonical reference for which token families need `@theme inline` vs `@theme reference`, the void-overrides layer, the namespace resets. L0's `theme.css` is structurally identical, generated from the same SSOT.

### What's framework-agnostic (the L0 surface area)
Spacing, color palette, physics presets, typography clamps, breakpoints, z-index, radius, shadows, ambient tokens, density.

### What stays Svelte-only (L1's job)
VoidEngine reactive state, view transitions on theme switch, font preloading by atmosphere, user config persistence UI, the temporary-theme stack used by modals and previews.

---

## What L0 Delivers

### Package Structure

```
@void-energy/tailwind
├── theme.css               ← @theme blocks: registers VE tokens with Tailwind v4 + utility/void-overrides
├── tokens.css              ← :root foundation tokens (spacing, radius, z-index, typography, density default)
├── atmospheres/
│   ├── slate.css           ← [data-atmosphere="slate"] overrides
│   ├── terminal.css
│   ├── meridian.css
│   └── frost.css
├── physics/
│   ├── glass.css           ← [data-physics="glass"] overrides (geometry; shadow color comes from atmosphere)
│   ├── flat.css
│   └── retro.css
├── density.css             ← [data-density] selectors (compact / default / comfortable)
├── runtime.{js,cjs,d.ts}   ← vanilla JS runtime (~3–4kb, no framework dependency)
├── head.{js,cjs,d.ts}      ← FOUC prevention inline script (exported as a string constant)
├── atmospheres.json        ← built-in metadata: { atmosphere: { physics, mode, label, source: 'builtin' } }
├── config.{js,cjs,d.ts}    ← defineConfig / defineAtmosphere helpers + public schema types
├── generator.{js,cjs,d.ts} ← shared generator core (config → CSS + manifest). Used by vite.ts and cli.ts.
├── vite.{js,cjs,d.ts}      ← Vite plugin entry (virtual modules, HMR, SSR-aware manifest export)
├── bin/void-energy.js      ← CLI entry (mapped via package.json `bin`)
└── README.md
```

**Public exports (package.json `exports` map):** `./theme.css`, `./theme-no-container.css`, `./runtime`, `./head`, `./config`, `./generator`, `./vite`, `./atmospheres.json`. Each JS entry ships ESM + CJS + `.d.ts`. The CLI binary is mapped via `"bin": { "void-energy": "./bin/void-energy.js" }`. Atmospheres, physics, and density stay as `@import`-able CSS paths under their existing folders.

**Key design:** In Tailwind v4, a "preset" is just a CSS file you `@import`. There is no JS preset config. The `theme.css` file uses `@theme` blocks to tell Tailwind which CSS variable names should generate utility classes; the actual runtime values come from `tokens.css` + `atmospheres/*.css` + `physics/*.css`. This is identical to how Phase 0a structures L1's `tailwind-theme.css`.

### Consumer Experience

```bash
npm install @void-energy/tailwind
```

**Minimal path (no custom themes or fonts):**

```css
/* app.css — consumer owns the tailwindcss import */
@import "tailwindcss";
@import "@void-energy/tailwind/theme.css";
```

Two lines. Ships with VE's four built-in atmospheres. Runtime `registerAtmosphere` still available for end-user-added themes.

**Full path (custom atmospheres + fonts, first-class):**

```ts
// vite.config.ts
import { voidEnergy } from '@void-energy/tailwind/vite';
export default { plugins: [voidEnergy()] };
```

```ts
// void.config.ts — project root
import { defineConfig, defineAtmosphere } from '@void-energy/tailwind/config';
export default defineConfig({
  atmospheres: {
    midnight: defineAtmosphere({ physics: 'glass', mode: 'dark', tokens: { /* ... */ } }),
  },
  fonts: [{ family: 'Orbitron', src: '/fonts/Orbitron.woff2', weight: '400 900' }],
  fontAssignments: { heading: 'Orbitron' },
  defaults: { atmosphere: 'midnight' },
});
```

```css
/* app.css */
@import "tailwindcss";
@import "@void-energy/tailwind/theme.css";
@import "virtual:void-energy/generated.css";  /* config atmospheres + @font-face */
```

```ts
// app entry
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';
init({ manifest });
```

Five files, still under two minutes to a working branded app. Their existing components now have access to VE's token-backed utility classes and their own atmospheres render as first-class defaults in any theme-picker UI.

```jsx
// Any framework — React, Vue, Svelte, vanilla
<div className="bg-surface text-main shadow-float rounded p-lg">
  <h2 className="font-heading text-h2">Dashboard</h2>
  <p className="text-mute">Responds to atmosphere switching</p>
</div>
```

```js
// Switch at runtime — vanilla JS
import { setAtmosphere, setPhysics, setDensity, setMode } from '@void-energy/tailwind/runtime';

setAtmosphere('terminal');  // entire app transforms
setPhysics('retro');        // surfaces gain retro material
setDensity('compact');      // spacing tightens globally
setMode('dark');            // explicit mode (or 'auto' for system preference)
```

### L0 vs Full VE Capability Matrix

| Capability | L0 (@void-energy/tailwind) | L1 (Full VE, Svelte) |
|---|---|---|
| Semantic tokens (bg-surface, text-main, etc.) | Yes | Yes |
| Runtime atmosphere switching | Yes | Yes |
| Physics presets (glass/flat/retro) | Yes (CSS-only, instant switch) | Yes (with view transitions) |
| Density scaling | Yes | Yes |
| Light/dark mode + auto | Yes | Yes |
| Physics constraints (glass requires dark) | Yes (runtime enforces) | Yes |
| Config-file atmospheres (ship as first-class defaults, no X button) | Yes (`void.config.ts`) | Yes (`atmospheres.ts`) |
| Replace VE built-in atmospheres with your own brand set | Yes (config `atmospheres: {...}`) | Yes |
| Extend VE built-ins with additional atmospheres | Yes (config `extendAtmospheres`) | Yes |
| Omit specific built-ins while keeping the rest | Yes (config `omitBuiltins: [...]`) | Yes |
| Runtime atmosphere registration (end-user added in-app, X button) | Yes (`registerAtmosphere`) | Yes |
| Custom fonts via config file (build-time `@font-face`) | Yes (config `fonts: [...]`) | Yes |
| AI atmosphere generation | Future (token output) | Yes |
| 40+ production components | No (use your own) | Yes |
| Kinetic typography | No | Yes (premium) |
| Ambient layers | No | Yes (premium) |
| Scoped CSS (zero leak) | No (Tailwind's responsibility) | Yes (Svelte native) |
| View transitions on switch | No (instant) | Yes (animated) |
| Physics-interpolated transitions | No | Yes |
| Font preloading per atmosphere | No (consumer emits `<link rel=preload>` if needed) | Yes (per-atmosphere preload) |

L0 is the 80/20 — 80% of VE's design system value with 0% framework lock-in.

---

## Strategic Decisions Locked

These were debated during the Phase 0a review and locked before this rewrite. They are not up for reconsideration during implementation; if one needs to change, update this section first.

### D-L0.1 — L1↔L0 unification deferred to Phase 3

**Decision:** During Phase 1, L1 keeps emitting its own SCSS-bridged tokens. L0 gets its own pure-CSS pipeline. Both read the same `design-tokens.ts` SSOT.

**Why:** Rewiring L1 to consume L0's CSS files mid-extraction triples the blast radius — every component, every showcase, every regression — for marginal benefit. The SSOT shared via `design-tokens.ts` keeps the two outputs aligned during Phase 1; a snapshot test (Session 1) catches drift. Full unification is a Phase 3 milestone, when the monorepo restructure makes L1 import L0 as a workspace package.

**Risk accepted:** generator drift between L1 and L0 outputs. Mitigated by snapshot tests run on every `build:tokens` invocation.

### D-L0.2 — Shadow port: var()-driven, atmosphere owns shadow color, physics owns geometry

**Decision:** The current SCSS-computed shadows split into two halves. Physics CSS owns the *geometry* (offsets, blur radius, spread). Atmosphere CSS owns the *color* (base + strong shadow tints).

```css
/* physics/glass.css — geometry only */
[data-physics="glass"] {
  --shadow-float: 0 1px 3px var(--shadow-base),
                  0 6px 20px -4px var(--shadow-base-strong);
  --shadow-lift:  0 4px 12px var(--shadow-base),
                  0 12px 36px -8px var(--shadow-base-strong);
  --shadow-sunk:  inset 0 1px 3px var(--shadow-base);
}

/* atmospheres/frost.css — color only */
[data-atmosphere="frost"] {
  --shadow-base: rgba(0, 0, 0, 0.12);
  --shadow-base-strong: rgba(0, 0, 0, 0.15);
}
```

**Why:** the alternative (emit one shadow set per `physics × atmosphere` combination) explodes combinatorially. The split keeps both sides composable: 3 physics × 4 atmospheres × 3 shadow tiers = 36 var() resolutions, all native CSS, zero precomputation. Session 2 ports the SCSS values directly without recomputing.

**Open question, resolved at execution:** does any current atmosphere actually tint its shadow with `energy-primary`? Read `_engine.scss` during Session 2 — if yes, the atmosphere CSS sets the tint; if no, all four atmospheres get the same neutral `rgba(0,0,0,X)` values and the geometry split still pays for itself in maintainability.

### D-L0.3 — Single generator with `--target=l0|l1|all` flag

**Decision:** `scripts/generate-tokens.ts` gets a `--target` flag. No second script. Default behavior (`--target=all`) emits both L0 and L1 outputs. CI uses `all`; local dev can use either.

**Why:** one owner, one SSOT, one place to break. Two scripts means the moment someone forgets to run the other, outputs drift. Single script with a flag is the standard pattern (used by every monorepo's build orchestration).

### D-L0.4 — Consumer imports `tailwindcss`; L0's theme.css does NOT

**Decision:** The first line of L0's `theme.css` is *not* `@import "tailwindcss"`. The consumer imports `tailwindcss` themselves in their app's entry CSS, then imports `@void-energy/tailwind/theme.css`.

**Why:** matches v4 community convention (shadcn/ui v4, official docs). Avoids double-import surprises when consumers follow Tailwind's own getting-started. Also makes L0 trivially compatible with consumers who pin a specific Tailwind version — they bring their own.

**Cost:** the README quick-start has two lines instead of one. Worth it.

### D-L0.5 — Free atmospheres are slate, terminal, meridian, frost

**Decision:** locked from D10 / D23 in `decisions.md`. The four shipped atmospheres cover all 3 physics × both color modes:

| Key | Mode | Physics | Tagline |
|---|---|---|---|
| `slate` | dark | flat | Professional / Clean |
| `terminal` | dark | retro | Hacker / Retro |
| `meridian` | light | flat | Fintech / Brand |
| `frost` | dark | glass | Arctic / Glass |

The 12 DGRS atmospheres (void, onyx, nebula, solar, overgrowth, velvet, crimson, paper, focus, laboratory, playground, plus any future) stay premium-only.

### D-L0.6 — Consumer config via file-based SSOT, generated at build time

**Decision:** Consumers own a `void.config.ts` (or `.js` / `.mjs`) at their project root. A generator (Vite plugin primary, CLI fallback) reads it and emits `void.generated.css` + `void.manifest.json` into an output directory the consumer controls. The generated CSS is imported between `@void-energy/tailwind/theme.css` and the app's own Tailwind-utility-using CSS; the manifest feeds the runtime's atmosphere directory.

**Why:** Runtime `registerAtmosphere` (Session 7) is insufficient for four concrete needs:

1. **First-class defaults.** Consumers shipping a branded app need their atmospheres to render as permanent cards in a theme picker — no X button, no "user extras" framing.
2. **Replacement.** A brand-heavy app (fintech, studio portfolio) often wants to drop VE's four themes entirely and ship only their own. Runtime registration can't suppress built-ins.
3. **Fonts.** Consumers who want Orbitron or Inter shouldn't have to hand-roll `@font-face`, preload tags, and font-family overrides across atmospheres. This belongs in one config block.
4. **Single SSOT mental model.** L1 devs edit `design-tokens.ts` and `atmospheres.ts`; L0 devs should edit `void.config.ts`. Same shape, same ergonomics.

**Cost:** L0 gains a build-time toolchain (Vite plugin, CLI, config schema). Wider maintenance surface. The manifest format becomes a versioned contract between the generator and the runtime. Worth it — without the config layer, L0 ships as "4 themes and a way to register user extras," which is the pattern the user rejected as "some useless platform."

**Risk:** schema drift between the Vite plugin output, the CLI output, and the runtime's `init({ manifest })` consumer. Mitigated by: (a) a single shared generator core that both the plugin and CLI call, (b) a `VOID_MANIFEST_SCHEMA_VERSION` constant exported from the runtime and written into every generated manifest, (c) runtime rejects manifests with mismatched major versions at `init()` time.

### D-L0.7 — Three theme provenance tiers

**Decision:** every atmosphere in the runtime's directory carries a `source: 'builtin' | 'config' | 'runtime'` tag.

- `builtin` — ships with L0 itself (frost, slate, terminal, meridian). Permanent.
- `config` — declared in `void.config.ts`, emitted into `void.generated.css` at build time. Permanent from the end-user's perspective; only the developer can remove it (by editing the config).
- `runtime` — registered via `registerAtmosphere()` in a running app. End-user-added.

**Why:** the mental model from L1 carries over. `builtin` + `config` render as permanent cards in a theme picker — no dismiss affordance, because the user didn't add them and can't remove them without touching source. `runtime` themes get the X button because the user who added them is the one who expects to remove them. This is the distinction between "what the product offers" and "what this specific user has added."

**Runtime API impact:** `getAtmospheres()` returns an array of `{ name, physics, mode, source, label? }` instead of a bare map. Theme-picker UIs filter on `source === 'runtime'` to decide whether to render the X button. Session 7's `getCustomAtmospheres()` keeps its current signature for backwards compatibility but is re-scoped to "runtime-registered only" (matches user intuition).

### D-L0.8 — Fonts are config-time, not runtime

**Decision:** font management happens entirely through `void.config.ts`. The generator emits `@font-face` declarations and optional `:root` overrides for `--font-heading` / `--font-body` / `--font-mono` into `void.generated.css`. The runtime does **not** expose a `registerFont` API.

**Why:** Dynamic font loading at runtime causes FOUT/FOIT, breaks SSR hydration, and conflicts with `font-display` strategies the browser needs to know about up front. It also crosses a network-fetch line that complicates CSP. Fonts are a static shape of the product, not a user preference — build-time is the correct layer. The only "runtime" font behavior a consumer needs is setting `--font-heading` / `--font-body` / `--font-mono`, which already works through plain CSS overrides without any API.

**Config shape (summary — full schema in the Consumer Config Layer section below):**

```ts
fonts: [
  { family: 'Orbitron', src: '/fonts/Orbitron.woff2', weight: '400 900', display: 'swap' },
  { family: 'Inter',    src: [{ url: '/fonts/Inter.woff2', format: 'woff2' }], weight: '100 900' },
],
fontAssignments: {
  heading: 'Orbitron',
  body:    'Inter',
  mono:    'JetBrains Mono',
},
```

**Cost:** consumers with genuine runtime-font-switching needs (white-label SaaS with per-tenant fonts) have to hand-roll `@font-face` injection themselves. Acceptable — that's a 1% use case, and the primitive (append a `<style>` tag to `<head>`) is trivial.

**Out of scope for Phase 1:** per-atmosphere font assignment (L1 supports `atmosphere → font-family` binding; L0 ships a single global assignment in v1). Adding per-atmosphere fonts to the config schema is a post-v1 follow-up if demand emerges.

---

## Consumer Config Layer

The Consumer Config Layer is L0's answer to "how do I ship my own atmospheres and fonts as first-class defaults?" It mirrors L1's `design-tokens.ts` + `atmospheres.ts` pattern, moved to the consumer's side of the npm boundary.

### Mental model

| Concern | L1 (Svelte consumers) | L0 (Tailwind preset consumers) |
|---|---|---|
| Where themes live | `src/config/atmospheres.ts` (project) | `void.config.ts` (project root) |
| Where fonts live | `src/config/design-tokens.ts` + font-registry | `void.config.ts → fonts: [...]` |
| Who generates the CSS | `scripts/generate-tokens.ts` | `@void-energy/tailwind/vite` or `npx void-energy build` |
| Where generated CSS lives | `src/styles/config/_generated-themes.scss` | `<outDir>/void.generated.css` (consumer-owned) |
| End-user-added themes | `voidEngine.registerTheme()` | `runtime.registerAtmosphere()` |

Same five rows, different output formats. The L0 consumer's mental load is identical to the L1 consumer's.

### Config file

```ts
// void.config.ts — consumer's project root
import { defineConfig, defineAtmosphere } from '@void-energy/tailwind/config';

export default defineConfig({
  // MODE A: replace built-ins entirely. When `atmospheres` is provided,
  // frost/slate/terminal/meridian are omitted unless re-listed here.
  atmospheres: {
    midnight: defineAtmosphere({
      physics: 'glass',
      mode: 'dark',
      label: 'Midnight',
      tokens: {
        '--bg-canvas':       '#05060b',
        '--bg-surface':      '#0b0e18',
        '--energy-primary':  '#7c5cff',
        // ... partial tokens merge onto SEMANTIC_DARK base
      },
    }),
    dawn: defineAtmosphere({
      physics: 'flat',
      mode: 'light',
      label: 'Dawn',
      extends: 'meridian',  // merge on top of a built-in (or another config atmosphere)
      tokens: {
        '--energy-primary': '#ff6b4a',
      },
    }),
  },

  // MODE B: keep built-ins, add more. Ignored if `atmospheres` is provided.
  // extendAtmospheres: { crimson: defineAtmosphere({ ... }) },

  // MODE C: keep some built-ins, drop others. Ignored if `atmospheres` is provided.
  // omitBuiltins: ['terminal'],

  fonts: [
    { family: 'Orbitron', src: '/fonts/Orbitron.woff2', weight: '400 900', display: 'swap' },
    { family: 'Inter',    src: '/fonts/Inter.woff2',    weight: '100 900', display: 'swap' },
  ],
  fontAssignments: {
    heading: 'Orbitron',
    body:    'Inter',
  },

  defaults: {
    atmosphere: 'midnight',
    physics:    'glass',
    mode:       'dark',
    density:    'default',
  },

  outDir: 'src/styles',  // default: 'src/styles'; emits void.generated.css + void.manifest.json here
});
```

### Config schema (exported types)

```ts
// @void-energy/tailwind/config — type surface only, zero runtime cost
export interface VoidConfig {
  atmospheres?:       Record<string, AtmosphereDef>;
  extendAtmospheres?: Record<string, AtmosphereDef>;
  omitBuiltins?:      BuiltinName[];
  fonts?:             FontSource[];
  fontAssignments?:   Partial<Record<'heading' | 'body' | 'mono', string>>;
  defaults?:          Partial<InitDefaults>;
  outDir?:            string;  // default: 'src/styles'
}

export interface AtmosphereDef {
  physics: 'glass' | 'flat' | 'retro';
  mode:    'light' | 'dark';
  tokens:  Record<string, string>;
  label?:  string;              // display name for theme picker UIs
  extends?: string;             // merge onto a builtin or another config atmosphere
}

export interface FontSource {
  family:        string;
  src:           string | { url: string; format?: 'woff2' | 'woff' | 'truetype' | 'opentype' }[];
  weight?:       string | number;            // '400 900' for variable fonts, 600 for single
  style?:        'normal' | 'italic';
  display?:      'auto' | 'block' | 'swap' | 'fallback' | 'optional';  // default: 'swap'
  unicodeRange?: string;
}

export type BuiltinName = 'frost' | 'slate' | 'terminal' | 'meridian';
```

`defineConfig` and `defineAtmosphere` are identity functions (`<T>(x: T) => x`). They exist solely to give the consumer IDE autocomplete and compile-time validation in a JSDoc-style setup where `satisfies VoidConfig` alone would be awkward.

### Safety Merge semantics

Session 7's runtime `registerAtmosphere` deliberately did not merge — consumers had to pass complete token sets. The config layer **does** merge, which is the behavior real consumers want:

1. **Base selection.** An `AtmosphereDef` without `extends` is merged onto the physics-appropriate VE semantic base (`SEMANTIC_DARK` for `mode: 'dark'`, `SEMANTIC_LIGHT` for `mode: 'light'`) — same base maps L1 already uses.
2. **`extends`.** When present, the base becomes the named atmosphere's fully-merged token set. Multi-level chains resolve in topological order; cycles are rejected at generator time with a clear error.
3. **Partial tokens win.** The consumer's `tokens` object overrides base values key-by-key.
4. **Unknown tokens pass through.** Consumers can add novel `--*` variables; the generator emits them without validation.

This matches `voidEngine.registerTheme`'s L1 semantics so the mental model is identical across layers.

### Generated output

**`<outDir>/void.generated.css`** — one file, imported by the consumer's entry CSS:

```css
/* ——— @font-face blocks ——— */
@font-face {
  font-family: 'Orbitron';
  src: url('/fonts/Orbitron.woff2') format('woff2');
  font-weight: 400 900;
  font-display: swap;
}
/* ... */

/* ——— font assignments (if provided) ——— */
:root {
  --font-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
  --font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;
}

/* ——— config atmospheres ——— */
[data-atmosphere='midnight'] {
  --bg-canvas: #05060b;
  --bg-surface: #0b0e18;
  --energy-primary: #7c5cff;
  /* ... full merged token set */
}
[data-atmosphere='dawn'] {
  /* ... */
}
```

**`<outDir>/void.manifest.json`** — consumed by the runtime:

```json
{
  "schemaVersion": 1,
  "defaults": { "atmosphere": "midnight", "physics": "glass", "mode": "dark", "density": "default" },
  "atmospheres": {
    "frost":    { "source": "builtin", "physics": "glass", "mode": "dark",  "label": "Frost" },
    "slate":    { "source": "builtin", "physics": "flat",  "mode": "dark",  "label": "Slate" },
    "meridian": { "source": "builtin", "physics": "flat",  "mode": "light", "label": "Meridian" },
    "terminal": { "source": "builtin", "physics": "retro", "mode": "dark",  "label": "Terminal" },
    "midnight": { "source": "config",  "physics": "glass", "mode": "dark",  "label": "Midnight" },
    "dawn":     { "source": "config",  "physics": "flat",  "mode": "light", "label": "Dawn" }
  }
}
```

When `atmospheres: {...}` is provided in the config (MODE A — full replacement), built-ins are **omitted from both the CSS and the manifest**. The runtime's four built-in `[data-atmosphere]` blocks still exist in L0's own CSS bundle, but without the manifest entries they're invisible to `getAtmospheres()` — a theme picker has no way to display them, and `setAtmosphere('frost')` becomes a no-op at the UI level (the runtime still sets the attribute, which is harmless).

### Integration paths

**Vite (primary):**

```ts
// vite.config.ts
import { voidEnergy } from '@void-energy/tailwind/vite';

export default {
  plugins: [voidEnergy()],  // auto-discovers void.config.ts at project root
};
```

The plugin:
- Discovers and loads `void.config.{ts,js,mjs}` from the project root via Vite's own module loader (respects the project's TS setup).
- Emits the generated CSS as a **virtual module** (`virtual:void-energy/generated.css`) that the consumer imports from their entry CSS — no physical file to manage or add to `.gitignore`.
- Emits the manifest as a virtual JSON module (`virtual:void-energy/manifest.json`) that the runtime consumer imports.
- Watches the config file and HMRs on change.
- Exposes a `manifest` export from the plugin for SSR bootstrapping (Next.js, Astro, Nuxt patterns documented in INTEGRATIONS.md).

**CLI (fallback, for non-Vite build setups):**

```bash
npx void-energy build              # one-shot
npx void-energy build --watch      # watch mode (chokidar)
npx void-energy build --config ./custom.config.ts --out ./styles
```

Both CLI and plugin call the same shared generator core (`@void-energy/tailwind/generator`). Output shape identical. CI builds and local dev stay in parity.

### Runtime integration

```ts
// consumer's app bootstrap
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';  // Vite
// or: import manifest from './src/styles/void.manifest.json';  // CLI path

init({ manifest });
```

`init({ manifest })` feeds the manifest's `defaults` into the existing default-resolution chain (localStorage wins; falls back to manifest; falls back to L0's hard-coded `frost` / `glass` / `dark` / `default`) and merges `manifest.atmospheres` into the runtime's internal directory. All directory entries carry `source: 'builtin' | 'config' | 'runtime'` (D-L0.7).

When no manifest is provided (consumer doesn't use the config layer at all), L0 falls back to Session 7 behavior: four built-ins + runtime-registered only. This preserves the minimal-install path — a consumer who wants "just VE's 4 themes" can skip the config layer entirely.

### FOUC implications

The FOUC script (Session 4 + Session 7) needs one addition: when the persisted atmosphere is a `config` source, its CSS is already in `void.generated.css` (statically imported), so no injection is required — just set the attribute. The script's logic is unchanged. Only `runtime`-source atmospheres still require the inline `<style>` re-injection that Session 7 added.

This keeps the FOUC script minimal: it doesn't need to know about the manifest at all. The manifest is consumed at hydration time (`init({ manifest })`), not before first paint.

---

## v4 Namespace Strategy

The single biggest lesson from Phase 0a: **a token's name relative to the underlying CSS variable determines which `@theme` mode to use.** Pick the wrong mode and you get either a self-reference cycle (variable becomes `var(--x, var(--x, var(--x...)))`, resolves to nothing) or an orphan `:root` variable that generates no utility class.

### The three modes

**1. `@theme inline` — for forwarders**
Use when the L0 token name **differs** from the underlying CSS variable name. The `inline` mode tells Tailwind to inline the variable reference into utility class output, so the utility resolves directly to the underlying variable.

```css
@theme inline {
  --spacing-md: var(--space-md);  /* gap-md → var(--space-md), no cycle */
  --color-surface: var(--bg-surface);
  --duration-fast: var(--speed-fast);
}
```

**2. `@theme reference` — for self-named tokens**
Use when the L0 token name **matches** the underlying CSS variable name (the value is defined elsewhere on `:root` by `tokens.css` / `atmospheres/*.css` / `physics/*.css`). `reference` generates utility classes that reference the variable but does *not* emit the variable itself in `@layer theme`. Without this, `@theme inline { --radius-md: 8px }` would write `:root { --radius-md: var(--radius-md) }` and create a self-reference cycle that invalidates whatever the SCSS or atmosphere CSS already set.

```css
@theme reference {
  --radius-md: 8px;             /* placeholder; physics/glass.css sets the real value */
  --color-success: #10b981;     /* placeholder; atmospheres/*.css set the real value */
  --shadow-float: 0 0 0 #000;   /* placeholder; physics/*.css set the real value */
}
```

**3. Raw `:root` — for tokens that need no utility class**
Use for variables consumers reference directly but Tailwind doesn't need to generate a utility for. Avoids the cycle hazard entirely because the variable lives outside any `@theme` block.

```css
/* tokens.css */
:root {
  --control-height: max(2.25rem, calc(2.75rem * var(--density, 1)));
  --scrollbar-width: 6px;
  --nav-height: calc(4rem * var(--density, 1));
}
```

These are values consumed by other utility definitions (`@utility min-h-control` reads `--control-height`) or by consumer CSS via `var()`, but no Tailwind utility class is generated for them directly.

**The rule:** if SCSS, atmosphere CSS, or physics CSS already defines a variable name on `:root`, the L0 `theme.css` MUST use `@theme reference` (not `inline`) for that name. Period.

### Mode assignment for L0

| Token family | Mode | Reason |
|---|---|---|
| `--spacing-*` (forwarders to `--space-*`) | `@theme inline` | Different name, no cycle |
| `--color-canvas/surface/sunk/spotlight/main/dim/mute/border` (forwarders to `--bg-*`/`--text-*`/etc.) | `@theme inline` | Different name |
| `--color-primary/secondary` (forwarders to `--energy-*`) | `@theme inline` | Different name |
| `--color-premium/system/success/error` (and -light/-dark/-subtle) | `@theme reference` | Atmosphere CSS owns these names |
| `--breakpoint-*` | `@theme` (plain, no inline/reference) | Plain values, no underlying var |
| `--radius-sm/md/lg/xl/full` | `@theme reference` | Physics CSS owns these names |
| `--radius-none: 0` | `@theme` (plain) | Literal value |
| `--text-h1`–`--text-h6`/`--text-base`/`--text-small`/`--text-caption` (forwarders to `--font-size-*`) | `@theme inline` | Different name |
| `--leading-*` (forwarders to `--line-height-*`) | `@theme inline` | Different name |
| `--tracking-*` (forwarders to `--letter-spacing-*`) | `@theme inline` | Different name |
| `--font-weight-regular/medium/semibold/bold` | `@theme reference` | SCSS/typography owns these names |
| `--ease-flow`, `--ease-spring-gentle/snappy/bounce` | `@theme reference` | Physics CSS owns these names |
| `--ease-linear` | `@theme` (plain) | Literal value |
| `--delay-cascade`, `--delay-sequence` | `@theme reference` | Physics CSS owns these names |
| `--delay-0` | `@theme` (plain) | Literal value |
| `--duration-instant/fast/base/slow` (forwarders to `--speed-*`) | `@theme inline` | Different name |
| `--duration-0` | `@theme` (plain) | Literal value |
| `--max-width-*` | `@theme` (plain) | Plain rem values |
| `--container-*` (container query breakpoints) | `@theme` (plain) | Plain px values |
| `--z-*` | `@theme` (plain) | Literal numbers |
| `--shadow-float/lift/sunk` | `@theme reference` | Physics CSS owns these names |
| `--font-heading/body/mono` | `@theme reference` | `tokens.css` `:root` owns the real value; reference mode generates `font-heading`/`font-body`/`font-mono` utilities without re-emitting the variable. Avoids the `@theme inline` self-reference cycle Phase 0a hit in L1. **Verify in Session 3** — if the cycle reappears under reference mode, fall back to raw `:root` (omit the utility, drop `font-heading` from doc examples). |

If a future contributor adds a new token, the decision tree is:

1. Does anything else already define this variable name on `:root`? → `@theme reference`
2. Is this a literal value with no underlying variable? → plain `@theme`
3. Otherwise (forwarder with different name) → `@theme inline`

---

## v4 Footgun Inventory & void-overrides Layer

Phase 0a discovered five v4 quirks that produce silent regressions if not patched. L0 must ship the same patches in `theme.css` so consumers don't reproduce Phase 0a from scratch. Each footgun lists what it is, what breaks, and the fix.

### Cascade layer order

L0's `theme.css` declares this layer order **before** any Tailwind import in the consumer's app:

```css
@layer void-scss, properties, theme, base, components, utilities, void-overrides;
```

**`void-overrides` (highest priority)** exists to defeat v4 utilities that are static/hardcoded and can't be overridden via `@utility` (which only *appends* to existing utilities — Tailwind's original declaration still wins source-order ties within the same rule). Used sparingly: only for true v4-vs-system conflicts.

**`void-scss` (lowest priority)** is included even though L0 itself ships no SCSS. Reason: L1 (and any consumer that mirrors L1's pattern) appends SCSS into this layer. Declaring it in L0 lets L1 import L0's `theme.css` without conflicting layer-order declarations. L0-only consumers see `void-scss` as an empty layer — harmless.

### Footgun 1 — Bare `border` and directional `border-{l,r,t,b,x,y}` are hardcoded 1px

v3 mapped `borderWidth.DEFAULT: var(--physics-border-width)`, giving retro physics its 2px CRT rails. v4 hardcodes 1px in the static utility. `@utility border { … }` *appends*, so Tailwind's 1px still co-exists and wins source-order ties. The fix is the void-overrides layer:

```css
@layer void-overrides {
  .border    { border-width: var(--physics-border-width); }
  .border-x  { border-inline-width: var(--physics-border-width); }
  .border-y  { border-block-width: var(--physics-border-width); }
  .border-l  { border-left-width: var(--physics-border-width); }
  .border-r  { border-right-width: var(--physics-border-width); }
  .border-t  { border-top-width: var(--physics-border-width); }
  .border-b  { border-bottom-width: var(--physics-border-width); }
}
```

Numeric variants (`border-2`, `border-l-2`) are unaffected — they remain literal.

**TRAP (document, do not fix):** don't combine `border` with a numeric directional like `border-l-2` on the same element. The shorthand `border-width` here expands to all four longhand `border-*-width` declarations in a higher layer than `utilities`, so `border-l-2`'s `border-left-width: 2px` silently loses to physics width. Use either the bare family OR numeric directionals, not both.

### Footgun 2 — Bare `rounded` is not driven by `--radius-*`

v4 has no `--radius-DEFAULT` namespace. Bare `rounded` is a hardcoded static utility with the v4 default radius. The fix is `@utility` (which works here because nothing in the L0 atmosphere/physics CSS sets `border-radius` directly on `.rounded`):

```css
@utility rounded {
  border-radius: var(--radius-md);
}
```

Stays physics-aware automatically because `--radius-md` is force-zeroed in retro by the physics CSS.

### Footgun 3 — `min-h-control` namespace mismatch

v4's `min-h-*` utility reads from `--min-height-*` (with `--height-*` and `--spacing-*` as fallbacks), **not** `--min-h-*`. A `--min-h-control: var(--control-height)` entry in `@theme` would emit the variable at `:root` but generate no class. Fix:

```css
@utility min-h-control {
  min-height: var(--control-height);
}
```

### Footgun 4 — `.container` shadowed by Tailwind v4's built-in

v4 ships a `.container` utility that uses raw breakpoint values (768/1024/1440/1920/2560). VE's container max-widths are intentionally smaller than each breakpoint for content readability. L0 ships its own container in the void-overrides layer:

```css
@layer void-overrides {
  .container {
    width: 100%;
    margin-inline: auto;
    padding-inline: var(--space-md);

    @media (min-width: 768px)  { max-width: 720px;  }
    @media (min-width: 1024px) { max-width: 960px;  }
    @media (min-width: 1440px) { max-width: 1320px; }
    @media (min-width: 1920px) { max-width: 1600px; }
    @media (min-width: 2560px) { max-width: 1920px; }
  }

  .container-fluid {
    width: 100%;
    padding-inline: var(--space-md);
    margin-inline: auto;
    max-width: none;
  }
}
```

These widths come from `design-tokens.ts → $container-widths`. The L0 generator writes the values into `theme.css` so the SSOT stays single.

**Note:** L0 consumers who do *not* want VE's container widths (e.g. they use Tailwind's stock breakpoint-driven container) can opt out by importing `@void-energy/tailwind/theme-no-container.css` instead — a generated alternate that omits the `.container` rules. Decided Session 3.

### Footgun 5 — `--max-width > --spacing > --container` fallback chain

v4's `max-w-*` utility resolves through `--max-width > --spacing > --container`. Our `--spacing-md` is 24px (from the physics spacing scale), which would shadow any `--container-md` value if `--max-width-*` weren't explicitly defined. The fix is the explicit `--max-width-*` block from Phase 0a:

```css
@theme {
  --max-width-*: initial;
  --max-width-3xs: 16rem;
  --max-width-2xs: 18rem;
  --max-width-xs: 20rem;
  /* ... through 7xl */
}
```

This also frees `--container-*` to carry actual container query breakpoints (320/480/640/800px) without affecting `max-w-*` utilities.

---

## Namespace Reset Inventory

Tailwind v4 ships defaults for every namespace. L0 wipes them all so consumers see only VE's vocabulary. Missing a reset means Tailwind defaults leak into the L0 output and `bg-blue-500`-style hardcoded utilities appear in the IDE autocomplete alongside `bg-surface`.

Required resets in L0's `theme.css` (each in its own `@theme` block matching the family):

```
--color-*: initial
--spacing-*: initial
--breakpoint-*: initial
--font-*: initial
--text-*: initial
--leading-*: initial
--tracking-*: initial
--font-weight-*: initial
--radius-*: initial
--ease-*: initial
--delay-*: initial
--duration-*: initial
--max-width-*: initial
--container-*: initial
--z-*: initial
```

Phase 0a's `tailwind-theme.css` is the canonical reference for which families need resets and in which order. Session 3 generates `theme.css` to match.

---

## Implementation Plan

This is the high-level step list. Sessions are defined below in [Implementation Sessions](#implementation-sessions).

### Step 0 — Absorb Phase 0a (read-only audit)

Before writing any L0 code, read `src/styles/tailwind-theme.css`, `src/styles/global.scss`, and the diff history of Phase 0a. The new `theme.css` is structurally identical to L1's; treat the existing file as a reference implementation. Skip this and you'll re-debug every namespace mode.

### Step 1 — Extend `generate-tokens.ts`

Add a `--target=l0|l1|all` flag. Default `all`. The L0 target produces:

**`tokens.css`** — Foundation tokens as `:root` variables (spacing with density scaling, typography clamps, z-index, control geometry, density default of 1). Plus the raw font-family declarations.

**`atmospheres/*.css`** — One file per free atmosphere (slate, terminal, meridian, frost). Each sets the full palette (`--bg-*`, `--energy-*`, `--text-*`, `--border-color`, semantic color overrides if present, atmosphere fonts) plus shadow color tokens (`--shadow-base`, `--shadow-base-strong`).

**`physics/*.css`** — One file per physics preset (glass, flat, retro). Each sets motion tokens (`--speed-*`, `--ease-*`, `--delay-*`), surface tokens (`--physics-blur`, `--physics-border-width`), depth tokens (`--shadow-float/lift/sunk` as `var()`-driven geometry, `--lift`, `--scale`), and radius overrides (retro zeros all radii).

**`density.css`** — `[data-density="compact|default|comfortable"] { --density: 0.75 | 1 | 1.25; }`.

**`atmospheres.json`** — Manifest of `{ atmosphereKey: { physics, mode } }` consumed by the runtime.

All values derive from `design-tokens.ts` and `atmospheres.ts`. Snapshot test verifies output stability across runs.

### Step 2 — Hand-write `theme.css` (Tailwind v4 bridge)

Not generated. Hand-written because it's mostly `@theme`/`@utility`/`@layer` directives, not data. The structure mirrors Phase 0a's `src/styles/tailwind-theme.css` exactly:

1. Cascade layer declaration (with `void-scss` and `void-overrides`)
2. Namespace reset blocks (all 15 families)
3. `@theme inline` blocks for forwarders
4. `@theme reference` blocks for self-named tokens
5. Plain `@theme` blocks for literal values
6. `@utility` declarations: `backdrop-blur-physics`, `min-h-control`, `rounded`
7. `@layer void-overrides` block: bare border family + container

Imports its own sub-files at the top (`tokens.css`, default atmosphere, default physics, `density.css`, `utilities.css`). Does **not** import `tailwindcss` — consumer owns that.

### Step 3 — Vanilla JS runtime

A small (~2-3kb) framework-agnostic runtime that replaces VoidEngine for L0 consumers. Exports `setAtmosphere`, `setPhysics`, `setMode`, `setDensity`, `init`, `getAtmospheres`, plus the `STORAGE_KEYS` constant.

```typescript
// runtime.ts — vanilla JS, no framework imports

export const STORAGE_KEYS = {
  atmosphere: 've-atmosphere',
  physics:    've-physics',
  mode:       've-mode',
  density:    've-density',
} as const;

const isBrowser = typeof document !== 'undefined';
const getRoot = () => (isBrowser ? document.documentElement : null);

const CONSTRAINTS: Record<string, 'dark' | 'light'> = {
  glass: 'dark',
  retro: 'dark',
};

export function setAtmosphere(name: string): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-atmosphere', name);
  const meta = ATMOSPHERES_META[name];
  if (meta?.physics) setPhysics(meta.physics);
  if (meta?.mode) setMode(meta.mode);
  persist(STORAGE_KEYS.atmosphere, name);
}

export function setPhysics(preset: 'glass' | 'flat' | 'retro'): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-physics', preset);
  const required = CONSTRAINTS[preset];
  if (required) setMode(required);
  persist(STORAGE_KEYS.physics, preset);
}

export function setMode(mode: 'light' | 'dark' | 'auto'): void {
  const root = getRoot();
  if (!root) return;
  const resolved = mode === 'auto'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  root.setAttribute('data-mode', resolved);
  persist(STORAGE_KEYS.mode, mode);
}

export function setDensity(level: 'compact' | 'default' | 'comfortable'): void {
  const root = getRoot();
  if (!root) return;
  root.setAttribute('data-density', level);
  persist(STORAGE_KEYS.density, level);
}

export function init(defaults?: {
  atmosphere?: string;
  physics?: 'glass' | 'flat' | 'retro';
  mode?: 'light' | 'dark' | 'auto';
  density?: 'compact' | 'default' | 'comfortable';
}): void {
  if (!isBrowser) return;
  setAtmosphere(restore(STORAGE_KEYS.atmosphere) ?? defaults?.atmosphere ?? 'frost');
  setPhysics((restore(STORAGE_KEYS.physics) as any) ?? defaults?.physics ?? 'glass');
  setMode((restore(STORAGE_KEYS.mode) as any) ?? defaults?.mode ?? 'dark');
  setDensity((restore(STORAGE_KEYS.density) as any) ?? defaults?.density ?? 'default');
}

function persist(key: string, value: string): void {
  if (!isBrowser) return;
  try { localStorage.setItem(key, value); } catch {}
}

function restore(key: string): string | null {
  if (!isBrowser) return null;
  try { return localStorage.getItem(key); } catch { return null; }
}
```

**SSR rules — hard requirements:**
- Zero side effects on import. No top-level `document` or `localStorage` access.
- Every exported function silently no-ops when `document` is unavailable.
- `init()` must be explicitly called by the consumer — never auto-invoked on import.
- `localStorage` access is always try/caught (incognito Safari, SSR, web workers).
- Module under test: `node -e "Object.values(require('./runtime')).filter(f=>typeof f==='function').forEach(f=>f())"` — must not throw.

**What the runtime does NOT do:**
- No view transitions (L1 only, requires framework integration)
- No font preloading (consumer's responsibility)
- No temporary theme stack (L1 feature for modals/previews)
- No theme registration at runtime (atmospheres are CSS files, not runtime objects)
- No reactive state (`$state` is Svelte — L0 uses DOM attributes directly)

### Step 4 — FOUC head script

L0 ships an inline blocking script as a string export, similar to L1's `ThemeScript` component. The script reads from `STORAGE_KEYS` (the same constant the runtime uses) so the keys can never drift.

```javascript
// head.js — exports the FOUC script as a string for framework injection
export const STORAGE_KEYS = {
  atmosphere: 've-atmosphere',
  physics:    've-physics',
  mode:       've-mode',
  density:    've-density',
};

export const FOUC_SCRIPT = `
(function() {
  try {
    var s = localStorage;
    var r = document.documentElement;
    r.setAttribute('data-atmosphere', s.getItem('${STORAGE_KEYS.atmosphere}') || 'frost');
    r.setAttribute('data-physics',    s.getItem('${STORAGE_KEYS.physics}')    || 'glass');
    r.setAttribute('data-mode',       s.getItem('${STORAGE_KEYS.mode}')       || 'dark');
    r.setAttribute('data-density',    s.getItem('${STORAGE_KEYS.density}')    || 'default');
  } catch(e) {}
})();
`.trim();
```

Note the *unconditional* `data-density="default"` set even when nothing is persisted. This is load-bearing: `tokens.css` sets `:root { --density: 1 }`, but `density.css` sets it via `[data-density="default"]`. Without the FOUC script setting the attribute, the `:root` default applies — which is correct, but the moment any element has a more-specific density attribute, the cascade gets confused. Always set the attribute.

**Framework-specific examples in docs:**
- Next.js: `<Script id="ve-fouc" strategy="beforeInteractive">{FOUC_SCRIPT}</Script>`
- Nuxt: `useHead({ script: [{ children: FOUC_SCRIPT, hid: 've-fouc' }] })`
- Astro: `<script is:inline set:html={FOUC_SCRIPT}></script>`
- Plain HTML: `<script>{paste FOUC_SCRIPT contents}</script>` in `<head>`

### Step 5 — Atmosphere metadata

The `atmospheres.json` manifest generated in Step 1 lives alongside the CSS files. The runtime imports it (or ships it inlined into `runtime.js`) so `setAtmosphere('frost')` knows to also call `setPhysics('glass')` and `setMode('dark')`.

```json
{
  "slate":    { "physics": "flat",  "mode": "dark"  },
  "terminal": { "physics": "retro", "mode": "dark"  },
  "meridian": { "physics": "flat",  "mode": "light" },
  "frost":    { "physics": "glass", "mode": "dark"  }
}
```

### Step 6 — Documentation

Professional, clean docs that make L0 feel production-ready:

1. **README.md** — quick start (install, import, use), atmosphere gallery with screenshots, API reference, upgrade path to full VE
2. **MIGRATION.md** — how to migrate an existing Tailwind project from hardcoded values to VE tokens
3. **ATMOSPHERES.md** — visual guide to each atmosphere (palette, physics, mode)
4. **Token reference table** — every CSS variable, its purpose, which physics/atmosphere overrides it

---

## Shadow Computation Extraction

The most complex part of L0 is extracting the shadow system. The current `_engine.scss` computes shadows in SCSS using a base shadow color and physics-derived geometry. For L0, the geometry moves to `physics/*.css` and the color moves to `atmospheres/*.css`, exactly as locked in **D-L0.2** above.

### Approach

1. **Read `_engine.scss`** during Session 2 to extract:
   - The exact shadow geometry per physics preset (offsets, blur, spread)
   - The shadow color values (likely `rgba(0,0,0,X)` neutral, but verify)
   - Whether any atmosphere injects its energy color into the shadow tint

2. **Port to the generator.** `generate-tokens.ts` learns to emit:
   - Physics CSS files containing shadow geometry with `var(--shadow-base)` / `var(--shadow-base-strong)` placeholders
   - Atmosphere CSS files containing the shadow base values

3. **Update `_engine.scss`** to read the same generated values from CSS variables instead of computing them. This is the "L1 stays in lockstep with L0" half of D-L0.1's parity guarantee.

4. **Snapshot test.** Capture the current SCSS-emitted shadow values as a golden file. The L0 generator's output, when fed through the cascade (atmosphere → physics → final `--shadow-float`), must resolve to byte-equivalent computed values in the browser. Session 2 doesn't ship until this passes.

### Why this is the hardest piece

Shadows are the one place the existing system does real *computation* in SCSS rather than passthrough variable substitution. Every other token is `var(--x)` chains that move directly to CSS. Shadows combine multiple physics tokens with hardcoded opacity values into a multi-layer `box-shadow` declaration. Getting them wrong is invisible until the visual sweep.

**Mitigation:** Session 2's stop point is "snapshot of the generated CSS variable cascade matches the current SCSS-emitted values exactly." Until that passes, no further sessions run.

---

## Token Naming & Namespace Strategy

### The Problem
Generic names like `--surface` could collide with other design systems. VE's current tokens use descriptive prefixes (`--bg-surface`, `--energy-primary`, `--text-main`) which are already somewhat namespaced.

### The Decision
Keep the current naming convention. VE's token names are semantic enough to be distinct:
- `--bg-canvas`, `--bg-surface` (not just `--canvas`, `--surface`)
- `--energy-primary`, `--energy-secondary` (unique to VE)
- `--text-main`, `--text-dim`, `--text-mute` (descriptive)
- `--physics-blur`, `--speed-fast` (VE-specific concepts)

For Tailwind utility classes, use the same names: `bg-surface`, `text-main`, `shadow-float`. These are distinctive enough. If collision becomes a real issue in practice, a configurable prefix can be added later without breaking the CSS variable layer.

**Rejected:** `ve-` prefix on everything (`--ve-bg-surface`, `bg-ve-surface`). Too verbose. Adds friction. Solve if/when it's a real problem.

---

## What L0 Does NOT Include

- **Components** — use your own (shadcn, Radix, custom, whatever). L0 gives you tokens, not UI.
- **SCSS** — L0 output is pure CSS. No SCSS dependency for consumers.
- **Svelte anything** — no framework imports, no runes, no stores.
- **View transitions** — theme switches are instant CSS attribute changes.
- **Font files themselves** — L0 does not ship font files. Consumers declare their fonts in `void.config.ts` and the generator emits `@font-face` rules + optional font-family assignments into `void.generated.css`. Consumers who skip the config layer can still override `--font-heading` / `--font-body` / `--font-mono` via plain CSS. See D-L0.8.
- **Runtime font registration** — no `registerFont` API. Fonts are a build-time concern (D-L0.8).
- **Ambient layers, kinetic text, Rive** — premium L1 features.
- **AI automation context** — that's L2, and it only works with L1.
- **CSS component classes (L0.5)** — deliberately excluded per D21. L0 is tokens + runtime. L1 is components. No middle layer that creates maintenance burden and an upgrade off-ramp.

---

## Build & Development

### Where L0 Lives (Current Monorepo)

During Phase 1, L0 is developed inside the current monorepo:

```
scripts/
  generate-tokens.ts          ← extended with --target=l0|l1|all flag
packages/
  void-energy-tailwind/       ← L0 package source
    src/
      runtime.ts              ← vanilla JS runtime
      head.ts                 ← FOUC script + STORAGE_KEYS
      theme.css               ← hand-written Tailwind v4 bridge
    dist/                     ← generated CSS output (from build:l0)
      tokens.css
      atmospheres/*.css
      physics/*.css
      density.css
      atmospheres.json
    package.json
    README.md
    tsconfig.json
```

### Build Command

```bash
npm run build:tokens             # generates BOTH L1 SCSS and L0 CSS (default --target=all)
npm run build:tokens -- --target=l0   # L0 CSS only
npm run build:tokens -- --target=l1   # L1 SCSS only (current behavior)
```

Both targets read from the same SSOT (`design-tokens.ts` + `atmospheres.ts`), produce different output formats.

### In Phase 3 (Monorepo Restructure)

L0 becomes a workspace package in the public monorepo:

```
packages/
  void-energy/                ← L1 (Svelte components)
  void-energy-tailwind/       ← L0 (Tailwind preset)
  create-void-energy/         ← scaffolder
```

Both L0 and L1 share the same `design-tokens.ts` SSOT via workspace imports. When a token changes, both packages update in lockstep — at which point D-L0.1's deferral (L1 keeping its own pipeline during Phase 1) gets revisited. Phase 3 may rewire L1 to consume L0's CSS directly, eliminating the dual-pipeline drift risk entirely.

---

## Implementation Sessions

Each session leaves `main` green and ends at a verifiable boundary, so we can stop/resume cleanly.

### Session 1 — Decision lock + generator skeleton

**Goal:** the foundation tokens (spacing, radius, z-index, typography, density default) flow through the new L0 pipeline. Nothing else changed.

**Steps:**
1. Re-confirm decisions D-L0.1 through D-L0.5 (already locked above; this is a sanity check).
2. Capture a baseline snapshot of L1's current CSS variable cascade (parity reference for later sessions).
3. Scaffold `packages/void-energy-tailwind/` with `package.json`, `tsconfig.json`, empty `src/`.
4. Extend `scripts/generate-tokens.ts` with `--target=l0|l1|all` flag plumbing. Default `all`.
5. Implement L0 emission of `tokens.css` only (spacing, radius, z-index, typography, control geometry, density default, raw font-family).
6. Snapshot test: regenerate, compare against committed golden file, fail on diff.

**Stop point:** `npm run build:tokens` produces both L1 SCSS (unchanged) and L0 `tokens.css` (new). Snapshot test green. No L0 atmospheres, physics, density, theme.css, or runtime yet.

### Session 2 — Atmospheres + physics + shadow port

**Goal:** the L0 token output is byte-equivalent to L1's runtime values across all 4 atmospheres × all 3 physics presets.

**Steps:**
1. Read `src/styles/abstracts/_engine.scss` to extract the current shadow computation logic. Capture geometry (per physics) and color (atmosphere-tinted or neutral).
2. Emit `atmospheres/{slate,terminal,meridian,frost}.css` with full palettes, shadow color tokens (`--shadow-base`, `--shadow-base-strong`), and atmosphere fonts.
3. Emit `physics/{glass,flat,retro}.css` with motion, surface, depth (var()-driven shadow geometry), radius overrides.
4. Emit `density.css` with the `[data-density]` selectors.
5. Update `_engine.scss` to read shadow values from the generated CSS variables instead of computing them in SCSS. Verify L1 still renders identically (the build + visual sweep gate from Phase 0a applies again).
6. Snapshot test: the resolved CSS variable values for every (atmosphere × physics × shadow tier) combination match the captured L1 baseline byte-for-byte.

**Stop point:** L1 still renders correctly with shadows now flowing through L0-style variables. L0's CSS files contain valid token cascades for all 4 atmospheres × 3 physics presets. No theme.css or runtime yet.

**Risk:** the shadow extraction is the load-bearing piece. If the byte-for-byte check fails, do NOT proceed to Session 3 — the parity guarantee is the entire point of D-L0.1's deferral strategy. Debug until snapshot matches.

### Session 3 — Tailwind v4 theme.css + footgun fixes

**Goal:** a hand-built test page imports `tokens.css` + `atmospheres/frost.css` + `physics/glass.css` + `density.css` + `theme.css` + `tailwindcss` and renders correctly across all 3 physics presets.

**Steps:**
1. Hand-write `packages/void-energy-tailwind/src/theme.css` mirroring Phase 0a's `src/styles/tailwind-theme.css` structure. Use the namespace strategy table from this doc to assign each token family to `inline` / `reference` / plain / raw.
2. Add the namespace reset blocks (all 15 families).
3. Add `@utility` declarations: `backdrop-blur-physics`, `min-h-control`, `rounded`.
4. Add the `@layer void-overrides` block: bare border family + container.
5. Generate the alternate `theme-no-container.css` (omits container rules) for consumers who want to keep Tailwind's stock container.
6. Built-CSS grep tests (mirror Phase 0a verification approach):
   - `.min-h-control{min-height:var(--control-height)}` present
   - `.rounded{border-radius:var(--radius-md)}` present
   - `.border-l{border-left-width:var(--physics-border-width)}` present
   - `.border-l-2{border-left-width:2px}` still literal
   - `.container{max-width:720px}` at min-width 768px wins (in void-overrides layer)
   - `.bg-surface{background-color:var(--bg-surface)}` present
   - `.font-heading{font-family:var(--font-heading)}` present (and same for `font-body`, `font-mono`)
   - **No font self-reference cycles**: grep generated CSS for `--font-heading:` declarations — should appear exactly once (in `tokens.css` `:root`), never inside `@layer theme`. If `@layer theme` contains `--font-heading: var(--font-heading)`, the cycle is back and Option A fallback applies.
7. **Font cycle verification (load-bearing for the Session 3 stop point):** in the `test/index.html`, render `<h2 class="font-heading text-h2">test</h2>` and inspect the resolved `font-family` in DevTools. Must show the actual font stack from `tokens.css`, not `serif`/`sans-serif` browser fallback. If it falls back, the `@theme reference` cycle is real and we revert to raw `:root` only — drop the namespace table row, drop the utility, drop `font-heading` from doc examples.
8. Manual smoke test: drop a static HTML file into `packages/void-energy-tailwind/test/index.html` that imports the L0 CSS + tailwindcss via CDN, switches `data-atmosphere` and `data-physics` via inline buttons. Verify all 4 atmospheres × 3 physics combinations render correctly.

**Stop point:** L0's CSS surface is complete and verified. No JS runtime yet — switching is done via inline button handlers in the test page.

### Session 4 — Vanilla JS runtime + SSR safety

**Goal:** `@void-energy/tailwind/runtime` exports work in both Node and browser. Every function is callable without throwing in either environment.

**Steps:**
1. Write `src/runtime.ts` with the API from Step 3 above. Include `STORAGE_KEYS` constant export.
2. All exports SSR-safe (`isBrowser` guard, no top-level DOM access, `localStorage` always try/caught).
3. Constraint enforcement: `setPhysics('glass')` and `setPhysics('retro')` auto-call `setMode('dark')`.
4. Bundle to ESM + CJS via tsup or rollup. Target < 3kb gzipped.
5. Node import test (CI): `node -e "const m = require('./dist/runtime.cjs'); Object.values(m).filter(f=>typeof f==='function').forEach(f=>f())"` — must not throw.
6. Browser smoke test: replace the inline button handlers in `test/index.html` with `runtime.setAtmosphere(...)` calls. Verify identical behavior.

**Stop point:** the runtime is publishable. SSR-safe. All 5 setters work. `init()` restores from localStorage.

### Session 5 — FOUC + package wiring + cross-framework proof

**Goal:** the published-shape package runs end-to-end with atmosphere switching in two real environments (plain HTML, then a React + Vite + shadcn app).

**Steps:**
1. Write `src/head.ts` exporting `STORAGE_KEYS` (re-exported from runtime) and `FOUC_SCRIPT` string.
2. Finalize `package.json`: `exports` field for `theme.css`, `theme-no-container.css`, `runtime`, `head`, `atmospheres.json`. `files` field. Peer dependency on `tailwindcss` ^4.
3. Smoke test 1: plain HTML page with no framework. Manually inject FOUC script in `<head>`, import L0 CSS, call runtime functions from inline scripts.
4. Smoke test 2: minimal Vite + React + shadcn/ui app. Install L0 from `npm pack` tarball. Inject FOUC via Vite's `transformIndexHtml`. Wrap a few shadcn components in L0 token classes. Verify atmosphere switching transforms shadcn components.
5. Document any rough edges discovered in real consumer usage. Open issues for Session 6 to address.

**Stop point:** L0 works as a real npm package in two environments. `npm pack` produces a clean tarball with no SCSS, no Svelte, no monorepo leakage.

### Session 6 — Documentation

**Goal:** Phase 1 complete. Ready for npm publish dry-run.

**Steps:**
1. README.md: install/import quick start (under 2 minutes to working atmosphere switch), API reference, link to atmosphere gallery.
2. ATMOSPHERES.md: visual showcase of all 4 atmospheres. Screenshots from L1's existing showcase pages. Palette table. Physics + mode pairing.
3. MIGRATION.md: recipes for converting hardcoded Tailwind values to VE semantic tokens. `bg-gray-800` → `bg-surface`, `text-white` → `text-main`, etc.
4. Token reference table appended to README or as `TOKENS.md`: every CSS variable, its purpose, which layer (atmosphere/physics/tokens) sets it.
5. Forward-reference to L1: "want components, view transitions, AI automation? See `void-energy` (L1)."
6. `npm publish --dry-run` to verify the published shape is correct. Do NOT actually publish until Phase 3 (when the monorepo restructure is final).

**Stop point:** Phase 1 done. L0 is publishable but not yet published. Phase 2 can begin.

### Session 7 — Custom atmosphere registration + framework reactivity

**Goal:** close the "you can't use your own atmospheres via L0" gap discovered after Session 6. Give non-Svelte consumers the registration + reactivity primitives they need to build theme-switcher UIs that match VoidEngine's core contract (minus Safety Merge and external loading — those stay in L2).

**Rationale:** the original L0 runtime shipped only the four built-in atmospheres with no registration API and no change-notification surface. React/Vue consumers can flip `data-atmosphere` via `setAtmosphere(name)`, but `name` has to be a built-in — there's no path to add a fifth. And without a subscribe primitive, React/Vue can't re-render in response to runtime changes without polling. Both of these make L0 feel like a teaser rather than a usable core.

**Steps:**
1. Extend `src/runtime.ts` with:
   - `STORAGE_KEYS.customAtmospheres = 've-custom-atmospheres'`.
   - New types: `AtmosphereDef { physics, mode, tokens, extends? }`, `VoidState`, `VoidStateListener`.
   - Internal state: `CUSTOM_ATMOSPHERES: Map<string, AtmosphereDef>`, `LISTENERS: Set<listener>`, `batchDepth` counter.
   - `registerAtmosphere(name, def)` — validates name against `/^[a-zA-Z0-9_-]+$/` (selector-injection guard), stores, rewrites the shared `<style id="ve-custom-atmospheres">`, persists to localStorage.
   - `unregisterAtmosphere(name)` — reverse of the above.
   - `getCustomAtmospheres()` — returns `string[]` of registered names.
   - `getState()` — snapshot of the four `data-*` attributes on `<html>`.
   - `subscribe(listener)` — pub/sub for runtime state changes; returns unsubscribe.
2. Wrap every setter in a `batchDepth++ / batchDepth--` guard so `setAtmosphere('x')` (which internally calls `setPhysics` + `setMode`) fires a single notification, not three. `init()` uses the same batching.
3. Merge built-ins + customs in `getAtmospheres()` — theme-picker UIs get the union.
4. Extend `src/head.ts`'s `FOUC_SCRIPT`: after the four `data-*` attribute writes, read `ve-custom-atmospheres` JSON and synthesize the matching `<style id="ve-custom-atmospheres">` tag before first paint. Name validation applies inline (the hostile-storage attack surface is identical to the registration path).
5. Mirror every change across the four hand-authored files in parity with Session 4's discipline: `dist/runtime.js` (ESM), `dist/runtime.cjs` (CJS), `dist/runtime.d.ts` (types), `dist/head.js` + `dist/head.cjs`.
6. Extend `tests/l0-runtime.test.ts`:
   - Updated `EXPECTED_EXPORTS` (+5 names), `EXPECTED_STORAGE_KEYS` (+1 key), keys-sort assertion.
   - SSR-safety: new exports callable in Node without throwing.
   - DOM: register injects `<style>`, persists, reflects in `getAtmospheres` / `getCustomAtmospheres`.
   - DOM: unregister removes the tag and storage entry.
   - DOM: `setAtmosphere` on a registered custom name cascades physics + mode.
   - DOM: selector-injection attempt (`"bad'; body{...}"`) rejected silently.
   - DOM: `subscribe` fires on every setter, exactly once per `setAtmosphere` / `init` transaction.
   - DOM: unsubscribe is idempotent; throwing listener does not break other listeners.
   - DOM: `init()` re-hydrates persisted custom atmospheres from localStorage.
7. Extend `tests/l0-head.test.ts`:
   - FOUC re-injects `<style id="ve-custom-atmospheres">` from storage.
   - Malformed JSON is ignored silently.
   - Names failing the validation pattern are rejected (selector injection guard).
   - No empty `<style>` tag when storage is absent.
8. Update [ATMOSPHERES.md](../packages/void-energy-tailwind/ATMOSPHERES.md) with a "Registering custom atmospheres" section covering: full example, under-the-hood behavior, v1 scope notes (no Safety Merge, name pattern, no remote loading), removal, enumeration.
9. Update [INTEGRATIONS.md](../packages/void-energy-tailwind/INTEGRATIONS.md) with a "Reactivity" section: React `useSyncExternalStore` recipe, Vue 3 composable, vanilla usage, and the custom-atmosphere quick-start.

**Scope boundaries (explicitly v1):**
- **No Safety Merge.** `AtmosphereDef.extends` is accepted in the type for forward compatibility but not merged. Consumers pass the complete token set.
- **No external theme loading.** `loadAtmosphereFromUrl` stays an L2 concern. The primitive `registerAtmosphere` is the building block.
- **No temporary/ephemeral preview stack.** The Svelte-side `pushTemporaryTheme` / `releaseTemporaryTheme` pattern is not ported. L0 consumers who need preview behavior stash-and-restore via `getState` + `setAtmosphere` themselves.
- **No validation of token names against a known schema.** TS types guard at compile time; the runtime passes token strings through unchanged.

**Stop point:** L0 consumers can register, persist, switch, and subscribe to atmospheres with framework-agnostic primitives. Theme-picker UIs are buildable in any framework. FOUC coverage extends to persisted custom atmospheres. Tests green; doc examples runnable.

**Risk:** the FOUC script grows from ~10 lines to ~35 lines (still inline, still well under 2KB). Verify in Session 7 that the existing regex-based shape assertions in `tests/l0-head.test.ts` still pass — the script must remain a single self-invoking IIFE wrapped in a single `try/catch(e){}`.

### Session 8 — Consumer config layer (generator + Vite plugin + CLI)

**Goal:** a consumer writes `void.config.ts`, runs the build (via Vite plugin or CLI), and gets `void.generated.css` + `void.manifest.json`. The runtime consumes the manifest via `init({ manifest })` and exposes config atmospheres alongside built-ins with `source: 'config'` tagging.

**Rationale:** see D-L0.6, D-L0.7, and the Consumer Config Layer section above. This session is the answer to "L0 must be a usable platform, not a teaser."

**Steps:**

1. **Config schema + helpers (`src/config.ts`).** Export `defineConfig` and `defineAtmosphere` as identity functions for IDE ergonomics. Export all public types: `VoidConfig`, `AtmosphereDef`, `FontSource`, `BuiltinName`, `FontAssignments`. No runtime logic — types-only surface plus two identity functions. Zero dependencies.

2. **Generator core (`src/generator.ts`).** Pure function with signature `generate(config, builtins)` returning `{ css, manifest }`. Responsibilities: resolve `extends` chains (detect cycles, throw clear error), merge partial tokens onto `SEMANTIC_DARK` / `SEMANTIC_LIGHT` base, handle the three modes from D-L0.6 (full replacement via `atmospheres`, extend via `extendAtmospheres`, omit via `omitBuiltins`), emit `@font-face` blocks for `fonts`, emit `:root` overrides for `fontAssignments` after canvas variables so they win the cascade, build the manifest. No I/O. Unit-testable in isolation.

3. **Config loader (`src/loader.ts`).** Loads `void.config.{ts,js,mjs}` using `tsx`'s programmatic API (handles TS, ESM, CJS). Validates at load time via a hand-rolled validator — no zod dependency, keep L0 footprint tight. Clear errors for missing required fields, cycles in `extends`, malformed font `src`. Resolves `outDir` to an absolute path. Default `src/styles`.

4. **Vite plugin (`src/vite.ts`).** `voidEnergy(options?)` returns a Vite plugin. Auto-discovers `void.config.{ts,js,mjs}` at project root (configurable via `options.config`). Registers two virtual modules: `virtual:void-energy/generated.css` and `virtual:void-energy/manifest.json`. `configureServer` watches the config file and HMRs on change by invalidating both virtual modules. Exposes `plugin.manifest` as a runtime getter for SSR consumers.

5. **CLI (`src/cli.ts`, wired via `bin/void-energy.js`).** Commands: `void-energy build` (one-shot), `void-energy build --watch` (chokidar), `void-energy build --config <path> --out <path>`. Shares 100% of the generation path with the Vite plugin via the shared generator core. Shebang `#!/usr/bin/env node`.

6. **Runtime integration (extend Session 7's runtime).** New type `Manifest`. `init({ manifest })` loads `manifest.atmospheres` into the internal directory tagged with `source: 'config'` for non-builtin entries. Default-resolution updated: localStorage > `manifest.defaults` > `init({ defaults })` > L0 hard-coded fallback. `getAtmospheres()` returns `Array<{ name, physics, mode, source, label? }>` — signature change flagged in the d.ts. New `getAtmosphereBySource()` convenience. Runtime rejects mismatched `schemaVersion` (logs one clear error, continues with built-ins only). When a config atmosphere name collides with a built-in, config wins in the directory; config CSS applies later in cascade and overrides.

7. **Hand-authored parallel output discipline (continues from Sessions 4 and 7):** `dist/runtime.{js,cjs,d.ts}`, `dist/config.{js,cjs,d.ts}`, `dist/generator.{js,cjs,d.ts}`, `dist/vite.{js,cjs,d.ts}`, `bin/void-energy.js`. Parity test extended to cover all new surfaces.

8. **Tests:**
   - `tests/l0-generator.test.ts` (new) — pure-function coverage: full replacement, extend, omit, extends chain, cycle rejection, font assignment, empty config, MODE-A-with-zero-atmospheres edge (nothing in the picker — confirm runtime still boots).
   - Config validator tests: malformed configs produce clear errors.
   - `tests/l0-runtime.test.ts` extended: `init({ manifest })` merges correctly, `getAtmospheres` reports `source` accurately, schema-version mismatch handled gracefully, config/builtin name collision (config wins), no-manifest path still works.
   - `tests/l0-cli.test.ts` (new) — point the CLI at a fixture config, assert output matches a golden snapshot.
   - `tests/l0-vite.test.ts` (new) — boot a minimal Vite build programmatically against a fixture, assert virtual modules resolve to expected content.

9. **Documentation:**
   - New `CONFIG.md`: full schema reference, every field documented, common patterns (full brand replacement, extending built-ins, font loading, omitting specific built-ins).
   - `README.md` quick-start: full path (config + Vite plugin) as recommended setup; minimal path preserved as a shorter alternative.
   - `INTEGRATIONS.md`: Vite, Astro, Next.js, Nuxt, no-Vite (CLI-only) recipes.
   - `ATMOSPHERES.md`: three-source model (builtin / config / runtime) and when to pick which.

**Scope boundaries (explicitly v1):**

- **No runtime config reloading.** Manifest hydrated once at `init`. Full-page reload after `void.config.ts` edits in prod. HMR during dev is the Vite plugin's job.
- **No per-atmosphere font assignment.** Single global `fontAssignments`. Per-atmosphere fonts remain L1-only in v1 (D-L0.8 scope note).
- **No config validation against a JSON Schema.** Hand-rolled TypeScript validator only.
- **No interactive init wizard.** `void-energy init` scaffolder is Future Adoption Plays material.

**Stop point:** a consumer writes `void.config.ts`, runs build, sees their atmospheres render as first-class defaults with no X button in a theme picker that discriminates on `source`. Tests green. Vite plugin HMRs on config edits. CLI produces identical output to the plugin. Manifest schema version locked and tested.

**Mid-session checkpoint:** if execution runs long, stop after Steps 1–3 (pure generator core + config loader, no Vite or CLI yet). That is a safe resume boundary — the generator is independently testable without integration surfaces.

**Risk:** config loading in Node is a long-standing papercut (ESM vs CJS vs TS). `tsx`'s programmatic API is the current best choice; if it becomes a dependency issue, fall back to `esbuild-register`. The Vite plugin sidesteps this entirely by using Vite's own loader.

### Session 9 — Fonts + final integration polish

**Goal:** the font half of Session 8 is fully wired end-to-end. Consumer fonts load in two real integration fixtures (plain Vite + Next.js). `data-atmosphere` switching preserves font assignments. Preload hints are documented but not auto-emitted.

**Rationale:** fonts are the other half of D-L0.6. They technically ship in Session 8, but the integration surface (font-display races, SSR hydration, preload discipline) is subtle enough to deserve its own session for a proper cross-framework proof. Fonts are also the piece most likely to surface bugs late — better to land them with a dedicated session than to rush them alongside the config layer.

**Steps:**

1. **Font emission hardening (extend `src/generator.ts`).** `src` accepts either a plain string URL or an array of `{ url, format? }`. Generator emits the full `src: url(x) format('woff2'), url(y) format('woff');` shape. Defaults: `font-display: swap` when not specified (documented rationale: FOUT is preferable to invisible text during atmosphere switches). Deduplicate: multiple `fonts[]` entries with the same `family`+`weight`+`style` are merged (last wins, warning logged). `fontAssignments` emits `:root { --font-heading: <family>, <fallback-stack>; }` using VE's existing system-font fallback chain extracted from `design-tokens.ts`.

2. **FOUC cooperation.** Document the pattern: consumers add `<link rel="preload" as="font" crossorigin>` to their HTML head. Auto-emission is Phase 2 — needs framework-specific hooks, belongs upstream. Verify the FOUC script from Sessions 4 + 7 is unaffected by generated `@font-face` blocks (it should be — fonts load async via CSS with no attribute interaction).

3. **Cross-framework integration proof (builds on Session 5).**
   - **Fixture A — Vite + plain HTML.** Full path with a real font (Orbitron from a public CDN), Vite plugin, virtual-module imports. Verify font renders. Switch atmospheres — verify font persists.
   - **Fixture B — Next.js 15.** Uses the CLI path since Next.js uses Turbopack. Document pattern: `npx void-energy build --watch` in a `concurrently` script alongside `next dev`. Generated CSS imported in `app/layout.tsx`.
   - For both fixtures, test all three provenance tiers visibly: ship a builtin (`frost`), a config atmosphere (`midnight`), and register a runtime one (`user-theme`). Build a dumb HTML theme picker that renders the X button only when `source === 'runtime'`. This is the visible proof that D-L0.7's distinction works.

4. **Package publishing readiness.**
   - `npm pack` produces a clean tarball including all new files.
   - Tarball excludes: test fixtures, `node_modules`, source maps beyond what's needed, fixture apps.
   - Size budget: runtime + head + config + generator + vite + CLI combined, gzipped, under 15KB. Runtime core stays under 4KB; the rest is dev-time code that tree-shakes to zero in consumer production bundles.
   - Exports resolve correctly in both ESM and CJS on Node 18 / 20 / 22.

5. **Final documentation pass.**
   - `README.md` minimal-path and full-path examples both current.
   - `CONFIG.md`, `INTEGRATIONS.md`, `ATMOSPHERES.md`, `MIGRATION.md` cross-link correctly.
   - A one-page adoption summary aimed at evaluators deciding between L0, shadcn's theme tokens, and rolling their own.

**Scope boundaries (explicitly v1):**

- **No automatic `<link rel="preload">` emission.** Framework-specific, belongs upstream. Documented recipe only.
- **No font subsetting.** Consumers bring subsetted font files. `unicodeRange` passes through untouched for those who do.
- **No variable font axis controls.** Consumers set `weight: '100 900'` for variable fonts and override via CSS for axis tuning. A typed `fontVariationSettings` helper is follow-up.

**Stop point:** Phase 1 complete. L0 ships with a real config layer, real font management, and real theme-picker provenance distinction. Ready for Phase 3 monorepo restructure and eventual `npm publish`.

**Risk:** the Next.js / Turbopack path is fragile compared to Vite. If Next.js integration proves flaky, cut Fixture B (document only) and ship. The Vite path is the proof of concept; the CLI path is the escape hatch; Next.js compatibility is a validation nice-to-have, not a Phase 1 gate.

---

## Verification Checklist

### Token Accuracy (gated by Session 2 snapshot)
- [ ] Every CSS variable in L0 output matches the corresponding variable in L1's current SCSS output
- [ ] Spacing tokens scale correctly with `--density`
- [ ] Shadow values resolve to byte-equivalent computed values vs L1 baseline
- [ ] Typography clamp() formulas are identical to L1
- [ ] All four free atmospheres produce correct palettes
- [ ] All three physics presets produce correct surface/motion/depth tokens

### Built CSS spot-checks (after Session 3)
- [ ] `.min-h-control{min-height:var(--control-height)}` present
- [ ] `.rounded{border-radius:var(--radius-md)}` present
- [ ] `.border{border-width:var(--physics-border-width)}` present in void-overrides
- [ ] `.border-l{border-left-width:var(--physics-border-width)}` present (and same for r/t/b/x/y)
- [ ] `.border-2{border-width:2px}` still literal (numeric variants unaffected)
- [ ] `.container{max-width:720px}` at `min-width:768px` is the winning declaration
- [ ] `.bg-surface{background-color:var(--bg-surface)}` present
- [ ] `.text-main{color:var(--text-main)}` present
- [ ] `.font-heading{font-family:var(--font-heading)}` present (and `font-body`, `font-mono`)
- [ ] **No `--font-*` self-reference cycles in generated CSS** — `--font-heading:` declared exactly once (in `tokens.css` `:root`), never inside `@layer theme` as `var(--font-heading)`
- [ ] **DevTools font check**: `<h2 class="font-heading">` resolves to the actual font stack from `tokens.css`, not browser fallback (`serif`)

### Runtime (gated by Session 4)
- [ ] `setAtmosphere()` switches all palette variables correctly
- [ ] `setPhysics()` switches all physics variables correctly
- [ ] `setPhysics('glass')` auto-enforces dark mode
- [ ] `setPhysics('retro')` auto-enforces dark mode
- [ ] `setMode()` works for light, dark, and auto
- [ ] `setDensity()` affects all density-scaled spacing
- [ ] `init()` restores persisted state from localStorage
- [ ] `init()` applies defaults when no persisted state exists
- [ ] **SSR import test:** `node -e "const m = require('./dist/runtime.cjs'); Object.values(m).filter(f=>typeof f==='function').forEach(f=>f())"` exits cleanly
- [ ] `STORAGE_KEYS` constant exported and used by both `runtime.ts` and `head.ts`

### Tailwind Integration
- [ ] `bg-surface`, `bg-canvas`, `text-main`, `text-dim`, `text-mute` resolve correctly
- [ ] `shadow-float`, `shadow-lift`, `shadow-sunk` resolve to physics-specific shadows
- [ ] `p-md`, `gap-lg`, `m-sm` resolve to density-scalable spacing
- [ ] `rounded` adapts per physics preset (8px glass, 8px flat, 0 retro)
- [ ] `transition-base`, `duration-fast`, `ease-flow` resolve correctly
- [ ] `border` family is physics-aware (1px glass/flat, 2px retro)
- [ ] `min-h-control` produces a class (not an orphan `:root` variable)

### Cross-Framework Proof (Session 5)
- [ ] Works in a plain HTML file with no framework
- [ ] Works in a React + Vite app with shadcn/ui components
- [ ] FOUC script prevents flash on page load in both environments

### Build
- [ ] `npm run build:tokens -- --target=l0` produces all output files from `design-tokens.ts`
- [ ] Output CSS is valid and parses without errors
- [ ] Runtime bundles to under 3kb (gzipped)
- [ ] `npm pack` produces a clean tarball
- [ ] Tarball contains: theme.css, theme-no-container.css, tokens.css, atmospheres/*.css, physics/*.css, density.css, runtime.{js,d.ts}, head.{js,d.ts}, atmospheres.json, README.md, package.json
- [ ] No SCSS files in the published package
- [ ] No Svelte files in the published package
- [ ] No `node_modules`, `src/`, or monorepo leakage in the published package

### Documentation (Session 6)
- [ ] README quick-start works in under 2 minutes from `npm install`
- [ ] Atmosphere gallery shows all four free atmospheres with visuals
- [ ] API reference covers every exported function
- [ ] Migration guide exists for converting hardcoded Tailwind values
- [ ] FOUC prevention snippet is documented and tested in framework-specific examples

### Consumer Config Layer (Session 8)
- [ ] `void.config.ts` loads correctly from project root (TS, ESM, CJS all supported)
- [ ] Generator emits valid `void.generated.css` with merged atmosphere token blocks
- [ ] Generator emits valid `void.manifest.json` with correct `source` tagging (builtin/config)
- [ ] `extends` chain resolves in topological order; cycles produce a clear error
- [ ] MODE A (`atmospheres: {...}`) omits built-ins from the manifest
- [ ] MODE B (`extendAtmospheres: {...}`) keeps built-ins in the manifest
- [ ] MODE C (`omitBuiltins: [...]`) drops only the listed built-ins
- [ ] Vite plugin resolves `virtual:void-energy/generated.css` and `virtual:void-energy/manifest.json`
- [ ] Vite plugin HMRs on `void.config.ts` changes
- [ ] CLI produces output byte-identical to the Vite plugin for the same config
- [ ] `init({ manifest })` merges config atmospheres into the runtime directory
- [ ] `getAtmospheres()` returns entries with correct `source` values
- [ ] `getAtmosphereBySource('runtime')` filters correctly for theme-picker X-button UIs
- [ ] Schema-version mismatch logs a clear error and falls back to built-ins only
- [ ] No-manifest path (minimal install) still works unchanged

### Fonts (Session 9)
- [ ] `@font-face` blocks emitted correctly for string-URL and array-URL `src` shapes
- [ ] `font-display: swap` applied by default when not specified
- [ ] `fontAssignments` produces `:root` overrides after canvas variables (cascade wins)
- [ ] Duplicate `fonts[]` entries deduplicated with a warning
- [ ] Fonts persist across `setAtmosphere` calls in the visible fixtures
- [ ] `unicodeRange` passes through untouched
- [ ] FOUC script unaffected by generated `@font-face` blocks
- [ ] Preload documentation pattern validated in Fixture A (Vite)
- [ ] Next.js / Turbopack fixture works via CLI `--watch` (or documented limitation if cut)

### Package shape (Session 9)
- [ ] `npm pack` tarball contains all new surfaces (config, generator, vite, cli, bin)
- [ ] Tarball excludes fixtures, node_modules, extraneous source maps
- [ ] Gzipped total under 15KB; runtime core under 4KB
- [ ] ESM + CJS resolution tested on Node 18 / 20 / 22
- [ ] `bin: void-energy` maps to a working CLI entry

---

## Open Architecture Notes

### L1↔L0 unification (deferred per D-L0.1)
During Phase 1, L1 and L0 emit independent token outputs from the same SSOT. Drift is mitigated by snapshot tests but not eliminated. Phase 3's monorepo restructure is the right time to make L1 consume L0's CSS directly via workspace import — at that point the dual pipeline collapses to one and the snapshot tests become redundant.

### AI atmosphere generation (Phase 2 dependency)
L0 ships static atmosphere CSS files. Phase 2's AI atmosphere generator currently writes to L1's runtime theme registration (`voidEngine.registerTheme()`). For L0 consumers, the equivalent path is either runtime CSS injection (`document.head.appendChild(<style>)`) or server-rendered atmosphere CSS files. Phase 2 picks the strategy; this isn't blocking Phase 1, but the L0 runtime should expose a `registerAtmosphereCSS(name, cssText)` helper in a follow-up minor release if injection proves to be the right pattern.

### Shadow tinting (D-L0.2 follow-up)
The var()-driven shadow split assumes shadow color is set per atmosphere, geometry per physics. If Session 2 discovers that current shadows tint with `--energy-primary` (atmosphere-specific accent color), the atmosphere CSS will need to set `--shadow-base: oklch(from var(--energy-primary) ...)` or similar. The split still holds; only the value computation moves.

---

## Out of Scope

- **L0.5 CSS component classes** — deliberately excluded per D21. L0 is tokens, not components.
- **AI atmosphere generation for L0** — Phase 2 problem. Not blocking.
- **shadcn-void theme pack** — separate project, depends on L0 being stable first.
- **Theme generator web tool** — separate project, top-of-funnel marketing.
- **Atmosphere marketplace** — community feature, longer term.
- **Premium atmospheres in L0** — L0 ships the 4 free atmospheres only. DGRS atmospheres stay premium.
- **CLI inspector** (`npx void-energy inspect`) — nice-to-have, not Phase 1.
- **Runtime `registerAtmosphere` Safety Merge** — Session 7's runtime primitive still accepts full token sets only. Config-layer `extends` (Session 8) does merge; this exclusion is scoped to the runtime API.
- **External theme loading** — `loadAtmosphereFromUrl` stays an L2 concern. L0 ships `registerAtmosphere` as the runtime primitive and `void.config.ts` as the build-time primitive; nothing network-fetched.
- **Per-atmosphere font assignment** — v1 ships a single global `fontAssignments` block. L1 supports atmosphere-bound fonts; porting that to L0 is a post-v1 follow-up (D-L0.8).
- **Runtime font registration** — no `registerFont` API. Fonts are config-time only (D-L0.8).
- **Automatic preload tag emission** — framework-specific, belongs upstream. Documented recipe only (Session 9).
- **Interactive config init wizard** — `void-energy init` scaffolder is Future Adoption Plays material.
- **Manifest hot-reload at runtime** — manifest hydrated once at `init` time. Dev HMR is the Vite plugin's job.
- **L1 consuming L0 directly** — deferred to Phase 3 per D-L0.1.
- **Publishing to npm** — Phase 1 ends with `npm publish --dry-run`. Real publish waits for Phase 3 monorepo restructure.

---

## Future Adoption Plays (Post-Phase 1)

These build on L0 but are separate projects:

1. **VE Theme Generator** — web tool at void.dgrslabs.ink/generate. Pick colors, choose physics, preview live, export as L0 atmosphere CSS or L1 atmosphere definition.
2. **shadcn-void** — a shadcn theme pack mapping shadcn's token system to VE's L0 tokens. The most direct React bridge.
3. **CLI Inspector** — `npx void-energy inspect` scans a project for hardcoded values and suggests VE token replacements.
4. **Atmosphere Marketplace** — community-created atmospheres as CSS files, compatible with both L0 and L1.
