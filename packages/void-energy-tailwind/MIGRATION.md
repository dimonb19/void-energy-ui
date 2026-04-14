# Migration

Converting an existing Tailwind codebase to `@void-energy/tailwind`. The preset **replaces** Tailwind's default color, spacing, radius, typography, and motion scales with semantic tokens. Standard layout utilities (`flex`, `grid`, `absolute`, etc.) are untouched.

This doc is a conversion recipe — mechanical find-and-replace patterns, grouped by utility family.

---

## Before you start

- Install the preset and add the FOUC script (see [README.md](./README.md) § Quick start).
- Run a `grep -r "bg-blue-500\|bg-red-400\|p-\[.*\]\|gap-\[.*\]"` pass to inventory how much raw-Tailwind you're dealing with.
- Migration does **not** have to be all-or-nothing. Replace one component at a time; VE tokens and stock Tailwind can coexist in the same file during the transition.

---

## Colors

Stock Tailwind's palette (`bg-blue-500`, `text-gray-400`, `border-red-300`, …) is **removed**. Replace with semantic tokens.

| Stock Tailwind | VE replacement | Notes |
|---|---|---|
| `bg-white`, `bg-gray-50`, `bg-zinc-50` | `bg-canvas` or `bg-surface` | `canvas` = page, `surface` = card |
| `bg-gray-100`, `bg-slate-100` | `bg-sunk` | Inset well |
| `bg-gray-900`, `bg-black` | `bg-canvas` (in dark atmospheres) | Atmosphere decides the color |
| `bg-blue-500`, `bg-indigo-500` | `bg-primary` | The atmosphere's `--energy-primary` |
| `bg-blue-500/50`, `bg-primary/50` | (no change needed — works via arbitrary `color-mix`) or `bg-premium-subtle` | |
| `text-gray-900`, `text-black` | `text-main` | |
| `text-gray-600`, `text-gray-500` | `text-dim` | |
| `text-gray-400`, `text-gray-300` | `text-mute` | |
| `text-red-500` | `text-error` | |
| `text-green-500` | `text-success` | |
| `text-yellow-500`, `text-amber-500` | `text-premium` (warning-ish) — **no `warning` token**; use `text-error` for real errors | |
| `text-purple-500` | `text-system` | |
| `border-gray-200` | `border-border` | Default semantic border |
| `border-blue-500` | `border-primary` | |

### Arbitrary colors (`bg-[#ff0000]`)

Replace with a semantic token. If none fits, declare a component-scoped variable:

```svelte
<!-- Before -->
<div class="bg-[#f5c518]">...</div>

<!-- After -->
<div class="bg-[var(--energy-primary)]">...</div>
<!-- or even better, if a semantic token fits -->
<div class="bg-primary">...</div>
```

---

## Spacing

Stock numeric scale (`p-4`, `gap-8`, `m-12`) is **removed**. Replace with the named scale.

| Stock Tailwind | VE replacement | Value |
|---|---|---|
| `p-1`, `gap-1` | `p-xs`, `gap-xs` | 8 px |
| `p-2`, `p-3`, `gap-2`, `gap-3` | `p-sm`, `gap-sm` | 16 px |
| `p-4`, `p-5`, `gap-4`, `gap-5` | `p-md`, `gap-md` | 24 px |
| `p-6`, `p-7`, `p-8`, `gap-6`, `gap-8` | `p-lg`, `gap-lg` | 32 px |
| `p-10`, `p-12`, `gap-10`, `gap-12` | `p-xl`, `gap-xl` | 48 px |
| `p-16`, `gap-16` | `p-2xl`, `gap-2xl` | 64 px |
| `p-24`, `gap-24` | `p-3xl`, `gap-3xl` | 96 px |
| `p-32`, `gap-32` | `p-4xl`, `gap-4xl` | 128 px |
| `p-40`, `gap-40` | `p-5xl`, `gap-5xl` | 160 px |

Arbitrary spacing (`p-[32px]`, `gap-[20px]`) should be replaced with the closest named token; don't bring arbitrary values back. If a specific pixel value is structurally necessary, declare a component variable rather than hardcoding in a utility.

VE's spacing also **scales with density** — the same `p-lg` renders as 24 px in compact mode, 32 px in default, 40 px in comfortable. This is a feature; don't defeat it by hardcoding.

---

## Radius

| Stock Tailwind | VE replacement | Notes |
|---|---|---|
| `rounded-sm` | `rounded-sm` | 4 px (retro: 0) |
| `rounded`, `rounded-md` | `rounded` or `rounded-md` | 8 px (retro: 0), physics-adaptive |
| `rounded-lg` | `rounded-lg` | 16 px (retro: 0) |
| `rounded-xl` | `rounded-xl` | 24 px (retro: 0) |
| `rounded-2xl`, `rounded-3xl` | `rounded-xl` | No 2xl/3xl in VE scale |
| `rounded-full` | `rounded-full` | 9999 px (retro: 0) |
| `rounded-none` | `rounded-none` | Always 0 |

All VE radii except `rounded-none` are force-zeroed in retro physics. If a component should ignore retro and stay rounded, use an arbitrary value (`rounded-[8px]`) — but consider whether that's the right call.

---

## Typography

### Font size

| Stock Tailwind | VE replacement |
|---|---|
| `text-xs` | `text-caption` |
| `text-sm` | `text-small` |
| `text-base` | `text-base` |
| `text-lg`, `text-xl` | `text-h6` or `text-h5` (depending on semantic role) |
| `text-2xl` | `text-h4` |
| `text-3xl` | `text-h3` |
| `text-4xl`, `text-5xl` | `text-h2` |
| `text-6xl`, `text-7xl`+ | `text-h1` |

VE font sizes use `clamp()` for fluid typography — they scale with viewport width, not breakpoint. You probably don't need `text-lg md:text-xl lg:text-2xl` chains anymore.

### Font weight

| Stock Tailwind | VE replacement |
|---|---|
| `font-normal` | `font-regular` |
| `font-medium` | `font-medium` |
| `font-semibold` | `font-semibold` |
| `font-bold` | `font-bold` |
| `font-thin`, `font-light`, `font-extrabold`, `font-black` | No direct utility — use inline style with `var(--font-weight-*)` |

### Font family

| Stock Tailwind | VE replacement |
|---|---|
| `font-sans` | `font-body` |
| `font-serif` | `font-body` (VE has no serif default; override `--font-body` in your atmosphere if needed) |
| `font-mono` | `font-mono` |

### Line height / tracking

| Stock Tailwind | VE replacement |
|---|---|
| `leading-none`, `leading-tight` | `leading-none`, `leading-h1` |
| `leading-normal`, `leading-relaxed` | `leading-body` |
| `tracking-tight`, `tracking-normal` | `tracking-body`, `tracking-h1` — use role-based names |

---

## Shadows & borders

### Shadows

Stock `shadow-sm`, `shadow`, `shadow-lg`, `shadow-xl` are **removed**. Shadows are now physics-owned and apply via CSS variables:

```html
<!-- Before -->
<div class="shadow-lg rounded-lg bg-white p-6">...</div>

<!-- After -->
<div
  class="rounded-lg bg-surface p-lg"
  style="box-shadow: var(--shadow-float);"
>...</div>
```

Three shadow tokens exist: `--shadow-sunk` (inset), `--shadow-float` (resting), `--shadow-lift` (hover). Each physics preset defines its own values for these — glass has atmospheric blur, flat has subtle rgba, retro has `none`.

If you're migrating a card pattern, this is usually the right shape:

```html
<div class="rounded border bg-surface p-lg" style="box-shadow: var(--shadow-float);">
  ...
</div>
```

### Borders

| Stock Tailwind | VE replacement |
|---|---|
| `border` (1px solid) | `border` (1–2 px, physics-adaptive) + semantic `border-border` for color |
| `border-2` | `border-2` (literal 2 px) |
| `border-4`, `border-8` | Not available — rewrite with arbitrary value or remove |
| `border-l`, `border-r`, `border-t`, `border-b` | Same — all physics-adaptive |
| `border-gray-200`, `border-blue-500` | `border-border`, `border-primary` — semantic names |

**Trap:** do not combine `border` (or directional `border-l`, `border-t`, …) with a numeric directional like `border-l-2` on the same element. See README.

---

## Motion

Stock `duration-150`, `duration-300`, `ease-in-out` etc. are **removed**. Use semantic names:

| Stock Tailwind | VE replacement |
|---|---|
| `duration-75`, `duration-100` | `duration-instant` |
| `duration-150`, `duration-200` | `duration-fast` |
| `duration-300` | `duration-base` |
| `duration-500`, `duration-700`, `duration-1000` | `duration-slow` |
| `ease-in`, `ease-out`, `ease-in-out` | `ease-flow` (physics-adaptive) |
| `transition-all`, `transition`, `transition-colors` | unchanged |

In retro physics all durations collapse to `0s`, so stop motion isn't something you need to opt out of — the physics enforces it.

---

## Breakpoints

VE replaces Tailwind's default `sm: md: lg: xl: 2xl:` breakpoint names. Rename responsive modifiers:

| Stock Tailwind | VE replacement | Breakpoint |
|---|---|---|
| `sm:` | (mobile-first, no prefix) or `tablet:` at 768 | — |
| `md:` | `tablet:` | 768 px |
| `lg:` | `small-desktop:` | 1024 px |
| `xl:` | `large-desktop:` | 1440 px |
| `2xl:` | `full-hd:` | 1920 px |
| — | `quad-hd:` | 2560 px |

Example:

```html
<!-- Before -->
<div class="flex-col md:flex-row lg:gap-8 xl:gap-12">

<!-- After -->
<div class="flex-col tablet:flex-row small-desktop:gap-lg large-desktop:gap-xl">
```

---

## Dark mode

Stock Tailwind's `dark:` modifier is **not used**. VE reads `[data-mode="dark"]` / `[data-mode="light"]` off `<html>`, and most of dark-vs-light is already baked into the atmosphere palette.

If you must hand-style a dark/light divergence in a specific component, use CSS custom properties or a descendant selector (`[data-mode="dark"] & { … }` in SCSS), not the `dark:` modifier.

---

## Checklist

1. [ ] Install + configure (FOUC script, theme import).
2. [ ] Replace color utilities (`bg-*`, `text-*`, `border-*`) with semantic tokens.
3. [ ] Replace numeric spacing (`p-4`, `gap-8`) with named scale (`p-md`, `gap-lg`).
4. [ ] Replace arbitrary values (`p-[32px]`, `bg-[#...]`) with semantic tokens or component variables.
5. [ ] Replace `shadow-*` utilities with inline `box-shadow: var(--shadow-float)`.
6. [ ] Rename breakpoints (`sm:` → `tablet:`, `md:` → `small-desktop:`, etc.).
7. [ ] Replace `dark:` modifiers with atmosphere-driven variables.
8. [ ] Test across all atmospheres + physics presets you ship.

Point 8 is the real test: a VE-native component should look **coherent** (if not identical) in every atmosphere × physics combination you ship. If it breaks in retro or looks wrong in meridian, you're probably still holding onto hardcoded values somewhere.
