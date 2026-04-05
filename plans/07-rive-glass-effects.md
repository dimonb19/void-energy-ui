# 07 — Rive Glass Effects Package: `@dgrslabs/void-energy-rive`

> Animated glass material effects via Rive — light/shadow, cursor-following specular, click ripples — exclusively for the glass physics preset.

**Status:** Planning — Dima building the `.riv` file, then integration scaffold
**Updated:** 2026-04-04
**Depends on:** 02-premium-repo (package lives in premium monorepo)
**Blocks:** Nothing (decoupled from wave timeline — not blocking launch or CoNexus)

---

## Goal

Add animated glass material effects via Rive that layer on top of the existing CSS glass physics (`backdrop-filter: blur`, semi-transparent backgrounds, neon glow). The Rive layer adds what CSS cannot: cursor-tracking light, click reactions, and subtle animated texture that makes glass surfaces feel like real optical material.

**Rive is glass-only.** Not in the DOM for flat or retro physics. No subtle variants, no degraded versions — flat is deliberately clean (no animations belong there), retro is CRT (no glass exists there). The physics presets must feel distinctly different; Rive bleeding across them would dilute all three.

**Color approach: white only.** Light reflections on glass are physically white. The atmosphere's energy color already comes from CSS (border glow, box-shadow). Rive draws white light effects — universally correct across all atmospheres, zero dynamic color complexity.

**Core architecture principle:** Rive owns one thing — animated glass material effects. It doesn't know about physics presets, color modes, or atmospheres. VoidEngine controls when Rive activates (`bool_Active`) and how strong the effect is (`num_Intensity`). CSS glass physics remains unchanged — Rive adds a visual layer on top.

---

## Rive Plan

**For development:** Pick the tier that gives unlimited files, version history (important when iterating), custom fonts, and private files (important before launch). Verify current offerings at rive.app/pricing. Budget ~$9-25/mo.

**Runtime is MIT** regardless of plan — zero production restrictions on any tier.

**Enterprise ($120/mo)** is for positioning, not development. You'd want it after Eric connects you with the Rive team — for partnership visibility, shared workspaces, co-marketing. Don't spend that money yet.

---

## How It Works in the Browser

### The Layer Cake

```
┌─────────────────────────────────────────────┐
│  Rive <canvas>  (transparent)      z-index: 2│  ← white light effects only
│  position: absolute; inset: 0                │     pointer-events: none
│  pointer-events: none                        │     border-radius: inherit
├─────────────────────────────────────────────┤
│  UI Content (buttons, text)        z-index: 1│  ← interactive DOM elements
├─────────────────────────────────────────────┤
│  CSS Glass Material                z-index: 0│  ← backdrop-filter: blur(20px)
│  surface-raised + glass-blur                 │     background gradient, border glow
└─────────────────────────────────────────────┘
│  Page content (blurred by CSS backdrop)      │
```

- **CSS owns:** frosted blur, transparency, seeing content scroll behind, border glow, box-shadow, energy color tinting
- **Rive owns:** animated white light — specular highlight, edge glow, click ripple, subtle mesh texture
- The canvas is transparent — Rive draws only its shapes, everything else is see-through
- `pointer-events: none` — clicks pass through to the UI below
- `border-radius: inherit` + parent `overflow: hidden` — canvas clips to any shape (pill nav island, rounded modal, etc.)

### DOM Presence

```svelte
{#if isGlassPhysics}
  <canvas class="rive-overlay" ...></canvas>
{/if}
```

**Not hidden — literally not in the DOM** for flat/retro. Zero overhead. No canvas element, no WASM instance, no render loop. Only materializes when `data-physics="glass"`.

### Dynamic Color — Why White is Enough

Rive supports dynamic color through three approaches (Data Binding, low-level API, CSS tinting), but **we don't need any of them for v0.1:**

- Light reflections on glass are physically white — that's correct across all atmospheres
- The atmosphere's energy color already comes from CSS (border glow, box-shadow, neon halos)
- White Rive effects + colored CSS glow = complete glass material
- If colored Rive effects are needed later, Rive's Data Binding (View Models) can pass runtime colors to shapes — but don't add this complexity now

---

## State Machine Architecture

Rive gets **5 inputs**. The Svelte adapter owns all physics/atmosphere/mode complexity.

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `bool_Active` | boolean | false | Glass on/off. VoidEngine flips this. |
| `num_Intensity` | number | 0 | Overall effect strength (0–1). |
| `num_LightX` | number | 0.5 | Cursor X position (0–1). Drives specular + click position. |
| `num_LightY` | number | 0.5 | Cursor Y position (0–1). Drives specular + click position. |
| `trigger_Click` | trigger | — | Fire on click. Plays radial ripple pulse at LightX/LightY. |

**What Rive does NOT know:** physics preset, color mode, atmosphere, per-layer intensities. The adapter maps `data-physics="glass"` → `bool_Active=true, num_Intensity=0.7`. Everything else → not in DOM.

---

## The Glass Effect — What to Build in Rive

### File: `glass-surface.riv`
One file. One artboard (1000x1000). One state machine. Three effect layers + one interaction.

### Effect 1 — Ambient Light/Shadow (always running)
**What it is:** A subtle light-to-shadow gradient across the surface. Bright area top-left, darker bottom-right — suggests the surface is curved glass catching light from above.

**How to build:**
- Large rectangle covering the artboard
- Linear gradient fill: white at ~8% opacity (top-left) → black at ~5% opacity (bottom-right)
- Blend mode: **Screen** (light adds, dark stays invisible)
- Very slow drift animation (~8-10s cycle) — the "light source" subtly shifts position so the surface feels alive, not static
- Opacity scaled by `num_Intensity`

**Why it matters:** This is the base layer that makes every glass surface feel three-dimensional even without interaction. Barely visible — you notice it subconsciously.

### Effect 2 — Cursor Light (interaction)
**What it is:** A soft white radial glow that follows the cursor across the surface. Like holding a flashlight behind frosted glass.

**How to build:**
- Ellipse shape with radial gradient fill (white center at ~15-20% opacity → transparent edge)
- Blend mode: **Screen**
- Size: ~30-40% of artboard width, ~20-30% height
- Position driven by `num_LightX` / `num_LightY` (0–1 mapped to artboard coordinates)
- Smooth follow with slight easing — don't snap to cursor, let it drift toward it (feels physical, like light diffusing through glass)
- When cursor leaves: glow drifts back to center and fades slightly (idle state)
- Opacity scaled by `num_Intensity`

**Why it matters:** This is the "wow" effect. Most people have never seen a web UI surface react to their cursor with realistic light behavior. High impact, immediately noticeable.

### Effect 3 — Mesh Distortion (subtle texture)
**What it is:** A barely-visible warping texture that suggests optical imperfection in the glass. Content doesn't actually distort (impossible in CSS/Rive) — instead, a semi-transparent noise pattern shifts slowly, creating the *illusion* of refraction.

**How to build:**
- Import a Perlin noise PNG as image asset (very low contrast, semi-transparent)
- Apply mesh deformation to the image (Rive's mesh tool)
- Slowly oscillate mesh vertices in a wave pattern (~8s cycle)
- Blend mode: **Overlay** at 5-8% opacity
- Very subtle — viewer barely notices it consciously, but it adds "life" and organic quality
- Strength scaled by `num_Intensity`

**Why it matters:** This is the difference between "frosted rectangle" and "actual glass material." The subtle imperfection makes the brain accept it as a physical object.

### Interaction — Click Ripple
**What it is:** When you click on a glass surface, a brief radial pulse of light expands from the click point. Like tapping on actual glass and seeing a ripple of light.

**How to build:**
- Circle shape with radial gradient (white center → transparent edge)
- Starts at ~10% of artboard size, expands to ~60% over ~300ms
- Opacity fades from ~25% → 0 during expansion
- Position set by `num_LightX` / `num_LightY` at the moment `trigger_Click` fires
- Blend mode: **Screen**
- One-shot animation — plays once on trigger, then shape returns to invisible

**Why it matters:** Gives glass surfaces tactile feedback. Makes the UI feel responsive and physical — "this surface reacted to my touch."

### State Machine States

- **Active** — ambient light drifts, cursor light follows pointer, mesh distortion loops, click ripple ready (when `bool_Active=true`)
- **Inactive** — all layers at 0 opacity, animations stopped (when `bool_Active=false`)
- **Transition in:** 300ms fade (glass activates)
- **Transition out:** 500ms fade (slower exit for elegance — the glass "dims" before disappearing)

---

## Integration Map — 2 Touch Points, 9 Surfaces

The entire Rive glass integration requires adding `<RiveOverlay />` in exactly **2 components**. Every other glass surface stays CSS-only (already good enough for small/transient elements).

### Touch Point 1: `Navigation.svelte` (1 addition → 3 surfaces)

All three nav surfaces live in one component (`src/components/Navigation.svelte`). Add `<RiveOverlay />` once and it covers:

| Surface | Shape | Notes |
|---------|-------|-------|
| **Mobile top island** | `border-radius: var(--radius-full)` — pill | Floating glass pill. Ideal showcase surface. |
| **Mobile bottom island** | `border-radius: var(--radius-full)` — pill | Same — floating pill, always visible. |
| **Desktop nav bar** | `border-radius: 0` — full-width, square | Square corners don't diminish the effect — specular drifting across a wide bar looks great (think MacOS menu bar). |

**Requirements:** Parent needs `overflow: hidden` to clip canvas to pill shape on mobile. Already has `position: fixed` and `glass-blur`.

### Touch Point 2: `Modal.svelte` (1 addition → 6 surfaces)

Modal is defined once in Layout (`src/components/Modal.svelte`), renders all fragments via modal manager. Add `<RiveOverlay />` inside the `<dialog>` surface once → every modal gets glass effects automatically:

| Fragment | Gets Rive | Notes |
|----------|----------|-------|
| **Settings** | Free | Large surface, high visual impact |
| **Themes** | Free | Theme switching showcase — perfect for glass demo |
| **Shortcuts** | Free | |
| **Command Palette** | Free | Premium feel, high-attention moment |
| **Alert** | Free | |
| **Confirm** | Free | |

**Requirements:** `<dialog>` already has `position: fixed` and `glass-blur`. Border radius is `calc(var(--radius-base) * 2)` (16px) — generous rounding. The cursor-tracking specular on a large modal surface will be the most visually impressive instance.

### Surfaces That Stay CSS-Only Glass

| Surface | Why No Rive |
|---------|------------|
| **Dropdown** | Too small and transient. Appears for 1-2 seconds. Spinning up a WASM context for that is wasteful. |
| **Tooltip** | Tiny, dynamically created/destroyed via raw JS (`void-tooltip.ts`), not a Svelte component. Would need significant refactoring. |
| **Toast** | Auto-dismisses in 3-6 seconds. Multiple toasts stack — potentially 3-4 WASM instances for ephemeral notifications. |
| **Breadcrumbs** | Very thin strip (~32px tall). Light effects wouldn't be visible. |
| **Sidebar** | Mixed positioning (fixed on mobile, sticky on desktop). Not a clear "floating glass" surface. Easy to add later if needed. |

**These surfaces already look good with CSS-only glass.** The `backdrop-filter: blur` + `surface-raised` + neon glow is sufficient for small/transient elements. Rive is reserved for the hero surfaces where the effect has room to breathe and is visible long enough to notice.

---

## Phase 1 — Integration Scaffold

Build `RiveOverlay.svelte` and the adapter. Ships as a placeholder — renders nothing until a `.riv` file exists. The integration point is ready whenever the `.riv` file is built.

### Component: `RiveOverlay.svelte`
- Renders a `<canvas>` only when `data-physics="glass"` (otherwise: not in DOM)
- Canvas: `position: absolute; inset: 0; pointer-events: none; border-radius: inherit`
- Creates Rive instance with `@rive-app/webgl2` (peer dep, best performance)
- State machine input wiring: `bool_Active`, `num_Intensity`, `num_LightX`, `num_LightY`, `trigger_Click`
- Pointer tracking on **parent element** (canvas has `pointer-events: none`)
- Click tracking on parent: captures click position → sets `num_LightX`/`num_LightY` → fires `trigger_Click`
- `$effect` cleanup calls `rive.cleanup()` — WASM won't garbage collect without this
- Graceful fallback: no `.riv` file → renders nothing, no errors

### Adapter: `void-energy-host.ts`
Following the pattern from `packages/kinetic-text/src/adapters/void-energy-host.ts`:
- Reads `data-physics` from `<html>` element
- `glass` → `bool_Active=true`, `num_Intensity=0.7`
- Anything else → component not in DOM (no adapter call needed)

### Where to Add `<RiveOverlay />`

```svelte
<!-- Navigation.svelte — inside the nav-bar container -->
<header class="nav-bar">
  <!-- existing nav content -->
  <RiveOverlay />
</header>

<!-- Modal.svelte — inside the dialog surface -->
<dialog>
  <div class="modal-surface">
    <!-- existing modal content / fragments -->
    <RiveOverlay />
  </div>
</dialog>
```

That's it. Two lines. Nine glass surfaces enhanced.

### Performance Guards
- **Not in DOM** for flat/retro — zero overhead by default
- **IntersectionObserver** — pause Rive instances when scrolled off-screen
- **`useOffscreenRenderer: true`** — shares WebGL context when 3+ instances exist (nav + modal + any visible overlay = potentially 3)
- **Lazy load** — fetch `.riv` file only when surface enters viewport
- **Instance cap** — max 3 active Rive overlays simultaneously
- **`prefers-reduced-motion`** — component not rendered
- **Budget:** < 5ms per frame on mid-range mobile

---

## Phase 2 — Build the `.riv` File (Dima in Rive editor)

### Rive Editor Learning Path

| # | Topic | Time | Why |
|---|-------|------|-----|
| 1 | Artboard + shapes + fills + gradients | 1 hour | Build the specular ellipse, edge rectangles, noise background |
| 2 | State machines + inputs | 2 hours | Wire bool/number/trigger inputs to drive the effects |
| 3 | Blend modes (Screen, Add, Overlay) | 1 hour | Light accumulation — critical for all glass layers |
| 4 | Mesh deformation | half day | The distortion texture — animate vertex positions on a mesh |
| 5 | Listeners (pointer tracking) | 1 hour | Optional: Rive-internal pointer-to-input mapping (we also do this in Svelte, but useful to understand) |
| 6 | Clipping/masking | 30 min | Constrain effects to artboard boundaries |

**Resources:**
- **rive.app/learn** — official tutorials (start here)
- **Rive YouTube channel** — mesh deformation and state machine tutorials are most relevant
- **rive.app/community** — search: "glass", "glow", "cursor follow", "specular", "light effect"

### Glass Optics Research (do before building)
- **Apple visionOS HIG** → "Materials" section — specular, edge glow, shadow behavior documented with examples
- **iOS/macOS dark mode** — screenshot Spotlight search, notification panel, control center. Zoom in on edges and highlights
- **Physical glass** — hold a glass over text, tilt it under a lamp. Watch how the highlight moves, how edges brighten (Fresnel reflection), how content subtly warps

### Build Order in the Editor
1. Create artboard (1000x1000), transparent background
2. Add state machine with the 5 inputs
3. Build the ambient light/shadow gradient (Effect 1) — test with `num_Intensity` controlling opacity
4. Build the cursor light ellipse (Effect 2) — test with `num_LightX`/`num_LightY` controlling position
5. Build the click ripple (Interaction) — test with `trigger_Click`
6. Build the mesh distortion (Effect 3) — import noise PNG, apply mesh, animate vertices
7. Wire `bool_Active` to fade all layers in/out
8. Export `.riv` file

---

## Phase 3 — Integration Test

- Drop `.riv` file into the scaffold (`assets/glass-surface.riv`)
- Verify: activates on glass physics, not in DOM for flat/retro
- Verify: specular follows cursor smoothly
- Verify: click ripple fires at correct position
- Verify: switching atmospheres doesn't break/leak canvas instances
- Verify: `prefers-reduced-motion` removes component from DOM
- Performance check: < 5ms per frame, smooth with CSS transitions

---

## Phase 4 — Showcase & Eric's Review

### Showcase Page
Create `RiveGlass.svelte` in `src/components/ui-library/`:
1. Isolated glass card with all effects — toggle each layer individually
2. Physics switching demo — glass → flat → retro, showing clean removal from DOM
3. Interactive pointer demo — specular clearly following cursor
4. Click ripple demo — tap/click and see the light pulse
5. Real surface demo — nav bar, modal, sidebar with overlay applied in context

### What to Show Eric
1. The full Void Energy system switching live (all physics + all atmospheres)
2. The Rive glass prototype embedded and responding to physics state
3. Specific asks: "polish the specular shape/softness, improve edge glow timing, refine the click ripple, suggest additional effects (internal reflections? chromatic aberration? particle effects?)"
4. When Eric likes it → he connects us with Rive team for potential partnership

**Eric's expected contribution:** Rework all visual craft — gradient shapes, timing curves, blend modes, mesh topology, opacity levels. The code architecture and 5 state machine inputs stay as-is. He tweaks the `.riv` file; integration code doesn't change.

---

## Package Structure

```
packages/rive/
├── assets/
│   ├── glass-surface.riv          ← Built in Rive editor (binary)
│   └── noise-texture.png          ← Perlin noise for mesh distortion layer
├── src/
│   ├── components/
│   │   └── RiveOverlay.svelte     ← Primary overlay component
│   ├── adapters/
│   │   └── void-energy-host.ts    ← DOM state reader (physics → bool_Active + num_Intensity)
│   ├── constants.ts               ← Default intensity values, performance thresholds
│   ├── types.ts                   ← RiveOverlayProps, RiveGlassConfig
│   └── index.ts                   ← Public exports
├── package.json
├── README.md
├── PACKAGE.md                     ← Interface spec
├── CHANGELOG.md
└── tsconfig.json
```

**Peer dependencies:** `svelte ^5.0.0`, `@rive-app/webgl2 ^2.0.0`
**No dependency on `void-energy`** at package level — the adapter reads DOM attributes directly (same pattern as KT).

---

## Realistic Expectations

**What we CAN achieve:**
- Cursor-tracking specular highlight — very close to Apple quality, immediate wow-factor
- Click ripple — tactile, physical, nobody does this on the web
- Edge glow breathing — polished, premium feel
- Mesh distortion texture — subliminal "real glass" quality
- Result: significantly more alive and premium than 99% of web apps

**What we CANNOT achieve:**
- True content distortion (HTML warping through glass) — requires native GPU shaders
- Apple visionOS pixel-for-pixel quality — custom Metal shaders on dedicated hardware

**The gap is small.** Specular + click ripple alone will make a dramatic difference. Most viewers won't notice the missing true refraction.

---

## Execution Order

```
1. Sign up for Rive (tier with version history + private files)
2. Learn Rive editor (learning path above, ~1 week)
3. Study glass optics references (concurrent with #2)
4. Build glass-surface.riv in Rive editor
5. Build integration scaffold (RiveOverlay.svelte + adapter)        ← AI-assisted
6. Wire .riv into scaffold, integration test
7. Build showcase page                                              ← AI-assisted
8. Boss review of full system
9. Send live site URL to Eric Jordan
10. Eric polishes .riv + connects us with Rive team
```

---

## Verification Checklist

### Rive Editor
- [ ] Rive plan active, editor accessible
- [ ] glass-surface.riv built with all 3 effects + click ripple
- [ ] State machine has 5 inputs: `bool_Active`, `num_Intensity`, `num_LightX`, `num_LightY`, `trigger_Click`
- [ ] All effects use white only — no colored fills
- [ ] Transparent artboard background

### Integration
- [ ] RiveOverlay.svelte added to `Navigation.svelte` (1 line → 3 nav surfaces)
- [ ] RiveOverlay.svelte added to `Modal.svelte` (1 line → 6 modal surfaces)
- [ ] Not in DOM for flat/retro physics — zero overhead
- [ ] Canvas clips to pill shape on mobile nav (`overflow: hidden`)
- [ ] Canvas clips to rounded modal corners

### Behavior
- [ ] Specular highlight follows cursor via `num_LightX` / `num_LightY`
- [ ] Click ripple fires at correct position via `trigger_Click`
- [ ] Ambient light/shadow drifts subtly
- [ ] Mesh distortion barely visible but adds texture
- [ ] All effects fade out 500ms when leaving glass physics
- [ ] `prefers-reduced-motion` removes component from DOM entirely

### Performance
- [ ] IntersectionObserver pauses offscreen instances
- [ ] `useOffscreenRenderer: true` when 3+ instances visible
- [ ] < 5ms per frame on mid-range mobile

### Delivery
- [ ] Showcase page demonstrates all effects + physics switching
- [ ] Package follows premium repo structure (PACKAGE.md spec)
- [ ] Boss review complete
- [ ] Live site URL sent to Eric Jordan

---

## Key Reference Files
- `src/components/Navigation.svelte` — touch point 1 (add RiveOverlay here)
- `src/components/Modal.svelte` — touch point 2 (add RiveOverlay here)
- `src/styles/components/_navigation.scss` — nav glass-blur, pill border-radius, overflow
- `src/styles/components/_dialogs.scss` — modal glass-blur, dialog positioning
- `packages/kinetic-text/src/adapters/void-energy-host.ts` — adapter pattern to replicate
- `packages/kinetic-text/package.json` — package.json pattern to follow
- `src/styles/abstracts/_mixins.scss` — glass-blur mixin, when-glass/when-flat/when-retro
- `plans/02-premium-repo.md` — premium repo architecture (Rive = 4th package)
