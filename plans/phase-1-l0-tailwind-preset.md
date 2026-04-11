# Phase 1 — L0: The Framework-Agnostic Tailwind Preset

> Extract Void Energy's design system brain as `@void-energy/tailwind` — a Tailwind CSS v4 preset that brings atmosphere switching, physics presets, density scaling, and semantic tokens to any framework. React, Vue, vanilla HTML — anything that uses Tailwind.

**Status:** Planning
**Priority:** Phase 1 (first priority — the adoption unlock)
**Depends on:** Phase 0 (Tailwind v4 migration — L1 must be on v4 before we extract L0)
**Blocks:** Phase 2 (AI automation references L0 as the universal layer), Phase 3 (monorepo ships L0 as a workspace package)

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

The token pipeline is already nearly structured for extraction. Here's what we have:

### Source of Truth
`src/config/design-tokens.ts` defines everything:
- `VOID_SPACING` — xs through 5xl (4px base unit, density-scalable)
- `VOID_RESPONSIVE` — 6 breakpoint tiers
- `VOID_LAYERS` — semantic z-index scale
- `VOID_RADIUS` — sm/md/lg/xl/full
- `VOID_TYPOGRAPHY` — clamp() fluid scales, weights, families
- `VOID_TOKENS.physics` — glass/flat/retro (motion, easing, blur, radius, shadow, lift, scale)
- `VOID_AMBIENT` — environment overlay tokens

`src/config/atmospheres.ts` defines each atmosphere's palette (canvas, surface, energy, text hierarchy, semantic colors) with mode and physics constraints.

### Build Pipeline
`scripts/generate-tokens.ts` reads design-tokens.ts and produces:
- `_generated-themes.scss` — SCSS maps consumed by the engine
- `_fonts.scss` — @font-face rules
- `font-registry.ts` — preload registry
- `void-registry.json` — runtime theme metadata
- `void-physics.json` — physics presets as JSON

### CSS Variable Emission
`src/styles/base/_themes.scss` + `src/styles/abstracts/_engine.scss` emit:
- `:root` — default physics + theme + ambient tokens
- `[data-physics="glass|flat|retro"]` — physics overrides
- `[data-atmosphere="name"]` — palette overrides
- Density scaling via `calc(value * var(--density, 1))`

### Tailwind Bridge
`tailwind.config.mjs` maps tokens to CSS variables:
```javascript
spacing: mapToVars(VOID_SPACING, 'space'),    // gap-md → var(--space-md)
colors: { primary: 'var(--energy-primary)' },  // text-primary → var(--energy-primary)
borderRadius: mapToVars(VOID_RADIUS, 'radius'),
// ... etc
```

### Runtime Switching
`src/adapters/void-engine.svelte.ts` sets `data-atmosphere`, `data-physics`, `data-mode` on `<html>`. CSS attribute selectors activate the right variable set. View Transitions API smooths the switch (Svelte-specific).

### What's Framework-Agnostic (Pure CSS)
- Spacing scale with density multiplication
- Color palette system (`[data-atmosphere]` selectors)
- Physics presets (`[data-physics]` selectors)
- Typography scale (clamp() formulas)
- Breakpoints, z-index, border radius
- Shadow system (per-physics computed shadows)
- Ambient tokens

### What's Svelte-Dependent
- VoidEngine reactive state ($state, $derived)
- View Transitions on theme switch
- Font preloading by atmosphere
- User config persistence UI
- Constraint enforcement (glass requires dark, etc.)

---

## What L0 Delivers

### Package Structure

```
@void-energy/tailwind
├── theme.css               ← @theme block: registers VE tokens with Tailwind v4
├── tokens.css              ← :root foundation tokens (spacing, radius, z-index, typography)
├── atmospheres/
│   ├── slate.css           ← [data-atmosphere="slate"] overrides
│   ├── terminal.css
│   ├── meridian.css
│   └── frost.css           ← default
├── physics/
│   ├── glass.css           ← [data-physics="glass"] overrides (with computed shadows)
│   ├── flat.css
│   └── retro.css
├── density.css             ← density presets ([data-density] selectors)
├── utilities.css           ← @utility definitions (backdrop-blur-physics, etc.)
├── runtime.js              ← vanilla JS runtime (~2-3kb, no framework dependency)
├── runtime.d.ts            ← TypeScript declarations for runtime API
├── head.js                 ← FOUC prevention inline script (copy into <head>)
└── README.md
```

**Key design:** In Tailwind v4, a "preset" is just a CSS file you `@import`. There is no JS preset config. The `theme.css` file uses `@theme` blocks to tell Tailwind which CSS variable names should generate utility classes. The actual runtime values come from `tokens.css` + `atmospheres/*.css` + `physics/*.css`.

### Consumer Experience

```bash
npm install @void-energy/tailwind
```

```css
/* app.css */
@import "tailwindcss";
@import "@void-energy/tailwind/theme.css";
```

That's it. Two lines. Their existing components now have access to VE's token-backed utility classes.

```jsx
// Any framework — React, Vue, Svelte, vanilla
<div className="bg-surface text-main shadow-float rounded-base p-lg">
  <h2 className="font-heading text-h2">Dashboard</h2>
  <p className="text-sub">Responds to atmosphere switching</p>
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
| AI atmosphere generation | Future (token output) | Yes |
| 40+ production components | No (use your own) | Yes |
| Kinetic typography | No | Yes (premium) |
| Ambient layers | No | Yes (premium) |
| Scoped CSS (zero leak) | No (Tailwind's responsibility) | Yes (Svelte native) |
| View transitions on switch | No (instant) | Yes (animated) |
| Physics-interpolated transitions | No | Yes |
| Font preloading per atmosphere | No (consumer's job) | Yes |

L0 is the 80/20 — 80% of VE's design system value with 0% framework lock-in.

---

## Implementation Plan

### Step 1 — New Generation Target

Add a new output target to `scripts/generate-tokens.ts` that produces pure CSS files instead of SCSS maps. This is the core extraction.

**What to generate:**

**`preset.css`** — Foundation tokens as `:root` variables:
```css
:root {
  /* Spacing (density-scalable) */
  --space-xs: calc(0.5rem * var(--density, 1));
  --space-sm: calc(1rem * var(--density, 1));
  --space-md: calc(1.5rem * var(--density, 1));
  --space-lg: calc(2rem * var(--density, 1));
  /* ... through 5xl */

  /* Typography */
  --font-size-caption: clamp(0.6875rem, 0.625rem + 0.125vw, 0.75rem);
  --font-size-body: clamp(0.8125rem, 0.75rem + 0.125vw, 0.875rem);
  /* ... through h1 */

  /* Z-index */
  --layer-sunk: -1;
  --layer-base: 0;
  /* ... through overlay */

  /* Border radius (physics overrides these) */
  --radius-sm: 4px;
  --radius-base: 8px;
  --radius-full: 9999px;

  /* Control geometry */
  --control-height: max(2.25rem, calc(2.75rem * var(--density, 1)));
  --density: 1;
}
```

**`atmospheres/*.css`** — One file per atmosphere:
```css
/* frost.css */
[data-atmosphere="frost"] {
  --bg-canvas: oklch(0.17 0.02 250);
  --bg-surface: oklch(0.21 0.02 250);
  --energy-primary: oklch(0.75 0.12 220);
  --energy-secondary: oklch(0.65 0.08 280);
  --text-main: oklch(0.92 0.01 250);
  --text-sub: oklch(0.72 0.02 250);
  --text-mute: oklch(0.52 0.02 250);
  /* ... full palette */
}
```

**`physics/*.css`** — One file per physics preset:
```css
/* glass.css */
[data-physics="glass"] {
  --radius-base: 8px;
  --physics-blur: 20px;
  --physics-border-width: 1px;
  --speed-instant: 100ms;
  --speed-fast: 200ms;
  --speed-base: 300ms;
  --speed-slow: 500ms;
  --ease-flow: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring-gentle: cubic-bezier(0.34, 1.56, 0.64, 1);
  --lift: -3px;
  --scale: 1.02;
  --shadow-sunk: inset 0 1px 3px rgba(0, 0, 0, 0.25);
  --shadow-float: 0 1px 3px rgba(0, 0, 0, 0.12), 0 6px 20px -4px rgba(0, 0, 0, 0.15);
  --shadow-lift: 0 4px 12px rgba(0, 0, 0, 0.15), 0 12px 36px -8px rgba(0, 0, 0, 0.2);
  /* ... */
}
```

**`density.css`** — Density presets:
```css
[data-density="compact"] { --density: 0.75; }
[data-density="default"] { --density: 1; }
[data-density="comfortable"] { --density: 1.25; }
```

**Source:** All values come from `design-tokens.ts` and `atmospheres.ts` — the same SSOT that generates the SCSS. The shadow computations currently in `_engine.scss` need to be ported to the generator so they can be emitted as CSS without SCSS dependencies.

**Key challenge:** The computed shadows in `_engine.scss` are the one place where SCSS does real computation (combining physics tokens with atmosphere-specific energy tints for glow effects). These calculations need to move into `generate-tokens.ts` so the CSS output is self-contained.

### Step 2 — Vanilla JS Runtime

A small (~2-3kb) framework-agnostic runtime that replaces VoidEngine for L0 consumers.

```typescript
// runtime.ts — vanilla JS, no framework imports
const ROOT = () => document.documentElement;

/** Physics↔mode constraints (mirrors VoidEngine logic) */
const CONSTRAINTS: Record<string, string> = {
  glass: 'dark',
  retro: 'dark',
};

export function setAtmosphere(name: string): void {
  ROOT().setAttribute('data-atmosphere', name);
  // If the atmosphere has a default physics/mode, apply them
  const meta = getAtmosphereMeta(name);
  if (meta?.physics) setPhysics(meta.physics);
  if (meta?.mode) setMode(meta.mode);
  persist('atmosphere', name);
}

export function setPhysics(preset: 'glass' | 'flat' | 'retro'): void {
  ROOT().setAttribute('data-physics', preset);
  // Enforce constraints: glass/retro require dark
  const requiredMode = CONSTRAINTS[preset];
  if (requiredMode) setMode(requiredMode);
  persist('physics', preset);
}

export function setMode(mode: 'light' | 'dark' | 'auto'): void {
  const resolved = mode === 'auto'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode;
  ROOT().setAttribute('data-mode', resolved);
  persist('mode', mode);
}

export function setDensity(level: 'compact' | 'default' | 'comfortable'): void {
  ROOT().setAttribute('data-density', level);
  persist('density', level);
}

/** Restore persisted state (call on page load) */
export function init(defaults?: {
  atmosphere?: string;
  physics?: string;
  mode?: string;
  density?: string;
}): void {
  const atmos = restore('atmosphere') ?? defaults?.atmosphere ?? 'frost';
  const physics = restore('physics') ?? defaults?.physics ?? 'glass';
  const mode = restore('mode') ?? defaults?.mode ?? 'dark';
  const density = restore('density') ?? defaults?.density ?? 'default';
  setAtmosphere(atmos);
  setPhysics(physics);
  setMode(mode);
  setDensity(density);
}

/** Get all available atmosphere names (from loaded CSS) */
export function getAtmospheres(): string[] {
  // Parse from loaded stylesheets or from a generated manifest
  return ATMOSPHERE_LIST;
}

// Persistence helpers (localStorage, silent fail for SSR)
function persist(key: string, value: string): void {
  try { localStorage.setItem(`ve-${key}`, value); } catch {}
}
function restore(key: string): string | null {
  try { return localStorage.getItem(`ve-${key}`); } catch { return null; }
}
```

**What the runtime does NOT do:**
- No view transitions (that's L1, requires framework support)
- No font preloading (consumer's responsibility)
- No temporary theme stack (L1 feature for modals/previews)
- No theme registration (atmospheres are CSS files, not runtime objects)
- No reactive state ($state is Svelte — L0 uses DOM attributes directly)

### Step 3 — Tailwind v4 Theme CSS

In Tailwind v4, the JS config (`tailwind.config.mjs`) is replaced by `@theme` blocks in CSS. A "preset" is just a CSS file consumers `@import`. The L0 package ships `theme.css` which registers VE's CSS variable names with Tailwind so it generates the right utility classes.

```css
/* theme.css — shipped in @void-energy/tailwind */
@import "tailwindcss";

/* Import L0's own CSS layers */
@import "./tokens.css";           /* :root foundation tokens */
@import "./atmospheres/frost.css"; /* default atmosphere */
@import "./physics/glass.css";     /* default physics */
@import "./density.css";
@import "./utilities.css";

/* ── Register tokens with Tailwind v4 ── */

/* Wipe Tailwind defaults — VE is the complete token system */
@theme inline {
  --color-*: initial;
  --spacing-*: initial;
}

/* Spacing (density-scalable, values come from tokens.css) */
@theme inline {
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-xs: var(--space-xs);
  --spacing-sm: var(--space-sm);
  --spacing-md: var(--space-md);
  --spacing-lg: var(--space-lg);
  --spacing-xl: var(--space-xl);
  --spacing-2xl: var(--space-2xl);
  --spacing-3xl: var(--space-3xl);
  --spacing-4xl: var(--space-4xl);
  --spacing-5xl: var(--space-5xl);
}

/* Colors (values come from atmosphere CSS) */
@theme inline {
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-sunk: var(--bg-sunk);
  --color-spotlight: var(--bg-spotlight);
  --color-primary: var(--energy-primary);
  --color-secondary: var(--energy-secondary);
  --color-border: var(--border-color);
  --color-main: var(--text-main);
  --color-dim: var(--text-dim);
  --color-mute: var(--text-mute);
  --color-premium: var(--color-premium);
  --color-system: var(--color-system);
  --color-success: var(--color-success);
  --color-error: var(--color-error);
  /* ... semantic variants */
}

/* Shadows (values come from physics CSS) */
@theme inline {
  --shadow-sunk: var(--shadow-sunk);
  --shadow-float: var(--shadow-float);
  --shadow-lift: var(--shadow-lift);
}

/* ... breakpoints, radius, motion, typography — same pattern as Phase 0's theme file */
```

**`@theme inline` is critical** — it tells Tailwind to inline the variable reference rather than creating a new CSS variable. Without `inline`, Tailwind would create `--spacing-md: var(--space-md)` as a new variable, which breaks when the underlying `--space-md` changes at runtime (atmosphere/physics switch). With `inline`, the utility class directly uses `var(--space-md)`.

The `theme.css` file is generated by the L0 build script from `design-tokens.ts`, not hand-maintained. This ensures L0 and L1 always produce identical token vocabularies.

### Step 4 — Atmosphere Metadata

The runtime needs to know each atmosphere's default physics and mode. Generate a small JSON manifest alongside the CSS:

```json
{
  "frost": { "physics": "glass", "mode": "dark" },
  "slate": { "physics": "flat", "mode": "dark" },
  "terminal": { "physics": "retro", "mode": "dark" },
  "meridian": { "physics": "flat", "mode": "light" }
}
```

This is already generated as `void-registry.json` — the L0 build just needs to include a minimal version of it.

### Step 5 — SSR Safety (Design Constraint)

The runtime must work in SSR environments (Next.js, Nuxt, Astro SSR, SvelteKit) without errors. This is not a nice-to-have — it's a hard requirement for the target audience.

**The rule:** Zero side effects on import. All DOM access inside exported functions only, behind environment guards.

```typescript
// runtime.ts — SSR-safe design

// NEVER at module scope:
//   const root = document.documentElement;     // ReferenceError in Node
//   const saved = localStorage.getItem('...');  // ReferenceError in Node

// ALWAYS behind a guard, inside a function:
const isBrowser = typeof document !== 'undefined';

function getRoot(): HTMLElement | null {
  return isBrowser ? document.documentElement : null;
}

export function setAtmosphere(name: string): void {
  const root = getRoot();
  if (!root) return;  // SSR — silent no-op
  root.setAttribute('data-atmosphere', name);
  persistIfBrowser('atmosphere', name);
}

export function init(defaults?: InitOptions): void {
  if (!isBrowser) return;  // SSR — silent no-op
  // ... restore from localStorage, apply defaults
}

// Persistence: guarded, never throws
function persistIfBrowser(key: string, value: string): void {
  if (!isBrowser) return;
  try { localStorage.setItem(`ve-${key}`, value); } catch {}
}
```

**Key constraints:**
- `import { setAtmosphere } from '@void-energy/tailwind/runtime'` must not throw in Node.js
- Every exported function silently no-ops when `document` is unavailable
- `localStorage` access is always try/caught (incognito Safari, SSR, web workers)
- `init()` must be explicitly called by the consumer — never auto-invoked on import
- The module has zero top-level side effects (no `document.addEventListener`, no `matchMedia` listeners at module scope)
- For SSR frameworks: the server renders with default attributes (`data-atmosphere="frost"` etc.), the FOUC script restores persisted state before hydration

**Testing:** Include a Node.js test that imports the runtime module and calls every exported function — must not throw.

### Step 6 — FOUC Prevention

L0 needs a blocking script pattern to prevent flash of unstyled content, similar to how L1's `ThemeScript` component works:

```html
<!-- Add to <head> — inline blocking script -->
<script>
  (function() {
    var s = localStorage;
    var r = document.documentElement;
    r.setAttribute('data-atmosphere', s.getItem('ve-atmosphere') || 'frost');
    r.setAttribute('data-physics', s.getItem('ve-physics') || 'glass');
    r.setAttribute('data-mode', s.getItem('ve-mode') || 'dark');
    r.setAttribute('data-density', s.getItem('ve-density') || 'default');
  })();
</script>
```

Ship this as:
- A copyable snippet in the README
- An exported string constant: `import { FOUC_SCRIPT } from '@void-energy/tailwind/head'` that frameworks can inject into their `<head>`
- Framework-specific examples in docs (Next.js `<Script strategy="beforeInteractive">`, Nuxt `useHead()`, Astro `<script is:inline>`)

### Step 7 — Documentation

Professional, clean docs that make L0 feel production-ready:

1. **README.md** — quick start (install, import, use), atmosphere gallery with screenshots, API reference, upgrade path to full VE
2. **MIGRATION.md** — how to migrate an existing Tailwind project from hardcoded values to VE tokens
3. **ATMOSPHERES.md** — visual guide to each atmosphere (palette, physics, mode)
4. **Token reference table** — every CSS variable, its purpose, which physics/atmosphere overrides it

---

## Token Naming & Namespace Strategy

### The Problem
Generic names like `--surface` could collide with other design systems. VE's current tokens use descriptive prefixes (`--bg-surface`, `--energy-primary`, `--text-main`) which are already somewhat namespaced.

### The Decision
Keep the current naming convention. VE's token names are semantic enough to be distinct:
- `--bg-canvas`, `--bg-surface` (not just `--canvas`, `--surface`)
- `--energy-primary`, `--energy-secondary` (unique to VE)
- `--text-main`, `--text-sub`, `--text-mute` (descriptive)
- `--physics-blur`, `--speed-fast` (VE-specific concepts)

For Tailwind utility classes, use the same names: `bg-surface`, `text-main`, `shadow-float`. These are distinctive enough. If collision becomes a real issue in practice, a configurable prefix can be added later without breaking the CSS variable layer.

**Rejected:** `ve-` prefix on everything (`--ve-bg-surface`, `bg-ve-surface`). Too verbose. Adds friction. Solve if/when it's a real problem.

---

## What L0 Does NOT Include

- **Components** — use your own (shadcn, Radix, custom, whatever). L0 gives you tokens, not UI.
- **SCSS** — L0 output is pure CSS. No SCSS dependency for consumers.
- **Svelte anything** — no framework imports, no runes, no stores.
- **View transitions** — theme switches are instant CSS attribute changes.
- **Font files** — consumers manage their own fonts. L0 provides the `--font-heading`/`--font-body`/`--font-mono` variables; consumers point them at their own font stacks.
- **Ambient layers, kinetic text, Rive** — premium L1 features.
- **AI automation context** — that's L2, and it only works with L1.
- **CSS component classes (L0.5)** — deliberately excluded. L0 is tokens + runtime. L1 is components. No middle layer that creates maintenance burden and an upgrade off-ramp.

---

## Build & Development

### Where L0 Lives (Current Monorepo)

During Phase 1, L0 is developed inside the current monorepo:

```
scripts/
  generate-tokens.ts          ← extended with L0 CSS output targets
  generate-l0.ts              ← dedicated L0 build script (or merged into generate-tokens)
packages/
  void-energy-tailwind/       ← L0 package source
    src/
      runtime.ts              ← vanilla JS runtime
      preset.js               ← Tailwind v4 preset
    dist/                     ← generated CSS output (from build:l0)
      preset.css
      atmospheres/
      physics/
      density.css
      typography.css
    package.json
    README.md
    tsconfig.json
```

### Build Command

```bash
npm run build:l0    # generates CSS from design-tokens.ts + bundles runtime
```

This mirrors the existing `build:tokens` pattern. Both read from the same SSOT (`design-tokens.ts`), produce different output formats (SCSS for L1, CSS for L0).

### In Phase 3 (Monorepo Restructure)

L0 becomes a workspace package in the public monorepo:

```
packages/
  void-energy/                ← L1 (Svelte components)
  void-energy-tailwind/       ← L0 (Tailwind preset)
  create-void-energy/         ← scaffolder
```

Both L0 and L1 share the same `design-tokens.ts` SSOT via workspace imports. When a token changes, both packages update.

---

## Shadow Computation Extraction

The most complex part of L0 is extracting the shadow system. Currently, `_engine.scss` computes shadows using SCSS:

```scss
// Current: SCSS-computed shadows per physics preset
$shadow-float: 0 1px 3px rgba($shadow-base, 0.12),
               0 6px 20px -4px rgba($shadow-base, 0.15);
```

These shadows combine physics tokens with hardcoded opacity values. For L0, these computations need to move into `generate-tokens.ts` so the output is pure CSS.

**Approach:** Port the shadow computation logic from SCSS into the TypeScript generator. The generator already handles physics presets — it just needs to also compute the derived shadow values and emit them as CSS variables. The SCSS engine then reads the same values from CSS variables instead of computing them, keeping both systems in sync.

This is the one place where the extraction requires actual logic porting, not just format conversion.

---

## Implementation Order

1. **Extend `generate-tokens.ts`** — add CSS output targets for preset, atmospheres, physics, density, typography. Start with the simple tokens (spacing, radius, z-index, typography). Verify output matches current CSS variables.

2. **Port shadow computation** — move the SCSS shadow math into the TypeScript generator. Verify the generated CSS shadows match the current SCSS-computed ones. Update `_engine.scss` to consume the generated values (so L1 stays in sync).

3. **Write the vanilla JS runtime** — `setAtmosphere()`, `setPhysics()`, `setMode()`, `setDensity()`, `init()`, persistence, constraint enforcement. Test in a plain HTML file.

4. **Write the Tailwind v4 preset** — map generated CSS variables to Tailwind theme configuration. Verify that `bg-surface`, `text-main`, `shadow-float` etc. resolve correctly.

5. **Build the package scaffold** — `package.json`, `tsconfig.json`, build script that generates CSS + bundles runtime.

6. **Test with a React + shadcn app** — create a minimal test app that installs L0, uses VE tokens in a few shadcn components, switches atmospheres. This is the proof that L0 works.

7. **Write documentation** — README (quick start + API), migration guide, atmosphere gallery. Professional quality — this is the first thing React developers will see.

8. **FOUC prevention** — ship the head script snippet. Test that page loads don't flash.

---

## Verification Checklist

### Token Accuracy
- [ ] Every CSS variable in L0 output matches the corresponding variable in L1's SCSS output
- [ ] Spacing tokens scale correctly with `--density`
- [ ] Shadow values in physics CSS match SCSS-computed shadows
- [ ] Typography clamp() formulas are identical to L1
- [ ] All four free atmospheres produce correct palettes

### Runtime
- [ ] `setAtmosphere()` switches all palette variables correctly
- [ ] `setPhysics()` switches all physics variables correctly
- [ ] `setPhysics('glass')` auto-enforces dark mode
- [ ] `setPhysics('retro')` auto-enforces dark mode
- [ ] `setMode()` works for light, dark, and auto
- [ ] `setDensity()` affects all density-scaled spacing
- [ ] `init()` restores persisted state from localStorage
- [ ] `init()` applies defaults when no persisted state exists
- [ ] Runtime works with SSR (no `document` access during import)

### Tailwind Integration
- [ ] `bg-surface`, `bg-canvas`, `text-main`, `text-sub`, `text-mute` resolve correctly
- [ ] `shadow-float`, `shadow-lift`, `shadow-sunk` resolve to physics-specific shadows
- [ ] `p-md`, `gap-lg`, `m-sm` resolve to density-scalable spacing
- [ ] `rounded-base` adapts per physics preset
- [ ] `transition-base`, `duration-fast`, `ease-flow` resolve correctly
- [ ] Tailwind's JIT generates correct utility classes from the preset

### Cross-Framework Proof
- [ ] Works in a plain HTML file with no framework
- [ ] Works in a React + Vite app
- [ ] Works in a Next.js app
- [ ] Works with shadcn/ui components
- [ ] Works in a Vue app

### Documentation
- [ ] README is complete, professional, with quick-start that works in under 2 minutes
- [ ] Atmosphere gallery shows all four free atmospheres with visuals
- [ ] API reference covers every exported function
- [ ] Migration guide exists for converting hardcoded Tailwind values
- [ ] FOUC prevention snippet is documented and tested

### Build
- [ ] `npm run build:l0` produces all output files from `design-tokens.ts`
- [ ] Output CSS is valid and parses without errors
- [ ] Runtime bundles to under 3kb (gzipped)
- [ ] Package can be published to npm independently
- [ ] No SCSS files in the published package
- [ ] No Svelte files in the published package

---

## Out of Scope

- **L0.5 CSS component classes** — deliberately excluded. L0 is tokens, not components. See strategy discussion for rationale.
- **AI atmosphere generation for L0** — future work. Would produce atmosphere CSS files from user input.
- **shadcn-void theme pack** — separate project, depends on L0 being stable first.
- **Theme generator web tool** — separate project, top-of-funnel marketing.
- **Atmosphere marketplace** — community feature, longer term.
- **Premium atmospheres in L0** — L0 ships the 4 free atmospheres only. DGRS atmospheres stay premium.
- **CLI inspector** (`npx void-energy inspect`) — nice-to-have, not Phase 1.
- **Custom atmosphere API** — L0 consumers can create their own atmosphere CSS files manually, following the pattern. A generator/API comes later.

---

## Future Adoption Plays (Post-Phase 1)

These build on L0 but are separate projects:

1. **VE Theme Generator** — web tool at void.dgrslabs.ink/generate. Pick colors, choose physics, preview live, export as L0 atmosphere CSS or L1 atmosphere definition.
2. **shadcn-void** — a shadcn theme pack mapping shadcn's token system to VE's L0 tokens. The most direct React bridge.
3. **CLI Inspector** — `npx void-energy inspect` scans a project for hardcoded values and suggests VE token replacements.
4. **Atmosphere Marketplace** — community-created atmospheres as CSS files, compatible with both L0 and L1.
