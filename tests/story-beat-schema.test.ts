import { describe, expect, it } from 'vitest';
import { parseStoryBeat, StoryBeatSchema } from '../src/lib/story-beat-schema';
import type { StoryBeat } from '../src/lib/story-beat-types';

const baseBeat: StoryBeat = {
  id: 'tideline-0',
  title: 'The Tideline',
  tagline: 'Tideline / salt air',
  text: 'Salt wind cuts the indigo air. Something far out hums like an idling engine.',
  ambient: {
    atmosphere: [{ layer: 'rain', intensity: 'medium' }],
  },
  kinetic: {
    revealStyle: 'blur',
    continuous: 'breathe',
    speed: 'default',
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

describe('StoryBeatSchema — happy path', () => {
  it('accepts a complete valid beat', () => {
    const result = parseStoryBeat(baseBeat);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual(baseBeat);
  });

  it('accepts a beat with optional fields omitted', () => {
    const minimal: StoryBeat = {
      id: 'minimal',
      title: 'Minimal',
      text: 'A shorter beat with only the required pieces.',
      ambient: {},
      kinetic: { revealStyle: 'pop' },
    };
    const result = parseStoryBeat(minimal);
    expect(result.ok).toBe(true);
  });

  it('accepts a beat with tagline omitted', () => {
    const { tagline: _t, ...rest } = baseBeat;
    const result = parseStoryBeat(rest);
    expect(result.ok).toBe(true);
  });
});

describe('StoryBeatSchema — structural errors', () => {
  it('rejects missing id', () => {
    const bad = clone(baseBeat) as Partial<StoryBeat>;
    delete bad.id;
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects ids with uppercase or spaces', () => {
    const bad = { ...clone(baseBeat), id: 'Not Kebab' };
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.issues?.some((i) => i.includes('id'))).toBe(true);
    }
  });

  it('rejects text that is too short', () => {
    const bad = { ...clone(baseBeat), text: 'hi' };
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects text that exceeds the length cap', () => {
    const bad = { ...clone(baseBeat), text: 'a'.repeat(601) };
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects unknown top-level keys under strict mode', () => {
    const bad = { ...clone(baseBeat), extraneous: true };
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects a beat that includes a choices field (legacy shape)', () => {
    const bad = {
      ...clone(baseBeat),
      choices: [{ id: 'a', label: 'A' }],
    };
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });
});

describe('StoryBeatSchema — enum guards', () => {
  it('rejects an unknown atmosphere layer', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'lava' as never, intensity: 'medium' }];
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects out-of-range intensity', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'fog', intensity: 'extreme' as never }];
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects an unknown reveal style', () => {
    const bad = clone(baseBeat);
    bad.kinetic.revealStyle = 'teleport' as never;
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects an unknown continuous kinetic effect', () => {
    const bad = clone(baseBeat);
    bad.kinetic.continuous = 'nope' as never;
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });
});

describe('StoryBeatSchema — ambient bounds', () => {
  it('rejects more than 1 atmosphere layer — one signal beats a pile-on', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [
      { layer: 'rain', intensity: 'low' },
      { layer: 'fog', intensity: 'low' },
    ];
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects more than 1 psychology layer', () => {
    const bad = clone(baseBeat);
    bad.ambient.psychology = [
      { layer: 'danger', intensity: 'low' },
      { layer: 'tension', intensity: 'low' },
    ];
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects combining atmosphere + psychology — one ambient signal per beat', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'fog', intensity: 'medium' }];
    bad.ambient.psychology = [{ layer: 'tension', intensity: 'low' }];
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('accepts atmosphere alone', () => {
    const good = clone(baseBeat);
    // Drop continuous: fog is HEAVY and cannot coexist with continuous KT.
    good.ambient.atmosphere = [{ layer: 'fog', intensity: 'medium' }];
    good.ambient.psychology = undefined;
    good.kinetic.continuous = undefined;
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('accepts psychology alone', () => {
    const good = clone(baseBeat);
    good.ambient.atmosphere = undefined;
    good.ambient.psychology = [{ layer: 'tension', intensity: 'low' }];
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('accepts an environment entry', () => {
    const good = clone(baseBeat);
    good.ambient.environment = [{ layer: 'night', intensity: 'medium' }];
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('rejects more than one environment entry', () => {
    const bad = clone(baseBeat);
    bad.ambient.environment = [
      { layer: 'night', intensity: 'low' },
      { layer: 'neon', intensity: 'low' },
    ];
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('accepts empty ambient (silence sells the mood)', () => {
    const good = clone(baseBeat);
    good.ambient = {};
    expect(parseStoryBeat(good).ok).toBe(true);
  });
});

describe('StoryBeatSchema — tagline', () => {
  it('rejects a tagline that exceeds the length cap', () => {
    const bad = { ...clone(baseBeat), tagline: 'x'.repeat(65) };
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('rejects an empty tagline', () => {
    const bad = { ...clone(baseBeat), tagline: '' };
    expect(parseStoryBeat(bad).ok).toBe(false);
  });
});

describe('StoryBeatSchema — GPU-heavy ambient gate', () => {
  it('rejects HEAVY atmosphere (heat) with kinetic.continuous', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'heat', intensity: 'medium' }];
    bad.kinetic.continuous = 'breathe';
    const result = parseStoryBeat(bad);
    expect(result.ok).toBe(false);
  });

  it('rejects HEAVY atmosphere (underwater) with kinetic.continuous', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'underwater', intensity: 'low' }];
    bad.kinetic.continuous = 'drift';
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('rejects HEAVY atmosphere (fog) with kinetic.continuous', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = [{ layer: 'fog', intensity: 'medium' }];
    bad.kinetic.continuous = 'pulse';
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('rejects HEAVY psychology (dizzy) with kinetic.continuous', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = undefined;
    bad.ambient.psychology = [{ layer: 'dizzy', intensity: 'low' }];
    bad.kinetic.continuous = 'wobble';
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('rejects HEAVY psychology (haze) with kinetic.continuous', () => {
    const bad = clone(baseBeat);
    bad.ambient.atmosphere = undefined;
    bad.ambient.psychology = [{ layer: 'haze', intensity: 'medium' }];
    bad.kinetic.continuous = 'glow';
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('accepts HEAVY atmosphere without continuous', () => {
    const good = clone(baseBeat);
    good.ambient.atmosphere = [{ layer: 'heat', intensity: 'medium' }];
    good.kinetic.continuous = undefined;
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('accepts HEAVY psychology without continuous', () => {
    const good = clone(baseBeat);
    good.ambient.atmosphere = undefined;
    good.ambient.psychology = [{ layer: 'dizzy', intensity: 'low' }];
    good.kinetic.continuous = undefined;
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('accepts LIGHT atmosphere (rain) with kinetic.continuous', () => {
    const good = clone(baseBeat);
    good.ambient.atmosphere = [{ layer: 'rain', intensity: 'medium' }];
    good.kinetic.continuous = 'breathe';
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('accepts LIGHT psychology (tension) with kinetic.continuous', () => {
    const good = clone(baseBeat);
    good.ambient.atmosphere = undefined;
    good.ambient.psychology = [{ layer: 'tension', intensity: 'low' }];
    good.kinetic.continuous = 'flicker';
    expect(parseStoryBeat(good).ok).toBe(true);
  });
});

describe('StoryBeatSchema — direct safeParse parity', () => {
  it('direct safeParse agrees with parseStoryBeat for a valid beat', () => {
    const parsed = StoryBeatSchema.safeParse(baseBeat);
    expect(parsed.success).toBe(true);
  });
});

describe('StoryBeatSchema — one-shot and action count caps', () => {
  it('accepts up to 3 oneShots', () => {
    const good = clone(baseBeat);
    good.kinetic.oneShots = [
      { atWord: 1, effect: 'flicker' },
      { atWord: 5, effect: 'ripple' },
      { atWord: 10, effect: 'tremble' },
    ];
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('rejects 4 oneShots — deliberate moments only, density hurts', () => {
    const bad = clone(baseBeat);
    bad.kinetic.oneShots = [
      { atWord: 1, effect: 'flicker' },
      { atWord: 3, effect: 'ripple' },
      { atWord: 7, effect: 'jolt' },
      { atWord: 11, effect: 'tremble' },
    ];
    expect(parseStoryBeat(bad).ok).toBe(false);
  });

  it('accepts up to 3 actions', () => {
    const good = clone(baseBeat);
    good.ambient.actions = [
      { atWord: 2, variant: 'flash', intensity: 'low' },
      { atWord: 6, variant: 'reveal', intensity: 'low' },
      { atWord: 11, variant: 'impact', intensity: 'medium' },
    ];
    expect(parseStoryBeat(good).ok).toBe(true);
  });

  it('rejects 4 actions — deliberate moments only, density hurts', () => {
    const bad = clone(baseBeat);
    bad.ambient.actions = [
      { atWord: 2, variant: 'flash', intensity: 'low' },
      { atWord: 5, variant: 'reveal', intensity: 'low' },
      { atWord: 8, variant: 'dissolve', intensity: 'medium' },
      { atWord: 11, variant: 'impact', intensity: 'high' },
    ];
    expect(parseStoryBeat(bad).ok).toBe(false);
  });
});
