# 05 — CoNexus Repo

> The CoNexus AI storytelling platform. Consumes public `void-energy` + CoNexus UI private package + premium packages. Owns all 12 DGRS-private atmospheres.

**Status:** Planning — Wave 4 (after Ambience Layers premium package)
**Updated:** 2026-03-31
**Depends on:** 03-public-repo (Wave 1), 02-conexus-extraction (Wave 2), 04-premium-repo (Wave 3)
**Blocks:** Nothing (final consumer).

---

## Goal

Create `github.com/dgrslabs/conexus` as the flagship application that demonstrates the full Void Energy ecosystem. CoNexus is a private repository — it's the product, not the framework.

**This is Wave 4 — the real announcement.** "Here's what a production app looks like on Void Energy." CoNexus running with physics switching, atmosphere changes, kinetic text, and narrative effects in production is the proof of concept that makes developers want to use the system.

After setup:
- CoNexus imports `void-energy` (public core) for the engine, components, and styles
- CoNexus imports CoNexus UI private package (Tile, StoryFeed, PortalLoader, etc.)
- CoNexus imports `@dgrslabs/void-energy-ambience` for immersive story effects
- CoNexus imports additional premium packages as available (Rive, future add-ons)
- CoNexus owns the 12 DGRS-private atmospheres (registered at boot via `voidEngine.registerTheme()`)
- CoNexus-exclusive features (story engine, app logic) live only here
- All 16 atmospheres available (4 free from void-energy + 12 private registered at boot)

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
│   ├── atmospheres/               ← 12 DGRS-private atmospheres (registered at boot)
│   │   ├── void.ts
│   │   ├── onyx.ts
│   │   ├── nebula.ts
│   │   ├── solar.ts
│   │   ├── overgrowth.ts
│   │   ├── velvet.ts
│   │   ├── crimson.ts
│   │   ├── paper.ts
│   │   ├── laboratory.ts
│   │   ├── playground.ts
│   │   ├── focus.ts
│   │   ├── fonts/                 ← Font files for private themes
│   │   └── index.ts               ← re-exports all as privateThemes record
│   │
│   ├── conexus-ui/                ← Extracted CoNexus UI components
│   │   ├── Tile.svelte
│   │   ├── StoryCategory.svelte
│   │   ├── PortalLoader.svelte
│   │   ├── LoadingTextCycler.svelte
│   │   ├── StoryFeed.svelte
│   │   └── styles/
│   │       └── _tiles.scss
│   │
│   ├── ui/                        ← CoNexus-exclusive UI (not extracted from monorepo)
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
import { privateThemes } from './atmospheres';

// Register all 12 DGRS-private atmospheres
for (const [id, definition] of Object.entries(privateThemes)) {
  voidEngine.registerTheme(id, definition);
}
// Now all 16 atmospheres are available (4 free + 12 private)

// App-specific initialization
// ...
```

This runs early in the app lifecycle (imported in the root layout or entry point). The 12 private themes are runtime-registered via CSS custom properties — they work identically to the 4 free themes baked into SCSS.

---

## Dependencies

```json
{
  "name": "conexus",
  "private": true,
  "dependencies": {
    "void-energy": "^0.1.0",
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

// Kinetic text — from public void-energy (ships free)
import KineticText from 'void-energy/packages/kinetic-text/component';

// Narrative effects — from public void-energy (free)
import { narrative } from 'void-energy/actions/narrative';

// Ambience Layers — from premium package
import { BloodLayer, SnowLayer } from '@dgrslabs/void-energy-ambience';

// Rive animations — from premium package (when available)
import { RiveOverlay } from '@dgrslabs/void-energy-rive';

// CoNexus UI — from private CoNexus UI package
import Tile from '../conexus-ui/Tile.svelte';
import StoryFeed from '../conexus-ui/StoryFeed.svelte';
import PortalLoader from '../conexus-ui/PortalLoader.svelte';

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
| Portal effects | Loading portal, portal ring | CoNexus brand identity |
| NFT gating | Token-gated story access | Business logic |
| AI story generation | Claude-powered narrative | App feature |

**Note:** Ambience Layers (Blood, Snow, Rain, Fog) are a premium package (`@dgrslabs/void-energy-ambience`), not CoNexus-exclusive. CoNexus installs them as a dependency.

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
# Premium packages added later as available:
# npm install @dgrslabs/void-energy-rive
```

### Step 4: Set up boot sequence
- Create `src/boot.ts` with premium atmosphere registration
- Import in root layout
- Verify all 12 atmospheres are available

### Step 5: Build the app
- Migrate app-specific features from the monorepo
- Build pages using imported components
- Implement story engine and exclusive features

### Step 6: CI/CD
- GitHub Actions for build/test
- Deployment pipeline (your server infrastructure)

---

## Verification Checklist

- [ ] All 16 atmospheres available after boot (4 free + 12 DGRS-private)
- [ ] Core components import correctly from `void-energy`
- [ ] CoNexus UI components work from local `conexus-ui/` directory
- [ ] Kinetic text works from `void-energy` (ships free)
- [ ] Ambience Layers work from `@dgrslabs/void-energy-ambience`
- [ ] Physics switching works across all imported components
- [ ] No direct imports from the old monorepo
- [ ] Builds cleanly from fresh clone
- [ ] Private npm authentication works in CI
