# Void Energy — Plans

> The complete launch and architecture plan for Void Energy, organized by priority.
> Last updated: 2026-04-19 (mobile deployment pulled ahead of monorepo; i18n moved to `future/`; phases now four in order)

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

## Completed Foundation

The following work has already shipped and is no longer tracked as a numbered phase. It is the substrate every remaining phase builds on.

- **Tailwind CSS v4 migration** — existing codebase migrated from Tailwind v3.4 to v4 with a `@theme`-based CSS config. Follow-up patched the v4 footguns (`@theme inline` vs `@theme reference`, namespace strategy). Canonical reference: [src/styles/tailwind-theme.css](../src/styles/tailwind-theme.css).
- **Design language modernization** — visual language aligned with 2025-2026 best practices (MD3, shadcn/ui, Linear, Radix). Sentence-case buttons, 8px flat radius, tint-only flat hover, refined active press and glass glow.
- **L0: framework-agnostic Tailwind preset** — `@void-energy/tailwind` extracted as a Tailwind CSS v4 preset with atmosphere switching, physics presets, density scaling, semantic tokens, and a vanilla JS runtime. Works with any framework.
- **TTS + Kinetic Text synchronization** — `revealMarks` prop on `<KineticText>` for externally-timed reveal, provider-agnostic TTS adapters (ElevenLabs, OpenAI, Azure, Google, Deepgram), audio-KT synchronizer, and inline effect cue resolver, shipped as a `@dgrslabs/void-energy-kinetic-text/tts` sub-export.

---

## Phases (in order)

Work is organized into four remaining phases. **Each phase ships before the next begins.** No split focus.

### Phase 1 — L2: AI Automation Foundation
**Why first:** AI automation is the primary differentiator of how Void Energy is consumed. The demo that sells VE isn't "look at our components" — it's "I told Claude to build a settings page and it came out perfect." Landing the foundation in the current monorepo first means every phase that follows inherits a working system instead of inventing rules and restructuring simultaneously.

**Deliverable:** Layered `CLAUDE.md` + `.claude/` system inside the current monorepo with strict per-directory rules, a complete enforced `component-registry.json`, package-level CLAUDE.md for every workspace package (including L0), and AI-readable catalogs.

**Plan:** [phase-1-ai-automation.md](phase-1-ai-automation.md)

### Phase 2 — Mobile Deployment (Capacitor)
**Why second (before the monorepo):** Mobile surfaces load-bearing constraints — the shape of a `capacitor.ts` helper in `void-energy`, which safe-area utilities belong in `@void-energy/tailwind`, and the default mobile physics preset after glass perf testing — that the Phase 3 monorepo needs to bake into package boundaries. Proving these in the current flat repo first means Phase 3 only relocates working files, and the first shippable Void Energy mobile app (the DGRS app or an early CoNexus build) lands months sooner.

**Deliverable:** Mobile capability wired directly into the current `void-energy-ui` repo — Capacitor integrated, safe areas audited, status bar sync, haptics wrapper, glass perf decision made, cloud build pipeline proven end-to-end with the first shipped app. Phase 3 will extract the template layer from this proven setup.

**Plan:** [phase-2-mobile-deployment.md](phase-2-mobile-deployment.md)

### Phase 3 — Core Repo Restructure + Premium Packages
**Why third:** Once the system has both its AI foundation (Phase 1) and proven mobile capability (Phase 2), we restructure everything into its production home: a public monorepo for the core library + L0, a private monorepo for premium packages, and the npm distribution that ties them together. The mobile work from Phase 2 gets extracted into `apps/starter-template/` and a `capacitor.ts` subpath export on `void-energy`.

**Deliverables:**
- Public `dgrslabs/void-energy` monorepo (Pattern A: `packages/` + `apps/`)
- `void-energy` npm package (L1 — Svelte components; includes `capacitor.ts` helper)
- `@void-energy/tailwind` npm package (L0 — Tailwind preset; includes mobile-ready safe-area utilities)
- `create-void-energy` npm package (scaffolder)
- `apps/showcase` deployed to `void.dgrslabs.ink`
- `apps/starter-template` as the self-contained, mobile-ready fork/scaffold target
- Private `dgrslabs/void-energy-premium` monorepo with 4 packages: Kinetic Text, DGRS, Ambient, Rive
- AI automation foundation from Phase 1 and mobile integration from Phase 2 redistributed across the new workspace layout

**Plans:**
- [phase-3a-monorepo-structure.md](phase-3a-monorepo-structure.md) — the public repo shape, workspaces, `npm install` vs `npm create`
- [phase-3b-premium-packages.md](phase-3b-premium-packages.md) — the private premium repo and its 4 packages

### Phase 4 — CoNexus Migration
**Why last:** CoNexus is an existing Astro+Svelte+SCSS app with a Go backend. Its frontend will be refactored to consume Void Energy. This is the definitive proof that the system works for real applications — the complete design system, AI foundation, mobile capability, and premium packages must be shipped first so there's no need to go back and remake or add anything later.

**Deliverable:** `dgrslabs/conexus` private repo — the existing app refactored to consume public `void-energy` from npmjs.org and the premium packages from GitHub Packages. Ships to mobile via the template pattern established in Phases 2 and 3.

**Plan:** [phase-4-conexus-migration.md](phase-4-conexus-migration.md)

---

## Future / Parked

Research and exploration for work that isn't scheduled as a phase. Captured so findings aren't lost, revisited once the roadmap phases ship.

- [future/i18n.md](future/i18n.md) — Internationalization substrate + premium `@void-energy/i18n` package. Ships after all four phases. Additive, not foundational. Some substrate prep (logical properties, `--direction-sign`, injectable KT segmenter) can be pulled forward opportunistically.
- [future/rive.md](future/rive.md) — Rive package content: cinematic animated CTA buttons by Eric Jordan. Phase 3b reserves the scaffold; real content ships only after all four phases land, on Eric's decoupled timeline.
- [future/haptics.md](future/haptics.md) — Premium `@dgrslabs/void-energy-haptics` package: iOS Core Haptics (AHAP) + Android VibrationEffect primitives + Kinetic Text accent sync + Ambient Layers continuous drones. Phase 2 ships the stock `@capacitor/haptics` wrapper floor; this is the depth layer on top.
- [future/webgl.md](future/webgl.md) — Premium `@dgrslabs/void-energy-webgl` package: shader-driven ambient enrichment, hero/showcase scene canvases, cinematic page transitions. Three surfaces only. OGL-first bundle discipline. Ships after all four phases land.

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
| [phase-1-ai-automation.md](phase-1-ai-automation.md) | Phase 1: L2 AI automation foundation in current monorepo |
| [phase-2-mobile-deployment.md](phase-2-mobile-deployment.md) | Phase 2: Capacitor mobile capability wired into current repo + first shipped app |
| [phase-3a-monorepo-structure.md](phase-3a-monorepo-structure.md) | Phase 3: public monorepo, npm packages, scaffolder |
| [phase-3b-premium-packages.md](phase-3b-premium-packages.md) | Phase 3: private premium repo, KT/DGRS/Ambient/Rive |
| [phase-4-conexus-migration.md](phase-4-conexus-migration.md) | Phase 4: CoNexus frontend refactor to Void Energy |
| [future/i18n.md](future/i18n.md) | Future: i18n substrate + premium `@void-energy/i18n` package (parked) |
| [future/rive.md](future/rive.md) | Future: Rive animated CTA button package content + Eric Jordan partnership integration (parked) |
| [future/haptics.md](future/haptics.md) | Future: premium `@dgrslabs/void-energy-haptics` package — Core Haptics + AHAP + KT/Ambient sync (parked) |
| [future/webgl.md](future/webgl.md) | Future: premium `@dgrslabs/void-energy-webgl` package — shader-driven ambient + hero scenes + page transitions (parked) |

---

## One-Line Priority

**~~Tailwind v4 migration~~ ✓ -> ~~L0 Tailwind preset~~ ✓ -> ~~TTS + KT sync~~ ✓ -> land L2 AI automation foundation -> wire Capacitor into the current repo and ship the first mobile app -> restructure into public/premium monorepos + ship npm packages -> refactor CoNexus frontend to VE. One phase at a time, no split focus. i18n and Rive content are parked — see [future/](future/).**
