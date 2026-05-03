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

---

## Brand Profile Overlay (v1)

The 8 rules above govern the **palette axis** — color correctness, contrast, hierarchy, semantic collisions. Brand profiles are an **orthogonal axis**: identity overrides for radii / motion / type-treatment / per-role weights. They live separately and are sparse-by-default.

> Status (post-1.5): directory + `BrandProfile` interface (1.2), cascade plumbing — `data-brand` + `:root[data-brand]` blocks + retro-floor reassertion — (1.3), heading-mixin + button-base port to role tokens (1.4), and three reference profiles (1.5) all shipped. The brand axis is end-to-end live.

### Cascade order (locked, Option B)

```
global tokens  →  physics  →  brand overlay  →  atmosphere palette  →  retro floor (re-asserted)
```

Brand sits **between physics and atmosphere**. Physics still has the floor — retro zeroes radii, retro keeps `steps()` motion, and `emit-physics-retro-floor` ([../../src/styles/abstracts/_engine.scss](../../src/styles/abstracts/_engine.scss)) re-asserts both above any brand override. Atmosphere still owns color. Atmospheres without a `brand:` reference fall through unchanged (byte-identical compile output to pre-overlay builds).

### Cascade plumbing (1.3-1.5)

- **DOM:** `applyTheme()` in [../../src/lib/void-boot.js](../../src/lib/void-boot.js) sets/clears `<html data-brand="<id>">` based on the active atmosphere's `brand` field — same write site that owns `data-atmosphere`/`data-physics`/`data-mode`. No separate `voidEngine.setBrand()` API; brand is atmosphere-bound.
- **Generator:** [../../scripts/generate-tokens.ts](../../scripts/generate-tokens.ts) reads `BRANDS` and emits one `:root[data-brand='<id>']` block per profile in `_generated-themes.scss`, plus per-axis CSS files at `dist/brands/<id>.css` and a `dist/brands.json` registry mirror.
- **SCSS source order** in [../../src/styles/base/_themes.scss](../../src/styles/base/_themes.scss): `:root → emit-physics → brands → atmospheres → emit-physics-retro-floor`. The retro floor wins because it emits last.
- **Role tokens reach `<h1>`-`<h4>` and buttons.** The 1.4 typography port rewrote the heading mixin to read `--weight-display`/`--weight-heading` and `--text-transform-display`/`--text-transform-heading`; `_buttons.scss` reads `--weight-button`/`--tracking-button`/`--text-transform-button`. `<h5>`/`<h6>` stay on `--font-weight-medium` (deferred from the brand axis).

### When to author a brand profile

Author one **only** when a real brand has identity worth preserving — radii policy, motion signature, type-treatment that survives a port. Catalog work (Phase 3). For ad-hoc or exploratory atmospheres, leave `brand:` unset; the atmosphere inherits physics defaults like the 4 free atmospheres do today.

### Sparse-by-default discipline

Most profiles override 2-3 fields. The Stripe shape (a couple radii + one transform) is the norm. The Nike shape (radii + 4 typography fields) is the ceiling. Do **not** pre-populate every field "for completeness" — empty fields are inheritance, not omission.

```ts
// Stripe — calm shape (3 fields). Outer radii nudged, one ease, body tracking neutralized.
stripe: {
  id: 'stripe', name: 'Stripe',
  radii: { lg: '6px', xl: '8px' },
  motion: { easeSpringGentle: 'cubic-bezier(0.4, 0, 0.2, 1)' },
  typography: { trackingBody: '0' },
}

// Nike — ceiling shape (8 fields). Uppercase, tight tracking, heavy weights, gentle radii.
nike: {
  id: 'nike', name: 'Nike',
  radii: { sm: '2px', md: '4px', lg: '6px', xl: '8px' },
  typography: {
    trackingButton: '0.08em', trackingHeading: '0.04em',
    transformButton: 'uppercase', transformHeading: 'uppercase',
    weightButton: 700, weightHeading: 900, weightDisplay: 900,
  },
}

// Lamborghini — motion-forward shape (8 fields). Zero radii incl. `full`, snappier speeds, sharper ease.
lamborghini: {
  id: 'lamborghini', name: 'Lamborghini',
  radii: { sm: '0', md: '0', lg: '0', xl: '0', full: '0' },
  motion: {
    speedFast: 120, speedBase: 240,
    easeSpringSnappy: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
  typography: { trackingDisplay: '0.06em', weightDisplay: 900 },
}
```

### File layout

| File | Role |
|------|------|
| `src/config/brands/index.ts` | `BrandProfile` interface + `BRANDS` registry barrel |
| `src/config/brands/<brand>.ts` | One file per brand profile (Phase 1.5+); re-exported from the barrel |
| `src/config/atmospheres.ts` | Atmospheres reference the brand by id: `brand: 'nike'` |

### Tier discipline (`AtmosphereDefinition.tier`)

Tier drives surface filtering — without it, the in-product Themes modal would balloon to 75+ entries when the catalog ships. The field is optional; **absent = treated as `'core'`**.

| Tier | Used for | Visible in Themes modal | Visible in /atmospheres gallery |
|------|----------|------------------------|--------------------------------|
| `core` (default) | The 4 free atmospheres + premium-adjacent sets that should appear in-product | ✅ | — |
| `catalog` | Brand-themed atmospheres in the public gallery (Phase 3) | ❌ | ✅ |
| `custom` | User-imported / runtime-registered atmospheres | ✅ | — |

The Themes modal filters built-in atmospheres to `tier === 'core'` (treating absence as core) and shows custom atmospheres unconditionally. Catalog atmospheres must declare `tier: 'catalog'` explicitly — they only surface in the public gallery.

### Out of scope for v1

- **Component-level brand conventions** ("Nike buttons always have a swoosh treatment"). Wait until ~30 brands exist and patterns recur enough to abstract. v1 covers tokens; tokens carry 80%+ of brand identity.
- **Spacing scale brand overrides.** Spacing Gravity (Law 5) stays universal.
- **Brand-level fonts.** Fonts already live on the atmosphere (`font-atmos-heading`, `font-atmos-body`).
- **Per-mode brand profiles.** A profile is mode-agnostic; mode-specific treatments live on separate atmospheres referencing the same brand.

### Retro physics floor — non-negotiable

A brand profile setting `radii.full: '9999px'` does **not** un-zero retro radii. The retro physics block reasserts the floor above any brand override (Phase 1.3). Same for `steps()` motion. "No rounding under CRT phosphor" is part of the contract; brand overlay does not break it.
