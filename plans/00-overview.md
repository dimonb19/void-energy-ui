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
- **Public adoption** via a free, BSL-licensed starter system (engine, components, AI generator)
- **Premium packages** kept private — Kinetic Text, Ambience Layers, Rive, future add-ons. Collect contacts, discuss access when there's demand. Premium deals are for later, after CoNexus launches.
- **CoNexus platform** as the flagship app built on the full stack — the first priority and the proof that the system works

---

## Four-Wave Launch Strategy

Each wave generates its own attention cycle. The priority is finishing and polishing the core system first.

### Wave 1 — Starter Launch (Target: 2-3 weeks)
Polish and finish the monorepo, then ship the public `void-energy` repo and npm package.
- Finish and polish everything in the current monorepo first
- Public repo with the core system: engine, 4 atmospheres, 40+ components, AI generator
- `npm publish void-energy@0.1.0` to public npm
- AI-drafted LICENSE.md (BSL 1.1 placeholder) — boss sends to lawyer immediately
- Clean git history: init commit + license
- Professional README with screenshots, quick start, feature grid
- **Kinetic Text stays private** — it's a strategic moat for CoNexus, not a giveaway
- The showcase site (void.dgrslabs.ink) shows ALL features including premium packages — visible, not downloadable
- Once lawyer returns final BSL terms, swap with a single commit

### Wave 2 — Premium Packages (After Wave 1)
Finish Void Energy completely before touching CoNexus. No split focus.
- Premium repo created with Kinetic Text as the first package (`@dgrslabs/void-energy-kinetic-text`)
- `@dgrslabs/void-energy-ambience` — Blood, Snow, Rain, Fog with physics adaptation
- Private npm distribution via GitHub Packages
- Collect contacts from interested parties, discuss access when there's demand
- Eric Jordan's Rive package ships whenever he delivers — decoupled from wave timeline

### Wave 3 — CoNexus Migration (After VE Is Complete)
Only start when Void Energy (starter + premium) is fully done.
- CoNexus repo created, imports `void-energy` from public npm (same as any external consumer)
- CoNexus UI components (Tile, StoryFeed, PortalLoader, etc.) live in the CoNexus repo
- Boot sequence registers 12 DGRS-private atmospheres at runtime
- Premium packages (Kinetic Text, Ambience Layers) imported from the private premium repo
- Physics switching, atmosphere changes, kinetic text, narrative effects — all running in production
- **This is the proof of concept AND the product** — the strongest marketing for Void Energy

### Wave 4 — Premium Availability (When CoNexus Is Established)
Open premium packages for external customers when timing is right.
- CoNexus is live and established as the flagship Void Energy showcase
- Premium packages available via subscription or deals — business model TBD
- Collaborator model proven (Eric Jordan as first external contributor)
- **Do NOT rush this** — the moat matters more than premium revenue right now

**Why this order:** Finish Void Energy completely first — no split focus. The starter ships, then premium packages get built and polished. Only when VE is fully done does CoNexus migration begin. CoNexus is the real product and the best marketing, but it needs a complete VE foundation underneath it. External premium deals happen only after CoNexus has traction.

---

## Three-Tier Model

| Tier | What it includes | Who gets it |
|------|-----------------|-------------|
| **Free** | 4 atmospheres (Slate, Terminal, Meridian, Solar), 40+ components, AI generator, narrative/drag actions | Everyone via `npm install void-energy` |
| **Premium** | Kinetic Text, Ambience Layers, Rive by Eric Jordan, future add-ons | Private — collect contacts, discuss access when demand exists. Deals after CoNexus launches. |
| **DGRS-Private** | 12 original atmospheres (Void, Onyx, Terminal, Nebula, Solar, Overgrowth, Velvet, Crimson, Paper, Focus, Laboratory, Playground), CoNexus UI | DGRS Labs internal only |

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
The starter system. What people fork, star, and install via `npm install void-energy`. Contains the complete engine, 4 free atmospheres (Slate, Terminal, Meridian, Solar), 40+ public UI components, AI atmosphere generator, and full documentation. A complete, working system on its own. No premium packages included.

### Repo 2: `void-energy-premium` (Private) — Wave 2
All premium packages published under the `@dgrslabs` npm scope. Each package extends the public core without modifying it. Packages: `@dgrslabs/void-energy-kinetic-text` (Kinetic Text — first), `@dgrslabs/void-energy-ambience` (Ambience Layers), `@dgrslabs/void-energy-rive` (Eric Jordan's Rive animations). Private for now — collect contacts, discuss access when demand exists. Premium deals happen after CoNexus launches.

### Repo 3: `conexus` (Private) — Wave 3
The CoNexus AI storytelling platform. Consumes the public `void-energy` package from npm (same as any external consumer) + premium packages from private npm. Registers the 12 DGRS-private atmospheres at boot. CoNexus-exclusive features (story engine, portal effects) live here. Serves as the flagship showcase of Void Energy at production scale. Only starts after VE is fully complete.

---

## Plan Documents

| # | Document | Description | Wave |
|---|----------|-------------|------|
| 01 | [Token Modularity](01-atmosphere-split.md) | Extract fonts + atmospheres from design-tokens.ts, tier metadata, developer instructions | Wave 1 |
| 02 | [CoNexus Extraction](02-conexus-extraction.md) | Extract CoNexus-specific components into CoNexus repo | Wave 3 |
| 03 | [Public Repo](03-public-repo.md) | Structure, contents, and setup of `void-energy` | Wave 1 |
| 04 | [Premium Repo](04-premium-repo.md) | Structure of `void-energy-premium`, KT first, then Ambience, then Rive | Wave 2 |
| 05 | [CoNexus Repo](05-conexus-repo.md) | Structure of the `conexus` app repository | Wave 3 |
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

## Strategic Principle — Moat First, Generosity Second

> "While we don't have a strong moat yet, every piece we do have is very strategic. We need to retain our moat until CoNexus has traction."

Open what builds community (core engine, components, AI generator). Close what builds moat (Kinetic Text, Ambience Layers, Rive, private atmospheres). The showcase site shows everything — visible, not downloadable. Premium deals are for after CoNexus launches.

Precedents: Figma (open plugin API, closed rendering engine), Linear (internal motion system), Vercel (open Next.js, closed infrastructure), Loom (internal video compression).

---

## Showcase Site Strategy

The **void.dgrslabs.ink** site is the premium showcase. It shows ALL packages and features — Kinetic Text, Ambience Layers, all 16 atmospheres, everything. The code stays private. Everyone sees the technology; only CoNexus uses it. When someone asks "how do I get Kinetic Text?" — collect their contact, discuss later.

---

## Current State (as of 2026-04-02)

| Asset | Status |
|-------|--------|
| Void Energy UI monorepo | Active, 16 atmospheres, 100+ components. Being polished before extraction. |
| Kinetic Text package | v0.1.0, built in `packages/kinetic-text/` — **PREMIUM** (private, strategic moat for CoNexus) |
| Free atmospheres | All 4 ready: Slate (created), Terminal (existing), Meridian (created), Solar (existing) |
| 12 DGRS-private atmospheres | All built, will stay private to CoNexus |
| Ambience Layers | Not yet started — premium package: `@dgrslabs/void-energy-ambience` |
| CoNexus components | In `src/components/conexus/` and `src/components/ui/` — move to CoNexus repo |
| Public repo | Not yet created — Wave 1 (after monorepo polish is complete) |
| Premium repo | Not yet created — Wave 2 (first package: Kinetic Text, then Ambience Layers) |
| CoNexus repo | Not yet created — Wave 3 (after VE is fully complete) |
| BSL License | AI-drafted placeholder for Wave 1 launch; lawyer swap when review completes |
| Private npm | Not needed until Wave 3 (GitHub Packages when ready) |
| Eric Jordan deal | Revenue share recommended; presenting deal after Wave 1 launch |
| Eric Jordan Rive package | Decoupled from waves — ships whenever Eric delivers |
| void.dgrslabs.ink | Live on Vercel, shown at EthCC Cannes. Will serve as premium showcase. |
