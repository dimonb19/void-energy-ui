# Rive Package — Future Premium Package

> Cinematic animated CTA buttons powered by Rive state machines, shipped as `@dgrslabs/void-energy-rive`. Designed by Eric Jordan, distributed by DGRS. A premium visual polish layer for moments CSS cannot reach.

**Status:** Parked research (captured 2026-04-19). Not a scheduled phase. Phase 3b only reserves the package name and scaffolds an empty workspace — the actual content (art, state machines, component layer, token bridge) lands after all four roadmap phases ship. Eric Jordan's delivery timeline is deliberately decoupled from the main phases.
**Consumes:** Requires Phase 3b (premium repo exists, scaffold in place) and a signed/confirmed partnership with Eric Jordan. CoNexus (Phase 4) provides the first real consumer context (narrative CTAs, portal triggers) that validates the button vocabulary.
**Blocks:** Nothing hard. The Rive package is additive — CoNexus and the showcase can ship without it. Missing Rive = missing cinematic polish, not missing functionality.

---

## Why this exists

Every interaction surface in Void Energy is expressive already: glass lifts, flat tints, retro flickers, narrative effects, kinetic text. But for **signature moments** — a primary CTA on a landing page, a "Begin the Story" button in CoNexus, a portal entry trigger — CSS has a ceiling. You can animate gradients, add glow loops, layer particles in SVG, and it will look good, but it will still look *web*. It will not look *cinematic*.

Rive exists for exactly this gap. It was built by the Flare/2Dimensions team as a successor to Flash/Lottie: vector runtime, interactive state machines, bone rigs, sub-20KB file sizes, hardware-accelerated canvas. Modern studios (Figma, Duolingo, Linear's onboarding, Framer) use it for the one or two buttons per product that need to feel like they belong in a film title sequence.

Void Energy's own visual thesis — dark, energetic, precise, cinematic — is exactly the aesthetic Rive is best at. And we have access to **Eric Jordan** (2Advanced Studios founder, FWA Hall of Fame), whose entire career is the aesthetic lineage Rive now serves digitally. This package is the bridge between his craft and VE's token system.

It is a **premium-only** package. There is no free tier. Rive is luxury, on purpose.

---

## Strategic framing

Same open/closed pattern VE uses everywhere, but with a twist unique to this package:

> **Open what builds community. Close what builds moat.** Keep Rive closed until the partnership validates the economics, then flip public as a prestige co-brand.

- **Phase-3b scaffold (private)** — reserves the `@dgrslabs/void-energy-rive` package name on GitHub Packages, empty placeholder content. This is all Phase 3b does.
- **`@void-energy/rive` v0 (private)** — the real work from this plan. Shipped after all four phases land. Private by default.
- **Potential flip to public (later)** — see decisions.md §D17 (selective publishing via `publishConfig`). Rive is explicitly called out there as a candidate for going open-source as part of Eric's partnership narrative — keeps KT/DGRS/Ambient private while letting the Rive assets act as a signature co-brand piece.

**What makes Rive structurally different from the other three premium packages:**

| Dimension | KT / DGRS / Ambient | Rive |
|---|---|---|
| Source of craft | Dima / DGRS | External artist (Eric Jordan) |
| Runtime dependency | None (pure web tech) | Rive runtime (~55 KB `@rive-app/canvas-lite`, ~100 KB WebGL2) |
| Authoring tool | Editor + tokens | Rive editor (macOS/Web) + .riv binary |
| Asset format | Source code | Binary `.riv` files + JSON export |
| Update cadence | Continuous (PRs) | Punctuated (Eric ships a pack, DGRS wraps it) |
| Bus factor | Internal | Single-artist dependency |

None of the other three packages have any of those properties. Rive is the only premium package whose delivery cadence is tied to a human outside DGRS, and whose runtime is external. The plan must respect this.

---

## The "cinematic button" pitch

The demo that sells this package:

```svelte
<RiveCTA onclick={begin}>Begin the Story</RiveCTA>
```

On hover: the button doesn't just lift — it *charges*. A subtle breathing glow resolves into a focused pulse. Particles orbit the edge. The text itself has been positioned inside the Rive art, so its letter spacing tightens as energy gathers.

On press: the button detonates — a single-frame light burst, canvas-level distortion, the label ghosts forward, then snaps back as the click resolves. In glass physics, the backdrop-filter around the button breathes with the animation.

On success (optional trigger): a celebratory sweep across the button surface, timed to a narrative cue or async completion.

No other design system ships this. Figma ships it as a product. Linear ships one per onboarding flow. For VE, it is the component that makes the showcase reel impossible to scroll past.

**Critically:** the native `<button>` is always underneath. The Rive canvas is a visual enhancement, not a replacement. Click targets, focus, keyboard, ARIA, form integration — all native. Rive only paints.

---

## Rive tech landscape (2026)

### What Rive is, concretely

- **File format:** `.riv` — vector art + rigs + state machine + timeline, single binary
- **Runtime:** `@rive-app/canvas` (~100 KB) or `@rive-app/canvas-lite` (~55 KB, subset of features) or `@rive-app/webgl2` (~130 KB, mesh/bone advanced)
- **Authoring:** Rive editor (native macOS + web app, free for individual use, paid for teams — see cost analysis below)
- **State machines:** declarative state graphs with typed inputs (`bool`, `number`, `trigger`) that drive transitions. This is the integration surface.

### Why Rive, not alternatives

| Alt | Why not |
|---|---|
| **Lottie** | No state machine. One-shot playback only. Fine for loading spinners, useless for interactive CTAs. |
| **Framer Motion / GSAP** | Still CSS/JS-bound. Can't do mesh deformation, bone rigs, or composited particle systems without a canvas. Ceiling too low. |
| **Custom WebGL (Three.js / OGL)** | Infinite ceiling but infinite authoring cost. No designer workflow. DIY every button. |
| **CSS + SVG only** | The status quo. Ceiling reached — this plan exists because we want past it. |
| **After Effects → Lottie pipeline** | Non-interactive. See Lottie row. |

Rive is the only tool where a designer authors the animation *and its interactive state graph* in one visual editor and ships a single binary runnable on the web, native, Flutter, Unity. That designer-first interactivity loop is the entire reason for picking it.

### Runtime options and the weight budget

VE has a **strict** budget for what we add to a consumer's bundle. The Rive runtime is not free:

| Runtime | Size (gzipped) | Features |
|---|---|---|
| `@rive-app/canvas-lite` | ~55 KB | Basic state machines, no meshes/bones |
| `@rive-app/canvas` | ~100 KB | Full state machines, most features |
| `@rive-app/webgl2` | ~130 KB | Meshes, bones, advanced blends |

**Default for v0:** `@rive-app/canvas-lite` if Eric's art stays within its constraints; `@rive-app/canvas` otherwise. WebGL2 only if a specific button needs it, gated behind a subpath export so consumers opt-in.

The runtime is a **peer dependency**. Consumers who install the package get a single copy. Consumers who never install the package pay zero bytes. This is mandatory — Rive weight cannot leak into `void-energy`'s base bundle.

---

## Scope — what Rive is and isn't in VE

### In scope
- **Animated CTA buttons.** Primary use case. One to five button variants in v0.
- **Portal / transition triggers.** CoNexus-specific: the button that opens a story, closes a chapter, starts a generation flow.
- **Signature loading indicators.** For premium moments (not generic spinners — those stay in free VE).
- **Narrative beat punctuation.** Buttons that react to story events (optional trigger inputs firing from CoNexus's narrative orchestrator).

### Out of scope (never)
- **Glass surface effects.** Moved to Liquid Glass (SVG `feDisplacementMap`). Rive is wrong for this — see memory `project_rive_decisions.md`.
- **Icon replacements.** The icon system is code-authored SVG for accessibility, theming, and bundle reasons. Rive icons would be glossy but wrong.
- **Generic motion across every component.** Over-use kills the magic. Rive lives on ~5% of interaction surfaces.
- **Atmosphere backgrounds or ambient effects.** Those are `@dgrslabs/void-energy-ambient-layers`.
- **Kinetic text.** That's KT. A Rive button can contain animated text authored in Rive, but general text effects are KT's domain.

The 5%-of-surfaces framing is deliberate. Rive is the spice, not the dish. If every button in a consumer app becomes a Rive button, the package has failed at its positioning.

---

## Architecture

### Layer positioning

Rive sits on top of L1. It does not participate in L0.

```
┌──────────────────────────────────────────────┐
│  void-energy (L1 — public)                   │
│                                              │
│   <Button>, <ActionBtn>, <IconBtn>              │
│   [data-physics], [data-atmosphere]           │
│   --energy-primary, --energy-secondary        │
└──────────────┬───────────────────────────────┘
               │ peer dep
               │
┌──────────────▼───────────────────────────────┐
│  @dgrslabs/void-energy-rive (premium)        │
│                                              │
│   • <RiveCTA> wraps <button> + <canvas>       │
│   • State machine inputs driven by DOM state │
│   • Reads --energy-* tokens into color inputs│
│   • Respects prefers-reduced-motion          │
│   • Ships .riv assets authored by Eric       │
└──────────────────────────────────────────────┘
```

Rive imports `void-energy` as a peer dependency and uses its tokens, but not its components — a `<RiveCTA>` is a native `<button>` + a Rive `<canvas>`, composed in the premium package. Native-First Protocol (CLAUDE.md §5) holds.

### State machine contract (v2 — button era)

The contract between Eric's `.riv` files and DGRS's wrapper code. This is the single most important artifact in this plan: if it's right, Eric can iterate art without touching code, and DGRS can ship new buttons without touching art. If it's wrong, every new button becomes a bespoke integration.

**Obsolete (glass-era v1, do not use):** `bool_Active`, `num_Intensity`, `num_LightX`, `num_LightY`, `trigger_Click`. These were designed for surface glass (mouse position driving a specular highlight). Buttons don't need them.

**v2 inputs (proposed — Eric refines in first design session):**

| Input | Type | Semantic | Driven by |
|---|---|---|---|
| `bool_Hover` | bool | Pointer over button | `pointerenter` / `pointerleave` |
| `bool_Press` | bool | Button currently pressed | `pointerdown` / `pointerup` |
| `bool_Focus` | bool | Keyboard focus | `focus-visible` / `blur` |
| `bool_Disabled` | bool | Disabled state | `disabled` attribute |
| `bool_Loading` | bool | Async action in flight | `data-loading` attribute |
| `trigger_Click` | trigger | Click committed | `click` event |
| `trigger_Success` | trigger | Async succeeded | Consumer calls `.success()` |
| `trigger_Error` | trigger | Async failed | Consumer calls `.error()` |
| `num_Energy` | number (0–1) | Overall intensity | `data-intensity` or prop |
| `color_Primary` | color | Theme energy primary | CSS var `--energy-primary` |
| `color_Secondary` | color | Theme energy secondary | CSS var `--energy-secondary` |

**Non-goals for the contract:**
- No `num_LightX/Y`. Pointer position inside a button is noise — buttons are small.
- No `trigger_Hover/Leave`. The `bool_Hover` is enough; Rive state graph handles entry/exit transitions.
- No atmosphere-name input. Art reads token colors, not atmosphere IDs. Atmosphere-specific art is a separate `.riv` file, not a branch inside one.

**Token bridge (energy colors → Rive color inputs):**

The wrapper reads the resolved CSS variable values via `getComputedStyle(host).getPropertyValue('--energy-primary')` at mount and on atmosphere change (observe `data-atmosphere` on `<html>`), converts to Rive's color format (RGBA number), and writes to the state machine input. This is the one non-trivial integration piece — it makes Rive buttons *atmosphere-reactive* without Eric having to ship 12 variants.

### Physics gating

| Physics | Rive buttons render | Why |
|---|---|---|
| **glass** | Yes (primary target) | The aesthetic where cinematic CTAs belong |
| **flat** | Yes (muted variant) | Flat physics can support Rive but with reduced-intensity art set |
| **retro** | No | Retro is CRT pixel aesthetic — Rive's smooth vectors break the illusion |

Retro gating is a fallback to the native VE button styling (the canvas simply doesn't render). The consumer writes `<RiveCTA>` once; physics gating is automatic. This keeps consumer code clean and respects VE's physics-first discipline.

### Accessibility contract (non-negotiable)

- **Native `<button>` is always the event target.** Rive canvas is `aria-hidden="true"`, positioned absolute inside the button.
- **`prefers-reduced-motion: reduce`** — the canvas does not mount. Button reverts to VE's native `.btn-cta` styling. Zero Rive bytes execute.
- **Keyboard and focus** — driven by native `:focus-visible`. Rive state machine receives `bool_Focus` via the wrapper.
- **Screen readers** — read the native `<button>` label. Canvas invisible to AT.
- **Form integration** — native button inside a form works natively. Rive changes nothing.
- **Low-power / low-end devices** — `navigator.hardwareConcurrency <= 2` or `navigator.connection?.saveData` also fall back to native. Conservative heuristic; revisit after telemetry.

---

## Cost analysis

### Rive pricing (2026)

| Tier | Cost | What it gives |
|---|---|---|
| **Free (individual)** | $0 | 1 editor, public projects, runtime free forever |
| **Pro** | ~$18/editor/month | Private projects, priority support |
| **Team** | ~$45/editor/month | Team libraries, shared assets, roles |
| **Organization** | Custom | SSO, audit logs, large teams |

**Runtime is free forever**, MIT/Apache-licensed depending on the specific runtime package. This is non-negotiable in our favor: consumers of `@dgrslabs/void-energy-rive` pay zero Rive licensing cost.

**Authoring cost:** Eric needs Pro (~$18/mo) for private `.riv` development. That's Eric's cost, or reimbursed by DGRS as a partnership expense — trivial number either way.

**DGRS authoring access:** Dima may want Pro to maintain/hotfix `.riv` files when Eric is unavailable. One seat, $18/mo. Consider it operational cost for the premium package.

### Bundle weight budget

| Surface | Weight |
|---|---|
| Rive runtime (lite) | ~55 KB gzipped |
| Rive runtime (canvas) | ~100 KB gzipped |
| Single `.riv` file | 5–30 KB typical |
| 5 `.riv` files (v0 button pack) | ~50–150 KB total |
| Wrapper component code | <5 KB |

**Total budget for v0 consumer who uses one button:** ~110–150 KB gzipped. Acceptable for a premium opt-in package; the consumer explicitly installed it.

Compare: `framer-motion` ~35 KB, `gsap` ~50 KB core + plugins. Rive is heavier but delivers a category of animation CSS libraries simply cannot.

### DGRS-side operational cost

- Rive Pro seat for Eric: ~$18/mo
- Rive Pro seat for Dima (optional): ~$18/mo
- **Total: ~$20–40/month.** Noise.

---

## Timing — why this ships after all four phases

Every prior premium package ships during Phase 3b. Rive is different. Four reasons to defer:

1. **Eric's delivery is decoupled.** His timeline is not controlled by the DGRS roadmap. Forcing Rive into a phase would either block the phase or ship an empty package.
2. **Phase 4 (CoNexus) validates the button vocabulary.** Until CoNexus exists on VE, we don't know which buttons need Rive. Shipping a button pack before the consumer exists risks shipping the wrong five.
3. **The partnership deal (decisions.md §D18) ideally closes after Phase 1 ships.** Eric sees a finished system first, deal is cleaner, expectations are grounded.
4. **Runtime weight needs CoNexus telemetry.** Deciding between `canvas-lite` and `canvas` benefits from real consumer data. Shipping Rive before CoNexus means guessing that budget.

**What Phase 3b does ship:** the empty scaffold (`packages/rive/`), the package name reserved on GitHub Packages, a stub README saying "under active development." This is enough for Phase 4 to import the package without having to restructure when real content lands.

**What this plan ships:** the state machine contract v2, the wrapper component, the token bridge, the first button pack from Eric, the accessibility floor, the showcase recipes, the decision on runtime tier, and the physics-gating logic.

---

## Out-of-the-box consumer experience

```bash
npm install @dgrslabs/void-energy-rive
```

```svelte
<script lang="ts">
  import { RiveCTA } from '@dgrslabs/void-energy-rive';

  async function begin() {
    // start story flow
  }
</script>

<RiveCTA variant="ignite" onclick={begin}>Begin the Story</RiveCTA>
```

Built-in variants (target v0 — names placeholder, Eric's call):
- `ignite` — the hero CTA. Breathing, charging, detonation on press.
- `portal` — story entry/exit. Inward collapse on press, outward bloom on success.
- `pulse` — subtler. For secondary-but-important actions.
- `async` — designed around loading→success/error. Minimal hover state, rich outcome states.
- `cinema` — "full budget." For marketing pages only. The reel piece.

For async flows, imperative API:

```svelte
<script lang="ts">
  let cta: ReturnType<typeof RiveCTA>;

  async function submit() {
    cta.loading(true);
    try {
      await doThing();
      cta.success();
    } catch {
      cta.error();
    }
  }
</script>

<RiveCTA bind:this={cta} variant="async" onclick={submit}>Submit</RiveCTA>
```

**Zero configuration.** Token colors wire automatically. Atmosphere changes reflect live. Reduced-motion users get a native button. Retro users get a native button. Forms work.

---

## Prerequisites (must be true before real work starts)

- **All four roadmap phases have shipped.** Non-negotiable. Rive is the polish layer on a complete system.
- **Eric partnership confirmed** (decisions.md §D18 — revenue share, not equity). Signed, documented, boundaries clear.
- **Phase 3b scaffold present** — the package exists on GitHub Packages with a placeholder, so v0 is a content drop, not a repo-surgery exercise.
- **CoNexus running on VE in production** — gives real consumer context for which buttons matter.
- **VE native `.btn-cta` is finalized** — Rive extends this, doesn't replace it. Any last CSS `.btn-cta` iteration happens first.
- **Accessibility floor agreed** — the reduced-motion fallback path is cleanly testable before any `.riv` asset is authored.
- **Token bridge prototype validated** — the `getComputedStyle` → Rive color input pipeline tested on at least 2 atmospheres before Eric commits to an art direction.

---

## Sequencing (once this ships)

Don't ship everything at once. Order:

1. **Confirm the state machine contract v2** with Eric, in writing, before any art is authored. One document. One diagram. One table of inputs. This is the single highest-leverage hour in the whole package.
2. **Build the wrapper component and token bridge first**, against a stub `.riv` file with the v2 state machine and placeholder art. Prove the integration end-to-end before Eric does expensive art.
3. **Eric authors `ignite` variant first** — the hero CTA. Ship that alone as v0.1.0. Showcase picks it up.
4. **Measure runtime cost on real hardware**, especially mobile. Decide: stay on `canvas-lite` or upgrade to `canvas`?
5. **Ship `portal` and `async` variants next** — driven by CoNexus's actual needs.
6. **Ship `pulse` and `cinema` last**, if still compelling after 3 variants are in production.
7. **Decide on flip-to-public** (decisions.md §D17). If the partnership narrative benefits from co-branded open Rive assets, flip `publishConfig` and republish. KT/DGRS/Ambient stay private.

**What v0 looks like:** one variant (`ignite`), wrapper component, token bridge, accessibility floor, reduced-motion fallback, physics gating. That's a shippable launch surface. Everything else is expansion.

---

## Open questions / decisions to make later

These are the real trade-offs. None need a decision today.

- **Which runtime tier?** `canvas-lite` (~55 KB) if art fits; `canvas` (~100 KB) if not. Decide after Eric's first variant is authored.
- **One `.riv` with variants, or one `.riv` per variant?** One file with 5 state-machine variants is cheaper to load; separate files tree-shake better. Depends on consumer patterns.
- **Per-atmosphere `.riv` variants?** A token-bridged single asset *should* adapt to any atmosphere. But some atmospheres (e.g. Blood Moon) may want bespoke art. Decide variant-by-variant; default is "one art, token-driven."
- **`.riv` versioning and upgrade path.** If Eric ships a new version of `ignite`, how do consumers opt in vs stay on the old one? Probably semver on the package, but individual `.riv` versioning may need its own discipline.
- **Do we ship source `.riv` files to consumers?** Probably not — just the compiled runtime assets. Source is Eric's IP per §D18. This also prevents consumers from forking the art.
- **Rive editor licensing for DGRS.** One seat minimum so Dima can hotfix. Second seat if Eric wants a collaborator. Decide at partnership close.
- **Stacking Rive with narrative effects.** A button that is both a `RiveCTA` and has a `use:narrative` entry effect — do the two animations compose or conflict? Needs a composition test early.
- **Rive assets in `git`.** Binary files bloat git history. Consider Git LFS for `.riv` assets in the premium repo.
- **License terms for the `.riv` files themselves.** The wrapper code is BSL (or whatever the premium repo license becomes). The `.riv` files are Eric's IP. Distribution rights need to be explicit in the partnership doc — see decisions.md §D18.
- **Flip-to-public timing.** §D17 enables it; the partnership story decides when. After Phase 4? With the first paying customer? After one viral showcase demo? No need to commit in advance.

---

## Honest tradeoffs

**Single-artist bus factor.** This is the biggest structural risk. If Eric stops, the package stops being updated. Revenue share continues on shipped assets (§D18), so consumers aren't stranded, but the catalog freezes. Mitigations: Dima maintains Rive editor access, documents state-machine-authoring conventions, and has a path to commission replacement art if ever needed. The package is deliberately narrow in scope (5% of surfaces) so the risk is bounded.

**Runtime weight is real.** 100 KB is not free, even for a premium opt-in. A consumer who uses one Rive button on one page pays for the full runtime on every page that loads it. Code-split aggressively — the runtime loads only on pages that actually mount a `RiveCTA`. This is a Phase 4 showcase-level concern.

**Rive is a moving target.** The `@rive-app/*` packages have had breaking changes historically. Pin versions tightly. Don't chase every new runtime release. Test upgrades against every shipped `.riv` before publishing.

**The demo may overshadow the substance.** Rive buttons are the easiest thing in all of VE to screenshot. There's a real risk that the package becomes the marketing face of VE while the actual engineering moat (L0 + L1 + L2) goes underappreciated. Accept this — the reel piece is the reel piece — but don't confuse it with the product.

**`.riv` files are opaque to code review.** A git diff on a `.riv` is `Binary files differ`. Eric ships an update, DGRS accepts it on faith unless manually loading and auditing in the editor. Build a small QA harness: load every `.riv`, verify state machine inputs match v2 contract, check file size is under budget. Gate `npm publish` on the harness passing.

**Retro physics exclusion is fine, actually.** Users on retro don't expect cinematic smoothness — they expect CRT phosphor. Falling back to native buttons in retro isn't a gap, it's a feature. Don't feel pressure to "fix" it.

---

## Related plans

- [../phase-3b-premium-packages.md](../phase-3b-premium-packages.md) — Phase 3b scaffolds the Rive package slot and reserves the name on GitHub Packages
- [../phase-4-conexus-migration.md](../phase-4-conexus-migration.md) — CoNexus is the first real consumer whose button vocabulary drives v0 content
- [../decisions.md#d17--selective-publishing-via-publishconfig](../decisions.md) §D17 — selective publishing, Rive as a flip-to-public candidate
- [../decisions.md#d18--eric-jordan-deal-revenue-share-no-equity](../decisions.md) §D18 — Eric partnership terms
- [./i18n.md](./i18n.md) — sibling future plan; Rive buttons will get a locale-aware label swap when i18n ships
