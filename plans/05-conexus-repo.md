# 05 — CoNexus Repo

> The CoNexus AI storytelling platform. Consumes both public `void-energy` and private `@dgrslabs` premium packages.

**Status:** Planning
**Depends on:** 03-public-repo, 04-premium-repo
**Blocks:** Nothing (final consumer)

---

## Goal

Create `github.com/dgrslabs/conexus` as the flagship application that demonstrates the full Void Energy ecosystem. CoNexus is a private repository — it's the product, not the framework.

After setup:
- CoNexus imports `void-energy` (public core) for the engine, components, and styles
- CoNexus imports premium packages for advanced features
- CoNexus-exclusive features (story engine, ambient layers, app logic) live only here
- All 12 atmospheres are available (4 starter + 8 registered at boot)

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
│   ├── ui/                        ← CoNexus-exclusive UI (not in any package)
│   │   ├── ambient-layers/        ← Visual immersion effects
│   │   │   ├── BloodLayer.svelte
│   │   │   ├── SnowLayer.svelte
│   │   │   ├── RainLayer.svelte
│   │   │   └── FogLayer.svelte
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
import { registerPremiumAtmospheres } from '@dgrslabs/void-energy-atmospheres';

// Register premium atmospheres — now all 12 are available
registerPremiumAtmospheres(voidEngine);

// App-specific initialization
// ...
```

This runs early in the app lifecycle (imported in the root layout or entry point).

---

## Dependencies

```json
{
  "name": "conexus",
  "private": true,
  "dependencies": {
    "void-energy": "^0.1.0",
    "@dgrslabs/void-energy-atmospheres": "^0.1.0",
    "@dgrslabs/void-energy-kinetic-text": "^0.1.0",
    "@dgrslabs/void-energy-conexus": "^0.1.0",
    "@dgrslabs/void-energy-rive": "^0.1.0",
    "astro": "^5.0.0",
    "svelte": "^5.0.0"
  }
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
// Core components — from public void-energy
import ActionBtn from 'void-energy/components/ActionBtn';
import { modal } from 'void-energy/lib/modal-manager';
import { toast } from 'void-energy/stores/toast';
import { voidEngine } from 'void-energy/engine';

// CoNexus UI — from premium conexus package
import Tile from '@dgrslabs/void-energy-conexus/components/Tile';
import StoryFeed from '@dgrslabs/void-energy-conexus/components/StoryFeed';
import PortalLoader from '@dgrslabs/void-energy-conexus/components/PortalLoader';

// Kinetic text — from premium kinetic-text package
import KineticText from '@dgrslabs/void-energy-kinetic-text/component';

// Narrative effects — from public void-energy (these are public)
import { narrative } from 'void-energy/actions/narrative';

// CoNexus-exclusive (local)
import BloodLayer from '../ui/ambient-layers/BloodLayer.svelte';
import { storyEngine } from '../engine/story-engine';
```

---

## What Lives Only in CoNexus (Never Extracted)

| Feature | Description | Why CoNexus-only |
|---------|-------------|------------------|
| Story engine | Narrative orchestration, beat system, branching | Core app logic |
| Ambient layers | Blood, snow, rain, fog overlays | Story immersion feature |
| Story viewer/editor | Reading and writing interface | App-specific UI |
| User stories/feed | Content management | App data layer |
| Portal effects | Loading portal, portal ring | CoNexus brand identity |
| NFT gating | Token-gated story access | Business logic |
| AI story generation | Claude-powered narrative | App feature |

**Note:** Some of these (ambient layers, portal effects) might move to premium packages later if there's demand from other consumers. But start with them in CoNexus.

---

## Ambient Layers (CoNexus-Exclusive)

Visual immersion effects triggered by story atmosphere or narrative beats:

### Planned Layers
| Layer | Effect | Trigger |
|-------|--------|---------|
| **BloodLayer** | Dripping/pooling from edges | Crimson atmosphere, horror beats |
| **SnowLayer** | Falling particles with wind | Winter narrative, cold scenes |
| **RainLayer** | Streaming rain with direction | Storm scenes, melancholy beats |
| **FogLayer** | Volumetric overlay | Mystery scenes, transitions |

### Physics Adaptation
Each layer must adapt to the active physics preset:
- **Glass:** Blur + glow effects, translucent particles
- **Flat:** Subtle opacity, clean shapes
- **Retro:** Pixelated/dithered rendering

### Implementation Notes
- Use `position: fixed` overlays with `pointer-events: none`
- CSS animations or canvas for particle systems
- Must be composable (multiple layers simultaneously)
- Performance budget: < 5ms per frame on mid-range mobile
- Toggle via `data-ambient` attribute on a container

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
npm install @dgrslabs/void-energy-atmospheres
npm install @dgrslabs/void-energy-kinetic-text
npm install @dgrslabs/void-energy-conexus
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

- [ ] All 12 atmospheres available after boot (4 starter + 8 premium)
- [ ] Core components import correctly from `void-energy`
- [ ] CoNexus components import from `@dgrslabs/void-energy-conexus`
- [ ] Kinetic text works from `@dgrslabs/void-energy-kinetic-text`
- [ ] Physics switching works across all imported components
- [ ] Ambient layers render in all 3 physics modes
- [ ] No direct imports from the old monorepo
- [ ] Builds cleanly from fresh clone
- [ ] Private npm authentication works in CI
