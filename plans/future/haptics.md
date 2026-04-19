# Haptics Package — Future Premium Package

> Tactile feedback as a first-class design primitive. A small haptics substrate lands during Phase 2 (stock `@capacitor/haptics` wrapper); this package is the premium depth layer — `@dgrslabs/void-energy-haptics` — that adds iOS Core Haptics (AHAP), Android VibrationEffect primitives, Kinetic Text accent sync, and Ambient Layers continuous drones. The difference between "an app that buzzes" and "an app you can feel."

**Status:** Parked research (captured 2026-04-19). Not a scheduled phase. Phase 2 ships the minimum viable wrapper (see [phase-2-mobile-deployment.md](../phase-2-mobile-deployment.md) §4); this plan captures the premium tier that goes on top. Revisit and formalize after all four roadmap phases ship.
**Consumes:** Requires Phase 2 (Capacitor wired, basic haptics wrapper proven), Phase 3a (monorepo split so the premium package has a home), Phase 3b (premium repo scaffold). Benefits strongly from Phase 4 (CoNexus) as the first real consumer whose story beats validate the AHAP pattern vocabulary.
**Blocks:** Nothing hard. Haptics are additive — every consumer app works without them. Missing haptics = missing a sensory dimension, not missing functionality.

---

## Why this exists

Every premium app that feels "alive" on iOS — Things 3, Linear's mobile app, Telegram, the iOS keyboard itself — uses haptics as a structural design element, not decoration. Tap a toggle and the phone confirms with a micro-pulse. Slide a slider across a detent and feel the click. Complete an async action and a distinct success stinger resolves the tension. These are not visual affordances — they are tactile ones, and they are half of what makes native iOS feel premium compared to web.

Void Energy's visual thesis is cinematic: glass lifts, flat tints, retro CRT, kinetic text reveals, ambient atmospheric layers. None of it is felt. An app ships to the App Store, a user taps the primary CTA, and nothing happens in their hand. The visual polish sells on the showcase; the absence of haptics silently downgrades the "premium" impression the moment someone holds a device.

Phase 2 solves the floor — a thin wrapper over `@capacitor/haptics` that buzzes the basics (button press, toggle, toast). That is Apple-HIG-compliant but generic. This package solves the ceiling: **story-driven haptics**. Kinetic Text reveals that you feel punctuating the reading rhythm. Ambient storm layers with a continuous tactile drone under the thunder. Success stingers authored as AHAP patterns, not mapped to a three-level `UIImpactFeedbackGenerator` preset. Haptics become a design surface, not a system call.

The web has no haptics story worth speaking of (see §Tech Landscape). This package is where VE's mobile-first thesis earns its premium framing — tactile design is the one sensory axis the web cannot compete on.

---

## Strategic framing

Same open/closed pattern VE uses everywhere:

> **Open what builds community. Close what builds moat.**

- **Phase 2 wrapper (ships public in `void-energy`)** — a `capacitor.ts` helper with `hapticTap()`, `hapticSuccess()`, and the `voidEngine.userConfig.haptics` preference. Telegram/Capacitor-aligned minimal vocabulary. Enough to remove "VE ignores haptics" as a public objection.
- **`@dgrslabs/void-energy-haptics` (private, this plan)** — the depth layer: custom Capacitor plugin for iOS Core Haptics + Android VibrationEffect.Composition, AHAP pattern library, KT-synced accent patterns, Ambient-synced continuous drones, Svelte action wrapper, reactive preference surface mirrored to `data-haptics`, reduced-motion gating, full intensity/sharpness curves.

The split is deliberate: the 4-preset vocabulary (light/medium/heavy impact, success/warning/error notification, selection) is table stakes — every framework ships it. **AHAP authoring, TTS-synced reveal accents, and audio-reactive continuous drones are VE-specific depth nobody else ships in a design system.** That's the moat.

Like Rive (see [rive.md](./rive.md)), this package is a candidate for later flip-to-public via [decisions.md](../decisions.md) §D17 — once the premium catalog is validated, the haptics package becomes a strong co-branded showcase piece. Defer that decision until after Phase 4.

---

## The "feel the story" pitch

The demo that sells this package:

```svelte
<TtsKineticBlock
  text="Thunder cracked. The cavern shuddered."
  audio={narrationAudio}
  haptic="story"
/>
```

As the TTS narrates, a soft `selection` tick lands on each word boundary — a tactile rhythm under the reading voice. On the word "cracked," a sharp `HapticTransient` fires synced to the audio peak of the thunderclap in the ambient layer. The word "shuddered" triggers a 600ms `HapticContinuous` with a decaying intensity curve — your phone literally shudders in your hand, released exactly as the word ends.

In parallel, the ambient storm layer is running a low-intensity `HapticContinuous` drone (intensity 0.2, sharpness 0.0) tracking the audio's low-band RMS. It's not a buzz — it's presence. The storm is *there*, under your thumb, the whole time.

On the next page, you tap "Continue." A custom AHAP pattern — `portal-enter.ahap`, authored specifically for VE — plays: two rising transients, 40ms apart, followed by a short sustained hum. It doesn't feel like a button. It feels like a door opening.

No design system ships this. Apps that do it — Things, Linear, a handful of premium reading apps — hand-roll every pattern. VE ships the infrastructure, the patterns, and the sync bus as a package.

---

## Haptics tech landscape (2026)

### Platform reality

| Runtime | What's available |
|---|---|
| **iOS native (Capacitor)** | UIKit feedback generators via `@capacitor/haptics` (presets only). Core Haptics + AHAP + continuous haptics only via **custom Capacitor plugin**. |
| **Android native (Capacitor)** | `VibrationEffect` presets via stock plugin. Composition primitives (API 30+), waveforms, and `HapticFeedbackConstants` only via **custom plugin**. |
| **Web (Android Chromium)** | `navigator.vibrate(pattern)` — coarse on/off pulses, no intensity, each call preempts the prior. |
| **Web (iOS Safari + all WebKit)** | **Nothing.** No `navigator.vibrate`. Permanent. Third-party "iOS Safari vibration" libraries rely on brittle AudioContext tricks; not production-grade. |
| **Desktop web** | No-op. Gamepad API `vibrationActuator` exists for connected controllers but irrelevant for phone UI. |

**Implication:** haptics are a progressive enhancement. The web tier is "Android buzz only, silent everywhere else." Native iOS is where the premium experience lives. The package must degrade gracefully or the showcase breaks on desktop demo.

### Capability tiers the package exposes

| Tier | API | What it delivers | Works on |
|---|---|---|---|
| **T0 — Preset vocabulary** | `haptics.impact('light'\|'medium'\|'heavy')`, `haptics.selection()`, `haptics.notification('success'\|'warning'\|'error')`, `haptics.vibrate(ms \| pattern)` | Telegram/Capacitor-aligned baseline. One-shot presets. | iOS native, Android native, Android web (synthesized) |
| **T1 — Pattern playback** | `haptics.play('pattern-name')` where patterns are pre-authored AHAP (iOS) + `VibrationEffect.Composition` sequences (Android) | Rich, designed single moments (e.g., `portal-enter`, `story-beat`, `dice-roll`) | iOS native (Taptic 2+), Android native (API 30+, LRA); T0 fallback elsewhere |
| **T2 — Continuous + dynamic** | `haptics.playContinuous({ intensity, sharpness, duration })`, `haptics.setParameter({ id, value, atTime })` | Sustained haptics with live intensity/sharpness modulation (ambient drones, TTS envelope tracking, breath waves) | iOS native only (Core Haptics); best-effort Android waveform approximation; T0 fallback elsewhere |

Consumer picks the tier their surface needs. T0 is 90% of app haptics. T1 is the differentiator. T2 is the cinematic edge.

### Why Core Haptics (AHAP) is the moat

`@capacitor/haptics` exposes only 3 impact strengths and 3 notification types. That's the Apple `UIImpactFeedbackGenerator` API — a convenience wrapper over Core Haptics. The full `CHHapticEngine` exposes:

- **Two event types:** `HapticTransient` (sharp tap) and `HapticContinuous` (sustained, up to ~30s per event).
- **Per-event params:** `HapticIntensity` [0–1] (loudness), `HapticSharpness` [0–1] (perceptually "soft rumble" → "crisp tick"), `AttackTime`, `DecayTime`, `ReleaseTime`, `Sustained`.
- **`ParameterCurve`s** — scripted intensity/sharpness envelopes over time. This is how breath-wave and audio-reactive drone haptics are authored.
- **Dynamic parameters** — `sendParameters(atTime:)` lets you modulate a playing continuous haptic in real time. This is what binds haptics to live audio.
- **AHAP JSON** — patterns as authorable files, designed in Apple's Haptics Explorer or Hapticlabs, shipped as assets.

Nothing short of a custom Capacitor plugin (wrapping `CHHapticEngine` in ~200 lines of Swift) exposes this to a Capacitor app. Reference prior art: Flutter's `core_haptics` package and React Native's `candlefinance/haptics`. The design is well-understood.

Android's parallel surface — `VibrationEffect.Composition` with primitives like `PRIMITIVE_CLICK`, `SPIN`, `QUICK_RISE` — is weaker but real on API 30+ with LRA-equipped devices (Pixel 4+, recent Samsungs). The same custom plugin bridges both platforms with a unified pattern format.

### Web `navigator.vibrate` footguns

- **Each call preempts the prior pattern.** You cannot queue successive pulses; you must issue one pattern array covering the whole window.
- **No intensity axis.** `[ms]` only. Cannot express `light` vs `heavy`.
- **Requires sticky user activation.** First call in a session must be inside a user gesture.
- **iOS Safari: unsupported, silent.** Feature-detect via `typeof navigator.vibrate === 'function'` is not reliable; the function may exist and return `true` while doing nothing. Route by Capacitor platform detection first, vibrate only as a last-resort web fallback on Android.

### Sources

- [MDN — Navigator.vibrate](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate), [Can I Use — Vibration](https://caniuse.com/vibration)
- [Capacitor Haptics plugin](https://capacitorjs.com/docs/apis/haptics), [custom iOS plugin guide](https://capacitorjs.com/docs/ios/custom-code)
- [Apple HIG — Playing haptics](https://developer.apple.com/design/human-interface-guidelines/playing-haptics), [WWDC19 Core Haptics session](https://developer.apple.com/videos/play/wwdc2019/520/)
- [Android VibrationEffect.Composition](https://developer.android.com/reference/android/os/VibrationEffect.Composition), [AOSP Haptics UX Design](https://source.android.com/docs/core/interaction/haptics/haptics-ux-design)
- Prior-art plugin bridges: [candlefinance/haptics (RN)](https://github.com/candlefinance/haptics), [Azzeccagarbugli/core_haptics (Flutter)](https://github.com/Azzeccagarbugli/core_haptics)

---

## Scope — what haptics is and isn't in VE

### In scope
- **UI feedback vocabulary.** T0 presets wired into every interactive primitive (buttons, toggles, sliders, drag, modal commit, form submit, copy, pull-to-refresh, tab change).
- **Kinetic Text sync.** Accent-only reveal haptics by default (word/punctuation/sentence-end); immersive AHAP tier for Core Haptics.
- **Ambient Layers sync.** Continuous drones tied to audio amplitude; one-shot stingers on atmospheric events (thunder, impact, reveal).
- **AHAP pattern library.** Pre-authored `.ahap` files for VE-specific moments: `story-beat`, `portal-enter`, `dice-roll`, `success-bloom`, `error-collapse`.
- **Android parallel patterns.** Matching `VibrationEffect.Composition` sequences for every AHAP pattern, so the same `haptics.play('portal-enter')` call works on both platforms.
- **Preference surface.** Master enable, intensity scalar, per-feature toggles (UI, reveal, ambient). Reactive, persisted, mirrored to `data-haptics` on `<html>`.
- **Reduced-motion + accessibility gating.** Honor `prefers-reduced-motion`, iOS System Haptics toggle, Android haptic-feedback setting.

### Out of scope (never)
- **Haptics as the sole confirmation of an action.** Always paired with visual state. Users who disable haptics must not miss information.
- **Per-character Kinetic Text haptics by default.** Too dense, wastes battery, annoying. Opt-in for consumers who explicitly want it; documented as discouraged.
- **Indefinite continuous haptics.** Taptic Engine stays powered while a continuous haptic runs — real battery cost. Max 15–30s segments, "moments not ambiance."
- **Haptics on passive events.** No buzzes for arriving content, auto-scroll, toast appearance (except error toasts), modal open (except destructive confirm).
- **Web as first-class.** The package runs on web — degraded. Every new feature must answer "what does this do on web?" with an honest answer, which is usually "nothing, and that's fine."
- **Custom hardware.** No Nintendo Switch HD Rumble, no PSVR2, no Taptic Touch Bar. Phone Taptic Engines + Android vibrators only.

---

## Architecture

### Layer positioning

```
┌──────────────────────────────────────────────┐
│  void-energy (L1 — public, Phase 2)          │
│                                              │
│   voidEngine.userConfig.haptics               │
│   src/lib/capacitor/haptics.ts                │
│     hapticTap() / hapticSuccess()             │
│     Thin wrapper over @capacitor/haptics     │
└──────────────┬───────────────────────────────┘
               │ peer dep
               │
┌──────────────▼───────────────────────────────┐
│  @dgrslabs/void-energy-haptics (premium)     │
│                                              │
│   • haptics singleton (T0/T1/T2 API)          │
│   • use:haptic Svelte action                  │
│   • AHAP pattern library (.ahap assets)       │
│   • Android Composition sequences (.json)     │
│   • Custom Capacitor plugin (Core Haptics)    │
│   • KT accent-beat binding                    │
│   • Ambient Layers continuous/stinger binding │
│   • Reactive preference surface → data-haptics│
└──────────────────────────────────────────────┘
```

The premium package upgrades — does not replace — the Phase 2 wrapper. A consumer who installs only `void-energy` gets T0 via the thin wrapper. A consumer who also installs `@dgrslabs/void-energy-haptics` gets T0 + T1 + T2, the same `voidEngine.userConfig.haptics` preference, and the pattern library.

### Runtime router (the adapter core)

On boot, the singleton detects runtime once and picks a strategy:

1. **Custom Capacitor plugin available** → full T2 (Core Haptics on iOS, Composition on Android).
2. **Stock `@capacitor/haptics` available, no custom plugin** → T0 only; T1 patterns synthesized from T0 presets; T2 no-ops with a dev-mode warning.
3. **Web with `navigator.vibrate`** → T0 via synthesized vibrate patterns; T1 coalesced to nearest T0; T2 no-ops.
4. **No haptic API** → every call no-ops silently. No errors, no warnings in production.

This is the same runtime-router pattern the TTS adapter layer uses (provider-agnostic, capability-downgrading). Consumers write code against the T2 API; it degrades transparently.

### Two consumer surfaces (imperative + declarative)

**Service (imperative):**
```ts
import { haptics } from '@dgrslabs/void-energy-haptics';

haptics.impact('light');                    // T0
haptics.play('portal-enter');               // T1
haptics.playContinuous({                    // T2
  intensity: 0.3,
  sharpness: 0.1,
  duration: 0.6,
});
```

**Action (declarative):**
```svelte
<button use:haptic={{ on: 'click', type: 'impact', style: 'light' }}>Go</button>

<!-- Multiple events -->
<input type="range" use:haptic={{
  on: 'input',    type: 'selection',
  on: 'change',   type: 'impact',   style: 'light',
}} />
```

Both call into the same singleton. Same dual-surface pattern as tooltip/morph actions — an established VE convention.

### Kinetic Text integration (the big one)

The existing KT TTS sync pipeline exposes a `TimedAction<T>[]` bus via `attachAudioActions(audio, scheduled, onFire)`. Actions fire when `audio.currentTime * 1000 >= atMs`, rate-aware, pause/resume/scrub-safe. Ambient Layers already rides this bus (`ambient.fire(variant, intensity)`). **Haptics slots in as a fourth action payload type**, consumed by the same `onFire` callback.

```svelte
<TtsKineticBlock
  text={story}
  audio={narration}
  haptic="accent"    <!-- 'off' | 'accent' | 'immersive' | custom TimedAction[] -->
/>
```

Modes:

| Mode | What fires | Works on |
|---|---|---|
| `off` | Nothing | Every runtime |
| `accent` (default) | `selection` on word boundary; `impact.light` on comma/colon; `impact.medium` on period/exclamation/question | T0-capable (iOS/Android native + Android web) |
| `immersive` | AHAP pattern with continuous haptic under each sentence, transient stingers on punctuation, intensity curve tracking TTS word timing | T2-capable only (iOS Core Haptics); degrades to `accent` elsewhere |
| custom `TimedAction<HapticPayload>[]` | Author-scripted — same authoring surface as ambient `TimedAction`s | Depends on payload tier |

**Critically:** throttle floor enforced in the adapter. 50ms minimum on web, 30ms on Android native, 15ms on Core Haptics. Per-character haptics at 10Hz+ coalesce to the nearest word boundary — the adapter refuses to fire events faster than the platform can resolve, preventing device buzz-fatigue and battery spikes.

### Ambient Layers integration

The four layer categories (Atmosphere / Psychology / Action / Environment) each get a haptic channel:

| Layer category | Haptic channel | Example |
|---|---|---|
| **Atmosphere** (storm, rain, wind) | Continuous low-intensity drone tracking audio low-band RMS | `intensity 0.15–0.3, sharpness 0.0`, sine modulation on storm intensity |
| **Psychology** (tension, danger, awe) | Slow-breath continuous haptic, 4s in / 6s out | Tracks the ambient mood curve |
| **Action** (impact, shake, zoomBurst) | One-shot stinger — AHAP transient cluster | Fires synced to existing `ambient.fire()` dispatch |
| **Environment** (night, neon, candlelit) | No haptic (these are tint-only visual layers) | N/A |

The ambient package already defines `ambient.fire(variant, intensity)`. Haptics extend this: `ambient.fire(variant, intensity, { haptic: true })` or (better, cleaner) the haptics package observes the ambient bus and plays the matching pattern automatically when `voidEngine.userConfig.haptics.ambient === true`.

**Constraint:** continuous ambient haptics only fire during attended moments (active story beat, reading session, meditation exercise) — never as a set-and-forget background layer. A scene-level "haptic scene active" flag gates this; when the user scrolls away or app backgrounds, the continuous haptic releases. Apple's HIG is explicit: haptics are moments, not ambiance.

### DOM contract (Law 4)

Mirror runtime state on `<html>` alongside `data-atmosphere` / `data-physics` / `data-mode`:

```
data-haptics="off"       User disabled or prefers-reduced-motion
data-haptics="subtle"    Enabled, intensity scalar = 0.5
data-haptics="full"      Enabled, intensity scalar = 1.0
```

Lets SCSS react (e.g., a subtle "muted" visual state when haptics are off, hinting the user might want to re-enable them in settings) and any analytics observer read a single attribute. Set pre-paint alongside theme/physics, FOUC-safe.

### Preference surface (VoidEngine)

Extend `voidEngine.userConfig.haptics` (Phase 2 adds the basic toggle; this expands it):

```ts
haptics: {
  enabled: true,                           // master toggle
  intensity: 'full',                       // 'off' | 'subtle' | 'full' — scalar 0/0.5/1
  ui: true,                                // button/toggle/slider haptics
  reveal: 'accent',                        // KT: 'off' | 'accent' | 'immersive'
  ambient: false,                          // continuous ambient drones (off by default — battery)
}
```

Resolution logic inside the adapter:
1. If `prefers-reduced-motion: reduce` → treat as `enabled: false` unless user has explicitly overridden in app settings.
2. If iOS "System Haptics" off → UIKit feedback generators auto-honor this; Core Haptics does **not** auto-honor it (this is an Apple footgun). Self-gate via `UIAccessibility.isReduceMotionEnabled` + a capability probe.
3. If Android haptic-feedback setting off → honor `Settings.System.HAPTIC_FEEDBACK_ENABLED`.
4. Apply `intensity` scalar to T2 event intensities. For T0 presets under `subtle`, map `medium → light`, `heavy → medium`, `light → selection`.

### UI surface mapping (the "where to wire it" catalog)

| Surface | Haptic | Notes |
|---|---|---|
| Primary/CTA button commit | `impact.light` | On click, not touchdown |
| Destructive confirm | `impact.medium` | In modal confirm, after user clicks "Delete" |
| Toggle flip | `selection` | Match iOS UISwitch behavior |
| Slider detent cross | `selection` | Throttled to 30Hz |
| Slider release | `impact.light` | Commit confirmation |
| Long-press trigger | `impact.medium` | Exactly at threshold crossing |
| Pull-to-refresh trigger | `impact.light` | On release past threshold (already in [PullRefresh.svelte](../../src/components/ui/PullRefresh.svelte)) |
| Pull-to-refresh complete | `notification.success` | Distinguishes completion from progress |
| Drag pickup | `selection` | |
| Drag over drop zone | `selection` | One per zone entered |
| Drag drop | `impact.medium` | |
| Form submit success | `notification.success` | |
| Form submit error | `notification.error` | Pair with error toast |
| Copy-to-clipboard | `impact.light` | Pair with toast |
| Tab change | `selection` | If tabs are primary nav; skip for secondary |
| Theme/atmosphere switch | `impact.medium` | A committed preference change |
| Modal open | — | Visual sufficient; haptic here = overuse |
| Toast appear | — | Unless error (then `notification.error`) |
| Scroll-to-top | — | Internal nav, not a commit |

This catalog ships as documentation and as the default wiring in VE primitives (ActionBtn, Toggle, SliderField, etc.) when haptics is enabled.

---

## Cost analysis

### Monetary cost

Runtime-free on every tier. Capacitor plugin, Core Haptics, AHAP, VibrationEffect — all first-party platform APIs, zero licensing. Authoring tools are optional:

| Tool | Cost | Purpose |
|---|---|---|
| Apple Haptics Explorer | Free (Xcode) | Design AHAP patterns visually |
| Hapticlabs Studio | ~$12/mo or free tier | Cross-platform AHAP + Android pattern authoring in one tool |
| Lofelt Studio | Deprecated (acquired by Meta) | Historical reference only |

**Authoring cost:** Hapticlabs Pro seat (~$12/mo) when designing the v0 pattern pack. Single seat, one month of work to author ~10 patterns. Negligible.

**Runtime cost:** zero — plugin code is ours, platform APIs are free.

### Bundle weight budget

| Surface | Weight |
|---|---|
| Package JS (singleton + action + router + pattern loader) | ~8 KB gzipped |
| Each `.ahap` JSON file | ~0.5–2 KB |
| Each Android composition JSON | ~0.3–1 KB |
| v0 pattern pack (10 patterns × 2 platforms) | ~15 KB |
| Custom Capacitor plugin native code | ~200 lines Swift + ~200 lines Kotlin (zero JS bundle impact) |

**Total consumer bundle impact:** ~25 KB gzipped. Trivial compared to Rive (~100 KB runtime). Acceptable for a premium opt-in package by any standard.

### DGRS operational cost

- Hapticlabs seat during authoring: ~$12/mo, 1–3 months
- Apple Developer account: already required for any iOS Capacitor deploy
- **Total: ~$20–40 one-time (amortized).** Noise.

### Energy cost (the non-obvious one)

Continuous haptics power the Taptic Engine. Sustained use measurably drains battery and warms the chassis. This is why the package gates continuous/ambient haptics behind `voidEngine.userConfig.haptics.ambient` (off by default) and enforces attended-moments-only timing. A well-designed app runs continuous haptics for seconds at a time, not minutes. The documentation must be unambiguous about this.

---

## Timing — why this ships after all four phases

Three reasons to defer:

1. **Phase 2 ships the floor.** The stock `@capacitor/haptics` wrapper in [phase-2-mobile-deployment.md](../phase-2-mobile-deployment.md) §4 is enough to make VE apps feel respectable on iOS. Until that floor is real and proven in production, there's no leverage in authoring AHAP patterns.
2. **Phase 4 (CoNexus) validates the pattern vocabulary.** The AHAP pattern library is the design artifact of this package. Authoring `story-beat.ahap` before a real story engine exists means designing for a use case we're guessing at. CoNexus running on VE gives concrete story-beat-vs-narration rhythm data that calibrates the patterns.
3. **KT + Ambient integration needs both packages to be stable.** Kinetic Text's `TimedAction` bus is the haptic sync point. Ambient Layers' four-category event model is the haptic channel routing map. Both are recent; both may still evolve. Building the haptic sync layer before those APIs freeze means rebuilding it after.

**What Phase 2 ships:** the `src/lib/capacitor/haptics.ts` wrapper with `hapticTap()`, `hapticSuccess()`, and `voidEngine.userConfig.haptics` (boolean toggle). Wired into ActionBtn, Toggle, Modal, Toast. That's the floor.

**What this plan ships:** the full T0/T1/T2 vocabulary, the custom Capacitor plugin, the AHAP pattern library, the KT accent/immersive binding, the Ambient continuous/stinger binding, the Svelte action, the rich preference surface, the reduced-motion gating, the DOM contract, the showcase demos.

---

## Out-of-the-box consumer experience

```bash
npm install @dgrslabs/void-energy-haptics
npx cap sync   # pulls the custom plugin's native code into ios/ and android/
```

```svelte
<script lang="ts">
  import { haptics } from '@dgrslabs/void-energy-haptics';
  import { ActionBtn, Toggle, TtsKineticBlock } from 'void-energy';

  async function commit() {
    haptics.play('success-bloom');    // T1 AHAP pattern
    // or: haptics.impact('light');   // T0 preset — also works everywhere
  }
</script>

<ActionBtn onclick={commit}>Save</ActionBtn>
<Toggle bind:checked={dark} />                            <!-- auto-wired selection haptic -->
<TtsKineticBlock text={story} audio={narration} haptic="accent" />
<!-- Ambient drones if enabled in preferences -->
```

**Zero configuration for UI primitives.** Installing the package upgrades every VE primitive's existing Phase 2 `hapticTap` call to the richer vocabulary automatically. The primitives check for the premium package's presence at module-load and route through it if available.

**Preferences surface as a settings panel** — the package ships a `<HapticsPreferences>` fragment that drops into the Settings modal with master toggle, intensity slider, per-feature toggles, and a "test your haptics" button that plays representative patterns from each tier. Users immediately feel the difference.

---

## Prerequisites (must be true before real work starts)

- **All four roadmap phases have shipped.** Non-negotiable. Haptics is a polish layer on a complete system.
- **Phase 2 haptics wrapper is in production.** The `voidEngine.userConfig.haptics` preference and the basic `hapticTap` wiring must be live — this package upgrades them, doesn't replace them.
- **Capacitor mobile deploy pipeline proven.** Custom Capacitor plugins require the full Capacitor + cloud build loop to be working end-to-end. Phase 2 proves this.
- **KT `TimedAction` bus is stable.** Any future refactor of the TTS sync surface breaks haptic accent timing. This API should be considered part of KT's public contract before the haptics package depends on it.
- **Ambient four-category event model is stable.** Same logic — the haptic channel routing depends on the ambient event taxonomy not shifting under it.
- **CoNexus running on VE in production.** Provides real story-beat rhythm and ambient layer usage to calibrate the AHAP pattern library against, rather than designing patterns in the abstract.
- **At least one iOS device with Taptic 2+ in the dev loop.** AHAP patterns cannot be designed meaningfully on a simulator — the Taptic Engine is fidelity-critical. iPhone 8+ for development minimum; iPhone 12+ preferred.

---

## Sequencing (once this ships)

Order of operations — don't try to build everything at once:

1. **Confirm the T0/T1/T2 API shape in writing.** One document. One table per tier. This is the single highest-leverage hour in the package. Once consumers code against T2, changing the vocabulary is expensive.
2. **Build the runtime router and T0 tier first.** The singleton, the Svelte action, the preference surface, the DOM contract. All running on stock `@capacitor/haptics` on native and `navigator.vibrate` on web. Prove the adapter shape end-to-end before writing a line of Swift.
3. **Author the custom Capacitor plugin (iOS first).** Swift + `CHHapticEngine`. Accepts AHAP JSON or a pattern key, plays the pattern. Exposes `playContinuous` and `setParameter`. Matching Kotlin plugin with `VibrationEffect.Composition` follows.
4. **Author the v0 AHAP pattern pack.** Start with 5 patterns: `success-bloom`, `error-collapse`, `portal-enter`, `story-beat`, `dice-roll`. Design in Hapticlabs, export AHAP + Android composition. Ship as package assets.
5. **Wire KT `haptic="accent"` mode.** The default, T0-only mode. Word/punctuation accents on the existing TTS timing bus. Tested on a real story read-through.
6. **Wire KT `haptic="immersive"` mode.** AHAP continuous under sentences, intensity curves. Core Haptics only; degrades to `accent` elsewhere. This is the cinematic mode.
7. **Wire Ambient continuous drones and one-shot stingers.** Observe the ambient bus, play matching patterns. Gated behind `voidEngine.userConfig.haptics.ambient` (off by default).
8. **Ship the `<HapticsPreferences>` settings fragment and the showcase demo page.** "Feel the story" demo with a paragraph of TTS narration + ambient storm + authored haptic accents. The reel piece.
9. **Decide on flip-to-public** per [decisions.md](../decisions.md) §D17. A public `@void-energy/haptics` — or keeping it private — is a partnership/brand question answered after CoNexus validates the catalog.

**What v0 looks like:** T0 vocabulary across all VE primitives + 5 AHAP patterns + KT `accent` mode + Ambient stingers + preference surface. That's a shippable launch surface. T2 continuous ambient drones, the `immersive` KT mode, and pattern expansion are post-v0 work.

---

## Open questions / decisions to make later

These are real trade-offs. None need a decision today.

- **AHAP vs a VE-specific pattern format?** AHAP is Apple-specific; the Android Composition format is different. Do we author two files per pattern, or invent a neutral "VE pattern" JSON that compiles to both? Adjacent prior art (Hapticlabs) uses a unified format. Probably worth a unified format by v1, but v0 should ship raw AHAP + raw Android JSON to avoid premature abstraction.
- **Does the custom Capacitor plugin ship as its own npm package or as part of `@dgrslabs/void-energy-haptics`?** Capacitor convention is separate plugin packages (`@capacitor/haptics`, `@capacitor-community/barcode-scanner`). Shipping it as `@dgrslabs/capacitor-core-haptics` keeps it reusable beyond VE. Default: separate package, depended on by `@dgrslabs/void-energy-haptics`.
- **Continuous haptic auto-release heuristic.** When does a "scene-active" continuous haptic release? On scroll-out-of-view? On tab backgrounding? On app backgrounding? Tight auto-release is safer (battery); loose release is more cinematic. Decide per-consumer (CoNexus gets loose, generic apps get tight) or global default?
- **Throttle floor values.** 50ms web / 30ms Android native / 15ms Core Haptics is theoretical; needs real-device measurement. Some Android ERM devices may need 40ms.
- **AHAP versioning and consumer upgrade path.** If a shipped `portal-enter.ahap` gets a v2, how do consumers opt in vs stay on v1? Probably semver on the package with major-version gates; individual pattern versioning is overkill.
- **Pattern licensing.** AHAP files are authored IP. If Hapticlabs is used for authoring, verify the export license allows commercial redistribution (it does as of 2026 research — reconfirm at authoring time).
- **Per-atmosphere pattern variants.** Does Blood Moon want a more visceral `story-beat.ahap` than the default Void? Probably yes eventually. Start with one-size-fits-all; atmosphere-tuned patterns are v2 scope.
- **KT `haptic="immersive"` — does continuous haptic under every sentence feel magical or exhausting?** Needs real user testing. May end up as "immersive on dramatic sentences only" with the narrative engine flagging intensity. CoNexus's story beat classifier (already in service layer) is the natural input.
- **Web haptics — do we try harder?** Some apps use `AudioContext` tricks to piggyback haptic-like feedback through silent audio assets on iOS Safari. Brittle, un-Apple-approved, borderline. Default answer: no, we don't. Re-evaluate only if iOS Safari ever ships proper `navigator.vibrate` (unlikely by 2027).
- **Should `data-haptics` gate SCSS visual dampening?** E.g., when haptics are off, maybe glass hover lift is slightly exaggerated to compensate for the missing tactile confirmation. Interesting thought, probably not worth the complexity.

---

## Honest tradeoffs

**The web tier will always be second-class.** Haptics is a mobile-native feature. No amount of engineering will make desktop web feel like an iPhone with Taptic Engine. The showcase demo will be noticeably flatter on desktop than on a phone held in the viewer's hand. Accept this — the mobile demo is what sells — but be honest in the documentation.

**Continuous haptics have a battery tax.** Not theoretical — Apple's own guidance explicitly warns against indefinite haptic playback. If a user leaves CoNexus open with ambient storm haptics running for an hour, the phone warms and the battery drains. The package must gate ambient haptics behind an explicit opt-in, auto-release on backgrounding, and document the trade-off loudly in the premium package README. Better a conservative default than a bad review about overheating.

**AHAP pattern design is a craft, not a code task.** The patterns that feel best are authored with ears, hands, and iteration — not written as JSON by a developer. Expect to spend an unreasonable amount of time on what seems like a tiny number of patterns. The `portal-enter` pattern will go through 30 revisions and the final version will be different from the first in ways that look like nothing on paper. This is the whole craft.

**The custom Capacitor plugin is a maintenance burden.** Native plugins break on Capacitor major upgrades. Swift deprecations. Kotlin API level migrations. Budget a half-day every 6–12 months for plugin maintenance, plus a rare full-day for a breaking Capacitor change. This is the cost of owning native code, and it's the only way to access AHAP.

**The demo may oversell what ships.** The "feel the story" pitch is the most intoxicating demo in all of VE — because haptics are genuinely magical when they work, and because they are rare. Resist the urge to write marketing copy that implies every button in a VE app feels cinematic. The reality: the baseline vocabulary is tasteful and correct; the magic moments are rare and deliberate. Same framing as Rive — spice, not dish.

**Haptics are failure-silent.** If the plugin throws, if the engine fails to start, if the AHAP file is malformed, the user feels nothing — and may not even notice. This is both a feature (graceful degradation) and a risk (the author doesn't notice their own haptics stopped working in a build). Build a `haptics.test()` function that plays a known pattern, log a dev-mode warning when T2 playback fails, and include a "test your haptics" button in the preferences fragment. Don't let bugs hide behind silence.

**Taptic Engine fidelity is a privilege, not an entitlement.** Not every iPhone has the same Taptic Engine generation — Taptic 2 (iPhone 8+) is the floor for good Core Haptics, but the iPhone 12+ generations are markedly better at sharp transients. Users on older devices get AHAP patterns that sound muffled relative to the design intent. Don't bother correcting for this — it's invisible to the user who has never felt the newer device.

---

## Related plans

- [../phase-2-mobile-deployment.md](../phase-2-mobile-deployment.md) §4 — Phase 2 ships the stock `@capacitor/haptics` wrapper that this package upgrades
- [../phase-3b-premium-packages.md](../phase-3b-premium-packages.md) — the private premium repo this package will join as a fifth package
- [../phase-4-conexus-migration.md](../phase-4-conexus-migration.md) — CoNexus's story engine provides the beat-rhythm calibration for AHAP pattern design
- [../decisions.md#d17--selective-publishing-via-publishconfig](../decisions.md) §D17 — the flip-to-public mechanism; haptics is a candidate post-Phase-4
- [./rive.md](./rive.md) — sibling future package with similar "parked premium polish" framing; same delivery-decoupled pattern
- [./i18n.md](./i18n.md) — sibling future plan; a localized haptics vocabulary is not a real need (haptics are language-neutral), but locale-aware reading-rhythm calibration for KT accent timing may matter once i18n ships
