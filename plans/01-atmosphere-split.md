# 01 — Token Modularity (Fonts + Atmospheres)

> Extract fonts and atmospheres from `design-tokens.ts` into dedicated, developer-editable files. Split atmospheres into 4 free (public) + 12 DGRS-private. No premium atmospheres for sale — premium value comes from packages, not themes.

**Status:** Planning — Wave 1 (all 4 free atmospheres already created)
**Updated:** 2026-04-03
**Depends on:** Nothing (can start immediately)
**Blocks:** 03-public-repo

---

## Why This Refactor

`design-tokens.ts` is an 850+ line monolith. Fonts and atmosphere palettes account for ~60% of the file, yet they're the two things a developer forking the repo will want to customize first. Right now a new user has to:

1. Understand the entire token file structure
2. Find the `FONTS` object buried at line 146
3. Find their theme's palette buried at line 500+
4. Hope they don't break spacing/physics tokens along the way

After this refactor, a developer sees two obvious files:
- **`src/config/fonts.ts`** — all font definitions, clear instructions at the top
- **`src/config/atmospheres.ts`** — all theme palettes, tier metadata, clear instructions

`design-tokens.ts` becomes a slim orchestrator: spacing, physics, semantic colors, and re-exports from the two new modules.

---

## Part A — Font Extraction

### Goal

Move all font definitions into `src/config/fonts.ts` — a self-contained file with inline instructions so any developer can add, remove, or replace fonts without reading any other file.

### What Moves to `fonts.ts`

| Export | Current Location | Description |
|--------|-----------------|-------------|
| `FONTS` | design-tokens.ts L146–231 | Font definitions (family + weight→file mappings) |
| `DEFAULT_PRELOAD_WEIGHTS` | design-tokens.ts L132 | Weights to preload (400, 700) |
| `FONT_FAMILY_TO_KEY` | design-tokens.ts L793–799 | Reverse lookup: CSS family → font key |
| `getThemePreloadFonts()` | design-tokens.ts L805–835 | Compute preload files for a theme |
| `getFontDisplayName()` | design-tokens.ts L841–846 | Extract display name from family string |
| `FontDefinition` | types/design-tokens.d.ts L1–6 | Type definition |

### What `fonts.ts` Looks Like

```typescript
/**
 * ═══════════════════════════════════════════════════════════════
 *  VOID ENERGY — FONT REGISTRY
 * ═══════════════════════════════════════════════════════════════
 *
 *  HOW TO ADD A CUSTOM FONT
 *  ────────────────────────
 *  1. Place your .woff2 files in /public/fonts/
 *     (Use https://transfonter.org or similar to convert from .ttf/.otf)
 *
 *  2. Add an entry below:
 *
 *       brand: {
 *         family: "'Your Font Name', sans-serif",
 *         files: {
 *           400: 'YourFont-Regular.woff2',
 *           700: 'YourFont-Bold.woff2',
 *         },
 *       },
 *
 *     - The key ('brand') is your internal reference name
 *     - The family string must match the font's real name in quotes
 *     - Include at least weights 400 (regular) and 700 (bold)
 *     - Optional weights: 300 (light), 500 (medium), 600 (semibold)
 *
 *  3. Run: npm run build:tokens
 *     This regenerates @font-face rules and preload registries.
 *
 *  4. Use in a theme palette:
 *       'font-atmos-heading': FONTS.brand.family,
 *       'font-atmos-body': FONTS.brand.family,
 *
 *  HOW TO REMOVE A FONT
 *  ────────────────────
 *  1. Delete the entry from FONTS below
 *  2. Remove any theme references to it (search for FONTS.keyName)
 *  3. Optionally delete the .woff2 files from /public/fonts/
 *  4. Run: npm run build:tokens
 *
 *  PRELOADING
 *  ──────────
 *  By default, weights 400 + 700 are preloaded for the active theme
 *  (covers ~90% of initial viewport text). Non-critical weights load
 *  on-demand via @font-face with font-display: swap.
 *  Override per-font with the optional preloadWeights array.
 *
 * ═══════════════════════════════════════════════════════════════
 */

export interface FontDefinition { ... }
export const DEFAULT_PRELOAD_WEIGHTS = [400, 700] as const;
export const FONTS: Record<string, FontDefinition> = { ... };
export const FONT_FAMILY_TO_KEY = ...;
export function getThemePreloadFonts(...) { ... }
export function getFontDisplayName(...) { ... }
```

### Font Tier Split

When extracting to separate repos:

**Free fonts (ship with `void-energy` npm package):**
- Hanken Grotesk (tech) — Slate default
- Inter (clean) — widely useful body font
- Courier Prime (code) — Terminal theme + code blocks
- Lora (nature) — Meridian uses it if needed
- Cinzel (arcane) — Solar
- Any font referenced by the 4 free atmospheres

**Private fonts (stay in CoNexus repo):**
- Exo 2 (mystic) — Nebula
- Caveat (hand) — Velvet
- Merriweather (horror) — Crimson
- PT Serif Caption (book) — Paper, Velvet body
- Open Sans (lab) — Laboratory
- Comic Neue (fun) — Playground

The tier split is determined by which atmospheres reference which fonts. A font ships free only if a free atmosphere uses it.

### Migration: Zero Breaking Changes

`design-tokens.ts` re-exports everything from `fonts.ts`:

```typescript
// design-tokens.ts
export {
  FONTS,
  DEFAULT_PRELOAD_WEIGHTS,
  FONT_FAMILY_TO_KEY,
  getThemePreloadFonts,
  getFontDisplayName,
  type FontDefinition,
} from './fonts';
```

All existing imports (`import { FONTS } from '@config/design-tokens'`) continue to work. Consumers can also import directly from `@config/fonts` if they prefer.

---

## Part B — Atmosphere Extraction

### Goal

Move all atmosphere/theme definitions into `src/config/atmospheres.ts` — a dedicated file where developers can edit existing themes, add new ones, or remove themes they don't need. Each theme gets a `tier` field for the free/private split.

### What Moves to `atmospheres.ts`

| Export | Current Location | Description |
|--------|-----------------|-------------|
| Theme definitions | design-tokens.ts `themes: { ... }` | All 16 atmosphere palette objects |
| `SEMANTIC_DARK` | design-tokens.ts L233+ | Dark mode semantic colors |
| `SEMANTIC_LIGHT` | design-tokens.ts L280+ | Light mode semantic colors |

The `VOID_TOKENS` orchestrator object stays in `design-tokens.ts` — it imports themes from `atmospheres.ts` and combines them with spacing, physics, and typography tokens.

### Atmosphere Assignments

#### Free (Public) — 4 Atmospheres

| Atmosphere | Physics | Mode | Status | Why Free |
|-----------|---------|------|--------|----------|
| **Slate** | flat | dark | Created | Default VE atmosphere. Clean, professional, daily-driver. |
| **Terminal** | retro | dark | Existing | Only retro theme. Demonstrates pixel physics. |
| **Meridian** | flat | light | Created | Primary light theme. Created for showcases, broad appeal. |
| **Solar** | glass | dark | Existing | Fan favorite from testing. Demonstrates glass physics. |

**All 4 atmospheres are ready.** No new atmospheres need to be created for Wave 1 launch.

**Coverage:** All 3 physics (glass, flat, retro) + both modes (light, dark). A user who only has the free tier can experience the full physics range.

**Why these 4:**
- **Slate** is Dima's daily driver, the intended default VE experience
- **Terminal** is the only retro theme — essential for demonstrating the physics
- **Meridian** was created for the showcase pages, neutral enough for any project
- **Solar** was the most praised by testers, strong glass showcase
- Each atmosphere has a distinct personality — no two feel similar

#### DGRS-Private — 11 Atmospheres

These stay in the CoNexus repo. They are registered at runtime via `voidEngine.registerTheme()` during the CoNexus boot sequence. They are never published to npm or distributed in any form.

| Atmosphere | Physics | Mode | Why Private |
|-----------|---------|------|-------------|
| **Void** | glass | dark | Original system default. DGRS signature. |
| **Onyx** | flat | dark | Stealth / Cinema |
| **Nebula** | glass | dark | Synthwave / Cosmic |
| **Overgrowth** | glass | dark | Nature / Organic |
| **Velvet** | glass | dark | Romance / Soft |
| **Crimson** | glass | dark | Horror / Intense |
| **Paper** | flat | light | Print / Editorial — boss's favorite, DGRS brand |
| **Laboratory** | flat | light | DGRS Labs brand colors (blue), company identity |
| **Playground** | flat | light | Playful / Vibrant |
| **Focus** | flat | light | Minimal / Distraction-free |
| **+ others** | — | — | Any future DGRS-created atmospheres |

**Note:** Solar moved to the free tier as of 2026-04-03.

**Why Paper is private:** Boss specifically wants to preserve it for DGRS. It's a brand asset.
**Why Laboratory is private:** Uses DGRS Labs blue colors — it's literally the company's atmosphere.

### Tier Metadata

Add a `tier` field to each theme definition in `atmospheres.ts`:

```typescript
slate: {
  mode: 'dark',
  physics: 'flat',
  tagline: 'Default / Professional',
  tier: 'free',           // ships with void-energy npm package
  palette: { ... }
},
void: {
  mode: 'dark',
  physics: 'glass',
  tagline: 'Default / Cyber',
  tier: 'private',         // DGRS only, registered at runtime in CoNexus
  palette: { ... }
},
```

**Tier values:**
- `'free'` — ships with void-energy npm package (4 atmospheres)
- `'private'` — DGRS-private, lives in CoNexus repo (11 atmospheres)

**Files to modify:**
- `src/config/atmospheres.ts` — new file with tier on each theme
- `src/types/design-tokens.d.ts` — add `tier: 'free' | 'private'` to the theme type
- Token build script — propagate `tier` into `void-registry.json`

### What `atmospheres.ts` Looks Like

```typescript
/**
 * ═══════════════════════════════════════════════════════════════
 *  VOID ENERGY — ATMOSPHERE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════
 *
 *  HOW TO ADD A NEW ATMOSPHERE
 *  ───────────────────────────
 *  1. Add an entry to ATMOSPHERES below with:
 *     - mode: 'dark' or 'light'
 *     - physics: 'glass', 'flat', or 'retro'
 *     - tagline: short description
 *     - tier: 'free' (ships in npm) or 'private' (DGRS only)
 *     - palette: full color/font token map
 *
 *  2. For fonts, reference FONTS.keyName.family from ./fonts.ts
 *     (add new fonts there first if needed)
 *
 *  3. Run: npm run build:tokens
 *
 *  PHYSICS CONSTRAINTS
 *  ───────────────────
 *  - glass requires mode: 'dark' (glows need darkness)
 *  - retro requires mode: 'dark' (CRT phosphor effect)
 *  - flat works with both modes
 *
 *  Use an existing atmosphere as your starting template.
 *  The AI atmosphere generator can also create palettes for you.
 *
 * ═══════════════════════════════════════════════════════════════
 */

import { FONTS } from './fonts';

export const SEMANTIC_DARK = { ... };
export const SEMANTIC_LIGHT = { ... };

export const ATMOSPHERES = {
  slate: { mode: 'dark', physics: 'flat', tier: 'free', tagline: '...', palette: { ... } },
  void:  { mode: 'dark', physics: 'glass', tier: 'private', tagline: '...', palette: { ... } },
  // ... all 16
};
```

### Migration: Zero Breaking Changes

`design-tokens.ts` imports from `atmospheres.ts` and plugs into `VOID_TOKENS`:

```typescript
// design-tokens.ts
import { ATMOSPHERES, SEMANTIC_DARK, SEMANTIC_LIGHT } from './atmospheres';
export { ATMOSPHERES, SEMANTIC_DARK, SEMANTIC_LIGHT } from './atmospheres';

export const VOID_TOKENS = {
  themes: ATMOSPHERES,
  spacing: { ... },
  physics: { ... },
  typography: { ... },
};
```

All existing imports continue to work. The `VOID_TOKENS.themes` reference is unchanged.

---

## Part C — Resulting File Structure

### Before (current)

```
src/config/
  design-tokens.ts      ← 850+ lines: fonts, semantics, atmospheres, spacing, physics, typography
src/types/
  design-tokens.d.ts    ← FontDefinition type
```

### After (refactored)

```
src/config/
  fonts.ts              ← ~120 lines: FONTS, preload helpers, inline instructions
  atmospheres.ts        ← ~500 lines: ATMOSPHERES, SEMANTIC_DARK/LIGHT, tier metadata, inline instructions
  design-tokens.ts      ← ~200 lines: spacing, physics, typography, VOID_TOKENS orchestrator + re-exports
src/types/
  design-tokens.d.ts    ← FontDefinition + tier type additions
```

### What Stays in `design-tokens.ts`

- `VOID_TOKENS` object (orchestrator — assembles themes + spacing + physics + typography)
- Spacing tokens
- Physics tokens
- Typography scale tokens
- Re-exports from `fonts.ts` and `atmospheres.ts` (backward compatibility)

---

## Implementation Steps

### Step 1: Create `src/config/fonts.ts`

1. Move `FontDefinition` type (or keep in `types/` and import)
2. Move `DEFAULT_PRELOAD_WEIGHTS`
3. Move `FONTS` record with all 11 font definitions
4. Move `FONT_FAMILY_TO_KEY` derived lookup
5. Move `getThemePreloadFonts()` and `getFontDisplayName()`
6. Add the instructional header comment block
7. Add re-exports in `design-tokens.ts`

### Step 2: Create `src/config/atmospheres.ts`

1. Move `SEMANTIC_DARK` and `SEMANTIC_LIGHT`
2. Move all 16 theme definitions from `VOID_TOKENS.themes`
3. Add `tier: 'free' | 'private'` to each theme
4. Import `FONTS` from `./fonts` (themes reference `FONTS.tech.family` etc.)
5. Add the instructional header comment block
6. Add re-exports in `design-tokens.ts`

### Step 3: Slim down `design-tokens.ts`

1. Remove moved code (fonts, semantics, atmospheres)
2. Import `ATMOSPHERES` and plug into `VOID_TOKENS.themes`
3. Add re-exports for backward compatibility
4. Verify the file is ~200 lines of spacing/physics/typography

### Step 4: Update token build script

1. Ensure `generate-tokens.ts` resolves imports correctly (it imports from `design-tokens.ts` — re-exports handle this)
2. Propagate `tier` field into `void-registry.json`
3. Run `npm run build:tokens` — verify all generated files are identical (except new tier field)

### Step 5: Update types

1. Add `tier: 'free' | 'private'` to theme type in `design-tokens.d.ts`
2. Move or re-export `FontDefinition` as needed

### Step 6: Verify all consumers

These files import from `@config/design-tokens` — verify they still work via re-exports:

- `src/lib/atmosphere-generator.ts` — imports `FONTS`, `SEMANTIC_DARK`, `SEMANTIC_LIGHT`
- `src/components/modals/ThemesFragment.svelte` — imports `FONTS`, `FONT_FAMILY_TO_KEY`
- `src/components/modals/ManualAtmosphereFragment.svelte` — imports `FONTS`, `SEMANTIC_DARK`
- `src/components/ui-library/Atmospheres.svelte` — imports `FONTS`
- `src/components/core/ThemeScript.astro` — imports `FONT_REGISTRY` (from font-registry.ts, unaffected)

### Step 7: SCSS generation split (for repo extraction)

**Public repo (`void-energy`):** `_generated-themes.scss` contains only 4 free themes (Slate, Terminal, Meridian, Solar).

**CoNexus repo:** Registers the 12 private themes at runtime via `voidEngine.registerTheme()`. Private themes work via CSS custom properties set on `<html>` at runtime — no SCSS compilation needed. The SCSS file only covers the initial page load (before JS), which is why free themes are baked in.

### Step 8: Extract private theme definitions to CoNexus (Wave 3)

Each private atmosphere becomes a standalone TypeScript module in the CoNexus repo:

```
conexus/
  src/
    atmospheres/
      void.ts
      onyx.ts
      nebula.ts
      overgrowth.ts
      velvet.ts
      crimson.ts
      paper.ts
      laboratory.ts
      playground.ts
      focus.ts
      index.ts          ← re-exports all as privateThemes record
    boot.ts             ← registers all private themes at startup
```

Each theme file exports the full palette definition (same shape as atmospheres.ts):
```typescript
// atmospheres/nebula.ts
export const nebula = {
  mode: 'dark' as const,
  physics: 'glass' as const,
  tagline: 'Synthwave / Cosmic',
  font: { heading: 'Mystic', body: 'Clean' },
  palette: {
    'bg-canvas': '#0a0014',
    'bg-spotlight': 'radial-gradient(...)',
    'energy-primary': '#d946ef',
    // ... full palette
  },
};
```

### Step 9: CoNexus boot sequence (Wave 3)

```typescript
// conexus/src/boot.ts
import { voidEngine } from 'void-energy/engine';
import { privateThemes } from './atmospheres';

// Register all 12 DGRS-private atmospheres
for (const [id, definition] of Object.entries(privateThemes)) {
  voidEngine.registerTheme(id, definition);
}
// Now all 16 atmospheres are available (4 free + 12 private)
```

### Step 10: Update VoidEngine getters (optional)

The existing `builtInAtmospheres` and `customAtmospheres` getters already distinguish between build-time and runtime themes. No new getters are strictly needed, but for clarity:

```typescript
get freeAtmospheres(): string[] {
  // Themes baked into SCSS (available before JS runs)
  return ['slate', 'terminal', 'meridian', 'solar'];
}
```

### Step 11: Update UI (ThemesFragment, showcase)

- **ThemesFragment in void-energy:** Shows only 4 free atmospheres + any user-created themes (via AI generator)
- **ThemesFragment in CoNexus:** Shows all 16 (4 free + 12 private), grouped visually
- **No "Premium" badge or upsell in the theme picker** — the free system is complete

---

## Font + Atmosphere Coupling

Private atmospheres reference fonts not shipped with the free tier:
- Nebula: Mystic (heading) + Clean (body)
- Overgrowth: Nature
- Velvet: Hand (heading) + Book (body)
- Crimson: Horror
- Playground: Fun
- Laboratory: Lab

**These fonts live in the CoNexus repo**, not in any published package. The boot sequence must handle font loading for private themes.

**Recommended approach:** Bundle fonts alongside the private theme definitions in the CoNexus repo. Self-contained, no network dependency. The font files go in the CoNexus `public/fonts/` directory, and `@font-face` rules are injected during the boot sequence alongside theme registration.

---

## Migration Path

During the transition period (while still working in the monorepo):
1. Create `fonts.ts` and `atmospheres.ts` now — zero breaking changes via re-exports
2. Add `tier` metadata now — zero breaking changes
3. Keep all atmospheres and fonts in the monorepo for development
4. When extracting to separate repos, use the tier field to determine what goes where
5. The showcase site in the monorepo continues to show all atmospheres for development

---

## Verification Checklist

### Font extraction
- [ ] `fonts.ts` has clear inline instructions for adding/removing fonts
- [ ] All font-related exports re-exported from `design-tokens.ts`
- [ ] `npm run build:tokens` produces identical `_fonts.scss` and `font-registry.ts`
- [ ] All consumers compile without changes (`atmosphere-generator`, `ThemesFragment`, etc.)
- [ ] `npm run check` passes (TypeScript + Svelte)

### Atmosphere extraction
- [ ] `atmospheres.ts` has clear inline instructions for adding/removing themes
- [ ] All atmosphere-related exports re-exported from `design-tokens.ts`
- [ ] `npm run build:tokens` produces identical `_generated-themes.scss`
- [ ] `tier` field present on all 16 themes
- [ ] `void-registry.json` includes tier information
- [ ] All consumers compile without changes

### Overall
- [ ] `design-tokens.ts` is ~200 lines (spacing, physics, typography, orchestrator)
- [ ] All 4 free atmospheres cover all 3 physics modes + both color modes
- [ ] Free atmospheres have distinct personalities (no two feel similar)
- [ ] `npm run dev` works — full dev server with all 16 atmospheres
- [ ] No FOUC — font preloading pipeline still works end-to-end
- [ ] A new developer can read `fonts.ts` and add a font without reading any other file
- [ ] A new developer can read `atmospheres.ts` and add a theme without reading any other file
