# Void Energy — Plans

> The complete launch and architecture plan for Void Energy, organized by priority.
> Last updated: 2026-04-07

---

## The Product

**Void Energy** is an enterprise design system built on Svelte 5, Astro, and hybrid SCSS/Tailwind. 3 physics presets (glass, flat, retro), 2 color modes, semantic tokens, runtime theme switching, AI atmosphere generation, 40+ components.

**CoNexus** is the flagship app — an AI-powered interactive storytelling platform. It is the core business priority and the best proof of what Void Energy can do.

---

## Strategic Principle

> Open what builds community. Close what builds moat.

The UI/UX premium feel is our only differentiator right now — no userbase, no content library, no network effects yet. Guard the premium packages until CoNexus has traction.

**Precedents:** Figma (open plugin API, closed rendering engine), Linear (internal motion system), Vercel (open Next.js, closed infra), Loom (internal video compression, $975M exit).

---

## Phases (in order)

Work is organized into four phases. **Each phase ships before the next begins.** No split focus.

### Phase 1 — Ambience Layers
**Why first:** Ambience Layers is the last major feature the system needs before it can be considered complete. Building it as a dedicated premium package from day one (following the existing Kinetic Text and DGRS pattern) means Phase 3 lifts it into the premium repo with zero refactoring.

**Deliverable:** `@dgrslabs/void-energy-ambience` package inside the current monorepo containing Blood, Snow, Rain, Fog — four immersive visual overlay layers that adapt to physics and color mode.

**Plan:** [phase-1-ambience-layers.md](phase-1-ambience-layers.md)

### Phase 2 — AI Automation Foundation
**Why second:** AI automation is not a polish pass — it is the primary differentiator of how Void Energy is consumed. Consumers build with AI. The team builds with AI. If the AI hallucinates components or drifts from the 5 Laws, the system fails at its job. Landing the foundation in the current monorepo first means Phase 3 inherits a working system and only has to redistribute it across workspaces.

**Deliverable:** layered `CLAUDE.md` + `.claude/` system inside the current monorepo with strict per-directory rules, a complete enforced `component-registry.json`, package-level CLAUDE.md for every premium package, and AI-readable catalogs.

**Plan:** [phase-2-ai-automation.md](phase-2-ai-automation.md)

### Phase 3 — Core Repo Restructure + Premium Packages
**Why third:** once the system is feature-complete (Phase 1) and AI-robust (Phase 2), we restructure everything into its production home: a public monorepo for the core library, a private monorepo for premium packages, and the npm distribution that ties them together.

**Deliverables:**
- Public `dgrslabs/void-energy` monorepo (Pattern A: `packages/` + `apps/`)
- `void-energy` npm package (library)
- `create-void-energy` npm package (scaffolder)
- `apps/showcase` deployed to `void.dgrslabs.ink`
- `apps/starter-template` as the self-contained fork/scaffold target
- Private `dgrslabs/void-energy-premium` monorepo with 4 packages: Kinetic Text, DGRS, Ambience, Rive
- AI automation foundation from Phase 2 redistributed across the new workspace layout

**Plans:**
- [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) — the public repo shape, workspaces, `npm install` vs `npm create`
- [phase-3-premium-packages.md](phase-3-premium-packages.md) — the private premium repo and its 4 packages

### Phase 4 — CoNexus Migration
**Why last:** CoNexus is the consumer. It proves the system works end-to-end by importing `void-energy` and premium packages from npm exactly the way any external customer would. Migrating earlier would force architectural decisions based on one app's needs; migrating last keeps the library honest.

**Deliverable:** `dgrslabs/conexus` private repo — a single Svelte/Astro app consuming public `void-energy` from npmjs.org and the premium packages from GitHub Packages.

**Plan:** [phase-4-conexus-migration.md](phase-4-conexus-migration.md)

---

## Dependency direction

Arrows only point down. Never reversed.

```
conexus ──────► void-energy-premium ──────► void-energy
 (app)            (private packages)         (public library)
```

- CoNexus depends on premium, premium depends on public. Public has zero awareness of either.
- Premium packages import `void-energy` from public npm, the same way external consumers do.
- This isolation is what lets us flip individual premium packages public (via `publishConfig`) without restructuring anything.

---

## Repository map (target end state after Phase 3)

```
github.com/dgrslabs/void-energy             PUBLIC (BSL 1.1)
github.com/dgrslabs/void-energy-premium     PRIVATE
github.com/dgrslabs/conexus                  PRIVATE
```

Two private repos because premium and CoNexus have different lifecycles: premium is a library collection, CoNexus is an app. Mixing them would force premium changes to wait on CoNexus release cycles and vice versa.

---

## Canonical decisions

All architectural and strategic decisions with rationale are documented in [decisions.md](decisions.md). Do not re-litigate these without updating that file.

---

## Plan documents

| Doc | Scope |
|-----|-------|
| [README.md](README.md) | This index |
| [decisions.md](decisions.md) | Canonical decisions log with rationale |
| [phase-1-ambience-layers.md](phase-1-ambience-layers.md) | Phase 1: `@dgrslabs/void-energy-ambience` package |
| [phase-2-ai-automation.md](phase-2-ai-automation.md) | Phase 2: layered CLAUDE.md + registry in current monorepo |
| [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) | Phase 3: public monorepo, npm packages, scaffolder |
| [phase-3-premium-packages.md](phase-3-premium-packages.md) | Phase 3: private premium repo, KT/DGRS/Ambience/Rive |
| [phase-4-conexus-migration.md](phase-4-conexus-migration.md) | Phase 4: CoNexus as a consumer of the finished system |
| [archive/](archive/) | Previous plan structure, kept for historical reference |

---

## One-line priority

**Finish Ambience Layers → land AI automation foundation → restructure into public/premium monorepos + ship npm packages → migrate CoNexus. One phase at a time, no split focus.**
