# 04 — Premium Repo: `void-energy-premium`

> Private monorepo for premium packages, published under the `@dgrslabs` npm scope. First package: Ambience Layers.

**Status:** Planning — Wave 3 (after CoNexus UI extraction)
**Updated:** 2026-03-31
**Depends on:** 03-public-repo (Wave 1), 02-conexus-extraction (Wave 2)
**Blocks:** 05-conexus-repo (Wave 4 — CoNexus consumes Ambience Layers)

---

## Goal

Create `github.com/dgrslabs/void-energy-premium` as a private monorepo that:
- Houses premium collaborator packages as independent workspace members
- Each package extends the public `void-energy` core without modifying it
- Published under `@dgrslabs/*` to a private npm registry
- Includes a package template for onboarding collaborators (Eric Jordan and future)
- Enforces the dependency boundary: premium imports from core, never the reverse

**Key change from earlier plans:** This repo is leaner than originally scoped. Kinetic Text now ships free with `void-energy`. Atmospheres are not a sellable product — the 12 originals are DGRS-private and live in the CoNexus repo. The first premium package is **Ambience Layers** (`@dgrslabs/void-energy-ambience`), built by DGRS. Eric Jordan's Rive package ships whenever he delivers — decoupled from the wave timeline.

---

## What Premium Is (and Isn't)

**Premium IS:**
- Packages that extend the public void-energy core
- First: `@dgrslabs/void-energy-ambience` (Ambience Layers — Blood, Snow, Rain, Fog)
- Second: `@dgrslabs/void-energy-rive` (Eric Jordan's Rive animations, whenever he delivers)
- Future: additional packages following the same template
- Distributed via private npm to licensed customers
- Realistic expectation: niche use case (especially Ambience Layers), but tangible product. Contact DGRS if interested.

**Premium is NOT:**
- Extra atmospheres (the 12 originals are DGRS-private, not for sale)
- Kinetic Text (now free — it's a marketing tool for adoption)
- CoNexus components (those live in a private CoNexus UI package)

---

## Repository Structure

```
void-energy-premium/
├── packages/
│   ├── ambience/                  ← @dgrslabs/void-energy-ambience (FIRST PACKAGE)
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
│   ├── rive/                      ← @dgrslabs/void-energy-rive (SECOND — when Eric delivers)
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

### `@dgrslabs/void-energy-ambience` (First Package — DGRS Built)

Visual immersion layers: Blood, Snow, Rain, Fog. Each adapts to the active physics preset. Built for CoNexus storytelling but available as a premium package for anyone who wants atmospheric effects.

**Status:** Not yet started — Wave 3 (after CoNexus UI extraction).

**Realistic expectation:** Very niche use case. Most consumers won't need ambient overlays. But it's a tangible product in the premium tier from day one, and CoNexus uses it in production. Anyone who wants it can contact DGRS Labs.

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
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  }
}
```

---

### `@dgrslabs/void-energy-rive` (Second Package — Eric Jordan)

Eric's Rive interactive asset library. Glass-physics visual effects (glow overlays, crystalline transitions, particle systems).

**Status:** Pending Eric's delivery. Deal structure under discussion. Decoupled from wave timeline — ships whenever Eric is ready.

**Interface spec (PACKAGE.md):**
- Must export Svelte components that accept Void Energy physics context
- State machine inputs must respond to `data-physics` and `data-mode` attributes
- Must declare `void-energy` as peer dependency
- Must include README with visual examples
- Assets must respond to all 3 physics presets (glass/flat/retro)

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-rive",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte",
    "./assets/*": "./assets/*.riv"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0",
    "@rive-app/canvas": "^2.0.0"
  }
}
```

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
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "check": "npm run check --workspaces"
  },
  "devDependencies": {
    "void-energy": "^0.1.0",
    "svelte": "^5.0.0",
    "typescript": "^5.0.0",
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
        package: [ambience, rive]
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

### Step 3: Build Ambience Layers package
- Set up `packages/ambience/` with package.json and PACKAGE.md
- Implement BloodLayer, SnowLayer, RainLayer, FogLayer
- Physics adaptation for all 3 presets (glass/flat/retro)
- Performance testing (< 5ms per frame)

### Step 4: Create Rive package skeleton (when Eric delivers)
- Set up `packages/rive/` with package.json and PACKAGE.md
- Placeholder components ready for Eric's assets
- Document the integration points Eric needs to implement

### Step 5: Set up CI/CD
- Add GitHub Actions workflows
- Configure private npm publishing
- Test publish flow with dry-run

---

## Verification Checklist

- [ ] Workspace builds from clean clone
- [ ] Package template is documented and usable
- [ ] Rive package skeleton builds (even without assets)
- [ ] `void-energy` declared as peer dependency in all packages
- [ ] No package imports from another premium package (only from core)
- [ ] CI pipeline runs for all packages
- [ ] Private npm publish works (test with dry-run first)
- [ ] CONTRIBUTING.md explains how collaborators onboard
