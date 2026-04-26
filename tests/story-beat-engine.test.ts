import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  storyBeatEngine,
  StoryBeatEngine,
} from '../src/lib/story-beat-engine.svelte';
import { ambient } from '@void-energy/ambient-layers';
import type { StoryBeat } from '../src/lib/story-beat-types';

function quietConsole() {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

function makeBeat(id: string, overrides: Partial<StoryBeat> = {}): StoryBeat {
  return {
    id,
    title: `Beat ${id}`,
    text: 'A short evocative beat of text for the vibe machine.',
    ambient: {
      atmosphere: [{ layer: 'fog', intensity: 'medium' }],
    },
    kinetic: {
      revealStyle: 'blur',
    },
    ...overrides,
  };
}

describe('StoryBeatEngine — applyBeat', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    ambient.clear();
    engine = new StoryBeatEngine();
  });

  it('records the current beat and pushes its ambient config through the singleton', () => {
    const beat = makeBeat('first');
    engine.applyBeat(beat);

    expect(engine.currentBeat?.id).toBe('first');
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0]).toMatchObject({
      variant: 'fog',
      intensity: 'medium',
    });
  });

  it('marks prior handles for fade-out on each subsequent beat (crossfade)', () => {
    engine.applyBeat(
      makeBeat('a', {
        ambient: { atmosphere: [{ layer: 'rain', intensity: 'high' }] },
      }),
    );
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0]).toMatchObject({
      variant: 'rain',
      intensity: 'high',
    });

    engine.applyBeat(
      makeBeat('b', {
        ambient: { psychology: [{ layer: 'tension', intensity: 'low' }] },
      }),
    );
    // Old atmosphere entry persists, marked for fade — AmbientHost animates
    // it out and the layer self-releases via onEnd. New psychology rises fresh.
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0]).toMatchObject({
      variant: 'rain',
      fadeMs: 1000,
    });
    expect(ambient.psychology).toHaveLength(1);
    expect(ambient.psychology[0]).toMatchObject({
      variant: 'tension',
      intensity: 'low',
    });
    expect(ambient.psychology[0].fadeMs).toBeUndefined();
  });
});

describe('StoryBeatEngine — releaseAmbient', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    ambient.clear();
    engine = new StoryBeatEngine();
  });

  it('flips atmosphere/psychology entries to decay and keeps the beat on screen', () => {
    const beat = makeBeat('idle');
    engine.applyBeat(beat);
    expect(ambient.atmosphere[0]).toMatchObject({ durationMs: 0 });

    engine.releaseAmbient();

    expect(engine.currentBeat?.id).toBe('idle');
    // Entry persists — host animates it out and self-releases via onEnd.
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0]).toMatchObject({
      variant: 'fog',
      durationMs: undefined,
    });
  });

  it('fades environment entries since they have no decay path', () => {
    engine.applyBeat(
      makeBeat('env', {
        ambient: { environment: [{ layer: 'night', intensity: 'medium' }] },
      }),
    );
    expect(ambient.environment).toHaveLength(1);

    engine.releaseAmbient();

    // Env can't decay, so the engine falls through to `release(handle)` —
    // which now fades by default. Entry persists marked fadeMs and
    // self-releases via AmbientHost's onEnd once the fade completes.
    expect(ambient.environment).toHaveLength(1);
    expect(ambient.environment[0].fadeMs).toBeGreaterThan(0);
  });

  it('subsequent applyBeat marks any decaying entry for fade and pushes the new beat', () => {
    engine.applyBeat(makeBeat('a'));
    engine.releaseAmbient();
    // Decaying entry still in store...
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0]).toMatchObject({ durationMs: undefined });

    engine.applyBeat(
      makeBeat('b', {
        ambient: { atmosphere: [{ layer: 'rain', intensity: 'low' }] },
      }),
    );
    // The next beat fades the old entry (still present, now marked fadeMs)
    // and pushes the new entry — crossfade rather than hard cut.
    expect(ambient.atmosphere).toHaveLength(2);
    const fading = ambient.atmosphere.find((e) => e.variant === 'fog');
    const fresh = ambient.atmosphere.find((e) => e.variant === 'rain');
    expect(fading?.fadeMs).toBe(1000);
    expect(fresh).toMatchObject({ variant: 'rain', durationMs: 0 });
  });
});

describe('StoryBeatEngine — release', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    ambient.clear();
    engine = new StoryBeatEngine();
  });

  it('clears currentBeat and marks prior layers for fade-out', () => {
    engine.applyBeat(makeBeat('a'));
    engine.release();

    expect(engine.currentBeat).toBeNull();
    // Layers persist until the fade animation completes (in real usage,
    // AmbientHost releases via onEnd). In tests jsdom doesn't render so
    // we verify the entry is marked fadeMs instead of asserting empty.
    expect(ambient.atmosphere).toHaveLength(1);
    expect(ambient.atmosphere[0].fadeMs).toBe(1000);
  });

  it('is safe to call on an empty engine', () => {
    expect(() => engine.release()).not.toThrow();
    expect(engine.currentBeat).toBeNull();
  });

  it('release followed by applyBeat pushes the new beat alongside the fading old one', () => {
    engine.applyBeat(makeBeat('a'));
    engine.release();
    engine.applyBeat(makeBeat('b'));

    expect(engine.currentBeat?.id).toBe('b');
    // Old fog (fading) + new fog (rising). Both are 'fog' variant; the old
    // one carries fadeMs, the new one carries default durationMs:0 (pinned).
    expect(ambient.atmosphere).toHaveLength(2);
    const fading = ambient.atmosphere.find((e) => e.fadeMs === 1000);
    const fresh = ambient.atmosphere.find((e) => e.fadeMs === undefined);
    expect(fading).toMatchObject({ variant: 'fog' });
    expect(fresh).toMatchObject({ variant: 'fog', durationMs: 0 });
  });
});

describe('StoryBeatEngine — default export', () => {
  beforeEach(() => {
    quietConsole();
    storyBeatEngine.release();
    ambient.clear();
  });

  it('the default singleton is a StoryBeatEngine with empty state', () => {
    expect(storyBeatEngine).toBeInstanceOf(StoryBeatEngine);
    expect(storyBeatEngine.currentBeat).toBeNull();
    expect(ambient.atmosphere).toHaveLength(0);
  });
});
