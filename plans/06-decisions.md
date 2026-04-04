# 06 — Open Decisions

> Decisions tracking for the Void Energy enterprise decomposition. Most decisions are now resolved.

**Last updated:** 2026-04-04

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
| **Solar** | glass | dark | Existing | Fan favorite from testing, strong glass showcase |

**Coverage:** All 3 physics (glass, flat, retro) + both modes (light, dark). Each has distinct personality.

**Why Solar over Void:** Solar was the most praised by testers. Void is the DGRS signature — keeping it private preserves brand identity.

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

## D7: Premium Package Order

**Status:** Decided — Updated 2026-04-04
**Owner:** Dima

### Resolution
**Four premium packages in order:**
1. `@dgrslabs/void-energy-kinetic-text` — first (already built, move from monorepo)
2. `@dgrslabs/void-energy-dgrs` — second (12 DGRS atmospheres + UI components, staging in monorepo — shared across all DGRS Labs apps)
3. `@dgrslabs/void-energy-ambience` — third (build when CoNexus needs it)
4. `@dgrslabs/void-energy-rive` — fourth (ships when Eric delivers)

All premium. All private. All DGRS Labs apps install them as dependencies. External customers can discuss access after CoNexus launches.

DGRS package: 12 original atmospheres, Tile, StoryFeed, PortalLoader, LoadingTextCycler, and other shared DGRS UI. Used by CoNexus and future DGRS Labs apps.

Ambience Layers: Blood, Snow, Rain, Fog — each with physics adaptation (glass: blur+glow, flat: opacity, retro: pixel/dither). Realistic expectation: very niche use case, but CoNexus uses it for immersive storytelling.

---

## D8: Monorepo Decommission Timeline

**Status:** Decided — no rush
**Owner:** Dima

### Resolution
The monorepo continues as the development environment indefinitely. It's working — don't fix it. Decommission when all 3 repos are stable and no one is actively using the monorepo for new work. Natural transition: primary workspace → reference/archive → read-only.

---

## D9: Public Component Tier — What Ships Free

**Status:** Decided — UPDATED 2026-04-04 (DGRS becomes a premium package)
**Owner:** Dima + Boss

### Resolution
**All core components stay public except DGRS-specific ones.** Generous free tier drives adoption. **All packages are premium/private.**

**Public (free):** 40+ components (all fields, buttons, navigation, overlays, charts, layout, icons, modals), all actions (narrative, drag, morph, tooltip, navlink), AI atmosphere generator, 4 atmospheres. PortalRing (interactive SVG icon) stays public.

**Premium (private):** Kinetic Text (`@dgrslabs/void-energy-kinetic-text`), DGRS (`@dgrslabs/void-energy-dgrs` — 12 atmospheres + shared UI components), Ambience Layers (`@dgrslabs/void-energy-ambience`), Rive (`@dgrslabs/void-energy-rive`).

**Removed from public:** Tile, StoryCategory, PortalLoader, LoadingTextCycler, StoryFeed, PortalLoaderDemo, ReorderShowcase (DGRS package — shared across all DGRS Labs apps).

**Why KT moved to premium:** See D11 (Strategic Moat decision).
**Why DGRS is a package (not local to CoNexus):** DGRS atmospheres and UI components are used across multiple DGRS Labs apps, not just CoNexus.

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

## D11: Strategic Moat — Keep All Packages Private

**Status:** Decided
**Owner:** Dima + Boss
**Date:** 2026-04-02

### Resolution
**All packages (Kinetic Text, Ambience Layers, Rive) stay premium/private until CoNexus has traction.** This is a strategic moat decision, not a monetization decision.

**Rationale (boss's argument, Dima agreed):**
- CoNexus is pre-launch. Zero users, zero network effects, zero content moat.
- The UI/UX premium feel is literally the only differentiator right now.
- Kinetic Text is core to CoNexus's narrative UX — a competitor with KT + a basic story engine could ship faster.
- DGRS atmospheres and UI components define the DGRS Labs brand identity across all apps.
- Once something is open-sourced, you can't take it back.
- Even at $100k, if a competitor uses KT to launch 3 months faster, that was a terrible trade.

**Precedents cited:**
- Figma — open plugin API, closed rendering engine. The openness built ecosystem; the closed core built valuation.
- Linear — internal motion system. It's why clones feel like knockoffs.
- Vercel — open Next.js, closed deployment infrastructure.
- Loom — internal async video compression. Acqui-hired for $975M.
- Netflix (early) — if they'd open-sourced their UI/UX when it was their only moat, they might never have become a giant.

**Pattern:** Open what builds community, close what builds moat. KT and Ambience fall in the second bucket.

**Showcase strategy:** The void.dgrslabs.ink site shows ALL features including premium packages — visible, not downloadable. People see the technology; code stays private. Collect contacts from interested parties; discuss access after CoNexus launches.

**When to revisit:** After CoNexus has traction (6-12 months post-launch). At that point, the moat is userbase + content + community, and open-sourcing KT could boost VE adoption without threatening CoNexus.

---

## D12: Top Navigation Island (Mobile)

**Status:** Decided — Implemented
**Owner:** Dima
**Date:** 2026-04-02

### Resolution
**On mobile, the top navigation bar becomes a floating pill-shaped island** — matching the existing bottom navigation island. The two islands create a symmetric, detached UI that floats over the content. On desktop (≥ 768px), behavior is unchanged: full-width fixed bar with optional hide-on-scroll.

### Why — When Everyone Else Has Top Bars

The traditional mobile top bar is a full-width rectangle fused to the browser chrome. It looks like part of the OS, not the app. Apple's Dynamic Island (2022) normalized the concept of detached, floating elements at the top of the viewport. The industry is moving toward floating surfaces, but almost no one has applied this to the navigation bar yet.

Void Energy is a design system that sells on visual distinction. Adopting the floating island pattern for the top nav — before it becomes the standard — signals that VE is forward-looking, not reactive. When this pattern becomes the norm in 1-2 years, VE apps will have been doing it since day one.

The bottom navigation was already a floating island. Having the top bar remain a full-width rectangle created a visual inconsistency — one half of the UI was modern, the other half was conventional. Now both poles of the mobile UI share the same floating language. The content area sits between two symmetric floating surfaces, which feels intentional and cohesive.

### Technical Approach
- **CSS-only** — no JS changes. The scroll-hide logic still runs; CSS simply ignores `data-hidden` on mobile by keeping the island's transform at `translateX(-50%)`.
- **Same visual DNA as bottom island**: identical width formula (safe-area-aware), `surface-raised` + `glass-blur`, `radius-full` pill shape, symmetric `space-xs` offsets from viewport edges.
- **"Fixed navigation" preference hidden on mobile** — the island is always visible, so the toggle is irrelevant on narrow screens.

### Files Changed
- `src/styles/components/_navigation.scss` — `@include mobile-only` block on `.nav-bar`
- `src/styles/base/_reset.scss` — mobile body padding adjustment
- `src/components/modals/ThemesFragment.svelte` — hide fixedNav toggle on mobile

---

## Decision Log

| # | Decision | Status | Date | Outcome |
|---|----------|--------|------|---------|
| D1 | Private NPM registry | **Decided** | 2026-03-31 | GitHub Packages → Verdaccio later |
| D2 | Narrative + drag | **Decided** | 2026-03-31 | Both public (free) |
| D3 | AI generator | **Decided** | 2026-03-31 | Public (free, consumer's API key) |
| D4 | Free atmospheres | **Decided** | 2026-03-31 | Slate, Terminal, Meridian, Solar (all ready) |
| D5 | BSL license | **Decided** (approach) | 2026-03-31 | AI draft → lawyer swap |
| D6 | Rive timeline | Deferred | — | Decoupled from waves, ships when Eric delivers |
| D7 | Premium package order | **Updated** | 2026-04-04 | KT first, DGRS second, Ambience third, Rive fourth — all premium |
| D8 | Monorepo decommission | **Decided** | 2026-03-31 | No rush, keep as dev environment |
| D9 | Public component tier | **Updated** | 2026-04-04 | All primitives free; KT + DGRS are premium packages |
| D10 | Eric Jordan deal | **Open** | — | Revenue share recommended |
| D11 | Strategic moat | **Decided** | 2026-04-02 | All packages private until CoNexus has traction |
| D12 | Top nav island (mobile) | **Decided** | 2026-04-02 | Floating pill nav on mobile, matching bottom island |
