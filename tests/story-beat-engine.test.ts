import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  storyBeatEngine,
  StoryBeatEngine,
} from '../src/lib/story-beat-engine.svelte';
import { ambient } from '@dgrslabs/void-energy-ambient-layers';
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

  it('releases prior handles atomically on each subsequent beat', () => {
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
    expect(ambient.atmosphere).toHaveLength(0);
    expect(ambient.psychology).toHaveLength(1);
    expect(ambient.psychology[0]).toMatchObject({
      variant: 'tension',
      intensity: 'low',
    });
  });
});

describe('StoryBeatEngine — releaseAmbient', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    ambient.clear();
    engine = new StoryBeatEngine();
  });

  it('clears ambient state but keeps the beat so the text stays on screen', () => {
    const beat = makeBeat('idle');
    engine.applyBeat(beat);
    engine.releaseAmbient();

    expect(engine.currentBeat?.id).toBe('idle');
    expect(ambient.atmosphere).toHaveLength(0);
    expect(ambient.psychology).toHaveLength(0);
    expect(ambient.environment).toHaveLength(0);
  });
});

describe('StoryBeatEngine — release', () => {
  let engine: StoryBeatEngine;

  beforeEach(() => {
    quietConsole();
    ambient.clear();
    engine = new StoryBeatEngine();
  });

  it('resets both currentBeat and the ambient singleton', () => {
    engine.applyBeat(makeBeat('a'));
    engine.release();

    expect(engine.currentBeat).toBeNull();
    expect(ambient.atmosphere).toHaveLength(0);
    expect(ambient.psychology).toHaveLength(0);
    expect(ambient.environment).toHaveLength(0);
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
    expect(ambient.atmosphere[0]).toMatchObject({ variant: 'fog' });
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
