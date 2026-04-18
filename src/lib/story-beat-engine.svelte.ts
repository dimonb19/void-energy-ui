import type { StoryAmbient, StoryBeat } from '@lib/story-beat-types';

/**
 * StoryBeatEngine — holds the currently-playing beat and its ambient layer
 * configuration. Theme application is intentionally omitted: the Vibe Machine
 * showcases kinetic text reveal + ambient effects on top of the host's
 * existing atmosphere rather than replacing it per beat.
 */
class StoryBeatEngine {
  currentBeat = $state<StoryBeat | null>(null);
  activeAmbient = $state<StoryAmbient>({});

  applyBeat(beat: StoryBeat): void {
    this.currentBeat = beat;
    this.activeAmbient = beat.ambient;
  }

  /**
   * Clear ambient layers while keeping the beat's text visible. Used when a
   * completed vibe idles long enough that the always-on GPU cost outweighs
   * the atmospheric benefit — the reveal stays on screen, the backdrop
   * effects go quiet.
   */
  releaseAmbient(): void {
    this.activeAmbient = {};
  }

  release(): void {
    this.currentBeat = null;
    this.activeAmbient = {};
  }
}

export { StoryBeatEngine };
export const storyBeatEngine = new StoryBeatEngine();
