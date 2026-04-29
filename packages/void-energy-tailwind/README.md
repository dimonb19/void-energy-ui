# @void-energy/tailwind

Void Energy's design system brain as a **framework-agnostic Tailwind CSS v4 preset**. Four built-in atmospheres, three physics presets, two color modes, three density levels — plus a consumer config layer that lets you replace VE's themes with your own and ship them as first-class defaults. Works with any framework. Zero runtime unless you want it.

**See it live:** [void.dgrslabs.ink](https://void.dgrslabs.ink) — every atmosphere, physics preset, and density level, switchable in the browser.

> **Status:** Phase 1 complete (Sessions 1–9). Not yet published to npm.

---

## Install

```bash
npm install @void-energy/tailwind tailwindcss@^4
```

---

## Three ways to adopt

Import `theme.css` once, then pick (or mix) how components get styled. All three are pure CSS imports — no runtime, no wrappers, no build step.

| Path | Add to your CSS | Use when |
|---|---|---|
| **Tokens only** | just `theme.css` | You're bringing your own components or writing bare HTML with Tailwind utilities. Every `bg-surface`, `p-lg`, `rounded`, `font-heading` resolves to semantic VE tokens. |
| **Components bundle** | `+ components.css` (~18 KB gzip) | You want zero-config styled native HTML: `<button class="btn">`, styled `<input>`, styled `<dialog>`, toasts, tabs, dropdowns — without installing a component library. |
| **Ecosystem bridge** | `+ bridges/shadcn.css` (or `radix-themes.css` / `mantine.css`) | You're already using shadcn/ui, Radix Themes, or Mantine. The bridge aliases the library's CSS variables onto VE tokens — every component repaints on `setAtmosphere()` with no code changes. |

You can combine them — e.g. `components.css` for native HTML plus a shadcn bridge for composite components. See [INTEGRATIONS.md](./INTEGRATIONS.md) for ecosystem bridges and the components bundle, and the two setup paths below for bootstrapping the preset.

---

## Recommended setup — full path (config file + Vite plugin)

Five files to a working branded app with your own atmospheres and fonts rendered as permanent defaults.

**1. `void.config.ts`** (project root) — declare your atmospheres and fonts:

```ts
import { defineConfig, defineAtmosphere } from '@void-energy/tailwind/config';

export default defineConfig({
  atmospheres: {
    midnight: defineAtmosphere({
      physics: 'glass',
      mode: 'dark',
      label: 'Midnight',
      tokens: { '--bg-canvas': '#05060b', '--energy-primary': '#7c5cff' },
    }),
  },
  fonts: [
    { family: 'Orbitron', src: '/fonts/Orbitron.woff2', weight: '400 900' },
  ],
  fontAssignments: { heading: 'Orbitron' },
  defaults: { atmosphere: 'midnight' },
});
```

**2. `vite.config.ts`** — register the plugin:

```ts
import { voidEnergy } from '@void-energy/tailwind/vite';
export default { plugins: [voidEnergy()] };
```

**3. `app.css`** — import the preset plus the generated virtual module:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import 'virtual:void-energy/generated.css';
```

**4. App entry** — hand the manifest to the runtime:

```ts
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';
init({ manifest });
```

**5. FOUC script** in `<head>` — inline the bootloader so atmosphere/physics attributes pin before first paint. The verbatim script lives in the **Minimal setup** section below, or import `FOUC_SCRIPT` from `@void-energy/tailwind/head` and inject it via your framework (see [INTEGRATIONS.md](./INTEGRATIONS.md)).

Your theme picker now renders built-ins plus your config atmospheres as permanent cards (no X button). Only `registerAtmosphere()`-registered themes are end-user-removable. See [CONFIG.md](./CONFIG.md) for the schema reference and [INTEGRATIONS.md](./INTEGRATIONS.md) for per-framework recipes (Vite, Next.js CLI `--watch`, Nuxt, Astro, SvelteKit).

Not using Vite? Use the CLI:

```bash
npx void-energy build            # one-shot
npx void-energy build --watch    # chokidar-backed rebuilds
```

The CLI writes `void.generated.css` + `void.manifest.json` to the config's `outDir` (default `src/styles`). Output is byte-identical to the Vite plugin for the same config.

---

## Minimal setup — no config file

If you just want VE's four built-in atmospheres without any customization:

**1. Import the preset.** In your top-level CSS file:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

**2. Inject the FOUC script.** (FOUC = Flash of Unstyled Content.) In your HTML `<head>`, **before any stylesheet link**, inline the bootloader so atmosphere/physics attributes are pinned before first paint:

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
| **2 color modes** | `dark`, `light` (glass + retro force dark; flat supports both). Of the four built-ins, **only `meridian` ships in light mode** — the others are dark-first because their physics demands it. |
| **3 density levels** | `compact` (0.75×), `default` (1×), `comfortable` (1.25×) |
| **Semantic tokens** | `--bg-canvas`, `--energy-primary`, `--color-premium`, `--control-height`, … — see [TOKENS.md](./TOKENS.md) |
| **Tailwind utilities** | `bg-surface`, `p-lg`, `rounded`, `border`, `min-h-control`, `font-heading`, … |
| **Footgun fixes** | physics-aware `.border`, adaptive `.rounded`, VE-scaled `.container`, `.backdrop-blur-physics` |
| **SSR-safe runtime** | ~1 KB gzipped, zero side effects on import |
| **SSR cookie bridge** | per-user atmosphere baked into server-rendered HTML; cookie + localStorage dual-write |
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

### `@void-energy/tailwind/components.css`

Optional precompiled component styles (~18 KB gzipped). Import after `theme.css` to style native HTML elements — `<button class="btn">`, `<input>`, `<dialog>`, toasts, dropdowns, chips, badges, pagination, tabs, and ~70 other classes — with VE physics already applied. Pure CSS, no JS. Generated from L1's `src/styles/components/**` sources; shipped with L0 for convenience.

Consumers using an ecosystem bridge (shadcn, Radix, Mantine) typically don't need this — the bridge already styles the library's components. See [Components bundle](./INTEGRATIONS.md#components-bundle-optional) for the full list.

### `@void-energy/tailwind/bridges/*`

Pre-built ecosystem bridges — pure CSS alias layers that map a third-party library's CSS variables onto VE tokens. No runtime, no wrappers. Three ship today:

- `@void-energy/tailwind/bridges/shadcn.css` — shadcn/ui
- `@void-energy/tailwind/bridges/radix-themes.css` — Radix Themes
- `@void-energy/tailwind/bridges/mantine.css` — Mantine

Import after `theme.css` and every component in the target library repaints on atmosphere change. See [Ecosystem bridges](./INTEGRATIONS.md#ecosystem-bridges) for per-library recipes and edge cases.

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
  getAtmosphereBySource,
  registerAtmosphere,
  unregisterAtmosphere,
  getCustomAtmospheres,
  getState,
  subscribe,
  STORAGE_KEYS,
  MANIFEST_SCHEMA_VERSION,
} from '@void-energy/tailwind/runtime';
```

| Function | Signature | Notes |
|---|---|---|
| `setAtmosphere` | `(name: string) => void` | Cascades the atmosphere's default physics + mode. |
| `setPhysics` | `(p: 'glass'\|'flat'\|'retro') => void` | `glass` and `retro` force `mode=dark`. |
| `setMode` | `(m: 'light'\|'dark'\|'auto') => void` | `auto` resolves via `prefers-color-scheme`; persists raw `'auto'`. |
| `setDensity` | `(d: 'compact'\|'default'\|'comfortable') => void` | Multipliers: 0.75, 1, 1.25. |
| `init` | `({ manifest?, atmosphere?, physics?, mode?, density? }?) => void` | Hydrate manifest + restore persisted state. Default-resolution chain: `localStorage` > `manifest.defaults` > `init({ defaults })` > L0 fallback. |
| `getAtmospheres` | `() => AtmosphereEntry[]` | `[{ name, source, physics, mode, label? }, …]`. Runtime > config > builtin when names collide. |
| `getAtmosphereBySource` | `(source: 'builtin'\|'config'\|'runtime') => AtmosphereEntry[]` | Filter the directory — use `'runtime'` to decide where to render the X button. |
| `registerAtmosphere` | `(name, { physics, mode, tokens }) => void` | End-user-added themes. Injects a scoped `<style>` tag, persists to `localStorage`. |
| `unregisterAtmosphere` | `(name) => void` | Removes a runtime atmosphere. |
| `getCustomAtmospheres` | `() => string[]` | Names of currently-registered runtime atmospheres. |
| `getState` | `() => { atmosphere, physics, mode, density }` | Snapshot of the four `data-*` attributes on `<html>`. |
| `subscribe` | `(listener) => unsubscribe` | One notification per logical transaction (`setAtmosphere` coalesces its internal setters). |
| `STORAGE_KEYS` | `{atmosphere, physics, mode, density, customAtmospheres}` | The five `localStorage` keys (`ve-*`). |
| `MANIFEST_SCHEMA_VERSION` | `1` | The schema version the runtime accepts. Mismatches log one error and fall back to built-ins. |

All setters are SSR-safe: silent no-op when `document` is unavailable. All `localStorage` access is try/caught.

### `@void-energy/tailwind/head`

```ts
import { FOUC_SCRIPT, STORAGE_KEYS } from '@void-energy/tailwind/head';
```

`FOUC_SCRIPT` is a string-literal IIFE for inline injection in `<head>`. `STORAGE_KEYS` is re-exported from the runtime so the two surfaces can't drift.

See [INTEGRATIONS.md](./INTEGRATIONS.md) for Next.js / Nuxt / Astro / SvelteKit / Vite injection recipes.

### `@void-energy/tailwind/ssr`

```ts
import {
  readAtmosphereCookie,
  serializeAtmosphereCookie,
  renderRootAttributes,
} from '@void-energy/tailwind/ssr';
```

Three pure framework-agnostic primitives so an SSR framework can render a page with the user's persisted atmosphere baked into the initial HTML.

| Function | Signature | Notes |
|---|---|---|
| `readAtmosphereCookie` | `(cookieHeader: string \| null \| undefined) => AtmosphereCookieState` | Parses a Cookie request header, validates against the FOUC value vocabulary, drops malformed values silently. Returns `{ atmosphere?, physics?, mode?, density? }`. |
| `serializeAtmosphereCookie` | `(state, opts?: { secure?, maxAge?, sameSite? }) => string[]` | Emits one `name=value; Path=/; Max-Age=...; SameSite=Lax[; Secure]` line per set key. Usable as `Set-Cookie` response headers or `document.cookie` assignments. |
| `renderRootAttributes` | `(state) => string` | Returns `data-atmosphere="..." data-physics="..." data-mode="..." data-density="..."` (unset keys omitted, no leading/trailing space) for `<html>` injection. HTML-safe by construction. |

Cookie key names are exactly `STORAGE_KEYS.atmosphere/physics/mode/density` — shared from the runtime so the two surfaces can't drift. The `customAtmospheres` registry is intentionally out of scope; runtime atmospheres remain client-only and the FOUC script's rehydration restores them before paint.

The runtime dual-writes cookie + localStorage on every state change, so once a user has interacted with the app the cookie is current and the next SSR render sees the right state. See [INTEGRATIONS.md](./INTEGRATIONS.md) for Astro / SvelteKit / Next.js recipes.

### `@void-energy/tailwind/config`

```ts
import { defineConfig, defineAtmosphere } from '@void-energy/tailwind/config';
import type { VoidConfig, AtmosphereDef, FontSource } from '@void-energy/tailwind/config';
```

Identity functions + types for `void.config.ts`. Zero runtime cost. See [CONFIG.md](./CONFIG.md).

### `@void-energy/tailwind/generator`

```ts
import { generate } from '@void-energy/tailwind/generator';
```

Pure `(config, builtins) => { css, manifest }`. Shared by the Vite plugin and CLI. No I/O. Useful for custom build integrations.

### `@void-energy/tailwind/vite`

```ts
import { voidEnergy } from '@void-energy/tailwind/vite';
```

Vite plugin. Auto-discovers `void.config.{ts,mts,js,mjs,cjs}` at project root (configurable via `voidEnergy({ config })`). Exposes two virtual modules — `virtual:void-energy/generated.css` and `virtual:void-energy/manifest.json` — and HMRs on config changes. Plugin instance carries a `.manifest` getter for SSR code paths.

### `void-energy` CLI

```bash
npx void-energy build [--watch] [--config <path>] [--out <dir>] [--cwd <dir>]
npx void-energy --version
npx void-energy --help
```

Writes `void.generated.css` + `void.manifest.json` to `<outDir>` (default `src/styles`). Output byte-identical to the Vite plugin for the same config.

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

- [**ARCHITECTURE.md**](./ARCHITECTURE.md) — what L0 is, what ships in `node_modules`, the cascade model, L0 vs L1
- [**CONFIG.md**](./CONFIG.md) — Consumer Config Layer: replace built-in atmospheres, ship custom fonts, provenance tiers
- [**ATMOSPHERES.md**](./ATMOSPHERES.md) — the four built-in atmospheres with palettes
- [**TOKENS.md**](./TOKENS.md) — every CSS variable, what it does, where it's overridden
- [**INTEGRATIONS.md**](./INTEGRATIONS.md) — framework recipes (Vite, Next.js, Nuxt, Astro, SvelteKit, plain HTML), ecosystem bridges (shadcn, Radix Themes, Mantine), and the components bundle
- [**MIGRATION.md**](./MIGRATION.md) — converting existing Tailwind codebases to VE tokens

---

## License

BSL-1.1. Auto-converts to Apache-2.0 after 4 years. See the root `LICENSE` file.
