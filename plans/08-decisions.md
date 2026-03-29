# 08 — Open Decisions

> Decisions that need resolution before or during execution. Track status and reasoning here.

**Last updated:** 2026-03-29

---

## Decision Format

Each decision includes:
- **Status:** Open / Decided / Deferred
- **Owner:** Who makes this call
- **Deadline:** When it needs to be decided (if any)
- **Options:** What's on the table
- **Recommendation:** Claude's recommendation based on analysis
- **Resolution:** Final decision once made

---

## D1: Private NPM Registry — GitHub Packages vs Verdaccio

**Status:** Open
**Owner:** Dima + Backend Lead
**Deadline:** Before premium packages need distribution
**Impact:** Affects customer onboarding, CI/CD setup, infrastructure

### Options

| | GitHub Packages | Verdaccio |
|---|---|---|
| **Cost** | Free | Server hosting |
| **Setup** | Minimal | Docker + HTTPS + domain |
| **Customer UX** | Needs GitHub account + PAT | Standard npm auth |
| **Maintenance** | Zero | Ongoing (updates, backups) |
| **Scalability** | Good for <50 users | Unlimited |
| **Control** | GitHub owns it | Full control |
| **Migration** | Can migrate away later | Already self-hosted |

### Recommendation
Start with GitHub Packages. Migrate to Verdaccio when customer base grows beyond ~20 or when non-GitHub customers need access.

### Resolution
_Pending discussion with backend lead._

---

## D2: Narrative Action + Drag Action — Public or Premium?

**Status:** Open
**Owner:** Dima
**Deadline:** Before public repo extraction
**Impact:** Affects what the public system can do out of the box

### Options

**Option A: Keep both public**
- Narrative effects (18 effects) showcase the physics system beautifully
- Drag-and-drop is a general-purpose utility useful for any app
- More value in the free tier → more adoption → more premium conversions
- CoNexus's value is the story ENGINE that orchestrates these, not the effects themselves

**Option B: Move to premium**
- Narrative effects are a differentiator (no other design system ships these)
- Drag system is complex and valuable (33KB of code)
- Premium tier has more exclusive value

**Option C: Narrative public, drag premium**
- Effects drive adoption (visual wow factor)
- Drag is more of a "power user" feature

### Recommendation
**Option A: Keep both public.** The narrative effects are the best demo of Void Energy's physics system — they'll generate GitHub stars and adoption. CoNexus's competitive advantage is the story engine and content platform, not the individual effects. Making them premium would weaken the public system without meaningfully protecting CoNexus.

### Resolution
_Pending._

---

## D3: AI Atmosphere Generator — Public or Premium?

**Status:** Open
**Owner:** Dima
**Deadline:** Before public repo extraction
**Impact:** Whether free users can generate custom themes via AI

### Options

**Option A: Public (free)**
- Incredible demo feature — users generate themes and see them live
- Drives engagement and viral sharing ("look at this theme I made")
- Low cost to DGRS Labs (uses the consumer's API key)
- The generator already requires users to provide their own Claude API key

**Option B: Premium**
- Keeps AI features as a premium differentiator
- But: the consumer provides their own API key, so there's no cost to you

**Option C: Public with rate limit**
- Free tier gets N generations per session
- Premium gets unlimited
- Adds complexity for questionable benefit

### Recommendation
**Option A: Public.** The generator uses the consumer's own API key — there's no cost to DGRS Labs. It's one of the most impressive features for driving adoption. Keeping it free makes the public system feel genuinely generous, which builds goodwill and trust that leads to premium conversions.

### Resolution
_Pending._

---

## D4: Starter Atmosphere Selection

**Status:** Open (recommended set proposed, needs confirmation)
**Owner:** Dima
**Deadline:** Before atmosphere split implementation
**Impact:** What the public system ships with out of the box

### Proposed Selection

| Atmosphere | Physics | Mode | Rationale |
|-----------|---------|------|-----------|
| **void** | glass | dark | System default, signature experience |
| **terminal** | retro | dark | Only retro theme, unique physics demo |
| **paper** | flat | light | Primary light theme, broadest appeal |
| **focus** | flat | light | Minimal alternative, distraction-free |

### Coverage Analysis
- Glass: void (1)
- Flat: paper, focus (2)
- Retro: terminal (1)
- Dark: void, terminal (2)
- Light: paper, focus (2)
- All 3 physics: covered
- Both modes: covered

### Alternative Considerations
- **Replace focus with onyx?** — Would give flat-dark representation, but focus is more universally appealing
- **Replace focus with laboratory?** — Lab is more distinctive but focus is more useful
- **5 starters instead of 4?** — Could add onyx for flat-dark coverage, but 4 is a cleaner number

### Resolution
_Pending confirmation._

---

## D5: BSL License Parameters

**Status:** Open (needs lawyer review)
**Owner:** Dima + Lawyer
**Deadline:** Before public launch
**Impact:** Legal terms for all public repo users

### Parameters to Define

1. **Additional Use Grant** — What free usage looks like
   - Revenue threshold for commercial use (e.g., $100K, $500K, $1M annual revenue?)
   - Internal tools exception?
   - Open-source project exception?

2. **Change Date** — How long before auto-conversion
   - Proposed: 4 years from each release
   - Industry standard: 3-4 years

3. **Change License** — What it converts to
   - Apache 2.0 (more permissive, corporate-friendly)
   - MIT (simpler, more familiar)
   - Recommendation: Apache 2.0 (patent grant is valuable for enterprise)

### Resolution
_Pending lawyer review. See [project_licensing.md](../memory/project_licensing.md)._

---

## D6: Eric Jordan Rive Package Timeline

**Status:** Deferred
**Owner:** Eric Jordan
**Deadline:** No hard deadline
**Impact:** When `@dgrslabs/void-energy-rive` becomes available

### Context
Eric is evaluating Rive glass effects for the system. Package scope is limited to Void Energy visual assets (not CoNexus content). See [project_eric_deal.md](../memory/project_eric_deal.md).

### What's Needed
- Eric delivers `.riv` files + Svelte wrapper components
- Assets must respond to physics presets (glass/flat/retro)
- Must follow the PACKAGE.md interface spec
- Must declare `void-energy` as peer dependency

### Resolution
_Deferred until Eric delivers initial assets._

---

## D7: Ambience Layers Scope

**Status:** Open
**Owner:** Dima
**Deadline:** No hard deadline (future feature)
**Impact:** What visual effects CoNexus ships for story immersion

### Proposed Layers

| Layer | Effect | Physics Adaptation |
|-------|--------|-------------------|
| Blood | Dripping/pooling from edges | Glass: blur + glow / Flat: opacity / Retro: pixel |
| Snow | Falling particles with wind | Glass: soft glow / Flat: clean dots / Retro: pixel blocks |
| Rain | Streaming rain with direction | Glass: motion blur / Flat: lines / Retro: dashes |
| Fog | Volumetric overlay | Glass: gaussian blur / Flat: gradient / Retro: dither |

### Implementation Approach Options
- **CSS-only** — Animations + pseudo-elements. Simplest, most performant.
- **Canvas** — `<canvas>` overlay. More control, slightly heavier.
- **SVG filters** — Combine with physics SCSS. Most consistent with VE patterns.

### Where It Lives
- **Start in CoNexus repo** (exclusive feature)
- **Move to `@dgrslabs/void-energy-ambience` later** if there's demand from other consumers

### Resolution
_Pending. Dima will implement when ready._

---

## D8: Monorepo Decommission Timeline

**Status:** Open
**Owner:** Dima
**Deadline:** No hard deadline
**Impact:** When the current `void-energy-ui` monorepo stops being the primary workspace

### Phases

1. **Now:** Monorepo is the primary workspace. All development happens here.
2. **After extraction:** Monorepo serves as reference/archive. New development starts in the three repos.
3. **After verification:** Monorepo is archived (read-only) on GitHub.
4. **Eventually:** Monorepo is deleted or kept as historical reference.

### Key Milestone
The monorepo can be decommissioned when:
- [ ] Public repo builds and passes all checks
- [ ] All premium packages build independently
- [ ] CoNexus repo builds with imported packages
- [ ] No developer is actively using the monorepo for new work

### Resolution
_No rush. The monorepo continues to serve as the development environment during transition._

---

## D9: Public Component Tier — What Ships Free

**Status:** Open (full inventory proposed in 03-public-repo.md)
**Owner:** Dima
**Deadline:** Before public repo extraction
**Impact:** Value proposition of the free tier

### Summary of Proposed Split

**Public (free):** All current UI primitives except CoNexus-specific ones. ~50 components, all actions, all icons, all modals, AI generator.

**Removed from public:** Tile, StoryCategory, PortalLoader, LoadingTextCycler, StoryFeed, PortalLoaderDemo, ReorderShowcase.

### Question
Should any additional components be premium? Candidates:
- **Charts** (StatCard, ProgressRing, Sparkline, DonutChart, LineChart, BarChart) — could be premium
- **GenerateField / GenerateTextarea** — AI-powered generation fields
- **MediaSlider** — Advanced media component

### Recommendation
Keep everything public except CoNexus-specific components. A generous free tier drives adoption. Premium value comes from packages (atmospheres, kinetic text, rive), not from withholding basic components.

### Resolution
_Pending confirmation._

---

## Decision Log

| # | Decision | Status | Date Decided | Outcome |
|---|----------|--------|-------------|---------|
| D1 | Private NPM registry | Open | — | — |
| D2 | Narrative + drag public/premium | Open | — | — |
| D3 | AI generator public/premium | Open | — | — |
| D4 | Starter atmosphere selection | Open | — | — |
| D5 | BSL license parameters | Open | — | — |
| D6 | Rive package timeline | Deferred | — | — |
| D7 | Ambience layers scope | Open | — | — |
| D8 | Monorepo decommission | Open | — | — |
| D9 | Public component tier | Open | — | — |
