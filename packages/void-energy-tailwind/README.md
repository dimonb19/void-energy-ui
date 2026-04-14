# @void-energy/tailwind

Void Energy's design system brain as a **framework-agnostic Tailwind CSS v4 preset**. Four atmospheres, three physics presets, two color modes, three density levels — all driven by CSS variables and DOM attributes. Works with any framework. Zero runtime unless you want it.

> **Status:** Phase 1 complete. Not yet published to npm. See [SMOKE-REPORT.md](./SMOKE-REPORT.md) for the cross-framework validation run.

---

## Install

```bash
npm install @void-energy/tailwind tailwindcss@^4
```

## Quick start

**1. Import the preset.** In your top-level CSS file:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

**2. Inject the FOUC script.** In your HTML `<head>`, **before any stylesheet link**, inline the bootloader so atmosphere/physics attributes are pinned before first paint:

```html
<script>
  (function () {
    try {
      var s = localStorage, r = document.documentElement;
      r.setAttribute('data-atmosphere', s.getItem('ve-atmosphere') || 'frost');
      r.setAttribute('data-physics',    s.getItem('ve-physics')    || 'glass');
      r.setAttribute('data-mode',       s.getItem('ve-mode')       || 'dark');
      r.setAttribute('data-density',    s.getItem('ve-density')    || 'default');
    } catch (e) {}
  })();
</script>
```

You can import this string from `@void-energy/tailwind/head` and inject it programmatically — see [INTEGRATIONS.md](./INTEGRATIONS.md) for framework recipes.

**3. Use the tokens.** Standard Tailwind v4 utility classes resolve to semantic Void Energy tokens:

```html
<div class="flex flex-col gap-lg p-lg rounded border bg-surface text-main">
  <h1 class="text-h1 font-heading">Hello</h1>
  <p class="text-dim">Adapts across 4 atmospheres × 3 physics presets.</p>
</div>
```

**4. Switch atmospheres at runtime** (optional — the FOUC script handles initial state):

```ts
import { setAtmosphere, setPhysics, setDensity } from '@void-energy/tailwind/runtime';

setAtmosphere('terminal');   // also sets physics=retro, mode=dark
setPhysics('flat');          // standalone physics switch
setDensity('comfortable');   // 0.75 | 1 | 1.25 spacing multiplier
```

---

## What you get

| | |
|---|---|
| **4 atmospheres** | `slate`, `terminal`, `meridian`, `frost` — see [ATMOSPHERES.md](./ATMOSPHERES.md) |
| **3 physics presets** | `glass` (atmospheric blur + lift), `flat` (modern minimal), `retro` (hard edges, no motion) |
| **2 color modes** | `dark`, `light` (glass + retro force dark; flat supports both) |
| **3 density levels** | `compact` (0.75×), `default` (1×), `comfortable` (1.25×) |
| **Semantic tokens** | `--bg-canvas`, `--energy-primary`, `--color-premium`, `--control-height`, … — see [TOKENS.md](./TOKENS.md) |
| **Tailwind utilities** | `bg-surface`, `p-lg`, `rounded`, `border`, `min-h-control`, `font-heading`, … |
| **Footgun fixes** | physics-aware `.border`, adaptive `.rounded`, VE-scaled `.container`, `.backdrop-blur-physics` |
| **SSR-safe runtime** | ~1 KB gzipped, zero side effects on import |
| **FOUC prevention** | inline-script string export, framework-agnostic |

---

## How the system works

Every surface reads its material from three layers of CSS variables:

```
atmosphere   →  --bg-canvas, --energy-primary, --text-main, --color-premium, …  (colors + palette)
physics      →  --shadow-float, --physics-blur, --radius-base, --lift, --scale  (geometry + motion)
density      →  --density  (multiplier applied to spacing via calc())
```

Switching any of the four DOM attributes (`data-atmosphere`, `data-physics`, `data-mode`, `data-density`) on `<html>` triggers a full cascade swap. There is **no runtime state mutation** — the runtime just sets attributes and persists them to `localStorage`. All visual change happens via CSS variable rebinding.

This also means atmosphere switching works with SSR, static sites, and server-rendered HTML: the FOUC script pins the attributes before paint, and nothing else is required.

---

## API reference

### `@void-energy/tailwind/theme.css`

The preset. Import **after** `tailwindcss`. Pulls in `tokens.css`, the default atmosphere (`frost`), the default physics (`glass`), and `density.css`, then registers `@theme` bindings so Tailwind utilities resolve to VE tokens.

Also ships `@void-energy/tailwind/theme-no-container.css` — identical but with the `.container` override stripped, for apps that want to define their own container rules.

### `@void-energy/tailwind/runtime`

Vanilla JS runtime. ESM and CJS builds.

```ts
import {
  setAtmosphere,
  setPhysics,
  setMode,
  setDensity,
  init,
  getAtmospheres,
  STORAGE_KEYS,
} from '@void-energy/tailwind/runtime';
```

| Function | Signature | Notes |
|---|---|---|
| `setAtmosphere` | `(name: string) => void` | Also cascades the atmosphere's default physics + mode. |
| `setPhysics` | `(p: 'glass'\|'flat'\|'retro') => void` | `glass` and `retro` force `mode=dark`. |
| `setMode` | `(m: 'light'\|'dark'\|'auto') => void` | `auto` resolves via `prefers-color-scheme`; persists raw `'auto'`. |
| `setDensity` | `(d: 'compact'\|'default'\|'comfortable') => void` | Multipliers: 0.75, 1, 1.25. |
| `init` | `(defaults?) => void` | Restore persisted state from `localStorage`; call once on first render. |
| `getAtmospheres` | `() => Record<name, {physics, mode}>` | Returns a copy of the built-in manifest. |
| `STORAGE_KEYS` | `{atmosphere, physics, mode, density}` | The four `localStorage` keys: `ve-atmosphere`, `ve-physics`, `ve-mode`, `ve-density`. |

All setters are SSR-safe: silent no-op when `document` is unavailable. All `localStorage` access is try/caught.

### `@void-energy/tailwind/head`

```ts
import { FOUC_SCRIPT, STORAGE_KEYS } from '@void-energy/tailwind/head';
```

`FOUC_SCRIPT` is a string-literal IIFE for inline injection in `<head>`. `STORAGE_KEYS` is re-exported from the runtime so the two surfaces can't drift.

See [INTEGRATIONS.md](./INTEGRATIONS.md) for Next.js / Nuxt / Astro / SvelteKit / Vite injection recipes.

### `@void-energy/tailwind/atmospheres.json`

The atmosphere manifest, usable at build time:

```json
{
  "slate":    { "physics": "flat",  "mode": "dark",  "tagline": "Professional / Clean" },
  "terminal": { "physics": "retro", "mode": "dark",  "tagline": "Hacker / Retro" },
  "meridian": { "physics": "flat",  "mode": "light", "tagline": "Fintech / Brand" },
  "frost":    { "physics": "glass", "mode": "dark",  "tagline": "Arctic / Glass" }
}
```

### Granular imports

If you want to compose the cascade yourself (e.g. ship only two atmospheres):

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/tokens.css';
@import '@void-energy/tailwind/atmospheres/slate.css';
@import '@void-energy/tailwind/atmospheres/frost.css';
@import '@void-energy/tailwind/physics/glass.css';
@import '@void-energy/tailwind/physics/flat.css';
@import '@void-energy/tailwind/density.css';
```

You will need to re-author the `@theme` bridge yourself if you skip `theme.css`.

---

## Documentation

- [**ATMOSPHERES.md**](./ATMOSPHERES.md) — the four built-in atmospheres with palettes
- [**TOKENS.md**](./TOKENS.md) — every CSS variable, what it does, where it's overridden
- [**INTEGRATIONS.md**](./INTEGRATIONS.md) — framework recipes (Vite, Next.js, Nuxt, Astro, SvelteKit, plain HTML) + shadcn bridge
- [**MIGRATION.md**](./MIGRATION.md) — converting existing Tailwind codebases to VE tokens
- [**SMOKE-REPORT.md**](./SMOKE-REPORT.md) — cross-framework validation run + known rough edges

---

## License

BSL-1.1. Auto-converts to Apache-2.0 after 4 years. See the root `LICENSE` file.
