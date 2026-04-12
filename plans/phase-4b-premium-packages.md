# Phase 4b — Premium Packages Repo

> Create the private `dgrslabs/void-energy-premium` monorepo and populate it with the four premium packages: Kinetic Text, DGRS, Ambient, and Rive.

**Status:** Planning — blocked on Phase 3 completion
**Priority:** Phase 4 (parallel to public monorepo restructure)
**Depends on:** Phase 1 (L0 shipped), Phase 2 (TTS sync landed in KT), Phase 3 (AI Automation Foundation landed), Phase 4a public monorepo (for `void-energy` as a dependency). Ambient Layers is already complete and ships in its current location.
**Blocks:** Phase 6 (CoNexus imports premium from this repo)
**Related:** [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md)

---

## Goal

Create a single private monorepo at `github.com/dgrslabs/void-energy-premium` that houses all four premium packages, follows the same Pattern A layout as the public repo, and publishes to GitHub Packages under the `@dgrslabs` scope.

After Phase 4b:
- Four premium packages are published and installable
- Each package can be flipped public independently via `publishConfig`
- The public showcase site demonstrates all four (installed as regular dependencies)
- CoNexus can import any of them in Phase 6 as a normal consumer

---

## Why a monorepo for premium

Same reasoning as the public repo: [decisions.md §D6](decisions.md#d6--premium-repo-uses-the-same-pattern-a). All four premium packages share tooling (token bridging to `void-energy`, type generation, SCSS build, test setup). Keeping them in one repo means one version cadence, one CI, one place to develop all premium features.

**Why NOT a single "void-energy-premium" package:** each premium feature has different consumers. A studio might license only Kinetic Text. CoNexus uses DGRS + Ambient + KT. A customer might want only Rive. Keeping them separate packages means each consumer installs what they need, nothing more.

---

## Repository layout

```
github.com/dgrslabs/void-energy-premium         PRIVATE
│
├── package.json                                  ← root, declares workspaces
├── pnpm-workspace.yaml (or npm workspaces)
├── tsconfig.base.json
├── README.md                                     ← private docs only
├── CLAUDE.md                                     ← root AI context
├── .claude/
│
└── packages/
    │
    ├── kinetic-text/                             @dgrslabs/void-energy-kinetic-text
    │   ├── package.json
    │   ├── src/
    │   │   ├── engine/                           advanced kinetic engine
    │   │   ├── pretexts/                         pretext effects
    │   │   ├── orchestration/                    narrative sequencing
    │   │   └── index.ts
    │   ├── scripts/
    │   └── tests/
    │
    ├── dgrs/                                     @dgrslabs/void-energy-dgrs
    │   ├── package.json
    │   ├── src/
    │   │   ├── atmospheres/                      12 DGRS atmospheres
    │   │   │   ├── crimson.ts
    │   │   │   ├── glacier.ts
    │   │   │   └── ...
    │   │   ├── components/                       DGRS-specific UI (Tile, StoryFeed, PortalLoader)
    │   │   └── index.ts
    │   ├── scripts/
    │   └── tests/
    │
    ├── ambient/                                 @dgrslabs/void-energy-ambient-layers
    │   ├── package.json
    │   ├── src/                                  ← lifted from current monorepo's packages/ambient-layers/
    │   │   ├── components/
    │   │   │   ├── BloodLayer.svelte
    │   │   │   ├── SnowLayer.svelte
    │   │   │   ├── RainLayer.svelte
    │   │   │   └── FogLayer.svelte
    │   │   ├── lib/
    │   │   ├── types/
    │   │   └── index.ts
    │   ├── scripts/
    │   └── tests/
    │
    └── rive/                                     @dgrslabs/void-energy-rive
        ├── package.json
        ├── src/
        │   ├── components/                       animated CTA button components
        │   ├── state-machines/                   Rive state machine bindings
        │   └── index.ts
        ├── assets/                               .riv source files (Eric Jordan)
        └── tests/
```

Each package is fully independent with its own `package.json`, own version, own build, own tests. They share dev tooling via the root workspace.

---

## Dependency direction

All four premium packages depend on `void-energy` from **public npm**, not from a sibling workspace. This is intentional:

```json
{
  "name": "@dgrslabs/void-energy-kinetic-text",
  "peerDependencies": {
    "void-energy": "^0.1.0",
    "svelte": "^5.0.0"
  }
}
```

**Why peer dependency and not regular dependency:** prevents duplicate copies of `void-energy` in the consumer's `node_modules`. The consumer installs `void-energy` once; all premium packages share that one instance.

**Why from public npm and not workspace:** the private repo is a separate git repo from the public repo. It has no workspace link to `void-energy`. It installs it like any external consumer would — which is the right pressure to keep the public API honest. If a premium package needs something that's not exported by `void-energy`, we either export it publicly or find another way.

### Dependency graph

```
┌──────────────────────────────────────────┐
│  @dgrslabs/void-energy-kinetic-text       │──┐
│  @dgrslabs/void-energy-dgrs               │──┤
│  @dgrslabs/void-energy-ambient-layers            │──┼──► void-energy (public npm)
│  @dgrslabs/void-energy-rive                │──┘
└──────────────────────────────────────────┘
```

**Packages do NOT depend on each other.** DGRS does not import from KT. Ambient does not import from Rive. If a consumer wants two of them, they install both; each works independently. This prevents the "tangled premium package graph" that kills modularity.

---

## The four packages

### 1. Kinetic Text (`@dgrslabs/void-energy-kinetic-text`)

**Status:** v0.1.0 already built in the current monorepo under `packages/kinetic-text/`.

**Scope:** advanced kinetic text engine with pretext effects, narrative orchestration, multi-stage reveals, character-level animation control.

**What stays in the public `void-energy` package:** the basic `kinetic` action + `_kinetic.scss` + types for simple text reveal. See [decisions.md §D11](decisions.md#d11--kinetic-text-base-reveal-stays-free-full-engine-is-premium).

**Phase 4b work:** lift the existing `packages/kinetic-text/` from the current monorepo into `packages/kinetic-text/` of the premium repo. Update imports from relative paths to `void-energy` public imports. Publish.

### 2. DGRS (`@dgrslabs/void-energy-dgrs`)

**Status:** staging in the current monorepo.

**Scope:** 12 DGRS Labs atmospheres (private, non-free themes) + DGRS-specific UI components (Tile, StoryCategory, PortalLoader, LoadingTextCycler, StoryFeed) that are shared across all DGRS Labs apps (CoNexus and future apps).

**Why it's a package and not just part of CoNexus:** multiple DGRS Labs apps will share these components. Putting them in CoNexus would force duplication when the next app ships. This package is the shared DGRS UI kit.

**What's in the 12 atmospheres:** the full atmosphere set that currently lives in the monorepo as "private" themes. Extract them, package them, ship them.

**Phase 4b work:** extract DGRS-specific components and atmosphere definitions from the current monorepo into this package. Wire up the atmosphere registration so consumers call `registerDGRSAtmospheres()` at boot.

### 3. Ambient (`@dgrslabs/void-energy-ambient-layers`)

**Status:** Complete. Already exists in the current monorepo as `packages/ambient-layers/`.

**Scope:** Blood, Snow, Rain, Fog visual overlay layers with multiple intensity/variant effects per category.

**Phase 4b work:** lift the existing `packages/ambient-layers/` from the current monorepo into `packages/ambient/src/` of the premium repo. Because Ambient was built in isolation (no cross-imports from other feature modules), this is a clean move. Update the SCSS imports from `@use '../abstracts' as *` to `@use 'void-energy/styles/abstracts' as *`. Publish.

### 4. Rive (`@dgrslabs/void-energy-rive`)

**Status:** planning only — Dima prototypes, Eric Jordan polishes.

**Scope:** Rive animation bindings for Void Energy — specifically animated CTA buttons (pivoted from glass effects, which are now handled by Liquid Glass). Eric Jordan builds the `.riv` assets; DGRS owns distribution.

**Phase 4b work:** create the package scaffold with a placeholder component and a clear README explaining the package is under active development. Do NOT try to ship Rive in Phase 4b if it's not ready — the Eric Jordan partnership timeline is decoupled from the main phases. Shipping the scaffold means the package name is reserved and CoNexus can import from it as soon as it has content.

---

## Root `package.json` for premium repo

```json
{
  "name": "void-energy-premium-monorepo",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces --if-present",
    "check": "npm run check --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "publish:all": "npm publish --workspaces --access restricted"
  },
  "devDependencies": {
    "void-energy": "^0.1.0"
  }
}
```

Installing `void-energy` at the root lets all premium packages share one copy during local development. Each package still declares it as a peer dependency so downstream consumers get the correct resolution.

---

## Publishing to GitHub Packages

GitHub Packages is the private npm registry for the `@dgrslabs` scope. To publish:

### One-time setup

```bash
# In each package's package.json:
{
  "name": "@dgrslabs/void-energy-ambient-layers",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "access": "restricted"
  }
}
```

### Consumer authentication

Consumers need a GitHub personal access token with `read:packages` scope. They configure their `.npmrc`:

```
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxxxxxx
```

Then `npm install @dgrslabs/void-energy-ambient-layers` works like any other package.

**Who gets tokens:** DGRS Labs team members, licensed customers (once we start selling). Distribution is manual — we issue tokens to people who pay or partner.

### Publishing workflow

```bash
cd packages/ambient
npm version patch   # or minor/major
npm publish
```

No GitHub Actions — see [decisions.md §D13](decisions.md#d13--no-cicd-workflows-in-the-starter-template). Manual `npm publish` from the developer's machine. If volume grows, revisit CI later.

### Selective publishing

Because each package has its own `publishConfig`, flipping one public (to npmjs.org) is a single field change:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org",
    "access": "public"
  }
}
```

Change, commit, `npm publish`. Done. This enables scenarios like "open-source Rive for the Eric Jordan partnership while keeping KT and DGRS private" without repo surgery. See [decisions.md §D17](decisions.md#d17--selective-publishing-via-publishconfig).

---

## Showcase integration

The public `apps/showcase/` site demonstrates all four premium packages. It installs them as regular dependencies from GitHub Packages:

```json
// apps/showcase/package.json in the PUBLIC repo
{
  "dependencies": {
    "void-energy": "workspace:*",
    "@dgrslabs/void-energy-kinetic-text": "^0.1.0",
    "@dgrslabs/void-energy-dgrs": "^0.1.0",
    "@dgrslabs/void-energy-ambient-layers": "^0.1.0",
    "@dgrslabs/void-energy-rive": "^0.1.0"
  }
}
```

The public repo's `.npmrc` (not committed) authenticates to GitHub Packages so Vercel's build can fetch them. The `GITHUB_TOKEN` secret is set in Vercel environment variables.

**This means the public repo's showcase depends on private packages.** That's fine: the showcase is for viewing, not for forking. External users who `git clone` the public repo won't have access to the premium packages and the showcase workspace will fail to install — but `packages/void-energy/` and `apps/starter-template/` will install fine because they don't depend on premium. External users get the library and the starter, not the showcase.

**Document this clearly in the public README:** "Building the showcase requires DGRS Labs credentials. The library and starter template work for everyone."

---

## Implementation order

1. **Create the private repo:** `gh repo create dgrslabs/void-energy-premium --private`
2. **Scaffold the workspace structure:** root `package.json`, `packages/` folders, shared tooling
3. **Migrate Kinetic Text first** — it already exists, move is mostly mechanical
4. **Migrate DGRS second** — extract 12 atmospheres + UI components from the current monorepo
5. **Migrate Ambient third** — lift from `packages/ambient-layers/` (already complete and in its package structure)
6. **Scaffold Rive fourth** — placeholder package, reserve the name
7. **Verify each package builds and publishes to GitHub Packages** (one at a time)
8. **Wire up the public showcase** to install from the new packages
9. **Verify the showcase deploys to Vercel with the private packages** (GitHub token in env)
10. **Remove the premium packages from the current monorepo** — they now live only in the premium repo

---

## Verification checklist

- [ ] Private repo created at `github.com/dgrslabs/void-energy-premium`
- [ ] Root workspace structure in place
- [ ] Kinetic Text migrated, builds, publishes to GitHub Packages
- [ ] DGRS migrated, builds, publishes to GitHub Packages
- [ ] Ambient migrated, builds, publishes to GitHub Packages
- [ ] Rive scaffold created, name reserved, empty package published
- [ ] Each package declares `void-energy` as a peer dependency
- [ ] No premium package imports from another premium package
- [ ] Each package has its own `publishConfig` pointing to GitHub Packages
- [ ] A developer with a GitHub token can `npm install @dgrslabs/void-energy-ambient-layers` from a fresh directory
- [ ] The public `apps/showcase/` installs all four premium packages successfully
- [ ] The public showcase demonstrates all four premium packages working
- [ ] The public showcase deploys to Vercel with the GitHub token in env
- [ ] Premium packages are removed from the current monorepo (no duplicate source of truth)
- [ ] `packages/void-energy/` in the public repo still installs cleanly without any premium packages (independence verified)

---

## Out of scope for Phase 4b

- **Publishing the Rive package with real content** — Eric Jordan's partnership timeline is decoupled. Phase 4b only reserves the package name.
- **Verdaccio or other registries** — GitHub Packages is sufficient. Revisit if it becomes a bottleneck.
- **Automated publishing via CI** — manual `npm publish` is fine for the current team size.
- **License key system or DRM** — trust-based distribution via token provisioning is enough for now. Formalize later if needed.
- **Selling the premium packages** — no commerce work in Phase 4b. Collect contacts, ship code, handle deals case-by-case.
