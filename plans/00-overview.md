# Void Energy — Enterprise Decomposition Roadmap

> Master plan for transforming the void-energy-ui monorepo into a three-repo enterprise product ecosystem.

**Created:** 2026-03-29
**Updated:** 2026-03-31
**Status:** Planning — Three-Wave Launch Strategy
**Owner:** Dima (DGRS Labs)

---

## Vision

Void Energy is an enterprise-grade design system built on Svelte 5, Astro, and a hybrid SCSS/Tailwind architecture. The system adapts to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark), with every visual value flowing through semantic tokens.

The goal is to decompose the current monorepo into three repositories with clear dependency direction, enabling:
- **Public adoption** via a free, BSL-licensed starter system with included Kinetic Text package
- **Premium revenue** via private collaborator packages (Rive, future add-ons)
- **CoNexus platform** as the flagship app built on the full stack, with DGRS-private atmospheres

---

## Four-Wave Launch Strategy

Each wave generates its own attention cycle. The priority is finishing and polishing the core system first.

### Wave 1 — Starter Launch (Target: 2-3 weeks)
Polish and finish the monorepo, then ship the public `void-energy` repo and npm package.
- Finish and polish everything in the current monorepo first
- Public repo with the complete system: engine, 4 atmospheres, 50+ components, Kinetic Text, AI generator
- `npm publish void-energy@0.1.0` to public npm
- AI-drafted LICENSE.md (BSL 1.1 placeholder) — boss sends to lawyer immediately
- Clean git history: init commit + license
- Professional README with screenshots, quick start, feature grid
- **Rides the Pretext hype wave** — Kinetic Text ships free as the headline feature
- Once lawyer returns final BSL terms, swap with a single commit

### Wave 2 — CoNexus UI Extraction (After Wave 1)
Extract CoNexus-specific UI into a private package so the public repo is clean.
- CoNexus UI components (Tile, StoryFeed, PortalLoader, etc.) extracted into a private package
- The public `void-energy` repo contains zero CoNexus references
- CoNexus will later import `void-energy` (core) + the private CoNexus UI package
- **This is enough "private" for CoNexus** — tiles and portal loader are the brand differentiator

### Wave 3 — Ambience Layers: First Premium Package (After Wave 2)
First premium package announcement. Shows the extension model in action.
- `@dgrslabs/void-energy-ambience` — Blood, Snow, Rain, Fog with physics adaptation
- Premium repo created with Ambience Layers as the first real package
- Announces the collaborator model: "here's how you build ON TOP of Void Energy"
- Private npm distribution via GitHub Packages
- Realistic expectation: niche use case, but a tangible product in the premium tier
- Anyone who wants it can contact DGRS Labs

### Wave 4 — CoNexus Frontend Migration (After Wave 3)
Migrate the CoNexus frontend to consume `void-energy` from npm. This is the real announcement.
- CoNexus repo created, imports `void-energy` from public npm + CoNexus UI private package
- Boot sequence registers 12 DGRS-private atmospheres at runtime
- Installs `@dgrslabs/void-energy-ambience` for immersive story effects
- Physics switching, atmosphere changes, kinetic text, narrative effects — all running in production
- **This is the proof of concept AND the product**

**Why this order:** The system must be polished and complete before anything else ships. CoNexus UI extraction keeps the public repo clean. Ambience Layers gives the premium tier something real from day one. CoNexus migration is the final payoff — a production app running on the full Void Energy stack.

---

## Three-Tier Model

| Tier | What it includes | Who gets it |
|------|-----------------|-------------|
| **Free** | 4 atmospheres (Slate, Terminal, Meridian, Ember), 50+ components, Kinetic Text, AI generator, narrative/drag actions | Everyone via `npm install void-energy` |
| **Premium** | Collaborator packages (Rive by Eric Jordan, future add-ons) | Licensed customers via `@dgrslabs/*` private npm |
| **DGRS-Private** | 12 original atmospheres (Void, Onyx, Nebula, Solar, Overgrowth, Velvet, Crimson, Paper, Laboratory, Playground, Focus, + others), CoNexus UI | DGRS Labs internal only |

---

## Three-Repo Architecture

```
github.com/dgrslabs/void-energy           PUBLIC  (BSL 1.1)
github.com/dgrslabs/void-energy-premium    PRIVATE
github.com/dgrslabs/conexus                PRIVATE

Dependency direction (never reversed):

  conexus ──> void-energy-premium ──> void-energy
                                          ^
                                          |
                              (peer dependency)
```

### Repo 1: `void-energy` (Public) — Wave 1
The starter system. What people fork, star, and install via `npm install void-energy`. Contains the complete engine, 4 free atmospheres (Slate, Terminal, Meridian, Ember), Kinetic Text package, all public UI components, AI atmosphere generator, and full documentation. A complete, working system on its own.

### Repo 2: `void-energy-premium` (Private) — Wave 3
Premium collaborator packages published under the `@dgrslabs` npm scope. Each package extends the public core without modifying it. First package: `@dgrslabs/void-energy-ambience` (Ambience Layers). Second package: `@dgrslabs/void-energy-rive` (Eric Jordan's Rive animations, whenever he delivers).

### Repo 3: `conexus` (Private) — Wave 4
The CoNexus AI storytelling platform. Consumes the public `void-energy` package + CoNexus UI private package + premium packages. Registers the 12 DGRS-private atmospheres at boot. CoNexus-exclusive features (story engine, portal effects) live here. Serves as the flagship showcase of Void Energy at production scale.

---

## Plan Documents

| # | Document | Description | Wave |
|---|----------|-------------|------|
| 01 | [Atmosphere Split](01-atmosphere-split.md) | 4 free atmospheres + 12 DGRS-private, runtime registration | Wave 1 |
| 02 | [CoNexus Extraction](02-conexus-extraction.md) | Extract CoNexus-specific components into private package | Wave 2 |
| 03 | [Public Repo](03-public-repo.md) | Structure, contents, and setup of `void-energy` | Wave 1 |
| 04 | [Premium Repo](04-premium-repo.md) | Structure of `void-energy-premium`, Ambience Layers first | Wave 3 |
| 05 | [CoNexus Repo](05-conexus-repo.md) | Structure of the `conexus` app repository | Wave 4 |
| 06 | [NPM Distribution](06-npm-distribution.md) | Publishing strategy for public and private packages | Wave 1 (public) / Wave 3 (private) |
| 07 | [Documentation](07-documentation.md) | Documentation site, licensing, and developer guides | Wave 1 |
| 08 | [Open Decisions](08-decisions.md) | Decisions — most now resolved | All |

---

## Eric Jordan — Collaborator Deal

Eric Jordan (2Advanced Studios, FWA Hall of Fame) is the first premium collaborator. He builds a Rive animation package (`@dgrslabs/void-energy-rive`) that sits on top of VE core. He owns the package creatively; DGRS handles distribution and licensing.

**Recommended deal structure — Revenue Share (preferred over equity):**
- 25-30% revenue share on `@dgrslabs/void-energy-rive` specifically
- Creative ownership of his .riv source files; DGRS owns distribution rights
- If partnership ends, his existing revenue share continues on shipped assets
- Vested equity not recommended — sets a precedent that doesn't scale to future collaborators

**Alternative — Hybrid (if equity is desired):**
- 2-3% equity (not 5%), 12-month vest, milestones = shipped .riv files that pass PACKAGE.md spec
- Plus 20-25% revenue share on his specific package
- This gives Eric skin in the platform game (equity) AND direct incentive for his package (revenue share)

**Why revenue share over equity:** Equity is forever. If Eric gets 5% for one Rive package, the next collaborator expects the same. Three collaborators = 15% given away to package contributors. Revenue share aligns incentives without diluting ownership and sets a sustainable template for all future collaborators.

**Timeline:** Deferred until Eric delivers initial .riv assets. No hard deadline — don't rush him. Rive package is decoupled from the wave timeline — it ships whenever Eric is ready.

---

## Current State (as of 2026-03-31)

| Asset | Status |
|-------|--------|
| Void Energy UI monorepo | Active, 16 atmospheres, 100+ components. Being polished before extraction. |
| Kinetic Text package | v0.1.0, built in `packages/kinetic-text/` — ships FREE |
| Free atmospheres | All 4 ready: Slate (created), Terminal (existing), Meridian (created), Ember (existing) |
| 12 DGRS-private atmospheres | All built, will stay private to CoNexus |
| Ambience Layers | Not yet started — Wave 3 (first premium package: `@dgrslabs/void-energy-ambience`) |
| CoNexus components | In `src/components/conexus/` and `src/components/ui/` — Wave 2 extraction |
| Public repo | Not yet created — Wave 1 (after monorepo polish is complete) |
| Premium repo | Not yet created — Wave 3 (first package: Ambience Layers) |
| CoNexus repo | Not yet created — Wave 4 (after Ambience Layers) |
| BSL License | AI-drafted placeholder for Wave 1 launch; lawyer swap when review completes |
| Private npm | Not needed until Wave 3 (GitHub Packages when ready) |
| Eric Jordan deal | Revenue share recommended; presenting deal after Wave 1 launch |
| Eric Jordan Rive package | Decoupled from waves — ships whenever Eric delivers |
| void.dgrslabs.ink | Live on Vercel, being shown at EthCC Cannes for feedback |
