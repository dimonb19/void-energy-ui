# 08 — Open Decisions

> Decisions tracking for the Void Energy enterprise decomposition. Most decisions are now resolved.

**Last updated:** 2026-03-31

---

## D1: Private NPM Registry — GitHub Packages vs Verdaccio

**Status:** Decided
**Owner:** Dima + Backend Lead
**Timeline:** Wave 3 (not needed until premium packages ship)

### Resolution
**GitHub Packages to start.** Zero cost, zero infrastructure, integrated with GitHub. Adequate for the first 6-12 months. Migrate to Verdaccio when customer base grows beyond ~20 or when non-GitHub customers need access. Migration is non-breaking — just change `.npmrc` registry URLs and re-publish.

---

## D2: Narrative Action + Drag Action — Public or Premium?

**Status:** Decided
**Owner:** Dima

### Resolution
**Both stay public (free).** Narrative effects (18 effects) are the best demo of Void Energy's physics system — they generate GitHub stars and adoption. Drag-and-drop is a general-purpose utility useful for any app. CoNexus's competitive advantage is the story engine that orchestrates these, not the individual effects.

---

## D3: AI Atmosphere Generator — Public or Premium?

**Status:** Decided
**Owner:** Dima

### Resolution
**Public (free).** Uses the consumer's own API key — zero cost to DGRS Labs. Combined with only 4 free atmospheres, it lets anyone create unlimited custom themes, making the free tier feel genuinely generous. Drives viral sharing ("look at this theme I made").

---

## D4: Free Atmosphere Selection

**Status:** Decided — all 4 atmospheres already created
**Owner:** Dima

### Resolution

| Atmosphere | Physics | Mode | Status | Rationale |
|-----------|---------|------|--------|-----------|
| **Slate** | flat | dark | Created | Dima's daily driver, default VE experience |
| **Terminal** | retro | dark | Existing | Only retro theme, essential for physics demo |
| **Meridian** | flat | light | Created | Created for showcases, neutral, broad appeal |
| **Ember** | glass | dark | Existing | Fan favorite from testing, strong glass showcase |

**Coverage:** All 3 physics (glass, flat, retro) + both modes (light, dark). Each has distinct personality.

**Why Ember over Void:** Ember was the most praised by testers. Void is the DGRS signature — keeping it private preserves brand identity.

**12 DGRS-private atmospheres** stay in CoNexus. Key reasons: Paper (boss's favorite, brand identity), Laboratory (DGRS Labs blue), Void (original signature). All are brand assets, not products for sale.

---

## D5: BSL License Parameters

**Status:** Decided (approach) — lawyer review still needed for final language
**Owner:** Dima + Lawyer
**Timeline:** AI-draft ships with Wave 1; lawyer finalizes before Wave 2

### Resolution — Two-Step Approach

**Step 1 (Wave 1 launch):** AI-drafted BSL 1.1 with proposed parameters:
- **Revenue threshold:** $1M annual revenue (gross)
- **Change date:** 4 years from each release
- **Change license:** Apache 2.0 (patent grant valuable for enterprise)
- **Additional Use Grant:** Personal, evaluation, education, open-source, and commercial projects under threshold
- Include visible note: "These terms are pending final legal review and may be updated"

**Step 2 (before Wave 2):** Boss sends draft to lawyer immediately after Wave 1 launch. Lawyer finalizes:
- Revenue threshold precision (gross vs net, per product vs per company)
- "Commercial use" definition (internal tools, SaaS, agency work)
- Change date mechanics (per-release vs initial release)
- Swap with a single commit — clean git history

**Why not wait:** Risk window is minimal. No $1M revenue customers in week one. "Pending review" note signals good faith. Don't let legal perfection delay engineering momentum.

---

## D6: Eric Jordan Rive Package Timeline

**Status:** Deferred — decoupled from wave timeline
**Owner:** Eric Jordan
**Timeline:** No hard deadline — ships whenever Eric delivers

### Context
Eric is evaluating Rive glass effects. Package scope = Void Energy visual assets only (not CoNexus content). Present deal after Wave 1 launch. Rive is the second premium package (after Ambience Layers) — it joins the premium repo whenever Eric is ready.

### What's Needed
- Eric delivers `.riv` files + Svelte wrapper components
- Assets must respond to physics presets (glass/flat/retro)
- Must follow PACKAGE.md interface spec
- Must declare `void-energy` as peer dependency

---

## D7: Ambience Layers Scope

**Status:** Decided — Wave 3 (first premium package)
**Owner:** Dima

### Resolution
**Build as the first premium package (`@dgrslabs/void-energy-ambience`) in Wave 3.** Not CoNexus-exclusive — it's a real product in the premium tier.

Planned layers: Blood, Snow, Rain, Fog — each with physics adaptation (glass: blur+glow, flat: opacity, retro: pixel/dither). CoNexus installs it as a dependency. Anyone else who wants it can contact DGRS Labs.

**Rationale for premium (not CoNexus-private):** The private CoNexus UI (tiles, portal loader) is already enough "private" to differentiate CoNexus. Keeping Ambience Layers as a premium package gives the premium tier something tangible from day one instead of an empty shell waiting for Eric's Rive delivery. Realistic expectation: very niche use case, but it's real and available.

**Wave 3 announcement angle:** "First premium package built on Void Energy — Ambience Layers." Shows the extension model in action.

---

## D8: Monorepo Decommission Timeline

**Status:** Decided — no rush
**Owner:** Dima

### Resolution
The monorepo continues as the development environment indefinitely. It's working — don't fix it. Decommission when all 3 repos are stable and no one is actively using the monorepo for new work. Natural transition: primary workspace → reference/archive → read-only.

---

## D9: Public Component Tier — What Ships Free

**Status:** Decided
**Owner:** Dima

### Resolution
**All components stay public except CoNexus-specific ones.** Generous free tier drives adoption.

**Public (free):** ~50 components (all fields, buttons, navigation, overlays, charts, layout, icons, modals), all actions (narrative, drag, morph, tooltip, kinetic, navlink), Kinetic Text package, AI atmosphere generator, 4 atmospheres.

**Removed from public:** Tile, StoryCategory, PortalLoader, LoadingTextCycler, StoryFeed, PortalLoaderDemo, ReorderShowcase (CoNexus-specific → CoNexus repo).

Premium value comes from collaborator packages (Rive, Ambience Layers), not from withholding basic components.

---

## D10: Eric Jordan Deal Structure

**Status:** Open — decide before presenting deal to Eric
**Owner:** Dima + Boss
**Timeline:** Present after Wave 1 launch

### Options

| | Revenue Share Only | Hybrid (Equity + Revenue) | Equity Only |
|---|---|---|---|
| **Structure** | 25-30% of Rive package revenue | 2-3% equity (vested) + 20-25% revenue share | 5% equity (vested) |
| **Dilution** | None | Minimal | High precedent risk |
| **Scalability** | Every collaborator gets same model | Works but complex | 3 collaborators = 15% gone |
| **Eric's incentive** | Direct: his package sells, he earns | Both platform + package | Platform only |
| **Complexity** | Simple | Moderate | Simple |

### Recommendation
**Revenue share (Option A) or hybrid (Option B).** Equity is forever. Revenue share is proportional to contribution. For a package contributor — even a legendary one — revenue share is the cleaner instrument.

Key points:
- Dima has 5% — giving the same to a package contributor feels disproportionate
- Revenue share sets a sustainable template for every future collaborator
- If equity matters for signaling, keep it to 2-3% with milestones = shipped .riv files passing PACKAGE.md spec
- Creative ownership stays with Eric; DGRS owns distribution rights
- If partnership ends, revenue share continues on shipped assets; vested equity stays

### Resolution
_Pending discussion between Dima and Boss._

---

## Decision Log

| # | Decision | Status | Date | Outcome |
|---|----------|--------|------|---------|
| D1 | Private NPM registry | **Decided** | 2026-03-31 | GitHub Packages → Verdaccio later |
| D2 | Narrative + drag | **Decided** | 2026-03-31 | Both public (free) |
| D3 | AI generator | **Decided** | 2026-03-31 | Public (free, consumer's API key) |
| D4 | Free atmospheres | **Decided** | 2026-03-31 | Slate, Terminal, Meridian, Ember (all ready) |
| D5 | BSL license | **Decided** (approach) | 2026-03-31 | AI draft → lawyer swap |
| D6 | Rive timeline | Deferred | — | Decoupled from waves, ships when Eric delivers |
| D7 | Ambience layers | **Decided** | 2026-03-31 | First premium package (Wave 3), CoNexus consumes it |
| D8 | Monorepo decommission | **Decided** | 2026-03-31 | No rush, keep as dev environment |
| D9 | Public component tier | **Decided** | 2026-03-31 | All primitives + Kinetic Text free |
| D10 | Eric Jordan deal | **Open** | — | Revenue share recommended |
