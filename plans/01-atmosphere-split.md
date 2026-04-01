# 01 — Atmosphere Split

> Split atmospheres into 4 free (public) + 12 DGRS-private. No premium atmospheres for sale — premium value comes from packages, not themes.

**Status:** Planning — Wave 1 (all 4 free atmospheres already created)
**Updated:** 2026-03-31
**Depends on:** Nothing (can start immediately)
**Blocks:** 03-public-repo

---

## Goal

The public `void-energy` repo ships with 4 free atmospheres that demonstrate every physics mode and both color modes. The 12 original atmospheres (Void, Onyx, Nebula, etc.) remain DGRS-private — they are registered at runtime in CoNexus and never distributed publicly or as a premium product.

**Key principle:** Premium value comes from packages (Rive, future add-ons), not from gating themes. The free tier is generous. The 12 originals are private because they're DGRS brand identity, not because they're a product to sell.

---

## Atmosphere Assignments

### Free (Public) — 4 Atmospheres

| Atmosphere | Physics | Mode | Status | Why Free |
|-----------|---------|------|--------|----------|
| **Slate** | flat | dark | Created | Default VE atmosphere. Clean, professional, daily-driver. |
| **Terminal** | retro | dark | Existing | Only retro theme. Demonstrates pixel physics. |
| **Meridian** | flat | light | Created | Primary light theme. Created for showcases, broad appeal. |
| **Ember** | glass | dark | Existing | Fan favorite from testing. Demonstrates glass physics. |

**All 4 atmospheres are ready.** No new atmospheres need to be created for Wave 1 launch.

**Coverage:** All 3 physics (glass, flat, retro) + both modes (light, dark). A user who only has the free tier can experience the full physics range.

**Why these 4:**
- **Slate** is Dima's daily driver, the intended default VE experience
- **Terminal** is the only retro theme — essential for demonstrating the physics
- **Meridian** was created for the showcase pages, neutral enough for any project
- **Ember** was the most praised by testers, strong glass showcase
- Each atmosphere has a distinct personality — no two feel similar

### DGRS-Private — 12 Atmospheres

These stay in the CoNexus repo. They are registered at runtime via `voidEngine.registerTheme()` during the CoNexus boot sequence. They are never published to npm or distributed in any form.

| Atmosphere | Physics | Mode | Why Private |
|-----------|---------|------|-------------|
| **Void** | glass | dark | Original system default. DGRS signature. |
| **Onyx** | flat | dark | Stealth / Cinema |
| **Nebula** | glass | dark | Synthwave / Cosmic |
| **Solar** | glass | dark | Royal / Gold |
| **Overgrowth** | glass | dark | Nature / Organic |
| **Velvet** | glass | dark | Romance / Soft |
| **Crimson** | glass | dark | Horror / Intense |
| **Paper** | flat | light | Print / Editorial — boss's favorite, DGRS brand |
| **Laboratory** | flat | light | DGRS Labs brand colors (blue), company identity |
| **Playground** | flat | light | Playful / Vibrant |
| **Focus** | flat | light | Minimal / Distraction-free |
| **+ others** | — | — | Any future DGRS-created atmospheres |

**Why Paper is private:** Boss specifically wants to preserve it for DGRS. It's a brand asset.
**Why Laboratory is private:** Uses DGRS Labs blue colors — it's literally the company's atmosphere.

---

## Implementation Steps

### Step 1: Add tier metadata to design-tokens.ts

In `src/config/design-tokens.ts`, add a `tier` field to each theme definition:

```typescript
slate: {
  mode: 'dark',
  physics: 'flat',
  tagline: 'Default / Professional',
  tier: 'free',           // <-- ships with void-energy
  palette: { ... }
},
void: {
  mode: 'dark',
  physics: 'glass',
  tagline: 'Default / Cyber',
  tier: 'private',         // <-- DGRS only, registered at runtime in CoNexus
  palette: { ... }
},
```

**Tier values:**
- `'free'` — ships with void-energy npm package (4 atmospheres)
- `'private'` — DGRS-private, lives in CoNexus repo (12 atmospheres)

**Files to modify:**
- `src/config/design-tokens.ts` — add `tier` to each theme
- `src/types/design-tokens.d.ts` — add `tier: 'free' | 'private'` to the theme type
- Token build script — propagate `tier` into `void-registry.json`

### Step 2: Update token build to propagate tier

The build script (`npm run build:tokens`) generates:
- `src/styles/config/_generated-themes.scss`
- `src/config/void-registry.json`

Update the generator so `void-registry.json` includes the tier:
```json
{
  "slate": { "physics": "flat", "mode": "dark", "tier": "free", ... },
  "void": { "physics": "glass", "mode": "dark", "tier": "private", ... }
}
```

### Step 3: SCSS generation split

**Public repo (`void-energy`):** `_generated-themes.scss` contains only 4 free themes (Slate, Terminal, Meridian, Ember).

**CoNexus repo:** Registers the 12 private themes at runtime via `voidEngine.registerTheme()`. Private themes work via CSS custom properties set on `<html>` at runtime — no SCSS compilation needed. The SCSS file only covers the initial page load (before JS), which is why free themes are baked in.

### Step 4: Extract private theme definitions to CoNexus

Each private atmosphere becomes a standalone TypeScript module in the CoNexus repo:

```
conexus/
  src/
    atmospheres/
      void.ts
      onyx.ts
      nebula.ts
      solar.ts
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

Each theme file exports the full palette definition (same shape as design-tokens.ts):
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

### Step 5: CoNexus boot sequence (Wave 4)

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

### Step 6: Update VoidEngine getters (optional)

The existing `builtInAtmospheres` and `customAtmospheres` getters already distinguish between build-time and runtime themes. No new getters are strictly needed, but for clarity:

```typescript
get freeAtmospheres(): string[] {
  // Themes baked into SCSS (available before JS runs)
  return ['slate', 'terminal', 'meridian', 'ember'];
}
```

### Step 7: Update UI (ThemesFragment, showcase)

- **ThemesFragment in void-energy:** Shows only 4 free atmospheres + any user-created themes (via AI generator)
- **ThemesFragment in CoNexus:** Shows all 16 (4 free + 12 private), grouped visually
- **No "Premium" badge or upsell in the theme picker** — the free system is complete

---

## Font Considerations

Private atmospheres reference fonts not shipped with the free tier:
- Nebula: Mystic (heading) + Clean (body)
- Solar: Arcane (heading) + Book (body)
- Overgrowth: Nature
- Velvet: Hand (heading) + Book (body)
- Crimson: Horror
- Playground: Fun
- Laboratory: Lab

**These fonts live in the CoNexus repo**, not in any published package. The boot sequence must handle font loading for private themes.

**Recommended approach:** Bundle fonts alongside the private theme definitions in the CoNexus repo. Self-contained, no network dependency.

---

## Migration Path

During the transition period (while still working in the monorepo):
1. Add `tier` metadata now — zero breaking changes
2. Keep all atmospheres in the monorepo for development
3. When extracting to separate repos, use the tier field to determine what goes where
4. The showcase site in the monorepo continues to show all atmospheres for development

---

## Verification Checklist

- [ ] All 4 free atmospheres cover all 3 physics modes
- [ ] All 4 free atmospheres cover both color modes (light + dark)
- [ ] Free atmospheres have distinct personalities (no two feel similar)
- [ ] Slate works as the default VE atmosphere
- [ ] 12 private themes register correctly at runtime in CoNexus
- [ ] Theme switching works between free and private atmospheres
- [ ] Font loading works for private atmospheres in CoNexus
- [ ] AI generator can create new atmospheres regardless of tier
- [ ] `void-registry.json` includes tier information
- [ ] No private atmosphere definitions leak into the public void-energy repo
- [ ] ThemesFragment shows appropriate themes per repo context
- [ ] No FOUC when switching to a runtime-registered private theme
