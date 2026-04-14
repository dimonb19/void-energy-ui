# Atmospheres

Four built-in atmospheres ship with `@void-energy/tailwind`. Each is a full palette + a preferred physics preset + a preferred color mode. Switching an atmosphere via `setAtmosphere(name)` or `data-atmosphere="..."` cascades all three.

The manifest lives at `@void-energy/tailwind/atmospheres.json`.

| Atmosphere | Physics | Mode | Vibe |
|---|---|---|---|
| [`slate`](#slate) | `flat` | `dark` | Professional / Clean |
| [`terminal`](#terminal) | `retro` | `dark` | Hacker / Retro |
| [`meridian`](#meridian) | `flat` | `light` | Fintech / Brand |
| [`frost`](#frost) | `glass` | `dark` | Arctic / Glass |

All four atmospheres override the same set of semantic tokens. The table below covers the major palette axes; see [TOKENS.md](./TOKENS.md) for the complete list.

---

## `slate`

Professional dark. Deep blue-purple canvas, muted lift, cool energy blue.

| Token | Value |
|---|---|
| `--bg-canvas` | `#111118` |
| `--bg-surface` | `#1e1e2a` |
| `--bg-sunk` | `#0c0c12` |
| `--energy-primary` | `#6ea1ff` |
| `--energy-secondary` | `#8b8fa3` |
| `--text-main` | `#e8e8ed` |
| `--text-dim` | `#a0a0b0` |
| `--color-premium` | `#ff8c00` |
| `--color-success` | `#00e055` |
| `--color-error` | `#ff3c40` |
| `--color-system` | `#a078ff` |

Pairs with `flat` physics: no lift, minimal shadows, subtle hover tint. Best fit for SaaS dashboards, admin UI, modern B2B.

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
