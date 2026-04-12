# Void Energy — Plans

> The complete launch and architecture plan for Void Energy, organized by priority.
> Last updated: 2026-04-12 (Phase 0 + 0a + 0b complete; TTS sync moved to Phase 2, right after L0)

---

## The Product

**Void Energy** is an enterprise design system built on Svelte 5, Astro, and hybrid SCSS/Tailwind. 3 physics presets (glass, flat, retro), 2 color modes, semantic tokens, runtime theme switching, AI atmosphere generation, 40+ components.

**CoNexus** is the flagship app — an AI-powered interactive storytelling platform built in Astro+Svelte+SCSS. It is the core business priority and the best proof of what Void Energy can do. Its frontend will be refactored to Void Energy as the final phase, after the complete system is shipped.

---

## The Layer Architecture

Void Energy's value has three distinct layers that can be adopted independently:

**L0 — The Design System Brain** (`@void-energy/tailwind`)
Framework-agnostic Tailwind CSS v4 preset. Atmosphere switching, physics presets, density scaling, semantic tokens. Works with React, Vue, vanilla HTML — anything that uses Tailwind. This is the adoption unlock: VE sits *underneath* component libraries instead of competing with them. "shadcn + VE" instead of "shadcn vs VE."

**L1 — The Component Library** (`void-energy`)
40+ Svelte 5 components that implement L0's token decisions with TypeScript constraint enforcement, scoped CSS, native transitions, and slot composition. This is the actual product — where "perfect on first shot" lives. Svelte users only need `npm install void-energy` — the full token system is included, no separate L0 install needed.

**L2 — The AI Pipeline** (CLAUDE.md + registry + recipes)
The context system that turns L1 from "a good component library" into "an automated frontend engine." L2 only works on top of L1's constraint enforcement — without it, the recipes are just suggestions the AI can ignore. This is the moat.

---

## Strategic Principle

> Open what builds community. Close what builds moat.

The UI/UX premium feel is our only differentiator right now — no userbase, no content library, no network effects yet. L0 is the community builder (framework-agnostic, free). L1 + L2 is the moat (Svelte-only, premium experience). Guard the premium packages until CoNexus has traction.

**Precedents:** Figma (open plugin API, closed rendering engine), Linear (internal motion system), Vercel (open Next.js, closed infra), Tailwind (open framework, closed UI kit).

---

## Phases (in order)

Work is organized into six phases. **Each phase ships before the next begins.** No split focus.

### Phase 0 — Tailwind CSS v4 Migration ✓ COMPLETE
The existing codebase migrated from Tailwind v3.4 to v4 with a `@theme`-based CSS config. Phase 0a follow-up patched the v4 footguns surfaced after the swap. Both phases are landed; the canonical reference for v4 namespace strategy and footgun fixes lives in [src/styles/tailwind-theme.css](../src/styles/tailwind-theme.css).

### Phase 0b — Design Language Modernization ✓ COMPLETE
Updated the visual language to align with 2025-2026 best practices (MD3, shadcn/ui, Linear, Radix). Key changes: sentence-case buttons, 8px flat radius, tint-only flat hover, refined active press and glass glow. Must land before Phase 1 so L0 ships with modern defaults.

### Phase 1 — L0: Framework-Agnostic Tailwind Preset
**Why first remaining:** This is the adoption unlock. VE is currently Svelte-only (~3% of frontend devs). Extracting the design system brain as a Tailwind v4 preset makes every Tailwind user a potential VE user. Low effort (the token system already exists), high reach (millions of Tailwind users across every framework).

**Deliverable:** `@void-energy/tailwind` — a Tailwind CSS v4 preset with atmosphere switching, physics presets, density scaling, semantic tokens, and a tiny vanilla JS runtime. Works with any framework.

**Plan:** [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md)

### Phase 2 — TTS + Kinetic Text Synchronization
**Why second:** KT needs timeline-driven reveal before CoNexus can build its narrative reading experience. The KT package already exists at `packages/kinetic-text/` with a working RevealTimeline engine — everything the TTS sync needs to hook into is in place. No monorepo restructure required.

**Deliverable:** `revealMarks` prop on `<KineticText>` for externally-timed reveal, an InWorld TTS adapter, audio-KT synchronizer, and inline effect cue resolver — all shipped as a `@dgrslabs/void-energy-kinetic-text/tts` sub-export.

**Plan:** [phase-2-tts-kinetic-sync.md](phase-2-tts-kinetic-sync.md)

### Phase 3 — L2: AI Automation Foundation
**Why third:** AI automation is the primary differentiator of how Void Energy is consumed. The demo that sells VE isn't "look at our components" — it's "I told Claude to build a settings page and it came out perfect." Landing the foundation in the current monorepo first means Phase 4 inherits a working system and only has to redistribute it across workspaces.

**Deliverable:** Layered `CLAUDE.md` + `.claude/` system inside the current monorepo with strict per-directory rules, a complete enforced `component-registry.json`, package-level CLAUDE.md for every workspace package (including L0), and AI-readable catalogs.

**Plan:** [phase-3-ai-automation.md](phase-3-ai-automation.md)

### Phase 4 — Core Repo Restructure + Premium Packages
**Why fourth:** Once the system has its adoption layer (Phase 1), KT's TTS capability (Phase 2), and AI foundation (Phase 3), we restructure everything into its production home: a public monorepo for the core library + L0, a private monorepo for premium packages, and the npm distribution that ties them together.

**Deliverables:**
- Public `dgrslabs/void-energy` monorepo (Pattern A: `packages/` + `apps/`)
- `void-energy` npm package (L1 — Svelte components)
- `@void-energy/tailwind` npm package (L0 — Tailwind preset)
- `create-void-energy` npm package (scaffolder)
- `apps/showcase` deployed to `void.dgrslabs.ink`
- `apps/starter-template` as the self-contained fork/scaffold target
- Private `dgrslabs/void-energy-premium` monorepo with 4 packages: Kinetic Text, DGRS, Ambient, Rive
- AI automation foundation from Phase 3 redistributed across the new workspace layout

**Plans:**
- [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md) — the public repo shape, workspaces, `npm install` vs `npm create`
- [phase-4b-premium-packages.md](phase-4b-premium-packages.md) — the private premium repo and its 4 packages

### Phase 5 — Mobile Deployment (Capacitor)
**Why here:** App Store and Play Store distribution is critical for the core DGRS app (Go backend) and potentially CoNexus. The mobile deployment template must be ready before the CoNexus migration so the flagship app can target mobile from day one.

**Deliverable:** `ve-app-template` — a ready-to-clone Astro + Svelte + Void Energy + Capacitor project with cloud build scripts. Builders work only in `src/` with Claude Code; native compilation and signing happens in the cloud. No Mac, Xcode, or Android Studio required.

**Plan:** [phase-5-mobile-deployment.md](phase-5-mobile-deployment.md)

### Phase 6 — CoNexus Migration
**Why last:** CoNexus is an existing Astro+Svelte+SCSS app with a Go backend. Its frontend will be refactored to consume Void Energy. This must be the final step — the complete system (L0, L1, L2, premium packages, TTS sync, mobile template) must be shipped first so there's no need to go back and remake or add anything later. The migration itself becomes the definitive proof that the system works for real applications.

**Deliverable:** `dgrslabs/conexus` private repo — the existing app refactored to consume public `void-energy` from npmjs.org and the premium packages from GitHub Packages.

**Plan:** [phase-6-conexus-migration.md](phase-6-conexus-migration.md)

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
- Svelte consumers install only `void-energy` (L1) — the full token system is included.
- Non-Svelte consumers install only `@void-energy/tailwind` (L0) — tokens without Svelte.
- Premium packages import `void-energy` from public npm, the same way external consumers do.
- This isolation is what lets us flip individual premium packages public (via `publishConfig`) without restructuring anything.

---

## Repository Map (target end state after Phase 4)

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
| [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md) | Phase 1: `@void-energy/tailwind` — framework-agnostic Tailwind preset |
| [phase-2-tts-kinetic-sync.md](phase-2-tts-kinetic-sync.md) | Phase 2: TTS + Kinetic Text sync (InWorld adapter, timeline-driven reveal) |
| [phase-3-ai-automation.md](phase-3-ai-automation.md) | Phase 3: L2 AI automation foundation in current monorepo |
| [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md) | Phase 4: public monorepo, npm packages, scaffolder |
| [phase-4b-premium-packages.md](phase-4b-premium-packages.md) | Phase 4: private premium repo, KT/DGRS/Ambient/Rive |
| [phase-5-mobile-deployment.md](phase-5-mobile-deployment.md) | Phase 5: Capacitor mobile template + cloud builds for App Store / Play Store |
| [phase-6-conexus-migration.md](phase-6-conexus-migration.md) | Phase 6: CoNexus frontend refactor to Void Energy (final phase) |

---

## One-Line Priority

**~~Migrate to Tailwind v4~~ ✓ -> ship L0 Tailwind preset -> TTS + KT sync -> land L2 AI automation foundation -> restructure into public/premium monorepos + ship npm packages -> mobile deployment template (Capacitor) -> refactor CoNexus frontend to VE. One phase at a time, no split focus.**
