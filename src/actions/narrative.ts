// ─────────────────────────────────────────────────────────────
// narrative.ts — Narrative Effects Engine
// Post-reveal ambient text animations for Void Energy UI
// ─────────────────────────────────────────────────────────────
//
// Effects apply CSS animations to a container element via the
// `data-narrative` attribute. SCSS owns all keyframes and visual
// tuning; this file owns lifecycle, event handling, and the
// enabled/reduced-motion gates.
//
// ── Effect categories ──────────────────────────────────────
//
//   One-shot (play once, auto-clean via animationend):
//     shake  — horizontal jitter, decaying (500ms)
//     quake  — heavy X+Y jitter, longer settle (800ms)
//     jolt   — single sharp displacement, elastic snap-back (300ms)
//     glitch — choppy offset + skew, stepped timing (600ms)
//     surge  — ascending power buildup with scale overshoot (500ms)
//     warp   — spatial scaleX oscillation with subtle skew (600ms)
//
//   Continuous (loop until cleared):
//     drift   — gentle vertical sine wave (3s)
//     flicker — irregular opacity stutters (2s)
//     breathe — slow rhythmic scale pulse (4s)
//     tremble — fast micro-shake vibration (100ms)
//     pulse   — heartbeat-tempo scale, sharp attack (1s)
//     whisper — shrink + fade, fragile presence (3s)
//     fade    — slow consciousness dissolve, opacity drift (5s)
//     freeze  — cold stillness, micro contraction + dim (5s)
//     burn    — heat distortion, vertical micro-wobble + skew (1.5s)
//     static  — persistent signal noise, rapid jitter + opacity flicker (200ms)
//     distort — woozy perception warp, rotation + asymmetric scale (3.5s)
//     sway    — lateral oscillation, horizontal sine wave (2.5s)
//
// ── Usage as Svelte action ─────────────────────────────────
//
//   <p use:narrative={{ effect: 'shake', enabled: true }} />
//
// ── Usage as standalone ────────────────────────────────────
//
//   const engine = new NarrativeEngine(el, { effect: 'breathe' });
//   engine.start();
//   engine.stop();       // clears the active effect (animation + listener)
//   engine.destroy();    // stop() + deregisters from the instance map
//
// ── Integration with Kinetic reveal ────────────────────────
//
// Kinetic controls how text arrives (char, word, sentence);
// narrative controls how the block physically reacts.
//
// ── Timing rules ───────────────────────────────────────────
//
// The two effect categories behave differently during reveal:
//
//   Continuous effects (drift, flicker, breathe, tremble,
//   pulse, whisper, fade, freeze, burn, static, distort, sway) — start IMMEDIATELY. They are ambient
//   atmosphere: the text drifts or flickers as it streams in,
//   setting the mood from the first word.
//
//   One-shot effects (shake, quake, jolt, glitch, surge, warp) — wait for
//   kinetic to FINISH. They are punctuation: a jolt only makes
//   sense once the full sentence is visible.
//
// Use isOneShotEffect() to branch:
//
//   import { isOneShotEffect } from '@actions/narrative';
//
//   const effect = step.narrativeEffect;
//   narrativeEffect = isOneShotEffect(effect) ? null : effect;
//   // → continuous starts now, one-shot waits for onComplete
//
// ── Late-arriving effects ──────────────────────────────────
//
// The narrative action is fully reactive: setting the effect
// state at ANY point during (or after) kinetic reveal will
// activate the CSS animation immediately. This means:
//
//   - You can start kinetic reveal with effect: null, then set
//     the effect later when it arrives (e.g. from an API or a
//     delayed game event). No restart, no re-mount needed.
//
//   - The action's update() fires whenever the config object
//     reference changes. Svelte 5 reactivity handles this
//     automatically when the $state variable updates.
//
// Example — effect arrives after reveal has already started:
//
//   // Text starts revealing immediately
//   let narrativeEffect = $state<NarrativeEffect | null>(null);
//
//   // Later, when the effect comes from the server:
//   function onEffectReceived(effect: NarrativeEffect) {
//     narrativeEffect = effect; // activates mid-reveal or after
//   }
//
// ── Story step pattern (with {#key} block) ─────────────────
//
// Each story step re-creates the element via {#key step.id},
// which destroys both actions cleanly and starts fresh.
//
//   <script>
//     let narrativeEffect = $state<NarrativeEffect | null>(null);
//     let revealing = $state(false);
//
//     function startStep() {
//       revealing = true;
//       const effect = step.narrativeEffect;
//       // Continuous starts now (atmosphere during reveal).
//       // One-shot waits for onComplete (punctuation on full text).
//       narrativeEffect = isOneShotEffect(effect) ? null : effect;
//     }
//
//     function onKineticDone() {
//       revealing = false;
//       if (isOneShotEffect(step.narrativeEffect)) {
//         narrativeEffect = step.narrativeEffect;
//       }
//     }
//   </script>
//
//   {#key step.id}
//     <div
//       use:kinetic={{
//         text: step.text,
//         mode: 'word',
//         chunk: 'sentence',
//         onComplete: onKineticDone,
//       }}
//       use:narrative={{
//         effect: narrativeEffect,
//         enabled: voidEngine.userConfig.narrativeEffects,
//       }}
//     />
//   {/key}
//
// ── Flow ───────────────────────────────────────────────────
//
//   1. {#key} changes → old element destroyed (both actions clean up;
//      destroy() deregisters from the instance map)
//   2. New element mounts → kinetic starts revealing text
//   3. Continuous effect: already set → CSS animation plays during reveal
//      One-shot effect: null → no-op (waits)
//   4. Kinetic finishes → onComplete fires
//   5. One-shot: narrativeEffect set now → CSS animation plays on full text
//      Continuous: already running, no change needed
//   6. One-shot: auto-clears via animationend
//      Continuous: loops until next step change or consumer clears
//
// ── Late-arriving effect variant ───────────────────────────
//
//   1. {#key} changes → kinetic starts, narrative has effect: null
//   2. Text is mid-reveal (kinetic still running)
//   3. Effect arrives (API response, game event, etc.)
//   4. Consumer sets narrativeEffect → action update() fires
//   5. CSS animation starts immediately on the partially-revealed text
//   6. Kinetic continues revealing; narrative animation runs in parallel
//
// Both flows are safe — the action handles any transition between
// null ↔ one-shot ↔ continuous at any point in the lifecycle.
//
// ─────────────────────────────────────────────────────────────

// ── One-shot effect set ──────────────────────────────────────

const ONE_SHOT_EFFECTS: ReadonlySet<NarrativeEffect> = new Set([
  'shake',
  'quake',
  'jolt',
  'glitch',
  'surge',
  'warp',
]);

/** Check whether an effect is one-shot (plays once) vs continuous (loops). */
export function isOneShotEffect(effect: NarrativeEffect): boolean {
  return ONE_SHOT_EFFECTS.has(effect);
}

// ── Reduced motion check ─────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ── Active instances (cleanup / abort) ──────────────────────

const activeInstances = new WeakMap<HTMLElement, NarrativeEngine>();

// ─────────────────────────────────────────────────────────────
// NarrativeEngine
// ─────────────────────────────────────────────────────────────

export class NarrativeEngine {
  private el: HTMLElement;
  private config: NarrativeConfig;
  private activeEffect: NarrativeEffect | null = null;
  private boundOnAnimationEnd: ((e: AnimationEvent) => void) | null = null;

  constructor(el: HTMLElement, config: NarrativeConfig) {
    // Abort any existing instance on this element
    activeInstances.get(el)?.stop();

    this.el = el;
    this.config = config;
    activeInstances.set(el, this);
  }

  // ── Public API ──────────────────────────────────────────────

  start(): void {
    const { effect, enabled = true, onComplete } = this.config;

    // Gate: disabled or no effect → no-op (fire onComplete for one-shots)
    if (!enabled || !effect) {
      if (!enabled && effect && ONE_SHOT_EFFECTS.has(effect)) {
        onComplete?.();
      }
      return;
    }

    // Gate: reduced motion → skip animation (fire onComplete for one-shots)
    if (prefersReducedMotion()) {
      if (ONE_SHOT_EFFECTS.has(effect)) {
        onComplete?.();
      }
      return;
    }

    this.applyEffect(effect);
  }

  stop(): void {
    this.clearEffect();
  }

  destroy(): void {
    this.clearEffect();
    activeInstances.delete(this.el);
  }

  // ── Internal ────────────────────────────────────────────────

  private applyEffect(effect: NarrativeEffect): void {
    // Clean up any previous effect first
    this.clearEffect();

    this.activeEffect = effect;
    this.el.dataset.narrative = effect;

    // One-shot effects need an animationend listener for cleanup
    if (ONE_SHOT_EFFECTS.has(effect)) {
      const expectedName = `narrative-${effect}`;

      this.boundOnAnimationEnd = (e: AnimationEvent) => {
        // Guard: only respond to our animation on this exact element
        if (e.target !== this.el || e.animationName !== expectedName) return;

        this.clearEffect();
        this.config.onComplete?.();
      };

      this.el.addEventListener('animationend', this.boundOnAnimationEnd);
    }
  }

  private clearEffect(): void {
    if (this.boundOnAnimationEnd) {
      this.el.removeEventListener('animationend', this.boundOnAnimationEnd);
      this.boundOnAnimationEnd = null;
    }

    if (this.activeEffect) {
      delete this.el.dataset.narrative;
      this.activeEffect = null;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Svelte Action
// ─────────────────────────────────────────────────────────────
//
// Usage:
//   <p use:narrative={{ effect: 'shake', enabled: true }} />
//
// Reactive updates (Svelte 5):
//   The action's `update` function re-evaluates when the config
//   object reference changes. Setting effect to null or enabled
//   to false stops any running animation.
// ─────────────────────────────────────────────────────────────

export function narrative(el: HTMLElement, config: NarrativeConfig) {
  let engine = new NarrativeEngine(el, config);
  engine.start();

  return {
    update(newConfig: NarrativeConfig) {
      engine.stop();
      engine = new NarrativeEngine(el, newConfig);
      engine.start();
    },
    destroy() {
      engine.destroy();
    },
  };
}
