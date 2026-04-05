# 02 — Premium Repo: `void-energy-premium`

> Private monorepo for ALL premium packages, published under the `@dgrslabs` npm scope. First package: Kinetic Text. Then Ambience Layers. Then Rive.

**Status:** Planning — Wave 2 (after starter launch, before CoNexus)
**Updated:** 2026-04-04
**Depends on:** 01-public-repo (Wave 1)
**Blocks:** 03-conexus-repo (Wave 3 — CoNexus consumes premium packages)

---

## Goal

Create `github.com/dgrslabs/void-energy-premium` as a private monorepo that:
- Houses premium collaborator packages as independent workspace members
- Each package extends the public `void-energy` core without modifying it
- Published under `@dgrslabs/*` to a private npm registry
- Includes a package template for onboarding collaborators (Eric Jordan and future)
- Enforces the dependency boundary: premium imports from core, never the reverse

**Strategic decision (2026-04-02, updated 2026-04-04):** ALL packages stay premium/private. Kinetic Text, DGRS, Ambience Layers, and Rive are strategic moat for CoNexus. We don't open-source anything that gives competitors a head start while CoNexus doesn't yet have a second moat (userbase, content). The premium packages in order: **Kinetic Text** (`@dgrslabs/void-energy-kinetic-text`), **DGRS** (`@dgrslabs/void-energy-dgrs` — 12 atmospheres + UI components, shared across all DGRS Labs apps), then Ambience Layers, then Rive when Eric delivers. Premium deals with external customers are for later — after CoNexus launches and has traction. For now, collect contacts from interested parties.

---

## What Premium Is (and Isn't)

**Premium IS:**
- ALL packages that extend the public void-energy core — kept private as strategic moat
- First: `@dgrslabs/void-energy-kinetic-text` (Kinetic Text — physics-aware text animations)
- Second: `@dgrslabs/void-energy-dgrs` (DGRS Package — 12 atmospheres + UI components, shared across all DGRS Labs apps)
- Third: `@dgrslabs/void-energy-ambience` (Ambience Layers — Blood, Snow, Rain, Fog)
- Fourth: `@dgrslabs/void-energy-rive` (Eric Jordan's Rive animations, whenever he delivers)
- Future: additional packages following the same template
- Private for now — collect contacts, discuss access when demand exists
- Premium deals happen after CoNexus launches and has traction

**Premium is NOT:**
- CoNexus app logic (story engine, narrative director — those live in the CoNexus repo)
- Available to external customers yet — moat first, deals later

---

## Repository Structure

```
void-energy-premium/
├── packages/
│   ├── kinetic-text/              ← @dgrslabs/void-energy-kinetic-text (FIRST PACKAGE)
│   │   ├── src/
│   │   │   ├── svelte/
│   │   │   │   └── KineticText.svelte
│   │   │   ├── core/
│   │   │   ├── adapters/
│   │   │   ├── types.ts
│   │   │   ├── index.ts
│   │   │   └── styles/
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── PACKAGE.md             ← Interface spec
│   │   └── CHANGELOG.md
│   │
│   ├── dgrs/                      ← @dgrslabs/void-energy-dgrs (SECOND PACKAGE)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Tile.svelte
│   │   │   │   ├── StoryCategory.svelte
│   │   │   │   ├── StoryFeed.svelte
│   │   │   │   ├── PortalLoader.svelte
│   │   │   │   ├── LoadingTextCycler.svelte
│   │   │   │   ├── PortalLoaderDemo.svelte
│   │   │   │   └── ReorderShowcase.svelte
│   │   │   ├── atmospheres/       ← 12 DGRS atmospheres (registered at boot)
│   │   │   │   ├── void.ts
│   │   │   │   ├── onyx.ts
│   │   │   │   ├── nebula.ts
│   │   │   │   ├── ... (12 total)
│   │   │   │   └── index.ts
│   │   │   ├── icons/
│   │   │   │   └── LoadingPortal.svelte
│   │   │   ├── config/
│   │   │   │   └── constants.ts
│   │   │   ├── types/
│   │   │   │   ├── story.d.ts
│   │   │   │   └── story-engine.d.ts
│   │   │   ├── styles/
│   │   │   │   └── _tiles.scss
│   │   │   ├── fonts/             ← Font files for DGRS atmospheres
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── PACKAGE.md             ← Interface spec
│   │   └── CHANGELOG.md
│   │
│   ├── ambience/                  ← @dgrslabs/void-energy-ambience (THIRD PACKAGE)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── BloodLayer.svelte
│   │   │   │   ├── SnowLayer.svelte
│   │   │   │   ├── RainLayer.svelte
│   │   │   │   ├── FogLayer.svelte
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── PACKAGE.md             ← Interface spec
│   │   └── CHANGELOG.md
│   │
│   ├── rive/                      ← @dgrslabs/void-energy-rive (FOURTH — when Eric delivers)
│   │   ├── assets/                ← .riv files from Eric Jordan
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── RiveOverlay.svelte
│   │   │   │   ├── RiveTransition.svelte
│   │   │   │   └── ...
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── PACKAGE.md             ← Interface spec
│   │   └── CHANGELOG.md
│   │
│   └── [future-packages]/         ← Future collaborator packages
│
├── templates/
│   └── package-template/          ← Starter template for new packages
│       ├── PACKAGE.md             ← Interface spec every package must implement
│       ├── src/
│       │   ├── ExampleOverlay.svelte
│       │   └── index.ts
│       ├── package.json
│       └── README.md
│
├── .github/
│   └── workflows/
│       ├── ci.yml                 ← Lint, type-check, test per package
│       └── publish.yml            ← Publish changed packages to private npm
│
├── package.json                   ← Workspace root
├── tsconfig.json                  ← Shared TS config
├── README.md                      ← Internal documentation
├── CONTRIBUTING.md                ← How to create a new premium package
└── .npmrc                         ← Private registry configuration
```

---

## Package Details

### `@dgrslabs/void-energy-kinetic-text` (First Package — DGRS Built)

Physics-aware animated text effects. The KT package was the viral hit that got attention (Pretext hype wave, March 2026). It's the highest-value strategic asset — keeping it private preserves CoNexus's feel advantage.

**Status:** v0.1.0 already built in monorepo (`packages/kinetic-text/`). Move to premium repo during Wave 2.

**Why premium (not free):** Kinetic Text is core to CoNexus's narrative UX. Before CoNexus has a userbase moat, the UI feel IS the moat. Competitors with KT + a basic story engine could ship a "good enough" narrative platform faster. Once CoNexus has traction (6-12 months), revisit open-sourcing KT to boost VE adoption.

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-kinetic-text",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./component": "./src/svelte/KineticText.svelte",
    "./styles/*": "./src/styles/*.scss"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

---

### `@dgrslabs/void-energy-dgrs` (Second Package — DGRS Built)

The DGRS Labs shared package. Contains the 12 original DGRS atmospheres plus UI components used across all DGRS Labs apps (CoNexus, future apps). This is the shared DGRS identity layer — atmospheres, loading states, story UI.

**Status:** Staging in monorepo (`packages/dgrs/`). Move to premium repo during Wave 2.

**Why a package (not local to CoNexus):** DGRS atmospheres and UI components (Tile, StoryFeed, PortalLoader, LoadingTextCycler) are used across multiple DGRS Labs apps, not just CoNexus. Publishing as a package enables all apps to share the same identity layer via `npm install`.

**Contents:**
- **12 DGRS atmospheres:** Void, Onyx, Terminal, Nebula, Solar, Overgrowth, Velvet, Crimson, Paper, Focus, Laboratory, Playground. Note: Terminal and Solar overlap with the free tier — Safety Merge handles duplicates at boot.
- **UI components:** Tile, StoryCategory, StoryFeed, PortalLoader, LoadingTextCycler, PortalLoaderDemo, ReorderShowcase
- **Icons:** LoadingPortal
- **Types:** StoryData, TileAuthor, TileGate, story engine types
- **Styles:** _tiles.scss (tile layout, reorder animations)
- **Config:** LOADING_WORDS constants
- **Fonts:** Font files for the 12 DGRS atmospheres (bundled with the package)

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-dgrs",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte",
    "./atmospheres": "./src/atmospheres/index.ts",
    "./icons/*": "./src/icons/*.svelte",
    "./types": "./src/types/index.ts",
    "./styles": "./src/styles/_tiles.scss",
    "./config": "./src/config/constants.ts"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

**Boot sequence in consumer apps:**
```typescript
import { voidEngine } from 'void-energy/engine';
import { dgrsAtmospheres } from '@dgrslabs/void-energy-dgrs/atmospheres';

for (const [id, definition] of Object.entries(dgrsAtmospheres)) {
  voidEngine.registerTheme(id, definition);
}
// Now all 16 atmospheres available (4 free + 12 DGRS)
```

---

### `@dgrslabs/void-energy-ambience` (Third Package — DGRS Built)

Visual immersion layers: Blood, Snow, Rain, Fog. Each adapts to the active physics preset. Built for CoNexus storytelling but available as a premium package for anyone who wants atmospheric effects.

**Status:** Not yet started — build when CoNexus narrative flow needs it.

**Realistic expectation:** Very niche use case. Most consumers won't need ambient overlays. But it's a tangible premium product, and CoNexus uses it in production for immersive storytelling.

**Planned layers:**
| Layer | Effect | Physics Adaptation |
|-------|--------|-------------------|
| **BloodLayer** | Dripping/pooling from edges | Glass: blur+glow, Flat: opacity, Retro: pixel/dither |
| **SnowLayer** | Falling particles with wind | Glass: blur+glow, Flat: clean shapes, Retro: pixelated |
| **RainLayer** | Streaming rain with direction | Glass: blur+glow, Flat: subtle opacity, Retro: dithered |
| **FogLayer** | Volumetric overlay | Glass: blur+glow, Flat: opacity, Retro: scanline fog |

**Implementation notes:**
- `position: fixed` overlays with `pointer-events: none`
- CSS animations or canvas for particle systems
- Composable (multiple layers simultaneously)
- Performance budget: < 5ms per frame on mid-range mobile
- Toggle via `data-ambient` attribute on a container

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-ambience",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

---

### `@dgrslabs/void-energy-rive` (Fourth Package — Dima + Eric Jordan)

Rive glass material effects — animated specular highlights, cursor-following light, click ripples, mesh distortion. Exclusively for the glass physics preset (not in DOM for flat/retro).

**Status:** Planning. Dima builds the prototype (`.riv` file + integration scaffold). Eric Jordan reviews, polishes the visual craft, and connects DGRS Labs with the Rive team. Decoupled from wave timeline.

**Architecture:** Rive owns one thing — animated glass light effects. 5 state machine inputs: `bool_Active`, `num_Intensity`, `num_LightX`, `num_LightY`, `trigger_Click`. White colors only (physically correct for light reflections, works across all atmospheres). The Svelte adapter reads `data-physics` from the DOM and controls when Rive activates — Rive doesn't know about physics presets.

**Integration:** 2 touch points → 9 surfaces. `<RiveOverlay />` added to `Navigation.svelte` (3 nav surfaces) and `Modal.svelte` (6 modal fragments). Everything else stays CSS-only glass.

**Full plan:** See [07-rive-glass-effects.md](07-rive-glass-effects.md).

**Interface spec (PACKAGE.md):**
- Must export Svelte components that accept Void Energy physics context
- Glass-only: not in DOM for flat/retro (zero overhead)
- State machine inputs: `bool_Active`, `num_Intensity`, `num_LightX`, `num_LightY`, `trigger_Click`
- Must declare `svelte` and `@rive-app/webgl2` as peer dependencies
- Must include README with visual examples

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-rive",
  "version": "0.1.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte",
    "./assets/*": "./assets/*.riv"
  },
  "peerDependencies": {
    "svelte": "^5.0.0",
    "@rive-app/webgl2": "^2.0.0"
  },
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

**Note:** Starts private (GitHub Packages). Flip `publishConfig` to public npm when Eric/Rive deal materializes — see "Selective Publishing" section above.
```

---

## Selective Publishing — Per-Package Registry Control

The monorepo is private, but individual packages can be published to different registries independently. Each package has its own `publishConfig`:

```json
// packages/kinetic-text/package.json — STAYS PRIVATE
{
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}

// packages/rive/package.json — CAN GO PUBLIC LATER
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

**How it works:** One monorepo, different registries per package. Flip `publishConfig` on any package when the time comes — one commit, one field change. Other packages are untouched. The GitHub repo stays private regardless — people get the built package from npm but can't browse the source.

**Timeline example:**

| Time | KT | DGRS | Ambience | Rive |
|------|-----|------|----------|------|
| Now | private | private | private | private |
| ~6 months (Eric/Rive deal) | private | private | private | **public npm** |
| ~12 months (CoNexus traction) | revisit | private forever | revisit | public |

**If source visibility is needed** (e.g., Rive partnership wants open-source collaboration): extract `packages/rive/` into its own public repo (`github.com/dgrslabs/void-energy-rive`). The package is self-contained — no cross-package imports, only peer dependency on the public `void-energy` core. This is Option B; default is Option A (private repo, public npm package).

---

## Collaborator Model

Eric Jordan is the template for all future collaborators:

### How It Works
1. Collaborator gets access to the premium repo
2. Creates a new package from `templates/package-template/`
3. Implements the PACKAGE.md interface spec
4. Delivers assets + Svelte wrappers that integrate with VE physics
5. DGRS handles distribution, licensing, and customer support

### Compensation — Revenue Share (Decided)
**Preferred:** 25-30% revenue share on `@dgrslabs/void-energy-rive` specifically. No equity dilution. Sustainable template for all future collaborators.
**Alternative hybrid:** 2-3% equity (12-month vest, milestone = shipped .riv files) + 20-25% revenue share. Only if Eric specifically wants ownership stake.
See [00-overview.md — Eric Jordan section](00-overview.md) for full rationale.

### Quality Gate
Every collaborator package must:
- Pass the PACKAGE.md interface spec
- Work across all 3 physics modes
- Work in both color modes
- Follow Token Law (no raw values)
- Use Svelte 5 Runes
- Include vitest unit tests

---

## Package Template

Every new premium package starts from `templates/package-template/`:

### `PACKAGE.md` — Interface Specification
```markdown
# Package: [Name]

## Required Exports
- `./` — Main entry with registration function
- `./components/*` — Individual component exports (if applicable)

## Void Energy Integration
- Peer dependency: `void-energy >= 0.1.0`
- Physics awareness: Components must adapt to glass/flat/retro
- Mode awareness: Components must work in light and dark
- Token compliance: No raw values (Law 2)
- Runes only: Svelte 5 runes (Law 3)

## State Contract
- State visible to CSS via data attributes (Law 4)
- Use `when-state()`, `when-retro`, `when-light` SCSS mixins

## Testing
- Must include vitest unit tests
- Must verify rendering in all 3 physics modes
```

---

## Workspace Configuration

### Root `package.json`:
```json
{
  "name": "void-energy-premium",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "check": "npm run check --workspaces --if-present"
  },
  "devDependencies": {
    "void-energy": "^0.1.0",
    "svelte": "^5.0.0",
    "typescript": "^5.0.0",
    "sass-embedded": "^1.0.0",
    "vitest": "^3.0.0"
  }
}
```

### `.npmrc` (private registry):
```ini
# GitHub Packages (recommended to start)
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## CI/CD

### Per-package CI:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [kinetic-text, dgrs, ambience, rive]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run check --workspace=packages/${{ matrix.package }}
      - run: npm run test --workspace=packages/${{ matrix.package }}
```

### Publish on release:
```yaml
name: Publish
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      packages: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          registry-url: 'https://npm.pkg.github.com'
          scope: '@dgrslabs'
      - run: npm ci
      - run: npm run build --workspaces
      - run: npm publish --workspaces
        env:
          NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Migration Steps

### Step 1: Create the repository
```bash
gh repo create dgrslabs/void-energy-premium --private
```

### Step 2: Initialize workspace structure
- Create `packages/` directory
- Create root `package.json` with workspaces config
- Create `templates/package-template/`

### Step 3: Move Kinetic Text package
- Move `packages/kinetic-text/` from monorepo to `packages/kinetic-text/` in premium repo
- Update imports to use `void-energy` as peer dependency
- Verify it builds independently from the premium repo
- This is the first package — it already exists and works

### Step 4: Move DGRS package
- Move `packages/dgrs/` from monorepo to `packages/dgrs/` in premium repo
- Create `package.json` with proper exports (components, atmospheres, icons, types, styles)
- Bundle DGRS atmosphere font files with the package
- Create boot helper for atmosphere registration
- Verify all 12 atmospheres register correctly via `voidEngine.registerTheme()`
- Verify all UI components render correctly when consuming `void-energy` from npm

### Step 5: Build Ambience Layers package (when CoNexus needs it)
- Set up `packages/ambience/` with package.json and PACKAGE.md
- Implement BloodLayer, SnowLayer, RainLayer, FogLayer
- Physics adaptation for all 3 presets (glass/flat/retro)
- Performance testing (< 5ms per frame)

### Step 6: Create Rive package skeleton (when Eric delivers)
- Set up `packages/rive/` with package.json and PACKAGE.md
- Placeholder components ready for Eric's assets
- Document the integration points Eric needs to implement

### Step 7: Set up CI/CD
- Add GitHub Actions workflows
- Configure private npm publishing
- Test publish flow with dry-run

---

## Verification Checklist

- [ ] Workspace builds from clean clone
- [ ] Package template is documented and usable
- [ ] Kinetic Text package builds from premium repo
- [ ] DGRS package builds from premium repo — all 12 atmospheres register, all UI components render
- [ ] DGRS atmosphere fonts are bundled and load correctly
- [ ] Rive package skeleton builds (even without assets)
- [ ] `void-energy` declared as peer dependency in all packages
- [ ] No package imports from another premium package (only from core)
- [ ] CI pipeline runs for all packages
- [ ] Private npm publish works (test with dry-run first)
- [ ] CONTRIBUTING.md explains how collaborators onboard
