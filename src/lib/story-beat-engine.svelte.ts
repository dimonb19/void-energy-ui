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
    this.#releaseAmbientHandles();
    this.currentBeat = beat;
    this.#pushAmbient(beat.ambient);
  }

  /**
   * Clear ambient layers while keeping the beat's text visible. Used when a
   * completed vibe idles long enough that the always-on GPU cost outweighs
   * the atmospheric benefit — the reveal stays on screen, the backdrop
   * effects go quiet.
   */
  releaseAmbient(): void {
    this.#releaseAmbientHandles();
  }

  release(): void {
    this.currentBeat = null;
    this.#releaseAmbientHandles();
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

  #releaseAmbientHandles(): void {
    for (const h of this.#handles) ambient.release(h);
    this.#handles = [];
  }
}

export { StoryBeatEngine };
export const storyBeatEngine = new StoryBeatEngine();
