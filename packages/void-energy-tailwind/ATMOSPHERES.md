# Atmospheres

Four built-in atmospheres ship with `@void-energy/tailwind`. Each is a full palette + a preferred physics preset + a preferred color mode. Switching an atmosphere via `setAtmosphere(name)` or `data-atmosphere="..."` cascades all three.

The manifest lives at `@void-energy/tailwind/atmospheres.json`.

---

## Three sources: builtin, config, runtime

Every atmosphere in the runtime's directory carries a `source` tag. Theme pickers read this tag to decide whether to render a remove affordance.

| Source | Origin | Permanence | UI affordance |
|---|---|---|---|
| `builtin` | Ships with L0 (the four atmospheres below). | Permanent. | No X button. |
| `config` | Declared in `void.config.ts`, emitted into `void.generated.css` at build time. See [CONFIG.md](./CONFIG.md). | Permanent from the end-user's perspective. | No X button. |
| `runtime` | Registered via `registerAtmosphere()` in a running app. | Removable by the user who added it. | X button. |

```ts
import {
  getAtmospheres,
  getAtmosphereBySource,
} from '@void-energy/tailwind/runtime';

getAtmospheres();
// [
//   { name: 'frost',    source: 'builtin', physics: 'glass', mode: 'dark', label: 'Frost' },
//   { name: 'midnight', source: 'config',  physics: 'glass', mode: 'dark', label: 'Midnight' },
//   { name: 'user-a',   source: 'runtime', physics: 'flat',  mode: 'dark' },
// ]

getAtmosphereBySource('runtime'); // → only end-user-added themes
```

### When to pick which

- **Built-in is what you get by default.** Four production-ready atmospheres covering all 3 physics × both modes. Works without a config file.
- **Config is how you ship a branded product.** Replace the four built-ins entirely (`atmospheres: {...}`), extend them (`extendAtmospheres`), or drop some (`omitBuiltins`). Emitted as first-class defaults — no end-user affordance to remove them.
- **Runtime is how your end-users add their own.** For apps with a "create a theme" flow — AI-generated palettes, imported JSON, user-scoped themes.

Config wins over built-in when names collide. Runtime wins over both.

See [CONFIG.md](./CONFIG.md) for config-layer schema + the flagship "replace 4 with 10" scenario.

| Atmosphere | Physics | Mode | Vibe |
|---|---|---|---|
| [`graphite`](#graphite) | `flat` | `dark` | Editor / Neutral |
| [`terminal`](#terminal) | `retro` | `dark` | Hacker / Retro |
| [`meridian`](#meridian) | `flat` | `light` | Fintech / Brand |
| [`frost`](#frost) | `glass` | `dark` | Arctic / Glass |

All four atmospheres override the same set of semantic tokens. The table below covers the major palette axes; see [TOKENS.md](./TOKENS.md) for the complete list.

---

## `graphite`

Editor neutral. Charcoal canvas, no chromatic accent — the chrome blends with the OS the way ChatGPT, VS Code Dark Modern, and Vercel Geist do. Surface floats *up* in luminance for elevation (Apple/VS Code pattern).

| Token | Value |
|---|---|
| `--bg-canvas` | `#1f1f1f` |
| `--bg-surface` | `#2a2a2c` |
| `--bg-sunk` | `#161617` |
| `--energy-primary` | `#ececee` |
| `--energy-secondary` | `#9ca0a6` |
| `--text-main` | `#ececee` |
| `--text-dim` | `#b4b6bb` |
| `--color-premium` | `#ff8c00` |
| `--color-success` | `#00e055` |
| `--color-error` | `#ff3c40` |
| `--color-system` | `#a078ff` |

Pairs with `flat` physics: no lift, minimal shadows, subtle hover tint. Best fit for editor-style tools, dev environments, OS-native productivity UIs where the chrome should disappear.

---

## `terminal`

CRT phosphor. Amber-on-black text, hard edges, zero motion.

| Token | Value |
|---|---|
| `--bg-canvas` | `#050505` |
| `--bg-surface` | `rgba(0, 20, 0, 0.9)` |
| `--bg-sunk` | `#000000` |
| `--energy-primary` | `#f5c518` |
| `--energy-secondary` | `#c9a820` |
| `--text-main` | `#f5c518` |
| `--text-dim` | `#ad8b12` |
| `--color-premium` | `#33e2e6` |
| `--color-success` | `#00e055` |
| `--color-error` | `#ff3c40` |
| `--color-system` | `#a078ff` |

Locks `retro` physics: `--radius-base: 0`, 2px borders, stepped easing, no transitions, no lift. Fonts default to monospace. Use for developer tools, CLI wrappers, hacker-aesthetic brands.

---

## `meridian`

Light fintech. White canvas, deep teal energy, slate-navy text.

| Token | Value |
|---|---|
| `--bg-canvas` | `#f4f6f9` |
| `--bg-surface` | `#ffffff` |
| `--bg-sunk` | `#e8ecf1` |
| `--energy-primary` | `#0d6e6e` |
| `--energy-secondary` | `#4a3df7` |
| `--text-main` | `#0f1729` |
| `--text-dim` | `#3d4a5c` |
| `--color-premium` | `#b45309` |
| `--color-success` | `#15803d` |
| `--color-error` | `#dc2626` |
| `--color-system` | `#6d28d9` |

The only built-in light atmosphere. Pairs with `flat` physics. Best fit for finance, insurance, regulated B2B, anywhere a dark UI would undercut trust.

---

## `frost`

Arctic glass. Deep blue canvas, translucent lift, ice blue energy.

| Token | Value |
|---|---|
| `--bg-canvas` | `#080c14` |
| `--bg-surface` | `rgba(20, 30, 50, 0.45)` |
| `--bg-sunk` | `rgba(0, 5, 15, 0.5)` |
| `--energy-primary` | `#7ec8e3` |
| `--energy-secondary` | `#4a6fa5` |
| `--text-main` | `#edf2f7` |
| `--text-dim` | `#a0b0c0` |
| `--color-premium` | `#ff8c00` |
| `--color-success` | `#00e055` |
| `--color-error` | `#ff3c40` |
| `--color-system` | `#a078ff` |

Locks `glass` physics: 20px backdrop blur, -3px lift on hover, 1.02 scale transforms, atmospheric shadows. The default atmosphere shipped by `theme.css`. Best fit for creative tools, landing pages, anywhere density + depth sell.

---

## Physics preset summary

| Preset | Blur | Border width | Radius base | Lift | Scale | Motion |
|---|---|---|---|---|---|---|
| `glass` | `20px` | `1px` | `8px` | `-3px` | `1.02` | spring curves |
| `flat` | `0` | `1px` | `8px` | `0` | `1` | ease-in-out |
| `retro` | `0` | `2px` | `0` | `-2px` | `1` | `steps()`, no duration |

**Physics constraints** (auto-enforced by the runtime):

- `glass` requires `mode=dark` — glass glows need darkness to work.
- `retro` requires `mode=dark` — CRT phosphor emission is a dark-mode effect.
- `flat` works with either mode.

Calling `setPhysics('glass')` or `setPhysics('retro')` while in light mode will also flip `data-mode` to `dark`. This is why `meridian` is the only light atmosphere — it pairs with `flat`.

---

## Color scale variants

Every semantic color (`premium`, `system`, `success`, `error`) also ships `-light`, `-dark`, and `-subtle` variants used by the `bg-*-light` / `text-*-dark` / `bg-*-subtle` utilities:

```
--color-premium          base color
--color-premium-light    lighter tint (for backgrounds under dark text)
--color-premium-dark     darker shade (for active states, deep fills)
--color-premium-subtle   very low-alpha tint (for subtle backgrounds)
```

These are defined per-atmosphere in the corresponding `atmospheres/{name}.css`.

---

## Registering custom atmospheres

Beyond the four built-ins you can register any number of additional atmospheres at runtime. A custom atmosphere is **a name, a preferred physics preset, a preferred color mode, and a map of CSS tokens** — the same shape the built-ins use, just scoped to a different selector.

```ts
import { registerAtmosphere, setAtmosphere } from '@void-energy/tailwind/runtime';

registerAtmosphere('acme', {
  physics: 'flat',
  mode: 'dark',
  tokens: {
    '--bg-canvas': '#0a0e1a',
    '--bg-surface': '#131a2a',
    '--bg-sunk': '#05080f',
    '--energy-primary': '#ff5a8a',
    '--energy-secondary': '#9ca3b3',
    '--text-main': '#edf2f7',
    '--text-dim': '#a0b0c0',
    '--text-mute': '#60708a',
    '--border-color': 'rgba(255, 90, 138, 0.2)',
    '--color-premium': '#ffb020',
    '--color-success': '#22c55e',
    '--color-error': '#ef4444',
    '--color-system': '#8b5cf6',
    // …full token list in TOKENS.md
  },
});

setAtmosphere('acme');
```

### What happens under the hood

- A shared `<style id="ve-custom-atmospheres">` element is injected into `<head>` with `[data-atmosphere='acme'] { … }` rules. Re-registering rewrites the block; unregistering removes it.
- The definition is persisted to `localStorage['ve-custom-atmospheres']` as JSON.
- The FOUC script reads the same key on the next page load and inlines the `<style>` tag **before first paint**, so persisted custom atmospheres never flash through a built-in palette.
- `setAtmosphere('acme')` looks up the registered meta and cascades `data-physics="flat"` + `data-mode="dark"` automatically — identical to the built-in cascade.
- `getAtmospheres()` returns the merged view (built-ins + customs), which is what theme-picker UIs should enumerate.

### v1 scope notes

- **No Safety Merge at runtime.** The runtime `registerAtmosphere` primitive accepts the complete token set. The `extends` field is parsed by the type but not merged — partial defs leave unspecified tokens resolving from `:root`, which is usually not what you want. Pass the full list. If you want merge semantics, declare the atmosphere in `void.config.ts` instead (the config layer **does** Safety-Merge against a base — see [CONFIG.md](./CONFIG.md#safety-merge-semantics)).
- **Name constraints.** Atmosphere names must match `/^[a-zA-Z0-9_-]+$/` — letters, digits, underscores, hyphens. Anything else is silently rejected to prevent CSS selector injection.
- **No external loading primitive.** There is no `loadAtmosphereFromUrl`. Fetch, validate, and call `registerAtmosphere` yourself if you need remote themes. That layer belongs in L2.

### Removing a custom atmosphere

```ts
import { unregisterAtmosphere } from '@void-energy/tailwind/runtime';

unregisterAtmosphere('acme');
```

The `<style>` block is updated, localStorage is pruned, and the atmosphere disappears from `getAtmospheres()`. If the user is currently viewing the atmosphere you just removed, switch them back to a built-in first — there is no automatic fallback.

### Enumerating atmospheres for a picker UI

```ts
import {
  getAtmospheres,
  getAtmosphereBySource,
  getCustomAtmospheres,
} from '@void-energy/tailwind/runtime';

const all = getAtmospheres();
// [
//   { name: 'acme',     source: 'runtime', physics: 'flat',  mode: 'dark' },
//   { name: 'frost',    source: 'builtin', physics: 'glass', mode: 'dark', label: 'Frost' },
//   { name: 'graphite', source: 'builtin', physics: 'flat',  mode: 'dark', label: 'Graphite' },
//   …
// ]

const runtimeOnly = getAtmosphereBySource('runtime'); // render X buttons on these
const customs     = getCustomAtmospheres();           // ['acme']
```

`getAtmospheres()` always returns a fresh array — caller mutation does not leak into the registry. Each entry's `source` drives theme-picker UI: `'builtin'` and `'config'` are permanent (no X button), `'runtime'` is end-user-removable.
