import type { StoryAmbient, StoryBeat } from '@lib/story-beat-types';
import { ambient } from '@void-energy/ambient-layers';

/**
 * StoryBeatEngine — holds the currently-playing beat. Ambient layers are
 * pushed onto the global `ambient` singleton via handles so they render
 * through <AmbientHost /> regardless of where the beat was applied from.
 * Theme application is intentionally omitted: the Vibe Machine showcases
 * kinetic text reveal + ambient effects on top of the host's existing
 * atmosphere rather than replacing it per beat.
 */
class StoryBeatEngine {
  currentBeat = $state<StoryBeat | null>(null);

  #handles: number[] = [];

  applyBeat(beat: StoryBeat): void {
    // Old layers fade out (~600ms) and self-release; new layers rise
    // immediately. The brief overlap reads as a crossfade rather than a cut.
    this.#fadeAmbientHandles();
    this.currentBeat = beat;
    this.#pushAmbient(beat.ambient);
  }

  /**
   * Soft-fade ambient layers while keeping the beat's text visible. Used
   * when a completed vibe idles long enough that the always-on GPU cost
   * outweighs the atmospheric benefit — the reveal stays on screen, the
   * backdrop effects animate to zero and self-release. Environment layers
   * have no decay path in the package, so they're cut hard.
   *
   * Handles are not cleared — a subsequent `applyBeat` or `release` aborts
   * any in-flight decay via the singleton's idempotent `release()`.
   */
  releaseAmbient(): void {
    for (const h of this.#handles) {
      if (!ambient.decay(h)) ambient.release(h);
    }
  }

  release(): void {
    this.currentBeat = null;
    this.#fadeAmbientHandles();
  }

  #pushAmbient(amb: StoryAmbient): void {
    for (const e of amb.environment ?? []) {
      this.#handles.push(ambient.push('environment', e.layer, e.intensity));
    }
    for (const a of amb.atmosphere ?? []) {
      this.#handles.push(ambient.push('atmosphere', a.layer, a.intensity));
    }
    for (const p of amb.psychology ?? []) {
      this.#handles.push(ambient.push('psychology', p.layer, p.intensity));
    }
  }

  /**
   * Trigger a fast fade-out on each tracked handle. Layers self-release
   * via `onEnd` when the fade completes, so we drop the handle list
   * immediately — anything that subsequently mutates a faded handle hits
   * the idempotent path in the singleton.
   */
  #fadeAmbientHandles(): void {
    for (const h of this.#handles) ambient.release(h);
    this.#handles = [];
  }
}

export { StoryBeatEngine };
export const storyBeatEngine = new StoryBeatEngine();
