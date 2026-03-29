# 01 — Atmosphere Split

> Split the 12 built-in atmospheres into 4 public starter + 8 premium, with a runtime registration system for additive loading.

**Status:** Planning
**Depends on:** Nothing (can start immediately)
**Blocks:** 03-public-repo, 04-premium-repo

---

## Goal

The public `void-energy` repo ships with 4 atmospheres that demonstrate every physics mode and both color modes. Premium atmospheres are shipped as a separate package that registers additional themes at runtime. No atmosphere is "locked" — the engine accepts any theme. The split is about what ships out of the box.

---

## Atmosphere Assignments

### Starter (Public) — 4 Atmospheres

| Atmosphere | Physics | Mode | Why Starter |
|-----------|---------|------|-------------|
| **void** | glass | dark | System default. The signature experience. |
| **terminal** | retro | dark | Only retro theme. Demonstrates pixel physics. |
| **paper** | flat | light | Primary light theme. Print/editorial aesthetic. |
| **focus** | flat | light | Minimal alternative. Distraction-free. |

**Coverage:** All 3 physics (glass, flat, retro) + both modes (light, dark). A user who only has the starter can experience the full physics range.

### Premium — 8 Atmospheres

| Atmosphere | Physics | Mode | Character |
|-----------|---------|------|-----------|
| **onyx** | flat | dark | Stealth / Cinema — flat dark alternative |
| **nebula** | glass | dark | Synthwave / Cosmic — purple glass with color overrides |
| **solar** | glass | dark | Royal / Gold — warm glass with color overrides |
| **overgrowth** | glass | dark | Nature / Organic — green glass (energy/success overlap) |
| **velvet** | glass | dark | Romance / Soft — pink glass |
| **crimson** | glass | dark | Horror / Intense — red glass (energy/error overlap) |
| **laboratory** | flat | light | Science / Clinical — cool gray flat |
| **playground** | flat | light | Playful / Vibrant — colorful flat |

---

## Implementation Steps

### Step 1: Add tier metadata to design-tokens.ts

In `src/config/design-tokens.ts`, add a `tier` field to each theme definition:

```typescript
// In the themes object, each entry gets:
void: {
  mode: 'dark',
  physics: 'glass',
  tagline: 'Default / Cyber',
  tier: 'starter',        // <-- NEW
  palette: { ... }
},
nebula: {
  mode: 'dark',
  physics: 'glass',
  tagline: 'Synthwave / Cosmic',
  tier: 'premium',        // <-- NEW
  palette: { ... }
},
```

**Files to modify:**
- `src/config/design-tokens.ts` — add `tier` to each of 12 themes
- `src/types/design-tokens.d.ts` — add `tier: 'starter' | 'premium'` to the theme type
- Token build script — propagate `tier` into `void-registry.json`

### Step 2: Update token build to propagate tier

The build script (`npm run build:tokens`) generates:
- `src/styles/config/_generated-themes.scss`
- `src/config/void-registry.json`

Update the generator so `void-registry.json` includes the tier:
```json
{
  "void": { "physics": "glass", "mode": "dark", "tier": "starter", ... },
  "nebula": { "physics": "glass", "mode": "dark", "tier": "premium", ... }
}
```

### Step 3: Design the atmosphere registration API

The public repo generates SCSS only for starter atmospheres. Premium atmospheres are loaded at runtime via a registration function.

**In the public `void-energy` package, VoidEngine already supports:**
```typescript
voidEngine.registerTheme(id, partialDefinition)  // merges against base
```

**The premium package exports a registration function:**
```typescript
// @dgrslabs/void-energy-atmospheres/src/index.ts
import type { VoidEngine } from 'void-energy/engine';
import { premiumThemes } from './themes';

export function registerPremiumAtmospheres(engine: VoidEngine): void {
  for (const [id, definition] of Object.entries(premiumThemes)) {
    engine.registerTheme(id, definition);
  }
}
```

**Consumer usage (CoNexus boot):**
```typescript
import { voidEngine } from 'void-energy/engine';
import { registerPremiumAtmospheres } from '@dgrslabs/void-energy-atmospheres';

registerPremiumAtmospheres(voidEngine);
// Now all 12 atmospheres are available
```

### Step 4: Extract premium theme definitions

Each premium atmosphere becomes a standalone TypeScript module:

```
@dgrslabs/void-energy-atmospheres/
  src/
    themes/
      onyx.ts
      nebula.ts
      solar.ts
      overgrowth.ts
      velvet.ts
      crimson.ts
      laboratory.ts
      playground.ts
      index.ts          ← re-exports all as premiumThemes record
    index.ts            ← exports registerPremiumAtmospheres()
  package.json
  README.md
```

Each theme file exports the full palette definition (same shape as design-tokens.ts):
```typescript
// themes/nebula.ts
export const nebula = {
  mode: 'dark' as const,
  physics: 'glass' as const,
  tagline: 'Synthwave / Cosmic',
  tier: 'premium' as const,
  font: { heading: 'Mystic', body: 'Clean' },
  palette: {
    'bg-canvas': '#0a0014',
    'bg-spotlight': 'radial-gradient(...)',
    'bg-sunk': '#0d001a',
    'bg-surface': 'rgba(30, 15, 60, 0.45)',
    'energy-primary': '#d946ef',
    'energy-secondary': '#8b5cf6',
    // ... full palette
  },
  overrides: {
    'color-system': '#38bdf8',
  }
};
```

### Step 5: SCSS generation split

**Public repo:** `_generated-themes.scss` contains only 4 starter themes.

**Premium themes use CSS custom properties injected at runtime** when registered via `registerTheme()`. The VoidEngine already applies themes by setting CSS variables on `<html>`, so runtime-registered themes work identically to build-time themes — they just aren't in the SCSS file.

**Important:** This means premium atmospheres work without any SCSS compilation. The runtime registration sets all `--var` values directly. The SCSS file is only needed for the initial page load (before JS runs), which is why starter themes are baked in.

### Step 6: Update VoidEngine getters

Add tier-aware getters to VoidEngine:

```typescript
get starterAtmospheres(): string[] {
  return this.builtInAtmospheres.filter(id =>
    this.registry[id]?.tier === 'starter'
  );
}

get premiumAtmospheres(): string[] {
  return this.builtInAtmospheres.filter(id =>
    this.registry[id]?.tier === 'premium'
  );
}
```

### Step 7: Update UI (ThemesFragment, showcase)

- **ThemesFragment:** Group themes visually — "Starter" section and "Premium" section (if any premium themes are registered). Show a subtle badge or divider.
- **Atmosphere showcase page:** Same grouping for documentation purposes.
- **No gating logic needed in the engine itself** — if a premium theme is registered, it's available. The gating is at the package level (you need the npm package to register them).

---

## Font Considerations

Premium atmospheres reference fonts not shipped with the starter:
- Nebula: Mystic (heading) + Clean (body)
- Solar: Arcane (heading) + Book (body)
- Overgrowth: Nature
- Velvet: Hand (heading) + Book (body)
- Crimson: Horror
- Playground: Fun
- Laboratory: Lab

**The premium atmospheres package must also ship these font files** or the registration function must handle font loading. Options:
1. Bundle fonts in the premium package (simplest)
2. Reference fonts from a CDN (lighter package, network dependency)
3. Use the existing font registry system — premium package extends `font-registry.ts`

**Recommended:** Option 1 (bundle fonts). Self-contained, no network dependency, works offline.

---

## Migration Path

During the transition period (while still working in the monorepo):
1. Add `tier` metadata now — zero breaking changes
2. Keep all 12 atmospheres in the monorepo for development
3. When extracting to separate repos, use the tier field to determine what goes where
4. The showcase site in the monorepo continues to show all 12 for development purposes

---

## Verification Checklist

- [ ] All 4 starter atmospheres cover all 3 physics modes
- [ ] All 4 starter atmospheres cover both color modes
- [ ] Premium atmospheres register correctly at runtime
- [ ] Theme switching works between starter and premium atmospheres
- [ ] Font loading works for premium atmospheres
- [ ] AI generator can create new atmospheres regardless of tier
- [ ] `void-registry.json` includes tier information
- [ ] ThemesFragment groups themes by tier when premium themes are present
- [ ] No FOUC when switching to a runtime-registered premium theme
