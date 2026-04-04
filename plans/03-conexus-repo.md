# 03 — CoNexus Repo

> The CoNexus AI storytelling platform — TOP PRIORITY. Consumes public `void-energy` from npm (same as everyone else) + premium packages from private npm. Owns all 12 DGRS-private atmospheres.

**Status:** Planning — Wave 3 (after VE is fully complete — starter + premium)
**Updated:** 2026-04-04
**Depends on:** 01-public-repo (Wave 1), 02-premium-repo (Wave 2)
**Blocks:** Nothing (final consumer).

---

## Goal

Create `github.com/dgrslabs/conexus` as the flagship application that demonstrates the full Void Energy ecosystem. CoNexus is a private repository — it's the product, not the framework.

**This is Wave 3 — after Void Energy is fully complete.** "Here's what a production app looks like on Void Energy." CoNexus running with physics switching, atmosphere changes, kinetic text, and narrative effects in production is the proof of concept that makes developers want to use the system. No split focus — finish VE first, then migrate CoNexus.

After setup:
- CoNexus imports `void-energy` from public npm (same as any external consumer)
- CoNexus imports `@dgrslabs/void-energy-dgrs` for DGRS atmospheres + shared UI components (Tile, StoryFeed, PortalLoader, LoadingTextCycler, etc.)
- CoNexus imports other premium packages from private npm (`@dgrslabs/void-energy-kinetic-text`, `@dgrslabs/void-energy-ambience`, etc.)
- Boot sequence registers 12 DGRS atmospheres from the DGRS package at runtime
- CoNexus-exclusive features (story engine, app logic) live only here
- All 16 atmospheres available (4 free from void-energy + 12 from DGRS package)

---

## Repository Structure

```
conexus/
├── src/
│   ├── pages/                     ← Astro pages (app routes)
│   │   ├── index.astro
│   │   ├── stories/
│   │   ├── portal/
│   │   └── api/
│   │
│   ├── layouts/                   ← App layouts
│   │   └── AppLayout.astro
│   │
│   ├── components/                ← App-level Svelte components
│   │   ├── StoryViewer.svelte
│   │   ├── StoryEditor.svelte
│   │   ├── Navigation.svelte
│   │   └── ...
│   │
│   ├── ui/                        ← CoNexus-exclusive UI (not from packages)
│   │   └── ...future CoNexus-only UI
│   │
│   ├── engine/                    ← Story engine (CoNexus core logic)
│   │   ├── story-engine.ts
│   │   ├── narrative-director.ts  ← Orchestrates effects per story beat
│   │   └── ...
│   │
│   ├── stores/                    ← App state
│   │   ├── stories.svelte.ts
│   │   └── ...
│   │
│   ├── service/                   ← Backend integration
│   │   ├── api.ts
│   │   └── ...
│   │
│   ├── boot.ts                   ← App initialization (registers premium packages)
│   │
│   └── styles/
│       └── app.scss               ← App-level styles (imports void-energy base)
│
├── .claude/                       ← AI context for CoNexus development
├── CLAUDE.md
├── package.json
├── tsconfig.json
├── astro.config.mjs
├── svelte.config.js
└── tailwind.config.mjs
```

---

## Boot Sequence

```typescript
// src/boot.ts
import { voidEngine } from 'void-energy/engine';
import { dgrsAtmospheres } from '@dgrslabs/void-energy-dgrs/atmospheres';

// Register all 12 DGRS atmospheres from the package
for (const [id, definition] of Object.entries(dgrsAtmospheres)) {
  voidEngine.registerTheme(id, definition);
}
// Now all 16 atmospheres are available (4 free + 12 DGRS)

// App-specific initialization
// ...
```

This runs early in the app lifecycle (imported in the root layout or entry point). The 12 DGRS themes are runtime-registered via CSS custom properties — they work identically to the 4 free themes baked into SCSS. Terminal and Solar overlap with the free tier; Safety Merge handles duplicates.

---

## Dependencies

```json
{
  "name": "conexus",
  "private": true,
  "dependencies": {
    "void-energy": "^0.1.0",
    "@dgrslabs/void-energy-dgrs": "^0.1.0",
    "@dgrslabs/void-energy-kinetic-text": "^0.1.0",
    "@dgrslabs/void-energy-ambience": "^0.1.0",
    "astro": "^5.0.0",
    "svelte": "^5.0.0"
  }
}
```

Additional premium packages added as they become available:
```json
{
  "@dgrslabs/void-energy-rive": "^0.1.0"
}
```

Premium packages are installed from the private registry. The `.npmrc` configures the `@dgrslabs` scope:
```ini
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## Import Patterns

```typescript
// Core components — from public void-energy (free)
import ActionBtn from 'void-energy/components/ActionBtn';
import { modal } from 'void-energy/lib/modal-manager';
import { toast } from 'void-energy/stores/toast';
import { voidEngine } from 'void-energy/engine';

// DGRS shared components — from premium DGRS package
import Tile from '@dgrslabs/void-energy-dgrs/components/Tile';
import StoryFeed from '@dgrslabs/void-energy-dgrs/components/StoryFeed';
import PortalLoader from '@dgrslabs/void-energy-dgrs/components/PortalLoader';
import LoadingTextCycler from '@dgrslabs/void-energy-dgrs/components/LoadingTextCycler';

// DGRS atmospheres — from premium DGRS package (registered at boot)
import { dgrsAtmospheres } from '@dgrslabs/void-energy-dgrs/atmospheres';

// Kinetic text — from premium package
import KineticText from '@dgrslabs/void-energy-kinetic-text/component';

// Narrative effects — from public void-energy (free)
import { narrative } from 'void-energy/actions/narrative';

// Ambience Layers — from premium package
import { BloodLayer, SnowLayer } from '@dgrslabs/void-energy-ambience';

// Rive animations — from premium package (when available)
import { RiveOverlay } from '@dgrslabs/void-energy-rive';

// CoNexus-exclusive (local)
import { storyEngine } from '../engine/story-engine';
```

---

## What Lives Only in CoNexus (Never Extracted)

| Feature | Description | Why CoNexus-only |
|---------|-------------|------------------|
| Story engine | Narrative orchestration, beat system, branching | Core app logic |
| Story viewer/editor | Reading and writing interface | App-specific UI |
| User stories/feed | Content management | App data layer |
| NFT gating | Token-gated story access | Business logic |
| AI story generation | Claude-powered narrative | App feature |

**Note:** DGRS UI components (Tile, StoryFeed, PortalLoader, LoadingTextCycler) and DGRS atmospheres are **NOT** CoNexus-exclusive — they live in the `@dgrslabs/void-energy-dgrs` premium package, shared across all DGRS Labs apps. Ambience Layers are also a separate premium package (`@dgrslabs/void-energy-ambience`).

---

## Migration Steps

### Step 1: Create the repository
```bash
gh repo create dgrslabs/conexus --private
```

### Step 2: Initialize Astro + Svelte project
- `npm create astro@latest` with Svelte integration
- Configure Tailwind with Void Energy token bridge
- Set up path aliases matching Void Energy conventions

### Step 3: Install dependencies
```bash
npm install void-energy
npm install @dgrslabs/void-energy-dgrs
npm install @dgrslabs/void-energy-kinetic-text
# Premium packages added as available:
# npm install @dgrslabs/void-energy-ambience
# npm install @dgrslabs/void-energy-rive
```

### Step 4: Set up boot sequence
- Create `src/boot.ts` — import DGRS atmospheres from `@dgrslabs/void-energy-dgrs/atmospheres` and register via `voidEngine.registerTheme()`
- Import in root layout
- Verify all 16 atmospheres are available (4 free + 12 DGRS)

### Step 5: Build the app
- Migrate app-specific features from the monorepo
- Build pages using imported components
- Implement story engine and exclusive features

### Step 6: CI/CD
- GitHub Actions for build/test
- Deployment pipeline (your server infrastructure)

---

## Verification Checklist

- [ ] All 16 atmospheres available after boot (4 free + 12 from DGRS package)
- [ ] Core components import correctly from `void-energy`
- [ ] DGRS UI components import correctly from `@dgrslabs/void-energy-dgrs`
- [ ] DGRS atmospheres register correctly from `@dgrslabs/void-energy-dgrs/atmospheres`
- [ ] Kinetic text works from `@dgrslabs/void-energy-kinetic-text` (premium)
- [ ] Ambience Layers work from `@dgrslabs/void-energy-ambience`
- [ ] Physics switching works across all imported components
- [ ] No direct imports from the old monorepo
- [ ] Builds cleanly from fresh clone
- [ ] Private npm authentication works in CI
