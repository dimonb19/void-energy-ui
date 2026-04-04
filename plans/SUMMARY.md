# Void Energy — Launch Plan Summary

> Quick reference for the full strategy. For details, see individual plan docs.
> Last updated: 2026-04-04

---

## The Product

Void Energy is an enterprise design system built on Svelte 5, Astro, and hybrid SCSS/Tailwind. 3 physics presets (glass, flat, retro), 2 color modes, semantic tokens, runtime theme switching, AI atmosphere generation, 40+ components. Built by Dima at DGRS Labs over 3+ months.

**CoNexus** is the flagship app — an AI-powered interactive storytelling platform. It's the core business priority and the best proof of what Void Energy can do.

---

## Strategic Principle

> Open what builds community. Close what builds moat.

We don't have a second moat yet (no userbase, no content library, no network effects). The UI/UX premium feel is our only differentiator right now. Guard it until CoNexus has traction.

**Precedents:** Figma (open plugin API, closed rendering engine), Linear (internal motion system), Vercel (open Next.js, closed infra), Loom (internal video compression, $975M exit).

---

## What's Free, What's Private

| Tier | What | Who Gets It |
|------|------|-------------|
| **Free (public npm)** | 4 atmospheres, 40+ components, AI generator, narrative/drag actions | Everyone via `npm install void-energy` |
| **Premium (private)** | Kinetic Text, DGRS Package (12 atmospheres + UI components), Ambience Layers, Rive animations | DGRS Labs apps + licensed customers. Collect contacts; deals after CoNexus launches. |

**Showcase site (void.dgrslabs.ink):** Shows EVERYTHING including premium — visible, not downloadable. People see the technology; code stays private.

---

## Three Repos

```
github.com/dgrslabs/void-energy          PUBLIC   (BSL 1.1)
github.com/dgrslabs/void-energy-premium   PRIVATE
github.com/dgrslabs/conexus               PRIVATE

Dependency direction (never reversed):
  conexus --> void-energy-premium --> void-energy
```

---

## Completed Milestones

- [x] **Atmosphere Split** (2026-04-04) — Fonts + atmospheres extracted into modular files with tier metadata. 4 free atmospheres separated from 12 DGRS-private.
- [x] **CoNexus Extraction** (2026-04-04) — Core system free from private dependencies. DGRS components separated into package.

---

## Wave Plan

### Wave 1 — Starter Launch (next)
- [x] Atmosphere split — extract fonts + atmospheres with tier metadata
- [x] CoNexus extraction — separate private components into DGRS package
- [x] 4 free atmospheres: Slate, Terminal, Meridian, Solar
- [ ] Finish and polish the monorepo
- [ ] Create public `void-energy` repo (clean git: init + license)
- [ ] `npm publish void-energy@0.1.0`
- [ ] 40+ components, AI generator, narrative/drag actions
- [ ] AI-drafted BSL license (lawyer reviews in parallel)
- [ ] Professional README, docs site
- [ ] Showcase site shows all features including premium

### Wave 2 — Premium Packages (after Wave 1)
Finish Void Energy completely before touching CoNexus. No split focus.
- [ ] Create `void-energy-premium` private repo
- [ ] Move Kinetic Text from monorepo (already built, v0.1.0)
- [ ] Move DGRS package from monorepo (12 atmospheres + UI components, shared across all DGRS Labs apps)
- [ ] Build Ambience Layers (Blood, Snow, Rain, Fog)
- [ ] Private npm via GitHub Packages
- [ ] Eric Jordan's Rive package — ships whenever he delivers (decoupled)
- [ ] Collect contacts from interested parties

### Wave 3 — CoNexus Migration (after VE is complete)
Only start when Void Energy (starter + premium) is fully done.
- [ ] Create `conexus` private repo
- [ ] Import `void-energy` from public npm (same as any external consumer)
- [ ] Import `@dgrslabs/void-energy-dgrs` for DGRS atmospheres + UI components (Tile, StoryFeed, PortalLoader, etc.)
- [ ] Import other premium packages from private npm (Kinetic Text, Ambience Layers)
- [ ] Boot sequence registers 12 DGRS atmospheres from the DGRS package
- [ ] Story engine, narrative orchestration, portal effects — all CoNexus-exclusive
- [ ] This is the real product launch and the best VE marketing

### Wave 4 — Premium Availability (after CoNexus established)
- [ ] Open premium packages for external customers
- [ ] Business model TBD (subscription or deals)
- [ ] Revisit open-sourcing KT if CoNexus has traction (6-12 months)

---

## Premium Packages (in order)

| # | Package | Status | Notes |
|---|---------|--------|-------|
| 1 | `@dgrslabs/void-energy-kinetic-text` | v0.1.0 built | Move from monorepo to premium repo |
| 2 | `@dgrslabs/void-energy-dgrs` | Staging in monorepo | 12 atmospheres + UI components, shared across all DGRS Labs apps |
| 3 | `@dgrslabs/void-energy-ambience` | Not started | Build when CoNexus needs it |
| 4 | `@dgrslabs/void-energy-rive` | Pending Eric | Decoupled from wave timeline |

---

## 4 Free Atmospheres

| Atmosphere | Physics | Mode | Why Free |
|-----------|---------|------|----------|
| Slate | flat | dark | Default VE experience, Dima's daily driver |
| Terminal | retro | dark | Only retro theme, essential for physics demo |
| Meridian | flat | light | Created for showcases, neutral, broad appeal |
| Solar | glass | dark | Fan favorite from testing, strong glass showcase |

Coverage: all 3 physics + both modes. AI generator lets anyone create unlimited custom themes.

---

## Eric Jordan Deal

Eric Jordan (2Advanced Studios, FWA Hall of Fame) is the first premium collaborator. He builds `@dgrslabs/void-energy-rive` — Rive animation package on top of VE core.

**Deal structure (recommended):**
- 25-30% revenue share on his specific package
- Creative ownership of .riv source files; DGRS owns distribution rights
- Revenue share continues on shipped assets if partnership ends
- No equity — sets a bad precedent for future collaborators

**Timeline:** Decoupled from waves. Ships when Eric delivers. Present deal after Wave 1.

---

## BSL License

- AI-draft for Wave 1 with "pending legal review" note
- Boss sends to lawyer immediately after launch
- Proposed: $1M revenue threshold, 4-year change date, converts to Apache 2.0
- Lawyer must clarify: gross vs net, per-product vs per-company, commercial use definition
- Swap with single commit when lawyer delivers

---

## Key Decisions Log

| # | Decision | Outcome |
|---|----------|---------|
| D1 | Private npm registry | GitHub Packages to start, Verdaccio later |
| D2 | Narrative + drag actions | Public (free) |
| D3 | AI atmosphere generator | Public (free, consumer's API key) |
| D4 | Free atmospheres | Slate, Terminal, Meridian, Solar (all ready) |
| D5 | BSL license approach | AI draft + lawyer swap |
| D6 | Rive timeline | Decoupled, ships when Eric delivers |
| D7 | Premium package order | KT first, DGRS second, Ambience third, Rive fourth |
| D8 | Monorepo decommission | No rush, keep as dev environment |
| D9 | Public component tier | 40+ components free; KT moved to premium |
| D10 | Eric Jordan deal | Revenue share recommended (open) |
| D11 | Strategic moat | ALL packages private until CoNexus has traction |

---

## Plan Documents

| Doc | What It Covers |
|-----|---------------|
| [00-overview.md](00-overview.md) | Master roadmap, wave strategy, repo architecture |
| [01-public-repo.md](01-public-repo.md) | Public repo structure, npm package, docs site |
| [02-premium-repo.md](02-premium-repo.md) | Premium repo structure, KT/DGRS/Ambience/Rive packages |
| [03-conexus-repo.md](03-conexus-repo.md) | CoNexus app structure, boot sequence, imports |
| [04-npm-distribution.md](04-npm-distribution.md) | Public npm + private GitHub Packages setup |
| [05-documentation.md](05-documentation.md) | Docs strategy, README template, licensing docs |
| [06-decisions.md](06-decisions.md) | All decisions with rationale |

---

## One-Line Priority

**Finish Void Energy completely (starter + premium), then migrate CoNexus. No split focus.**
