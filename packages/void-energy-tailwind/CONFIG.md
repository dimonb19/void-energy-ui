# Consumer Config Layer

The Consumer Config Layer is L0's answer to: **how does a consumer ship their own atmospheres and fonts as first-class defaults?** Without it, L0 is "ships with 4 VE themes + a runtime escape hatch." With it, L0 is a real platform — the React dev replaces VE's four themes with their own ten, brings their own fonts, and the result feels native to the product they're building.

It ships as four subpath entries — `@void-energy/tailwind/config` (schema + `defineConfig` / `defineAtmosphere`), `@void-energy/tailwind/generator` (pure transformation), `@void-energy/tailwind/vite` (plugin + virtual modules), and the `void-energy` CLI (`npx void-energy build`) — plus the Session 7 runtime extended with `init({ manifest })`, `getAtmospheres()` returning provenance-tagged entries, and `getAtmosphereBySource()`.

This doc covers the schema, the three replacement modes, the font story, the provenance tier model, and the integration paths.

---

## Mental model

| Concern | L1 (Svelte consumers) | L0 (Tailwind preset consumers) |
|---|---|---|
| Where themes live | `src/config/atmospheres.ts` | `void.config.ts` (project root) |
| Where fonts live | `src/config/design-tokens.ts` + font-registry | `void.config.ts → fonts: [...]` |
| Who generates the CSS | `scripts/generate-tokens.ts` | `@void-energy/tailwind/vite` plugin or `npx void-energy build` |
| Where generated CSS lives | `src/styles/config/_generated-themes.scss` | `<outDir>/void.generated.css` (consumer-owned) |
| End-user-added themes | `voidEngine.registerTheme()` | `runtime.registerAtmosphere()` |

Same five rows, different output formats. The L0 consumer's mental load matches the L1 consumer's.

---

## The three replacement modes

The schema has three knobs depending on how aggressive the consumer wants to be:

| Mode | Config key | Result |
|---|---|---|
| **Replace** | `atmospheres: {...}` | VE's 4 built-ins are removed from the manifest. Only what you list exists in any theme picker. |
| **Extend** | `extendAtmospheres: {...}` | VE's 4 stay in the manifest + your additions appear alongside. |
| **Subtract** | `omitBuiltins: ['terminal']` | Drop only the listed built-ins. Combine with `extendAtmospheres` for "keep some VE + add my own." |

Modes are mutually exclusive on the `atmospheres` axis: if you provide `atmospheres`, both `extendAtmospheres` and `omitBuiltins` are ignored (full replacement is a deliberate, complete decision).

The built-in atmosphere CSS (`dist/atmospheres/*.css`) is still loaded by `theme.css` — but if a built-in isn't in the manifest, the runtime treats it as invisible. Theme pickers iterate the manifest, not the CSS.

---

## The flagship scenario — replace 4 with 10, bring your own fonts

```ts
// void.config.ts — project root
import { defineConfig, defineAtmosphere } from '@void-energy/tailwind/config';

export default defineConfig({
  atmospheres: {
    midnight:   defineAtmosphere({ physics: 'glass', mode: 'dark',  label: 'Midnight',   tokens: { '--bg-canvas': '#05060b', '--energy-primary': '#7c5cff' } }),
    dawn:       defineAtmosphere({ physics: 'flat',  mode: 'light', label: 'Dawn',       tokens: { '--bg-canvas': '#fff8f0', '--energy-primary': '#ff6b4a' } }),
    cyberpunk:  defineAtmosphere({ physics: 'retro', mode: 'dark',  label: 'Cyberpunk',  tokens: { '--energy-primary': '#ff00aa' } }),
    forest:     defineAtmosphere({ physics: 'flat',  mode: 'dark',  label: 'Forest',     tokens: { '--energy-primary': '#4ade80' } }),
    sunset:     defineAtmosphere({ physics: 'glass', mode: 'dark',  label: 'Sunset',     tokens: { '--energy-primary': '#fb923c' } }),
    arctic:     defineAtmosphere({ physics: 'flat',  mode: 'light', label: 'Arctic',     tokens: { '--bg-canvas': '#f0f9ff' } }),
    ember:      defineAtmosphere({ physics: 'glass', mode: 'dark',  label: 'Ember',      tokens: { '--energy-primary': '#dc2626' } }),
    sage:       defineAtmosphere({ physics: 'flat',  mode: 'light', label: 'Sage',       tokens: { '--energy-primary': '#84cc16' } }),
    cosmos:     defineAtmosphere({ physics: 'glass', mode: 'dark',  label: 'Cosmos',     tokens: { '--bg-canvas': '#0a0014', '--energy-primary': '#a855f7' } }),
    parchment:  defineAtmosphere({ physics: 'flat',  mode: 'light', label: 'Parchment',  tokens: { '--bg-canvas': '#fef3c7' } }),
  },

  fonts: [
    { family: 'Orbitron',       src: '/fonts/Orbitron.woff2',       weight: '400 900' },
    { family: 'Inter',          src: '/fonts/Inter.woff2',          weight: '100 900' },
    { family: 'JetBrains Mono', src: '/fonts/JetBrainsMono.woff2',  weight: '400 800' },
    { family: 'Cormorant',      src: '/fonts/Cormorant.woff2',      weight: '300 700' },
    { family: 'Space Grotesk',  src: '/fonts/SpaceGrotesk.woff2',   weight: '300 700' },
    { family: 'Manrope',        src: '/fonts/Manrope.woff2',        weight: '200 800' },
    { family: 'Lora',           src: '/fonts/Lora.woff2',           weight: '400 700' },
    { family: 'Fira Code',      src: '/fonts/FiraCode.woff2',       weight: '300 700' },
    { family: 'IBM Plex Sans',  src: '/fonts/IBMPlexSans.woff2',    weight: '100 700' },
    { family: 'Crimson Pro',    src: '/fonts/CrimsonPro.woff2',     weight: '300 900' },
  ],
  fontAssignments: {
    heading: 'Orbitron',
    body:    'Inter',
    mono:    'JetBrains Mono',
  },

  defaults: { atmosphere: 'midnight' },
});
```

```ts
// vite.config.ts
import { voidEnergy } from '@void-energy/tailwind/vite';
export default { plugins: [voidEnergy()] };
```

```css
/* app.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import 'virtual:void-energy/generated.css';   /* config atmospheres + @font-face */
```

```ts
// app entry (e.g. main.tsx)
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';
init({ manifest });
```

That's the full setup. Five files, every theme picker now shows ten branded atmospheres, ten branded fonts loaded via `@font-face` with `font-display: swap`, and VE's frost / slate / terminal / meridian are invisible.

---

## Schema reference

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

export interface InitDefaults {
  atmosphere: string;
  physics:    'glass' | 'flat' | 'retro';
  mode:       'light' | 'dark' | 'auto';
  density:    'compact' | 'default' | 'comfortable';
}
```

`defineConfig` and `defineAtmosphere` are identity functions (`<T>(x: T) => x`). They exist solely to give the consumer IDE autocomplete and compile-time validation.

### Validation errors

Shape validation runs at config-load time. Errors are hand-rolled and path-anchored so the location of the problem is obvious:

```
void.config: atmospheres.midnight.physics must be one of "glass" | "flat" | "retro" (got "liquid")
void.config: fonts[2].src must be a string URL or an array of { url, format? } entries
void.config: defaults.mode must be one of "light" | "dark" | "auto"
void.config: extends cycle detected: midnight → dusk → midnight
```

`void-energy build` prints the first error and exits `1`. The Vite plugin throws during `configResolved`, so misconfigured projects fail at dev-server boot rather than on first page load.

---

## Safety Merge semantics

The runtime `registerAtmosphere` (Session 7, already shipped) does **not** merge — consumers must pass complete token sets. The config layer **does** merge, which is what real consumers want:

1. **Base selection.** An `AtmosphereDef` without `extends` is merged onto the physics-appropriate VE semantic base (`SEMANTIC_DARK` for `mode: 'dark'`, `SEMANTIC_LIGHT` for `mode: 'light'`) — the same base maps L1 already uses.
2. **`extends`.** When present, the base becomes the named atmosphere's fully-merged token set. Multi-level chains resolve in topological order; cycles are rejected at generator time with a clear error.
3. **Partial tokens win.** The consumer's `tokens` object overrides base values key-by-key.
4. **Unknown tokens pass through.** Consumers can add novel `--*` variables; the generator emits them without validation.

This matches `voidEngine.registerTheme`'s L1 semantics so the mental model is identical across layers.

```ts
// Example — extend a built-in
export default defineConfig({
  atmospheres: {
    'frost-warm': defineAtmosphere({
      physics: 'glass',
      mode: 'dark',
      extends: 'frost',                       // merge on top of frost
      tokens: { '--energy-primary': '#ff8c42' }, // only override the accent
    }),
  },
});
```

---

## Three provenance tiers

Every atmosphere in the runtime's directory carries a `source` tag:

| Source | Origin | Permanence | UI affordance |
|---|---|---|---|
| `builtin` | Ships with L0 (frost, slate, terminal, meridian). | Permanent. | No X button. |
| `config` | Declared in `void.config.ts`, emitted into `void.generated.css` at build time. | Permanent from the end-user's perspective. | No X button. |
| `runtime` | Registered via `registerAtmosphere()` in a running app (end-user-added). | Removable by the user who added it. | X button. |

`getAtmospheres()` returns `Array<{ name, physics, mode, source, label? }>`. Theme pickers filter on `source === 'runtime'` to decide whether to render a remove affordance.

This distinction is the whole reason the config layer exists: runtime registration alone makes every consumer-shipped theme look like a "user extra." Tiers fix that.

---

## Font story

Fonts are config-time, not runtime. Three reasons:

1. Dynamic font loading at runtime causes FOUT/FOIT.
2. SSR hydration breaks if the font registry isn't known at first paint.
3. CSP gets complicated when fonts cross network boundaries at runtime.

Fonts are a static shape of the product, not a user preference. Build-time is the correct layer.

### What gets emitted

For a `fonts: [...]` entry, the generator emits a `@font-face` block in `void.generated.css`:

```css
@font-face {
  font-family: 'Orbitron';
  src: url('/fonts/Orbitron.woff2') format('woff2');
  font-weight: 400 900;
  font-display: swap;
}
```

For `fontAssignments`, the generator emits `:root` overrides **after** the `@font-face` blocks but **before** any atmosphere blocks, so the assignments win the cascade:

```css
:root {
  --font-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
  --font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}
```

### What's not in v1

- **Per-atmosphere font assignment** — single global `fontAssignments`. L1 supports atmosphere-bound fonts; porting that to L0 is post-v1.
- **Automatic `<link rel="preload">` emission** — framework-specific, belongs upstream. Documented recipe only.
- **Font subsetting** — consumers bring subsetted font files. `unicodeRange` passes through untouched.
- **Variable font axis controls** — set `weight: '100 900'` for variable fonts; override via CSS for axis tuning.
- **Runtime `registerFont` API** — fonts are static. The 1% white-label SaaS use case can hand-roll `@font-face` injection.

---

## Generated output reference

For the flagship scenario above, the generator produces two files (default `outDir: 'src/styles'`, but with the Vite plugin these become virtual modules and never hit disk):

### `<outDir>/void.generated.css`

```css
/* ——— @font-face blocks (10 entries) ——— */
@font-face { font-family: 'Orbitron'; ... }
@font-face { font-family: 'Inter'; ... }
/* ... */

/* ——— font assignments ——— */
:root {
  --font-heading: 'Orbitron', ui-sans-serif, system-ui, sans-serif;
  --font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}

/* ——— config atmospheres (10 blocks) ——— */
[data-atmosphere='midnight'] {
  /* full merged token set — base SEMANTIC_DARK + consumer overrides */
  --bg-canvas: #05060b;
  --energy-primary: #7c5cff;
  /* ... ~30 more tokens */
}
[data-atmosphere='dawn'] { /* ... */ }
/* ... 8 more */
```

### `<outDir>/void.manifest.json`

```json
{
  "schemaVersion": 1,
  "defaults": { "atmosphere": "midnight", "physics": "glass", "mode": "dark", "density": "default" },
  "atmospheres": {
    "midnight":  { "source": "config", "physics": "glass", "mode": "dark",  "label": "Midnight" },
    "dawn":      { "source": "config", "physics": "flat",  "mode": "light", "label": "Dawn" },
    "cyberpunk": { "source": "config", "physics": "retro", "mode": "dark",  "label": "Cyberpunk" }
    /* ... 7 more */
  }
}
```

Note that `frost`, `slate`, `terminal`, `meridian` are absent from `atmospheres` — this is **Replace mode** (see [The three replacement modes](#the-three-replacement-modes) above). Their CSS still loads but is invisible to the runtime.

---

## Integration paths

### Vite (primary)

```ts
// vite.config.ts
import { voidEnergy } from '@void-energy/tailwind/vite';

export default {
  plugins: [voidEnergy()],   // auto-discovers void.config.ts at project root
};
```

The plugin:
- Loads `void.config.{ts,js,mjs}` via Vite's own module loader (respects the project's TS setup).
- Emits CSS as a virtual module: `virtual:void-energy/generated.css`.
- Emits the manifest as a virtual JSON module: `virtual:void-energy/manifest.json`.
- Watches the config file and HMRs on change.
- Exposes `plugin.manifest` for SSR bootstrapping.

### CLI (fallback for non-Vite setups — Next.js Turbopack, Webpack, Parcel)

```bash
npx void-energy build                                 # one-shot
npx void-energy build --watch                         # chokidar watch
npx void-energy build --config ./custom.config.ts --out ./styles
npx void-energy build --cwd ./apps/web                # alternate project root
npx void-energy --version                             # print version
npx void-energy --help                                # show flags
```

The CLI writes physical files to `<outDir>`. Run alongside the dev server:

```json
{
  "scripts": {
    "dev": "concurrently \"void-energy build --watch\" \"next dev\""
  }
}
```

Both CLI and plugin call the same shared generator core. Output is byte-identical for the same config.

### Runtime hookup

```ts
import { init } from '@void-energy/tailwind/runtime';

// Vite — virtual module:
import manifest from 'virtual:void-energy/manifest.json';

// CLI — physical file:
// import manifest from './src/styles/void.manifest.json';

init({ manifest });
```

`init({ manifest })`:
1. Merges `manifest.atmospheres` into the runtime directory (config entries tagged `source: 'config'`).
2. Resolves defaults: `localStorage` > `manifest.defaults` > `init({ defaults })` argument > L0 hard-coded fallback (frost / glass / dark / default).
3. Rejects manifests with mismatched `schemaVersion` (logs one clear error, continues with built-ins only).

When no manifest is provided (consumer skips the config layer entirely), L0 falls back to Session 7 behavior: four built-ins + runtime-registered only. The minimal install path is preserved.

---

## FOUC implications

The FOUC script is unchanged. When the persisted atmosphere is a `config` source, its CSS is already in `void.generated.css` (statically imported), so the script just sets the attribute and the cascade resolves naturally. Only `runtime`-source atmospheres still require the inline `<style>` re-injection that Session 7 added.

This keeps the FOUC script minimal: it doesn't need to know about the manifest at all. The manifest is consumed at hydration time (`init({ manifest })`), not before first paint.

---

## What the React dev sees end-to-end

1. `npm install @void-energy/tailwind tailwindcss@^4`.
2. Add the Vite plugin (one line).
3. Write `void.config.ts` with their 10 atmospheres + 10 fonts.
4. Add three `@import` lines to their app CSS.
5. Call `init({ manifest })` once at app boot.
6. Build their own theme picker that iterates `getAtmospheres()` and shows X buttons only when `source === 'runtime'`.
7. Their UI now responds to atmosphere/physics/mode/density switching across every Tailwind utility — `bg-surface`, `text-main`, `shadow-float`, `p-lg`, `font-heading` — with no component library involvement.

VE's four built-in themes never appear. Their ten brands do. Their ten fonts load correctly. The product feels native, not "powered by VE with extras." That's what the config layer delivers.
