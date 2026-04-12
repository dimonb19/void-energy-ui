# Void Energy — Plans

> The complete launch and architecture plan for Void Energy, organized by priority.
> Last updated: 2026-04-11 (Phase 0 + 0a complete; Phase 1 revised post-migration)

---

## The Product

**Void Energy** is an enterprise design system built on Svelte 5, Astro, and hybrid SCSS/Tailwind. 3 physics presets (glass, flat, retro), 2 color modes, semantic tokens, runtime theme switching, AI atmosphere generation, 40+ components.

**CoNexus** is the flagship app — an AI-powered interactive storytelling platform. It is the core business priority and the best proof of what Void Energy can do.

---

## The Layer Architecture

Void Energy's value has three distinct layers that can be adopted independently:

**L0 — The Design System Brain** (`@void-energy/tailwind`)
Framework-agnostic Tailwind CSS v4 preset. Atmosphere switching, physics presets, density scaling, semantic tokens. Works with React, Vue, vanilla HTML — anything that uses Tailwind. This is the adoption unlock: VE sits *underneath* component libraries instead of competing with them. "shadcn + VE" instead of "shadcn vs VE."

**L1 — The Component Library** (`void-energy`)
40+ Svelte 5 components that implement L0's token decisions with TypeScript constraint enforcement, scoped CSS, native transitions, and slot composition. This is the actual product — where "perfect on first shot" lives.

**L2 — The AI Pipeline** (CLAUDE.md + registry + recipes)
The context system that turns L1 from "a good component library" into "an automated frontend engine." L2 only works on top of L1's constraint enforcement — without it, the recipes are just suggestions the AI can ignore. This is the moat.

---

## Strategic Principle

> Open what builds community. Close what builds moat.

The UI/UX premium feel is our only differentiator right now — no userbase, no content library, no network effects yet. L0 is the community builder (framework-agnostic, free). L1 + L2 is the moat (Svelte-only, premium experience). Guard the premium packages until CoNexus has traction.

**Precedents:** Figma (open plugin API, closed rendering engine), Linear (internal motion system), Vercel (open Next.js, closed infra), Tailwind (open framework, closed UI kit).

---

## Phases (in order)

Work is organized into five phases. **Each phase ships before the next begins.** No split focus.

### Phase 0 — Tailwind CSS v4 Migration ✓ COMPLETE
The existing codebase migrated from Tailwind v3.4 to v4 with a `@theme`-based CSS config. Phase 0a follow-up patched the v4 footguns surfaced after the swap (bare `border` family hardcoded 1px, bare `rounded` no longer driven by `--radius-*`, `min-h-control` namespace mismatch, `.container` shadowed by Tailwind's built-in, `--max-width > --spacing > --container` fallback chain). Both phases are landed; the canonical reference for v4 namespace strategy and footgun fixes lives in [src/styles/tailwind-theme.css](../src/styles/tailwind-theme.css). Phase 1 absorbs these learnings.

### Phase 1 — L0: Framework-Agnostic Tailwind Preset
**Why first remaining:** This is the adoption unlock. VE is currently Svelte-only (~3% of frontend devs). Extracting the design system brain as a Tailwind v4 preset makes every Tailwind user a potential VE user. Low effort (the token system already exists), high reach (millions of Tailwind users across every framework).

**Deliverable:** `@void-energy/tailwind` — a Tailwind CSS v4 preset with atmosphere switching, physics presets, density scaling, semantic tokens, and a tiny vanilla JS runtime. Works with any framework.

**Plan:** [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md)

### Phase 2 — L2: AI Automation Foundation
**Why second:** AI automation is the primary differentiator of how Void Energy is consumed. The demo that sells VE isn't "look at our components" — it's "I told Claude to build a settings page and it came out perfect." Landing the foundation in the current monorepo first means Phase 3 inherits a working system and only has to redistribute it across workspaces.

**Deliverable:** Layered `CLAUDE.md` + `.claude/` system inside the current monorepo with strict per-directory rules, a complete enforced `component-registry.json`, package-level CLAUDE.md for every workspace package (including L0), and AI-readable catalogs.

**Plan:** [phase-2-ai-automation.md](phase-2-ai-automation.md)

### Phase 3 — Core Repo Restructure + Premium Packages
**Why third:** Once the system has its adoption layer (Phase 1) and AI foundation (Phase 2), we restructure everything into its production home: a public monorepo for the core library + L0, a private monorepo for premium packages, and the npm distribution that ties them together.

**Deliverables:**
- Public `dgrslabs/void-energy` monorepo (Pattern A: `packages/` + `apps/`)
- `void-energy` npm package (L1 — Svelte components)
- `@void-energy/tailwind` npm package (L0 — Tailwind preset)
- `create-void-energy` npm package (scaffolder)
- `apps/showcase` deployed to `void.dgrslabs.ink`
- `apps/starter-template` as the self-contained fork/scaffold target
- Private `dgrslabs/void-energy-premium` monorepo with 4 packages: Kinetic Text, DGRS, Ambient, Rive
- AI automation foundation from Phase 2 redistributed across the new workspace layout

**Plans:**
- [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) — the public repo shape, workspaces, `npm install` vs `npm create`
- [phase-3-premium-packages.md](phase-3-premium-packages.md) — the private premium repo and its 4 packages

### Phase 4 — CoNexus Migration
**Why last:** CoNexus is the consumer. It proves the system works end-to-end by importing `void-energy` and premium packages from npm exactly the way any external customer would. Migrating earlier would force architectural decisions based on one app's needs; migrating last keeps the library honest.

**Deliverable:** `dgrslabs/conexus` private repo — a single Svelte/Astro app consuming public `void-energy` from npmjs.org and the premium packages from GitHub Packages.

**Plan:** [phase-4-conexus-migration.md](phase-4-conexus-migration.md)

---

## Dependency Direction

Arrows only point down. Never reversed.

```
conexus ----------> void-energy-premium ------> void-energy (L1)
 (app)              (private packages)           |
                                                 +-> @void-energy/tailwind (L0)
```

- CoNexus depends on premium, premium depends on public. Public has zero awareness of either.
- L1 and L0 share the same token SSOT (`design-tokens.ts`). L0 imports nothing from L1.
- Premium packages import `void-energy` from public npm, the same way external consumers do.
- This isolation is what lets us flip individual premium packages public (via `publishConfig`) without restructuring anything.

---

## Repository Map (target end state after Phase 3)

```
github.com/dgrslabs/void-energy             PUBLIC (BSL 1.1)
  packages/void-energy/                      L1 (Svelte components)
  packages/void-energy-tailwind/             L0 (Tailwind preset)
  packages/create-void-energy/               Scaffolder
  apps/showcase/                             void.dgrslabs.ink
  apps/starter-template/                     Scaffold payload

github.com/dgrslabs/void-energy-premium     PRIVATE
  packages/kinetic-text/                     @dgrslabs/void-energy-kinetic-text
  packages/dgrs/                             @dgrslabs/void-energy-dgrs
  packages/ambient/                          @dgrslabs/void-energy-ambient-layers
  packages/rive/                             @dgrslabs/void-energy-rive

github.com/dgrslabs/conexus                  PRIVATE
```

---

## The Adoption Funnel

```
L0 (free, any framework)     ->  "Wow, atmosphere switching is cool"
  | wants more
L1 (premium experience)      ->  "Wow, the components are perfect"
  | wants automation
L2 (included with L1)        ->  "Wow, Claude just built my entire page"
```

L0 deliberately doesn't give you components — that creates pull toward L1. L2 only works on top of L1's constraint enforcement — that makes the full stack irreplaceable.

---

## Canonical Decisions

All architectural and strategic decisions with rationale are documented in [decisions.md](decisions.md). Do not re-litigate these without updating that file.

---

## Plan Documents

| Doc | Scope |
|-----|-------|
| [README.md](README.md) | This index |
| [decisions.md](decisions.md) | Canonical decisions log with rationale |
| [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md) | Phase 1: `@void-energy/tailwind` — framework-agnostic Tailwind preset (revised post-Phase 0a) |
| [phase-2-ai-automation.md](phase-2-ai-automation.md) | Phase 2: L2 AI automation foundation in current monorepo |
| [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) | Phase 3: public monorepo, npm packages, scaffolder |
| [phase-3-premium-packages.md](phase-3-premium-packages.md) | Phase 3: private premium repo, KT/DGRS/Ambient/Rive |
| [phase-4-conexus-migration.md](phase-4-conexus-migration.md) | Phase 4: CoNexus as a consumer of the finished system |
| [archive/](archive/) | Previous plan structure, kept for historical reference |

---

## One-Line Priority

**~~Migrate to Tailwind v4~~ ✓ -> ship L0 Tailwind preset -> land L2 AI automation foundation -> restructure into public/premium monorepos + ship npm packages -> migrate CoNexus. One phase at a time, no split focus.**
