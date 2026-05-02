---
paths:
  - "src/config/atmospheres.ts"
  - "src/config/design-tokens.ts"
---

# Theme Creation Rules

When adding or modifying a theme in `src/config/atmospheres.ts`, run this checklist before finishing.

---

## 1. Physics / Mode Constraint Matrix

| physics | mode  | Valid? | Notes |
|---------|-------|--------|-------|
| glass   | dark  | ✅     | Standard for most dark themes |
| glass   | light | ❌     | Engine auto-corrects to `flat` — never set intentionally |
| retro   | dark  | ✅     | CRT aesthetic only |
| retro   | light | ❌     | Engine forces `dark` — never set intentionally |
| flat    | dark  | ✅     | Valid — Graphite is the built-in example |
| flat    | light | ✅     | All light themes use this |

---

## 2. `bg-surface` Physics Rule

| Physics      | Format required | Example |
|--------------|----------------|---------|
| glass        | `rgba(R, G, B, opacity)` — opacity **0.3–0.6** | `rgba(22, 30, 95, 0.4)` |
| flat + light | Solid opaque hex | `#ffffff` |
| flat + dark  | Solid opaque hex | `#1e1e1e` |

**flat + dark must never be semi-transparent.** Without blur compositing, rgba values on a dark canvas render ambiguously — the color resolves differently across browsers and the "floating surface" effect breaks down.

---

## 3. Text Hierarchy Direction

`text-main` → `text-dim` → `text-mute` must be **descending contrast** against `bg-surface`.

- **Dark themes:** `text-main` is the brightest/lightest → `text-mute` is the most faded
- **Light themes:** `text-main` is the darkest → `text-mute` is the lightest

`text-mute` must never be brighter or higher-contrast than `text-dim`. Inversions break information hierarchy throughout the entire UI.

---

## 4. WCAG Minimums (contrast against `bg-surface`)

| Token | Min contrast | Standard |
|-------|-------------|---------|
| `text-main` | 4.5:1 | WCAG AA normal text |
| `text-dim` | 4.5:1 | WCAG AA normal text |
| `text-mute` | 3:1 | WCAG AA large text / UI components |
| `energy-primary` | 3:1 | WCAG AA interactive elements |

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) or browser DevTools to verify.

---

## 5. Token Collision Rule — `energy-secondary` ≠ text tokens

`energy-secondary` must not equal or be visually indistinguishable from `text-main`, `text-dim`, or `text-mute`.

**Why it matters:** Charts render `energy-secondary` as a data series color. A collision makes chart series 2 look identical to ambient body text. Secondary buttons and badges are also affected.

```typescript
// ❌ BAD — energy-secondary collides with text-mute (both #64748b)
'energy-secondary': '#64748b',
'text-mute':        '#64748b',

// ✅ GOOD — clearly distinct values, clearly distinct roles
'energy-secondary': '#3d7ab5',  // Identifiable blue accent
'text-mute':        '#64748b',  // Neutral muted text
```

This collision is easy to introduce when fixing accessibility (darkening `text-mute` toward an existing `energy-secondary` value). Always check both after changing either.

---

## 6. Semantic Color Conflict Rule — energy tokens ≠ `color-premium`

**SEMANTIC_DARK** defines `color-premium: '#ff8c00'` (gold/orange).
**SEMANTIC_LIGHT** defines `color-premium: '#b45309'` (amber-brown).

If `energy-primary` or `energy-secondary` is in the **gold/orange/amber family**, add a per-theme `color-premium` override. Without it, premium badges, credit indicators, and caution states are visually indistinguishable from primary interactive elements.

```typescript
// Terminal — amber energy requires a non-amber premium
'energy-primary': '#f5c518',   // Bright amber
'color-premium':  '#33e2e6',   // Cyan override ← required

// Any gold-energy theme — non-gold premium
'energy-primary': '#ffaa00',   // Gold
'color-premium':  '#0284c7',   // Sapphire override ← required
```

The override color must avoid:
- Purple — reserved for `color-system` (`#a078ff`)
- Red — reserved for `color-error`
- Green — reserved for `color-success`
- Gold/orange — that's what you're escaping

---

## 7. Semantic Color Conflict Rule — energy tokens ≠ `color-system`

**SEMANTIC_DARK** defines `color-system: '#a078ff'` (purple).
**SEMANTIC_LIGHT** defines `color-system: '#6d28d9'` (deep violet).

If `energy-primary` or `energy-secondary` is in the **purple/violet family**, add a per-theme `color-system` override. Without it, system notifications and AI feature indicators are visually indistinguishable from primary interactive elements.

```typescript
// Any purple-energy theme — non-purple system
'energy-secondary': '#8b5cf6',   // Purple
'color-system':     '#38bdf8',   // Sky blue override ← required
```

The override color must avoid:
- Gold/orange — reserved for `color-premium` (`#ff8c00`)
- Red — reserved for `color-error`
- Green — reserved for `color-success`
- Purple — that's what you're escaping

---

## Accepted Overlap — `color-success` and `color-error`

A neon-green energy will overlap with `color-success` (`#00e055`), and a coral-red energy will overlap with `color-error` (`#ff3c40`). Unlike `color-premium` and `color-system`, these are **not overridden** — green must mean success and red must mean error. These are universal signals; replacing them with an arbitrary hue would cause more confusion than the overlap.

The overlap is tolerable because success/error appear in **momentary, contextual states** (toasts, validation, form borders) with explicit text labels that disambiguate meaning. `color-premium` and `color-system` appear persistently alongside energy colors in the same UI regions, making their collisions far more disruptive.

**Do not add `color-success` or `color-error` overrides to any theme.**

---

## 8. Required Token Checklist

Every theme must explicitly set all of the following (spread `...SEMANTIC_DARK` or `...SEMANTIC_LIGHT` first):

```
□ font-atmos-heading    Use FONTS.*.family — never a raw string
□ font-atmos-body       Use FONTS.*.family — can differ from heading
□ bg-canvas             Foundation floor — darkest in dark mode, lightest in light
□ bg-spotlight          Ambient light source — must be brighter than bg-canvas (dark) or darker (light)
□ bg-surface            Floating elements — see Rule 2 for physics-specific format
□ bg-sunk               Recessed areas — darker than bg-surface (dark) or lighter (light)
□ energy-primary        Brand/CTA color — see Rule 6 if gold/amber family
□ energy-secondary      Supporting accent — see Rules 5, 6 & 7
□ border-color          Typically energy-primary or energy-secondary at 20–35% opacity for glass,
                        slightly higher for flat
□ text-main             Highest contrast — see Rules 3 & 4
□ text-dim              Mid contrast — see Rules 3 & 4
□ text-mute             Lowest contrast — see Rules 3 & 4
```

---

## Reference: Built-in Theme Quick-Scan

| Theme | Mode | Physics | Primary | Secondary | Overrides |
|-------|------|---------|---------|-----------|-----------|
| frost | dark | glass | #7ec8e3 arctic blue | #4a6fa5 muted blue | — |
| graphite | dark | flat | #ffffff white | #6e7178 gray | — |
| terminal | dark | retro | #f5c518 amber | #c9a820 dim amber | color-premium: #33e2e6 |
| meridian | light | flat | #0d6e6e teal | #4a3df7 indigo | — |
