# Void Energy — Enterprise Decomposition Roadmap

> Master plan for transforming the void-energy-ui monorepo into a three-repo enterprise product ecosystem.

**Created:** 2026-03-29
**Status:** Planning
**Owner:** Dima (DGRS Labs)

---

## Vision

Void Energy is an enterprise-grade design system built on Svelte 5, Astro, and a hybrid SCSS/Tailwind architecture. The system adapts to 3 physics presets (glass, flat, retro) and 2 color modes (light, dark), with every visual value flowing through semantic tokens.

The goal is to decompose the current monorepo into three repositories with clear dependency direction, enabling:
- **Public adoption** via a free, BSL-licensed starter system
- **Premium revenue** via private add-on packages
- **CoNexus platform** as the flagship app built on both tiers

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

### Repo 1: `void-energy` (Public)
The starter system. What people fork, star, and install via `npm install void-energy`. Contains the complete engine, 4 starter atmospheres, all public UI components, AI atmosphere generator, and full documentation. A working system on its own.

### Repo 2: `void-energy-premium` (Private)
Premium add-on packages published under the `@dgrslabs` npm scope. Each package extends the public core without modifying it. Packages include kinetic text, premium atmospheres, CoNexus UI components, Rive assets, and future additions.

### Repo 3: `conexus` (Private)
The CoNexus AI storytelling platform. Consumes both public and premium packages. CoNexus-exclusive features (ambient layers, story engine, portal effects) live here.

---

## Plan Documents

| # | Document | Description |
|---|----------|-------------|
| 01 | [Atmosphere Split](01-atmosphere-split.md) | Split 12 atmospheres into 4 starter + 8 premium with runtime registration |
| 02 | [CoNexus Extraction](02-conexus-extraction.md) | Extract CoNexus-specific components, actions, styles, and types into a package |
| 03 | [Public Repo](03-public-repo.md) | Structure, contents, and setup of the `void-energy` public repository |
| 04 | [Premium Repo](04-premium-repo.md) | Structure of `void-energy-premium` monorepo with all premium packages |
| 05 | [CoNexus Repo](05-conexus-repo.md) | Structure of the `conexus` app repository |
| 06 | [NPM Distribution](06-npm-distribution.md) | Publishing strategy for public and private packages |
| 07 | [Documentation](07-documentation.md) | Documentation site, licensing, and developer guides |
| 08 | [Open Decisions](08-decisions.md) | Decisions that need resolution before or during execution |

---

## Execution Phases

### Phase 0: Pre-Work (Current Repo)
Prepare the monorepo for extraction without breaking anything.
- Add atmosphere tier metadata to design-tokens.ts
- Clean page boundaries (remove tiles from /components, kinetic from /conexus)
- Design atmosphere runtime registration API
- Audit and tag every file as: core, premium, or conexus

### Phase 1: Public Repo Setup
Create `void-energy` with the core system extracted.
- Engine, tokens, physics, density, styles
- 4 starter atmospheres
- Public UI components and actions
- AI atmosphere generator
- Full documentation and BSL license

### Phase 2: Premium Repo Setup
Create `void-energy-premium` as a package monorepo.
- Move `@dgrslabs/void-energy-kinetic-text` (already built)
- Create `@dgrslabs/void-energy-atmospheres` (8 premium themes)
- Create `@dgrslabs/void-energy-conexus` (tiles, portal, story feed)
- Set up package template for future packages
- Future: `@dgrslabs/void-energy-rive`, `@dgrslabs/void-energy-ambience`

### Phase 3: CoNexus Repo Setup
Create `conexus` consuming both public and premium.
- Import all packages as dependencies
- Boot sequence registers premium atmospheres and components
- CoNexus-exclusive features live here

### Phase 4: Distribution
Set up npm publishing pipelines.
- Public npm for `void-energy`
- Private npm (@dgrslabs scope) for premium packages
- CI/CD for all three repos

### Phase 5: Launch Prep
Final polish before going public.
- Lawyer review of BSL license
- Documentation site deployment
- Public npm publish + GitHub launch
- Marketing: README quality, examples, starter templates

---

## Current State (as of 2026-03-29)

| Asset | Status |
|-------|--------|
| Void Energy UI monorepo | Active, all 12 atmospheres, 100+ components |
| Kinetic Text package | v0.1.0, built in `packages/kinetic-text/` |
| CoNexus components | In `src/components/conexus/` (StoryFeed, PortalLoaderDemo, ReorderShowcase) |
| CoNexus UI primitives | Mixed into `src/components/ui/` (Tile, StoryCategory, PortalLoader) |
| Public repo | Not yet created |
| Premium repo | Not yet created |
| CoNexus repo | Not yet created |
| BSL License | Drafted, needs lawyer review |
| Private npm | Not yet configured (GitHub Packages vs Verdaccio pending) |
