# WebGL Package — Future Premium Package

> Shader-driven canvas effects for moments CSS and SVG cannot reach, shipped as `@dgrslabs/void-energy-webgl`. Three deliberate surfaces only: enriched ambient layers, hero/showcase scene backgrounds, and cinematic page transitions. A premium visual layer for atmosphere, not a general 3D framework.

**Status:** Parked research (captured 2026-04-19). Not a scheduled phase. Phase 3b may optionally reserve the package slot alongside `packages/rive/` — the actual content (effect catalog, runtime, token bridge, component layer) lands after all four roadmap phases ship.
**Consumes:** Requires Phase 3b (premium repo exists). Benefits from Phase 4 (CoNexus is the first real consumer whose ambient and transition needs validate the effect catalog) and Phase 2 (mobile perf data shapes the runtime budget).
**Blocks:** Nothing. The package is additive — every existing visual surface continues to function with SVG/CSS only. Missing WebGL = missing atmospheric depth on three specific surfaces, not missing functionality.

---

## Why this exists

Void Energy's ambient layer system, hero surfaces, and page transitions are already expressive — SVG `<circle>` particles, SCSS keyframes, `feTurbulence` filters, and continuous `--ambient-level` decay carry most atmospheres convincingly. But three surfaces share the same ceiling:

1. **Heavy ambient variants** — storm, nebula, dense smoke, plasma. SVG particles top out at a few hundred elements before the DOM cost dominates. Volumetric depth is impossible in SCSS.
2. **Hero / showcase backgrounds** — the marketing surface and the showcase reel. Static gradients and CSS animation reach a quality floor that defines whether VE looks like a *system* or like a *product*.
3. **Cinematic page transitions** — between routes, between story chapters, between modal layers. CSS transitions can fade and slide, but they can't displace, ripple, or warp.

GPU-driven canvas effects exist for exactly this gap. A fullscreen fragment shader runs the same nebula at 60fps that 800 SVG particles would choke on. A mesh-gradient hero authored once token-drives across every atmosphere. A TSL-authored transition shader composes with the existing morph/dissolve actions without rewriting them.

Void Energy's visual thesis — dark, energetic, precise, atmospheric — is exactly what shader-based effects do best. This package is the bridge between that aesthetic and the surfaces where SVG's ceiling is visible.

It is a **premium-only** package. There is no free tier. Same open/closed pattern VE uses everywhere — open what builds community (L0 + L1), close what builds moat (atmospheric polish).

---

## Strategic framing

> **Three surfaces. No more.** The package's value comes from being narrow and excellent, not broad and average.

The rejected scope (deliberately, see "Out of scope" below) reads like a typical 3D-on-the-web framework: atmosphere preview tiles, 3D component demos, data viz, configurators, AR/VR. All technically possible. All wrong for this package. None of them reinforce VE's thesis; all of them dilute it.

The accepted scope is what the system *already does* but at a quality ceiling raised by an order of magnitude — better ambient layers, better hero surfaces, better transitions. The package extends existing surfaces; it does not invent new ones.

**What makes WebGL structurally different from the other premium packages:**

| Dimension | KT / DGRS / Ambient-Layers | Rive | WebGL |
|---|---|---|---|
| Source of craft | Dima / DGRS | External artist (Eric Jordan) | Dima / shader code |
| Runtime dependency | None (pure web tech) | Rive runtime (~55–130 KB) | Shader runtime (~25–200 KB depending on tier) |
| Authoring tool | Editor + tokens | Rive editor + .riv binary | Code (TSL or GLSL/WGSL fragments) |
| Asset format | Source code | Binary `.riv` files | Source code (shaders + uniforms) |
| Update cadence | Continuous (PRs) | Punctuated (Eric ships a pack) | Continuous (PRs) |
| Bus factor | Internal | Single-artist dependency | Internal |

WebGL shares Rive's "canvas-as-visual-enhancement" pattern but inherits none of Rive's external-artist coupling. It ships at the cadence of code, not art.

---

## The pitch — three concrete demos

The three surfaces, each with the demo that justifies the package:

### 1. Ambient Layers — the nebula upgrade

```svelte
<!-- Today (SVG particles, ~150 <circle> elements) -->
<AtmosphereLayer variant="nebula" intensity="high" />
```

The current SVG path looks fine at low intensity, frays at high intensity (DOM cost), and cannot do volumetric depth or fluid motion. The WebGL upgrade is **a drop-in replacement at the consumer site** — same component name, same props — but mounts a fullscreen canvas with a shader-driven nebula: 100,000+ particles via instanced GPU draws, fluid-noise-driven motion, depth fog, atmosphere-tinted color pulled from `--energy-primary`. Same `--ambient-level` decay drives shader uniforms; the SCSS continues to control fade, the canvas just renders the body.

If the package isn't installed, the SVG path renders. If the consumer's device fails the perf gate or sets `prefers-reduced-motion`, the SVG path renders. The contract for the consumer is identical.

### 2. Hero / Showcase Scenes

```svelte
<HeroCanvas variant="meshGradient" reactivity="cursor" />
<!-- positioned absolute behind hero content; aria-hidden; pointer-events: none unless reactive -->
```

A signature, atmosphere-reactive shader background for the showcase site (`void.dgrslabs.ink`) hero, marketing pages, and CoNexus's landing surface. Built-in variants are deliberately few (target 3–5 in v0 — see Sequencing). Each variant takes one or two parameters and reads token colors. No per-page custom shaders — the catalog *is* the API.

### 3. Cinematic Page Transitions

```svelte
<!-- In a layout, around <slot /> -->
<PageTransition variant="ripple">
  <slot />
</PageTransition>
```

Shader-driven displacement effects between route changes. Composes with VE's existing transition system (`emerge`, `dissolve`, `materialize`) — does not replace it. The existing transitions handle layout-aware enter/exit; the canvas handles the *moment between* — a single-frame ripple, a brief warp, a chromatic separation that resolves into the new page. Lives in the layout, fires on `astro:page-load`.

For all three: **the canvas is purely visual**. Native HTML, focus, keyboard, ARIA, and form integration are untouched. The canvas is `aria-hidden="true"`, positioned absolute, `pointer-events: none` (except for the cursor-reactive hero variant, which still does not intercept clicks).

---

## WebGL tech landscape (2026)

### What's stable, what changed

- **WebGPU is production-ready.** Three.js r171+ ships a `WebGPURenderer`. Safari 26 (Sept 2025) added support. ~95% of users have WebGPU-capable browsers; the rest get WebGL2 fallback automatically when initialized correctly.
- **TSL (Three Shader Language)** is the new node-based shader API — renderer-agnostic, compiles to both WGSL and GLSL. Authoring shaders in TSL future-proofs the package against the WebGL→WebGPU transition. Even if v0 ships GL-only at runtime, source shaders should be authored in TSL where possible.
- **Compute shaders** (WebGPU only) unlock particle counts and simulations impossible with WebGL. Not needed for v0, but the architecture should not preclude them.

### Library options, ranked for VE fit

| Library | Bundle (gz) | Pros | Cons | VE fit |
|---|---|---|---|---|
| **OGL** | ~25 KB | Tiny; zero-dep; ES6 modules; close to raw WebGL | No high-level features; smaller ecosystem | **Best default tier** — handles all three surfaces if scope stays disciplined |
| **Paper Shaders** | <10 KB/shader | Zero-dep; purpose-built for 2D backgrounds; preset-based | 2D only — no 3D camera/lighting | **Best for hero variants** — the MeshGradient class fits exactly |
| **Three.js (raw)** | ~168 KB | Full ecosystem; battle-tested; WebGPU-ready; TSL support | Bundle weight is the floor, not the ceiling | **Reserve for true-3D scenes** — only via opt-in sub-export |
| **Threlte** | ~200 KB+ | Idiomatic Svelte; declarative; mirrors Three.js 1:1 | Threlte+Three doubled; Svelte 5 runes mode still maturing | Not v0. Consider if 3D scope ever expands. |
| **Custom WebGL** | <5 KB | Smallest possible | Maximum hand-written code; rebuild everything | One-off signature shaders only |

### The dual-tier decision

**Default tier (v0):** OGL + Paper Shaders for ambient, hero, and transitions. Total runtime cost ~30 KB gzipped. Ships first.

**Optional tier (later):** A `@dgrslabs/void-energy-webgl/three` sub-export that pulls full Three.js. Reserved for a future surface that legitimately needs 3D — not committed until a real use case appears. **Almost certainly never needed** under the current scope.

This mirrors Rive's `canvas-lite` vs `canvas` vs `webgl2` pattern. Consumers who use only ambient/hero pay only the OGL/Paper cost. The Three.js dependency does not exist in the default bundle.

---

## Scope — what WebGL is and isn't in VE

### In scope (the three surfaces)

- **Ambient layer enrichment.** Heavy ambient variants migrate from SVG particles to shader-driven canvas. Same component API, same `--ambient-level` decay contract, dramatically higher particle density and fluid motion. SVG variants for light ambient remain — WebGL is for variants that hit the SVG ceiling.
- **Hero / showcase scene canvases.** A small catalog (3–5) of full-viewport shader backgrounds for marketing and showcase surfaces. Token-driven, atmosphere-reactive, optionally cursor-reactive.
- **Cinematic page transitions.** A small catalog (2–3) of shader-driven inter-route effects. Compose with existing transition actions; do not replace them.

### Out of scope (deliberately, never)

- **Atmosphere preview tiles in Themes modal.** Tempting but redundant — static color swatches communicate atmosphere identity sufficiently. A live shader per tile is overkill and adds runtime cost to a frequently-mounted UI.
- **3D component demos / showcase pages.** The component library is communicated by the components themselves. A 3D rotating Button is a parody of a design system, not a feature.
- **Data visualization primitives.** Not VE's job. CoNexus dashboards or DGRS analytics use their own viz stack.
- **Product configurators.** Not VE's job. If a future DGRS Labs product needs one, it ships in that product, not here.
- **AR/VR/XR.** Out of scope for the system entirely.
- **AI-generated shaders.** The Phase 1 AI pipeline generates atmospheres (CSS vars). Generating shader code is a research problem unrelated to VE's value prop.
- **Generic 3D framework features** (model loading, physics, scene graphs, animation rigs). Use Threlte directly if you need this — VE doesn't wrap it.

The three-surface discipline is non-negotiable. Every addition past these three would push the package toward "general WebGL framework," and the value evaporates.

---

## Architecture

### Layer positioning

WebGL sits on top of L1, parallel to Rive. It does not participate in L0. It does not depend on Rive.

```
┌──────────────────────────────────────────────┐
│  void-energy (L1 — public)                   │
│                                              │
│   <AtmosphereLayer>, transition actions      │
│   [data-physics], [data-atmosphere]          │
│   --energy-primary, --ambient-level          │
└──────────────┬───────────────────────────────┘
               │ peer dep
               │
┌──────────────▼───────────────────────────────┐
│  @dgrslabs/void-energy-webgl (premium)       │
│                                              │
│   • <AmbientCanvas> — replaces SVG body for  │
│     heavy ambient variants                   │
│   • <HeroCanvas> — full-viewport shader      │
│   • <PageTransition> — inter-route shader    │
│                                              │
│   • OGL runtime + Paper Shaders presets      │
│   • Reads --energy-* tokens into uniforms    │
│   • Observes data-atmosphere mutations       │
│   • Respects prefers-reduced-motion          │
│   • Falls back to native VE behavior         │
└──────────────────────────────────────────────┘
```

WebGL imports `void-energy` as a peer dependency and uses its tokens, but not its components — components in this package compose around their own canvas. Native-First Protocol (CLAUDE.md §5) holds: every component wraps native HTML; the canvas is `aria-hidden`.

### Token bridge contract

Same pattern as `kinetic-text` (the proven precedent). One bridge function, one mutation observer, one uniform-update path.

```ts
// Conceptual — actual implementation lives in the package
function bindAtmosphereToScene(scene: WebGLScene, host: HTMLElement) {
  const root = document.documentElement;

  function syncUniforms() {
    const computed = getComputedStyle(root);
    scene.setUniform('uPrimary',   parseColor(computed.getPropertyValue('--energy-primary')));
    scene.setUniform('uSecondary', parseColor(computed.getPropertyValue('--energy-secondary')));
    scene.setUniform('uAmbient',   parseFloat(computed.getPropertyValue('--ambient-level') || '0'));
    scene.setUniform('uPhysics',   root.dataset.physics);  // 'glass' | 'flat' | 'retro'
  }

  syncUniforms();

  const observer = new MutationObserver(syncUniforms);
  observer.observe(root, { attributes: true, attributeFilter: ['data-atmosphere', 'data-physics'] });

  return () => observer.disconnect();
}
```

Atmosphere change does **not** rebuild the scene. Only uniforms update. Frame cost is unaffected.

### Physics gating

| Physics | WebGL canvases render | Why |
|---|---|---|
| **glass** | Yes (primary target) | The aesthetic where atmospheric depth belongs |
| **flat** | Yes (muted variant) | Reduced-intensity shader presets |
| **retro** | No | CRT pixel aesthetic; smooth shaders break the illusion |

Retro gating is a fallback to the existing SVG/CSS surface (canvas does not mount). The consumer writes `<HeroCanvas>` once; physics gating is automatic.

### Accessibility & runtime contract (non-negotiable)

- **Native HTML is always present.** Canvas is `aria-hidden="true"`, positioned absolute, `pointer-events: none`. The hero variant that reads cursor position uses `pointermove` listeners on the *parent* — the canvas itself never intercepts events.
- **`prefers-reduced-motion: reduce`** — canvas does not mount. Component falls back to VE's existing surface. Zero WebGL bytes execute.
- **Low-power / low-end devices** — `navigator.hardwareConcurrency <= 2` or `navigator.connection?.saveData` also fall back. Conservative heuristic; revisit after telemetry.
- **WebGL2 unsupported** (very small tail in 2026) — fall back. WebGPU initialization failure → WebGL2 → fallback. Three-tier graceful degradation.
- **Visibility** — `IntersectionObserver` pauses the rAF loop when the canvas is offscreen. `document.visibilityState === 'hidden'` pauses on tab switch.
- **Mobile battery** — frame rate caps to 30fps when `navigator.getBattery?.().level < 0.2` (where supported). Conservative; respects user power state.

---

## Bundle weight budget

| Surface | Weight (gzipped) |
|---|---|
| OGL runtime | ~25 KB |
| Paper Shaders (per shader, average) | <10 KB |
| Wrapper component code | <5 KB |
| Token bridge + lifecycle | <3 KB |
| Per-shader source (custom variants) | 2–8 KB |
| **Default tier total** (consumer using all three surfaces) | **~50–80 KB** |
| Optional `/three` sub-export (Three.js) | +168 KB |
| Optional `/three` + Threlte | +200 KB+ |

**Default tier budget for v0 consumer who uses one ambient variant + one hero scene + one transition:** ~60 KB gzipped. Acceptable for a premium opt-in package; the consumer explicitly installed it.

The runtime is loaded **only on pages that mount a component from this package.** Code-split aggressively — dynamic `import()` inside the component, gated on canvas mount and reduced-motion check. Pages that never mount a WebGL component pay zero bytes.

Three.js floor (~168 KB even tree-shaken) is the entire reason for the OGL-first tier. If a future surface ever justifies Three.js, the consumer opts in via the sub-export and pays the cost knowingly.

---

## Out-of-the-box consumer experience

```bash
npm install @dgrslabs/void-energy-webgl
```

### Ambient — drop-in upgrade

The same `AtmosphereLayer` API as the public package. The WebGL package monkey-patches *nothing*; instead, the consumer replaces the import on a per-app basis (or imports the WebGL-enriched component explicitly):

```svelte
<script lang="ts">
  // Public path (SVG body)
  // import { AtmosphereLayer } from '@dgrslabs/void-energy-ambient-layers';

  // Premium path (WebGL body for heavy variants, SVG fallback for light variants and reduced-motion)
  import { AtmosphereLayer } from '@dgrslabs/void-energy-webgl/ambient';
</script>

<AtmosphereLayer variant="nebula" intensity="high" />
```

Consumer code is identical between the two imports. The premium import yields shader-driven body for variants where it matters (storm, nebula, smoke, plasma) and falls back to the SVG path for light variants (mist, drift) where SVG already wins on cost.

### Hero — explicit canvas component

```svelte
<script lang="ts">
  import { HeroCanvas } from '@dgrslabs/void-energy-webgl';
</script>

<section class="relative min-h-screen">
  <HeroCanvas variant="meshGradient" reactivity="cursor" class="absolute inset-0" />
  <div class="relative z-10 flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-display">Void Energy</h1>
  </div>
</section>
```

Built-in variants (target v0 — names placeholder, refine in authoring):
- `meshGradient` — flowing organic background. Atmosphere-tinted. Default for marketing pages.
- `aurora` — vertical light bands, slow drift. Calmer alternative.
- `field` — particle field with fluid noise. The "deep atmosphere" option.

`reactivity` prop: `'none' | 'cursor' | 'scroll'`. Cursor-reactivity pulls pointer position from the parent; scroll uses `IntersectionObserver` percentage.

### Transition — layout-level wrapper

```svelte
<!-- src/layouts/Layout.astro -->
<script lang="ts">
  import { PageTransition } from '@dgrslabs/void-energy-webgl';
</script>

<PageTransition variant="ripple" duration="600">
  <slot />
</PageTransition>
```

Built-in variants (target v0):
- `ripple` — radial displacement from click origin (or page center if no pointer). Default.
- `dissolve` — chromatic separation + alpha noise.

Composes with VE's existing `emerge` / `materialize` actions on the page content itself — the canvas paints the *moment between*, not the content reveal.

---

## Cost analysis

### Operational cost

- No external runtime licenses. OGL is MIT, Paper Shaders is permissive open-source.
- No external authoring tools required for v0. Shader source lives in the repo.
- Optional: a Paper account for shader prototyping in their editor (~free tier). Convenient, not required.
- **Total recurring cost: $0.**

### Authoring cost (real)

Unlike Rive (artist-authored binaries) or KT (declarative effects), shader authoring is **code by Dima or a future contributor**. There is no Eric-equivalent for shaders. Each variant is a few hundred lines of GLSL/TSL plus a small component wrapper.

- v0 catalog (~10 shaders total: 4 ambient + 3 hero + 2 transition + 1 reserve) = ~2–4 weeks of focused authoring time.
- Each new variant after v0 = ~3–5 days.

This is the package's biggest non-monetary cost. Build the catalog narrow; resist requests to expand it.

---

## Timing — why this ships after all four phases

Same discipline as Rive. Five reasons to defer:

1. **CoNexus (Phase 4) defines which ambient variants matter.** Without the real consumer, you risk shipping the wrong variants. The current `@dgrslabs/void-energy-ambient-layers` catalog is an educated guess; CoNexus tells us which ones get used.
2. **Mobile (Phase 2) sets the perf floor.** WebGPU on iOS Safari 26 vs older Android changes runtime decisions. Mobile telemetry decides whether the cursor-reactive hero variant ships.
3. **Premium repo (Phase 3b) is where it lives.** Phase 3b *may* reserve the package slot now (`packages/webgl/` next to `packages/rive/`) for free, but the content lands later.
4. **L0 / L2 must be stable first.** The token bridge depends on `--energy-*` and `--ambient-level` being canonical. Phase 1 (L2) and existing L0 work bake these in — don't author shaders against a moving token target.
5. **Showcase site exists first.** Hero variants are designed for `void.dgrslabs.ink`. The site has to exist (Phase 3) before its hero canvas can be authored against the real layout.

**What Phase 3b could ship if reserved:** the empty scaffold (`packages/webgl/`), the package name reserved on GitHub Packages, a stub README. This is enough for Phase 4 to import the package without restructuring when content lands. Decide at Phase 3b planning time.

**What this plan ships:** the three component APIs, the OGL-based runtime, the Paper Shaders integration for hero variants, the token bridge, the physics gating, the reduced-motion fallback, the v0 effect catalog, the showcase recipes.

---

## Prerequisites (must be true before real work starts)

- **All four roadmap phases have shipped.** Non-negotiable.
- **Premium repo exists** with the WebGL package slot scaffolded (Phase 3b).
- **CoNexus running on VE in production** — gives real consumer context for which ambient variants matter.
- **Showcase site (`void.dgrslabs.ink`) shipped** — gives the canonical hero surface to author against.
- **Token bridge prototype validated** on at least one ambient variant before committing to the catalog. The `getComputedStyle` → uniform pipeline tested on at least 2 atmospheres.
- **Reduced-motion fallback path tested end-to-end** — the SVG path must remain perfectly functional. WebGL is enhancement, not replacement.
- **Mobile perf floor measured** — at minimum, frame-time on mid-range Android (Pixel 6a class) and iPhone 12. Decide per-variant whether mobile gets the WebGL path or the SVG fallback.

---

## Sequencing (once this ships)

Don't ship everything at once. Order:

1. **Build the runtime + token bridge + physics gating + reduced-motion fallback first**, against a stub shader (gradient + noise). Prove the integration end-to-end before authoring a real catalog. This is the highest-leverage week.
2. **Ship one ambient variant** (probably `nebula`, the variant most stressed by the SVG path). Drop-in replacement for the existing one. Measure mobile cost. Decide whether other ambient variants get the WebGL upgrade or stay SVG.
3. **Ship one hero variant** (`meshGradient` — the most universally useful). Mount it on the showcase home. Measure cursor-reactivity cost on mid-range mobile.
4. **Ship one transition** (`ripple`). Wire into the showcase route changes. Measure pop-in/perceived smoothness.
5. **Expand catalog** based on what CoNexus actually uses. If three variants suffice, three variants ship. Resist demand to expand to 15.
6. **Decide on `/three` sub-export.** Probably never needed. If a real surface justifies it, add it then.
7. **Decide on flip-to-public.** Same `publishConfig` flip discussed in [decisions.md](../decisions.md) §D17. WebGL has no external-artist narrative the way Rive does, so the flip case is weaker — likely stays private.

**What v0 looks like:** runtime + token bridge + physics gating + reduced-motion fallback + one variant per surface (one ambient, one hero, one transition). That's a shippable launch surface. Everything else is expansion.

---

## Open questions / decisions to make later

These are the real trade-offs. None need a decision today.

- **Reserve the slot in Phase 3b, or scaffold cold later?** Reserving is cheap. Cold-scaffolding later means premium repo is in production when work starts, and adding a package may require restructuring. Slight bias toward reserving.
- **Package name.** `void-energy-webgl` is technology-flavored; `void-energy-canvas` or `void-energy-shaders` is more semantic. Match the precedent set by `void-energy-ambient-layers` (semantic) and `void-energy-rive` (technology). No clear winner. Decide at Phase 3b.
- **Should ambient WebGL variants live in this package or extend `void-energy-ambient-layers`?** Two reasonable shapes: (a) WebGL is a separate package consumers install on top, (b) `ambient-layers` gains a `/webgl` sub-export. Bias toward (a) — clean separation, no peer dep on a premium package from a premium package.
- **OGL or Paper Shaders for hero variants?** Probably both: Paper for `meshGradient` (their MeshGradient is exactly this), OGL for everything custom. Or commit to OGL for consistency. Decide after first hero variant is prototyped.
- **TSL authoring vs raw GLSL?** TSL is the future-proof choice but adds a dependency on Three.js's TSL compiler at *build time* (not runtime). Raw GLSL ships smaller. Bias toward GLSL for v0; TSL if/when WebGPU compute becomes load-bearing.
- **Per-atmosphere shader variants?** A token-bridged single shader *should* adapt to any atmosphere via uniform colors. But some atmospheres (e.g. Blood Moon, Solar) may want bespoke art — separate shaders, not branches. Decide variant-by-variant; default is "one shader, token-driven."
- **Cursor-reactivity on mobile?** Touch translates poorly to cursor position. Probably gate cursor-reactivity to non-touch devices and let mobile get the static variant. Test before committing.
- **Page transition gating in CoNexus's narrative flow.** A WebGL transition between story chapters could conflict with KT's reveal animations and the narrative orchestrator's beat timing. Compose carefully — the transition should fire *between* beats, not during. Needs a composition test before shipping.
- **Asset pipeline.** Shader source files (`.glsl`, `.wgsl`) need a build step or inline-as-string convention. Vite handles this; settle the convention at Phase 3b scaffold time.
- **License terms.** OGL (MIT), Paper Shaders (permissive). The package's own license follows the premium repo's BSL (or whatever it becomes). No Eric-equivalent IP issue.
- **Telemetry on fallback rates.** Once shipped, knowing what % of consumers hit the WebGL path vs the SVG fallback informs whether to author more variants or polish the existing ones. Add a tiny opt-in counter.

---

## Honest tradeoffs

**Three surfaces is a hard limit.** The first instinct after shipping v0 will be "we already have the runtime, why not also do X?" Resist. The package's value is in being narrow. Every added surface dilutes it. The "out of scope" list above is the most important section in this doc.

**Authoring cost is real.** No Eric. No Rive editor. Shaders are code, and good shaders are *hard* code. The catalog must stay small (~10 shaders ever) or maintenance dominates. This is why hero and transition catalogs are 3 and 2 respectively, not 10 and 8.

**Bundle weight is bounded but not free.** ~50–80 KB gzipped for the default tier is acceptable for a premium opt-in. It is *not* acceptable to leak this into the public `void-energy` bundle. Code-splitting must be enforced at the build, not just promised. Add a CI check that `void-energy`'s public bundle does not import anything from the WebGL package.

**Mobile perf is the quiet killer.** A nebula shader at 60fps on desktop can be 12fps on a four-year-old Android. Without rigorous per-variant mobile gating, the package ships a worse experience than the SVG fallback for a meaningful fraction of users. Mobile telemetry from Phase 2 is a hard prerequisite.

**Atmosphere reactivity is the differentiator.** A static shader background is generic. A shader background whose mood shifts with the atmosphere is *Void Energy*. The token bridge has to be excellent — observe `data-atmosphere`, push uniforms within one frame, no scene rebuild, no flash. This is the single most important piece of engineering in the package.

**Three-surface discipline will be tested by CoNexus.** CoNexus will want WebGL effects for things outside the three surfaces (chapter transitions inside the story, narrative effect overlays, character portraits). Some of those requests are legitimate. Most of them are scope creep masquerading as features. Have the discipline to say "use KT" or "use a CSS animation" or "use Rive" before saying "yes."

**WebGPU's 5% tail is real.** Three.js handles the WebGL2 fallback correctly when initialized with `WebGPURenderer`, but custom OGL paths need explicit WebGPU detection if/when they migrate. For v0, WebGL2-only is fine — WebGPU is a v0.2 concern at earliest.

**Reduced-motion fallback is the ethical floor, not a "nice-to-have."** The SVG path must look *good* on its own — not "passable." If the SVG path looks worse than what `@dgrslabs/void-energy-ambient-layers` already ships, the package has regressed accessibility. The premium consumer pays for the upgrade; the reduced-motion consumer is not penalized for opting out.

**The package is the easiest in VE to use poorly.** A consumer can put a HeroCanvas on every page, add a PageTransition with a 3-second duration, mount three ambient variants simultaneously, and ship a 30fps mess. Documentation has to lead with restraint. The first showcase recipe should be "one canvas per page, period."

---

## Related plans

- [../phase-3a-monorepo-structure.md](../phase-3a-monorepo-structure.md) — public monorepo shape; WebGL stays out, lives only in the premium repo
- [../phase-3b-premium-packages.md](../phase-3b-premium-packages.md) — Phase 3b is where the WebGL package slot can optionally be reserved alongside Rive
- [../phase-4-conexus-migration.md](../phase-4-conexus-migration.md) — CoNexus is the first real consumer whose ambient and transition needs validate the v0 catalog
- [./rive.md](./rive.md) — sibling premium package; shares the canvas-as-visual-enhancement contract, the physics-gating discipline, and the reduced-motion floor
- [./i18n.md](./i18n.md) — sibling future plan; unrelated, but same `future/` lifecycle
- [../decisions.md#d17--selective-publishing-via-publishconfig](../decisions.md) §D17 — selective publishing; WebGL likely stays private (no external-artist co-brand narrative)
