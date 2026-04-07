# Phase 2 — Public Monorepo Structure

> Restructure Void Energy into its production home: a public monorepo following Pattern A, producing two npm packages, housing the showcase site, and providing the starter template.

**Status:** Planning — blocked on Phase 1 completion
**Priority:** Phase 2 (after Ambient Layers ship)
**Depends on:** Phase 1 (Ambient Layers complete and self-contained)
**Blocks:** Phase 3 (CoNexus migration)
**Related:** [phase-2-premium-packages.md](phase-2-premium-packages.md), [phase-2-ai-automation.md](phase-2-ai-automation.md)

---

## Goal

Transform the current two-repo situation (`void-energy-ui` monorepo + standalone `void-energy-starter`) into a single public monorepo at `github.com/dgrslabs/void-energy` that:

- Houses the `void-energy` library as a workspace package
- Houses the `create-void-energy` scaffolder as a workspace package
- Houses the `apps/showcase` site (current `void.dgrslabs.ink`) as a workspace app
- Houses the `apps/starter-template` as a workspace app that doubles as the scaffolder's payload
- Publishes `void-energy` and `create-void-energy` to npmjs.org
- Deploys `apps/showcase` to Vercel
- Retires the standalone `void-energy-starter` repo on Desktop

After Phase 2, there is **one public repo** and **two npm packages**, with the showcase and starter template both living inside the monorepo and always running against the local working copy of the library.

---

## Why this structure

See [decisions.md §D2](decisions.md#d2--monorepo-pattern-pattern-a-packages--apps) for the full reasoning. In short: Pattern A (packages + apps with workspaces) is used by Radix, shadcn, TanStack, Svelte, Astro, and Tailwind. It eliminates the drift and friction of multi-repo or staging-vs-prod setups. One repo, one history, atomic changes.

---

## `npm install` vs `npm create` — the mechanics

These are two different things that share the word "npm":

### `npm install void-energy` — adds a library to an existing project

```bash
cd my-existing-project
npm install void-energy
```

What happens: npm downloads the `void-energy` package into `node_modules/void-energy/`. The consumer then imports from it:

```ts
import { Button } from 'void-energy/components/Button';
import { voidEngine } from 'void-energy/engine';
```

The package is a **library** — it lives inside `node_modules`, the consumer imports pieces of it. They never see its source, never edit it. This is how CoNexus will use it.

**Audience:** existing projects adding components.

### `npm create void-energy@latest my-app` — generates a new project on disk

```bash
cd ~/Desktop
npm create void-energy@latest my-new-app
```

What happens: npm downloads a **different package** called `create-void-energy` (the `create-` prefix is npm convention), runs its executable, which **copies a whole project template onto the user's disk** as a regular directory. The user then `cd my-new-app && npm install` and has a fully working project they own and can edit freely.

This is how `npm create vite@latest`, `npm create astro@latest`, `npm create svelte@latest` all work.

**Audience:** new projects starting from zero.

### Why both are needed

One package cannot serve both audiences without compromise. An existing project that runs `npm install` doesn't want a whole scaffold dropped into their codebase. A new project that runs `npm create` doesn't want to manually wire up every file from a library. The solution is two packages, both published from the same monorepo.

---

## Target repository layout

```
github.com/dgrslabs/void-energy                PUBLIC (BSL 1.1)
│
├── package.json                                ← root, declares workspaces
├── pnpm-workspace.yaml (or npm workspaces)
├── tsconfig.base.json
├── LICENSE
├── README.md                                   ← repo landing page
├── CLAUDE.md                                   ← root AI context (shared rules)
├── .claude/                                    ← shared AI infrastructure
│   ├── rules/
│   ├── agents/
│   ├── commands/
│   ├── skills/
│   └── settings.json
│
├── packages/
│   │
│   ├── void-energy/                            ← THE LIBRARY (published to npm)
│   │   ├── package.json                          { "name": "void-energy" }
│   │   ├── CLAUDE.md                             system-level rules
│   │   ├── CHEAT-SHEET.md                        component + action catalog
│   │   ├── src/
│   │   │   ├── actions/                          morph, tooltip, navlink, kinetic, narrative, drag
│   │   │   ├── adapters/                         VoidEngine
│   │   │   ├── components/
│   │   │   │   ├── core/                         AtmosphereScope, ThemeScript
│   │   │   │   ├── ui/                           37+ UI primitives
│   │   │   │   ├── icons/                        interactive animated SVG icons
│   │   │   │   └── modals/                       modal fragments
│   │   │   ├── config/
│   │   │   │   ├── component-registry.json      ← SSOT for AI and consumers
│   │   │   │   ├── design-tokens.ts
│   │   │   │   ├── modal-registry.ts
│   │   │   │   ├── font-registry.ts
│   │   │   │   └── constants.ts
│   │   │   ├── lib/                              modal manager, layer stack, transitions, etc.
│   │   │   ├── service/                          AI integration
│   │   │   ├── stores/                           toast, user
│   │   │   ├── styles/                           SCSS engine + components + themes
│   │   │   └── types/
│   │   ├── scripts/                              token build, registry check, scan
│   │   └── tests/
│   │
│   └── create-void-energy/                     ← THE SCAFFOLDER (published to npm)
│       ├── package.json                          { "name": "create-void-energy", "bin": "./index.js" }
│       ├── index.js                              tiny CLI: copies apps/starter-template/
│       └── README.md                             "how to scaffold"
│
└── apps/
    │
    ├── showcase/                               ← void.dgrslabs.ink (deployed)
    │   ├── package.json                          { "dependencies": { "void-energy": "workspace:*" } }
    │   ├── CLAUDE.md                             consumer-level rules
    │   ├── astro.config.mjs
    │   ├── src/
    │   │   ├── pages/
    │   │   │   ├── index.astro                   landing
    │   │   │   ├── components.astro              component showcase
    │   │   │   ├── themes.astro                  atmosphere gallery
    │   │   │   └── api/                          AI generator endpoint
    │   │   ├── components/                       showcase-specific components
    │   │   └── layouts/
    │   └── public/
    │
    └── starter-template/                       ← payload for create-void-energy
        ├── package.json                          { "dependencies": { "void-energy": "^0.x.0" } }
        ├── CLAUDE.md                             self-contained AI context
        ├── .claude/                              self-contained AI rules
        ├── AI-PLAYBOOK.md                        consumer-tailored
        ├── COMPOSITION-RECIPES.md                consumer-tailored
        ├── astro.config.mjs
        ├── tailwind.config.mjs
        ├── svelte.config.js
        ├── tsconfig.json
        └── src/
            ├── pages/
            │   └── index.astro                   blank hello-world page
            ├── layouts/
            └── styles/
                └── global.scss                   imports void-energy/styles
```

---

## What each workspace does

### `packages/void-energy/` — the library

**The crown jewel.** Contains every component, style, token, action, and utility. This is what gets published to npmjs.org as the `void-energy` package. Consumers who `npm install void-energy` download this.

**Key rules:**
- No pages, no astro config, no routes. Pure library code.
- Every public API is exported from `src/index.ts` and the sub-path exports in `package.json`.
- `component-registry.json` lives here and ships with the published package.
- Has its own `scripts/` for token generation and registry checks.

### `packages/create-void-energy/` — the scaffolder

A **tiny CLI package** (~50–100 lines) whose only job is to copy `apps/starter-template/` to a user-specified target directory. Published as `create-void-energy` so that `npm create void-energy@latest my-app` invokes it.

**How it finds the template:**
- At build time, a script copies `apps/starter-template/` into `packages/create-void-energy/template/`
- The published package includes this `template/` directory in its tarball
- At runtime, the CLI reads from its bundled `template/` and writes to the user's target directory
- Placeholder substitution: replace `"void-energy": "workspace:*"` in the template's `package.json` with the latest published version

**Alternative approach (simpler):** instead of bundling, use `giget` or `degit` to fetch `apps/starter-template/` from GitHub at runtime. Cleaner, smaller package, requires network. Decide at implementation time based on reliability preference.

### `apps/showcase/` — the public showcase site

**The existing `void.dgrslabs.ink`** reorganized as a workspace app. Imports `void-energy` via `workspace:*` which means "always use the sibling package in `packages/void-energy/`." Editing a component in the library instantly updates the showcase — no publish step needed for local dev.

**Key rules:**
- Consumer-side code only. Does NOT edit `packages/void-energy/`.
- For premium demos (KT, DGRS, Ambient, Rive), installs the premium packages from GitHub Packages as regular dependencies.
- Deploys to Vercel from the monorepo root. Vercel auto-detects workspaces.

### `apps/starter-template/` — the scaffold payload

**What becomes the new user's project.** Stripped-down hello world with:
- One blank `index.astro` page showing a "welcome to your Void Energy project" message
- `void-energy` as a dependency (imports styles + core)
- A self-contained `CLAUDE.md` + `.claude/` for the consumer's own AI automation
- Tailored `AI-PLAYBOOK.md` and `COMPOSITION-RECIPES.md` for app-building (not system-building)
- Zero GitHub workflows (see [decisions.md §D12](decisions.md#d12--no-cicd-workflows-in-the-starter-template))
- No pre-built showcase pages, no component demos — this is the blank canvas

**Why this matters for AI automation:** when a user runs `npm create void-energy@latest my-app` and opens it in Claude Code, the AI immediately reads the template's `CLAUDE.md` and starts composing pages using the installed `void-energy` package. The template is optimized for AI-driven app construction on a blank canvas. See [phase-2-ai-automation.md](phase-2-ai-automation.md).

**Dev mode:** the starter template runs as a regular workspace (`npm run dev` from `apps/starter-template/`), using `workspace:*` to link the library. This lets us dev-test the template alongside the library.

---

## Workspace setup

### Root `package.json`

```json
{
  "name": "void-energy-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspace=apps/showcase",
    "dev:starter": "npm run dev --workspace=apps/starter-template",
    "build:lib": "npm run build --workspace=packages/void-energy",
    "build:showcase": "npm run build --workspace=apps/showcase",
    "check": "npm run check --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}
```

### `packages/void-energy/package.json`

```json
{
  "name": "void-energy",
  "version": "0.1.0",
  "license": "BUSL-1.1",
  "type": "module",
  "description": "Enterprise design system for Svelte 5 + Astro",
  "repository": "github:dgrslabs/void-energy",
  "homepage": "https://void.dgrslabs.ink",
  "keywords": ["svelte", "astro", "design-system", "ui", "components"],
  "files": [
    "src",
    "scripts",
    "CHEAT-SHEET.md",
    "README.md",
    "LICENSE"
  ],
  "exports": {
    ".": "./src/index.ts",
    "./engine": "./src/adapters/void-engine.svelte.ts",
    "./tokens": "./src/config/design-tokens.ts",
    "./components/*": "./src/components/ui/*.svelte",
    "./icons/*": "./src/components/icons/*.svelte",
    "./core/*": "./src/components/core/*.svelte",
    "./modals/*": "./src/components/modals/*.svelte",
    "./actions/*": "./src/actions/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./stores/*": "./src/stores/*.ts",
    "./config/*": "./src/config/*",
    "./styles": "./src/styles/global.scss",
    "./styles/*": "./src/styles/*"
  },
  "peerDependencies": {
    "svelte": "^5.0.0",
    "astro": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "astro": { "optional": true }
  }
}
```

The `files` field controls what ends up in the npm tarball. `scripts/`, `src/`, and docs go in. Tests, configs, node_modules stay out.

### `apps/showcase/package.json`

```json
{
  "name": "@void-energy-monorepo/showcase",
  "private": true,
  "dependencies": {
    "void-energy": "workspace:*",
    "@dgrslabs/void-energy-kinetic-text": "...",
    "@dgrslabs/void-energy-dgrs": "...",
    "@dgrslabs/void-energy-ambient-layers": "...",
    "@dgrslabs/void-energy-rive": "..."
  }
}
```

`workspace:*` is the magic. During local dev, npm resolves `void-energy` to the sibling `packages/void-energy/` directory. Every change to the library is reflected in the showcase instantly.

### `apps/starter-template/package.json`

```json
{
  "name": "@void-energy-monorepo/starter-template",
  "private": true,
  "dependencies": {
    "void-energy": "workspace:*"
  }
}
```

When the scaffolder copies this template to a user's machine, it rewrites `"void-energy": "workspace:*"` to `"void-energy": "^0.1.0"` (the current published version) so the user's new project installs from npm, not from a nonexistent workspace.

---

## Migration from current state

The current state is:
- `void-energy-ui/` — monorepo (this repo), has all the library code mixed with pages
- `void-energy-starter/` — standalone repo on Desktop with a cleaned-up library-like version

The migration path:

1. **Start in a new clone** of `void-energy-ui`. Work in a branch.
2. **Create the workspace structure:**
   ```
   packages/void-energy/
   packages/create-void-energy/
   apps/showcase/
   apps/starter-template/
   ```
3. **Move the library** — everything in `src/` that is library code (`components/ui`, `components/core`, `components/icons`, `components/modals`, `actions`, `adapters`, `lib`, `stores`, `styles`, `types`, `config`, `service/ai`) moves into `packages/void-energy/src/`. Also move `scripts/`, `tests/`.
4. **Move the pages** — everything in `src/pages/`, `src/layouts/`, app-level components, moves into `apps/showcase/src/`.
5. **Create the starter template** — start by copying `void-energy-starter/` into `apps/starter-template/`, then strip it down to a hello world (remove most pages, keep only the blank index).
6. **Create the scaffolder** — write `packages/create-void-energy/index.js` as a minimal CLI.
7. **Wire up workspaces** — root `package.json` with `workspaces` field.
8. **Fix imports** — update path aliases so the library uses relative or workspace imports, and the apps import from `void-energy` (not from relative paths).
9. **Verify** — `npm install` at root, then `npm run dev` in showcase, `npm run dev:starter` in starter, `npm run build:lib`, `npm run check`, `npm run test`. Everything passes.
10. **Retire old repos** — delete `void-energy-starter/` on Desktop. The current `void-energy-ui/` repo becomes the new monorepo (or create a fresh `void-energy/` repo and push the restructured content there).
11. **Publish** — `cd packages/void-energy && npm publish` and `cd packages/create-void-energy && npm publish`.
12. **Update Vercel** — point the existing `void.dgrslabs.ink` deployment at the new repo's `apps/showcase/` workspace.

---

## Verification checklist

- [ ] `npm install` at monorepo root installs all workspaces
- [ ] `npm run dev` from `apps/showcase/` runs the showcase site against local library
- [ ] Editing a component in `packages/void-energy/` instantly reflects in the running showcase
- [ ] `npm run dev` from `apps/starter-template/` runs the blank starter against local library
- [ ] `npm run build:lib` produces a valid library package
- [ ] `npm pack --workspace=packages/void-energy` produces a tarball with only the files listed in `files`
- [ ] Tarball includes `component-registry.json`, `CHEAT-SHEET.md`, `LICENSE`
- [ ] Tarball excludes `node_modules`, `tests`, `.claude`
- [ ] `npm run check` passes across all workspaces
- [ ] `npm run test` passes across all workspaces
- [ ] `npm publish --dry-run` from `packages/void-energy/` shows the correct file set
- [ ] Showcase deploys to Vercel successfully from the new monorepo
- [ ] A fresh directory can `npm install void-energy` and import `Button` without errors
- [ ] A fresh directory can `npm create void-energy@latest test-app` and the scaffolded app runs
- [ ] The scaffolded app's `package.json` has `"void-energy": "^0.1.0"` (not `workspace:*`)
- [ ] The old `void-energy-starter` repo is deleted

---

## Out of scope for Phase 2

- **CoNexus migration** — that's Phase 3. Do not touch CoNexus code during Phase 2.
- **Premium package development** — the premium repo and its packages are covered in [phase-2-premium-packages.md](phase-2-premium-packages.md). They are a parallel workstream.
- **New features in the library** — Phase 2 is pure plumbing. No new components, no new physics, no new actions. If something feels missing, note it and defer.
- **Docs site beyond the current showcase** — the current `/components` and `/themes` pages are enough. A dedicated docs site can come later.
