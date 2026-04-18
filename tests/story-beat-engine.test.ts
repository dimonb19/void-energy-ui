import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  storyBeatEngine,
  StoryBeatEngine,
} from '../src/lib/story-beat-engine.svelte';
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
    engine = new StoryBeatEngine();
  });

  it('records the current beat and mirrors its ambient config', () => {
    const beat = makeBeat('first');
    engine.applyBeat(beat);

    expect(engine.currentBeat?.id).toBe('first');
    expect(engine.activeAmbient).toEqual(beat.ambient);
  });

  it('swaps activeAmbient atomically on each subsequent beat', () => {
    engine.applyBeat(
      makeBeat('a', {
        ambient: { atmosphere: [{ layer: 'rain', intensity: 'high' }] },
      }),
    );
    expect(engine.activeAmbient.atmosphere?.[0]).toEqual({
      layer: 'rain',
      intensity: 'high',
    });

    engine.applyBeat(
      makeBeat('b', {
        ambient: { psychology: [{ layer: 'tension', intensity: 'low' }] },
      }),
    );
    expect(engine.activeAmbient.atmosphere).toBeUndefined();
    expect(engine.activeAmbient.psychology?.[0]).toEqual({
      layer: 'tension',
      intensity: 'low',
    });
  });
});

describe('StoryBeatEngine — releaseAmbient', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    engine = new StoryBeatEngine();
  });

  it('clears ambient state but keeps the beat so the text stays on screen', () => {
    const beat = makeBeat('idle');
    engine.applyBeat(beat);
    engine.releaseAmbient();

    expect(engine.currentBeat?.id).toBe('idle');
    expect(engine.activeAmbient).toEqual({});
  });
});

describe('StoryBeatEngine — release', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    engine = new StoryBeatEngine();
  });

  it('resets both currentBeat and activeAmbient', () => {
    engine.applyBeat(makeBeat('a'));
    engine.release();

    expect(engine.currentBeat).toBeNull();
    expect(engine.activeAmbient).toEqual({});
  });

  it('is safe to call on an empty engine', () => {
    expect(() => engine.release()).not.toThrow();
    expect(engine.currentBeat).toBeNull();
  });

  it('release followed by applyBeat starts cleanly', () => {
    engine.applyBeat(makeBeat('a'));
    engine.release();
    engine.applyBeat(makeBeat('b'));

    expect(engine.currentBeat?.id).toBe('b');
    expect(engine.activeAmbient.atmosphere?.[0].layer).toBe('fog');
  });
});

describe('StoryBeatEngine — default export', () => {
  beforeEach(() => {
    quietConsole();
    storyBeatEngine.release();
  });

  it('the default singleton is a StoryBeatEngine with empty state', () => {
    expect(storyBeatEngine).toBeInstanceOf(StoryBeatEngine);
    expect(storyBeatEngine.currentBeat).toBeNull();
    expect(storyBeatEngine.activeAmbient).toEqual({});
  });
});
