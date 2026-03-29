# 04 — Premium Repo: `void-energy-premium`

> Private monorepo for all premium add-on packages, published under the `@dgrslabs` npm scope.

**Status:** Planning
**Depends on:** 01-atmosphere-split, 02-conexus-extraction, 03-public-repo
**Blocks:** 05-conexus-repo, 06-npm-distribution

---

## Goal

Create `github.com/dgrslabs/void-energy-premium` as a private monorepo that:
- Houses all premium packages as independent workspace members
- Each package extends the public `void-energy` core without modifying it
- Published under `@dgrslabs/*` to a private npm registry
- Includes a package template for onboarding future contributors (e.g., Eric Jordan)
- Enforces the dependency boundary: premium imports from core, never the reverse

---

## Repository Structure

```
void-energy-premium/
├── packages/
│   ├── kinetic-text/              ← @dgrslabs/void-energy-kinetic-text (v0.1.0, DONE)
│   │   ├── src/
│   │   │   ├── svelte/
│   │   │   │   └── KineticText.svelte
│   │   │   ├── core/
│   │   │   │   ├── layout/
│   │   │   │   ├── render/
│   │   │   │   ├── effects/
│   │   │   │   └── timeline/
│   │   │   ├── adapters/
│   │   │   │   └── void-energy-host.ts
│   │   │   ├── types.ts
│   │   │   ├── index.ts
│   │   │   └── styles/
│   │   │       └── kinetic-text.scss
│   │   ├── dist/
│   │   ├── package.json
│   │   ├── README.md
│   │   └── CHANGELOG.md
│   │
│   ├── atmospheres/               ← @dgrslabs/void-energy-atmospheres (NEW)
│   │   ├── src/
│   │   │   ├── themes/
│   │   │   │   ├── onyx.ts
│   │   │   │   ├── nebula.ts
│   │   │   │   ├── solar.ts
│   │   │   │   ├── overgrowth.ts
│   │   │   │   ├── velvet.ts
│   │   │   │   ├── crimson.ts
│   │   │   │   ├── laboratory.ts
│   │   │   │   ├── playground.ts
│   │   │   │   └── index.ts
│   │   │   ├── fonts/             ← Font files for premium themes
│   │   │   └── index.ts           ← registerPremiumAtmospheres()
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── conexus/                   ← @dgrslabs/void-energy-conexus (NEW)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Tile.svelte
│   │   │   │   ├── StoryCategory.svelte
│   │   │   │   ├── PortalLoader.svelte
│   │   │   │   ├── LoadingTextCycler.svelte
│   │   │   │   ├── StoryFeed.svelte
│   │   │   │   ├── PortalLoaderDemo.svelte
│   │   │   │   └── ReorderShowcase.svelte
│   │   │   ├── styles/
│   │   │   │   └── _tiles.scss
│   │   │   ├── types/
│   │   │   │   ├── story.ts
│   │   │   │   └── story-engine.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── rive/                      ← @dgrslabs/void-energy-rive (FUTURE)
│   │   ├── assets/                ← .riv files from Eric Jordan
│   │   ├── src/
│   │   │   ├── RiveOverlay.svelte
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── README.md
│   │   └── PACKAGE.md             ← Interface spec
│   │
│   ├── ambience/                  ← @dgrslabs/void-energy-ambience (FUTURE)
│   │   ├── src/
│   │   │   ├── layers/
│   │   │   │   ├── BloodLayer.svelte
│   │   │   │   ├── SnowLayer.svelte
│   │   │   │   ├── RainLayer.svelte
│   │   │   │   └── FogLayer.svelte
│   │   │   ├── styles/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── components-pro/            ← FUTURE: advanced composites if needed
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

### `@dgrslabs/void-energy-kinetic-text` (DONE — v0.1.0)

Already built in the current monorepo at `packages/kinetic-text/`. Move as-is.

**Exports:**
- `.` — Main entry (KineticText engine)
- `./component` — KineticText.svelte
- `./types` — Type definitions
- `./adapters/void-energy-host` — Void Energy integration adapter
- `./styles` — kinetic-text.css

**Peer deps:** `svelte ^5.0.0`
**Dependencies:** `@chenglou/pretext ^0.0.3`

---

### `@dgrslabs/void-energy-atmospheres` (NEW)

Provides the 8 premium atmospheres as runtime-registrable theme definitions.

**Key export:**
```typescript
import { registerPremiumAtmospheres } from '@dgrslabs/void-energy-atmospheres';
import { voidEngine } from 'void-energy/engine';

registerPremiumAtmospheres(voidEngine);
// All 12 atmospheres now available
```

**Includes:**
- 8 theme definitions (full palette, physics, mode, font mapping)
- Font files for premium-specific fonts (Mystic, Arcane, Nature, Hand, Horror, Fun, Lab)
- SCSS variables (optional — for consumers who want build-time theme availability)

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-atmospheres",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./themes/*": "./src/themes/*.ts",
    "./fonts/*": "./src/fonts/*"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0"
  }
}
```

---

### `@dgrslabs/void-energy-conexus` (NEW)

CoNexus-specific UI components extracted from the monorepo.

**Components:** Tile, StoryCategory, PortalLoader, LoadingTextCycler, StoryFeed, PortalLoaderDemo, ReorderShowcase

**Includes:** `_tiles.scss`, story types

**Package.json:**
```json
{
  "name": "@dgrslabs/void-energy-conexus",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte",
    "./styles/*": "./src/styles/*",
    "./types": "./src/types/index.ts"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  }
}
```

---

### `@dgrslabs/void-energy-rive` (FUTURE — Eric Jordan)

Eric's Rive interactive asset library. Glass-physics visual effects (glow overlays, crystalline transitions, particle systems).

**Status:** Pending Eric's delivery. See [project_eric_deal.md](../memory/project_eric_deal.md) for scope.

**Interface spec (PACKAGE.md):**
- Must export Svelte components that accept Void Energy physics context
- State machine inputs must respond to `data-physics` and `data-mode` attributes
- Must declare `void-energy` as peer dependency
- Must include README with visual examples

---

### `@dgrslabs/void-energy-ambience` (FUTURE)

Visual ambient layers for story immersion. Planned effects:
- **BloodLayer** — dripping/pooling effect for horror atmospheres
- **SnowLayer** — falling snow particles
- **RainLayer** — rain with wind direction
- **FogLayer** — volumetric fog overlay

**Design constraints:**
- Each layer is a positioned overlay (`position: fixed` or `absolute`)
- Must respect physics presets (glass = blur + glow, flat = subtle, retro = pixel)
- Must be performant (CSS animations or requestAnimationFrame, not heavy JS)
- Must be toggleable and composable (multiple layers at once)

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
    "check": "npm run check --workspaces",
    "lint": "npm run lint --workspaces"
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
# Option A: GitHub Packages
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Option B: Verdaccio (self-hosted)
# @dgrslabs:registry=https://npm.yourdomain.com
# //npm.yourdomain.com/:_authToken=${VERDACCIO_TOKEN}
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
        package: [kinetic-text, atmospheres, conexus]
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
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          registry-url: 'https://npm.pkg.github.com'
      - run: npm ci
      # Publish only changed packages (use changesets or manual)
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

### Step 3: Move kinetic-text
- Copy `packages/kinetic-text/` from monorepo
- Update imports if any reference monorepo paths
- Verify it builds independently

### Step 4: Create atmospheres package
- Extract 8 premium theme definitions from `design-tokens.ts`
- Create individual theme files
- Bundle premium fonts
- Create `registerPremiumAtmospheres()` function
- Write README with usage examples

### Step 5: Create conexus package
- Follow 02-conexus-extraction plan
- Move extracted components here
- Update all imports to reference `void-energy` peer dependency
- Verify builds

### Step 6: Set up CI/CD
- Add GitHub Actions workflows
- Configure private npm publishing
- Test publish flow

---

## Verification Checklist

- [ ] All packages build independently
- [ ] All packages declare `void-energy` as peer dependency
- [ ] No package imports from another premium package (only from core)
- [ ] `npm run check` passes in each package
- [ ] `npm run test` passes in each package
- [ ] Kinetic-text works as before after migration
- [ ] Premium atmospheres register correctly via the registration function
- [ ] CoNexus components render when imported from the package
- [ ] CI pipeline runs for all packages
- [ ] Private npm publish works (test with dry-run first)
- [ ] Package template is documented and usable
