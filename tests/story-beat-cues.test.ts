import { describe, expect, it } from 'vitest';
import {
  buildCuesFromOneShots,
  generateSpontaneousExtras,
  scheduleActions,
  wordSpansOf,
  wordStartTimes,
} from '../src/lib/story-beat-cues';
import type { StoryBeat } from '../src/lib/story-beat-types';

function makeBeat(partial: Partial<StoryBeat> = {}): StoryBeat {
  return {
    id: 'test',
    title: 'Test',
    text: 'x',
    ambient: {
      environment: [{ layer: 'night', intensity: 'low' }],
      actions: [{ atWord: 5, variant: 'flash', intensity: 'high' }],
    },
    kinetic: {
      revealStyle: 'pop',
      oneShots: [{ atWord: 7, effect: 'surge' }],
    },
    ...partial,
  };
}

/** Deterministic RNG for tests — linear congruential, seeded. */
function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe('wordSpansOf', () => {
  it('splits simple sentences into word spans', () => {
    const spans = wordSpansOf('Salt wind cuts the air.');
    expect(spans).toHaveLength(5);
    expect(spans[0]).toEqual({ start: 0, end: 4 }); // "Salt"
    expect(spans[4].end).toBe(23); // "air." including the period
  });

  it('collapses whitespace runs', () => {
    expect(wordSpansOf('a   b   c')).toHaveLength(3);
  });

  it('handles empty and whitespace-only strings', () => {
    expect(wordSpansOf('')).toEqual([]);
    expect(wordSpansOf('   ')).toEqual([]);
  });
});

describe('wordStartTimes — fallback', () => {
  it('spaces words evenly using the preset speed when no timestamps are given', () => {
    const starts = wordStartTimes('one two three four', 'default');
    expect(starts).toHaveLength(4);
    expect(starts[0]).toBe(0);
    expect(starts[1]).toBe(260);
    expect(starts[2]).toBe(520);
    expect(starts[3]).toBe(780);
  });

  it('honours the speed preset', () => {
    expect(wordStartTimes('one two', 'slow')[1]).toBe(420);
    expect(wordStartTimes('one two', 'fast')[1]).toBe(160);
  });
});

describe('wordStartTimes — TTS path', () => {
  it('uses word timestamps when present', () => {
    const starts = wordStartTimes('one two three', 'default', [
      { word: 'one', startMs: 100, endMs: 300 },
      { word: 'two', startMs: 340, endMs: 600 },
      { word: 'three', startMs: 640, endMs: 1000 },
    ]);
    expect(starts).toEqual([100, 340, 640]);
  });

  it('pads trailing word indices the provider did not cover', () => {
    const starts = wordStartTimes('one two three', 'default', [
      { word: 'one', startMs: 100, endMs: 300 },
    ]);
    expect(starts).toHaveLength(3);
    expect(starts[0]).toBe(100);
    // Fallback extends from the last known startMs
    expect(starts[1]).toBe(100 + 260);
    expect(starts[2]).toBe(100 + 260 * 2);
  });
});

describe('buildCuesFromOneShots', () => {
  const starts = [0, 260, 520, 780];

  it('maps each one-shot to a KineticCue with atMs from word starts', () => {
    const cues = buildCuesFromOneShots(
      [
        { atWord: 1, effect: 'shake' },
        { atWord: 3, effect: 'shatter' },
      ],
      starts,
    );
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({
      effect: 'shake',
      trigger: 'at-time',
      atMs: 260,
    });
    expect(cues[1]).toMatchObject({ effect: 'shatter', atMs: 780 });
  });

  it('emits unique cue ids so the timeline does not dedupe same-effect cues', () => {
    const cues = buildCuesFromOneShots(
      [
        { atWord: 0, effect: 'shake' },
        { atWord: 2, effect: 'shake' },
      ],
      starts,
    );
    expect(cues[0].id).not.toBe(cues[1].id);
  });

  it('returns [] for undefined or empty input', () => {
    expect(buildCuesFromOneShots(undefined, starts)).toEqual([]);
    expect(buildCuesFromOneShots([], starts)).toEqual([]);
  });

  it('clamps out-of-range atWord to atMs=0 so the cue still fires', () => {
    const cues = buildCuesFromOneShots(
      [{ atWord: 99, effect: 'flash' }],
      starts,
    );
    expect(cues[0].atMs).toBe(0);
  });
});

describe('scheduleActions', () => {
  const starts = [0, 260, 520];

  it('returns atMs + action tuples in input order', () => {
    const scheduled = scheduleActions(
      [
        { atWord: 1, variant: 'glitch', intensity: 'medium' },
        { atWord: 2, variant: 'flash', intensity: 'high' },
      ],
      starts,
    );
    expect(scheduled).toHaveLength(2);
    expect(scheduled[0]).toEqual({
      atMs: 260,
      action: { atWord: 1, variant: 'glitch', intensity: 'medium' },
    });
    expect(scheduled[1].atMs).toBe(520);
  });

  it('clamps out-of-range atWord to the last known word start', () => {
    const scheduled = scheduleActions(
      [{ atWord: 99, variant: 'impact', intensity: 'low' }],
      starts,
    );
    expect(scheduled[0].atMs).toBe(520);
  });

  it('returns [] when actions are empty or word starts are empty', () => {
    expect(scheduleActions([], starts)).toEqual([]);
    expect(
      scheduleActions([{ atWord: 0, variant: 'flash', intensity: 'low' }], []),
    ).toEqual([]);
  });
});

describe('generateSpontaneousExtras', () => {
  it('returns nothing for short beats (would spam a tiny window)', () => {
    const extras = generateSpontaneousExtras(makeBeat(), 8, seededRng(1));
    expect(extras.actions).toEqual([]);
    expect(extras.oneShots).toEqual([]);
  });

  it('scales extras count with word count', () => {
    const short = generateSpontaneousExtras(makeBeat(), 20, seededRng(1));
    expect(short.actions.length + short.oneShots.length).toBe(1);

    const medium = generateSpontaneousExtras(makeBeat(), 40, seededRng(1));
    expect(medium.actions.length + medium.oneShots.length).toBe(2);

    const long = generateSpontaneousExtras(makeBeat(), 80, seededRng(1));
    expect(long.actions.length + long.oneShots.length).toBe(3);
  });

  it('never lands on a word index the beat already claimed', () => {
    const beat = makeBeat({
      ambient: {
        environment: [{ layer: 'night', intensity: 'low' }],
        actions: [{ atWord: 5, variant: 'flash', intensity: 'high' }],
      },
      kinetic: {
        revealStyle: 'pop',
        oneShots: [{ atWord: 7, effect: 'surge' }],
      },
    });
    // Try many seeds — none should ever pick word 5 or 7.
    for (let seed = 1; seed < 100; seed++) {
      const extras = generateSpontaneousExtras(beat, 60, seededRng(seed));
      for (const a of extras.actions) {
        expect(a.atWord).not.toBe(5);
        expect(a.atWord).not.toBe(7);
      }
      for (const o of extras.oneShots) {
        expect(o.atWord).not.toBe(5);
        expect(o.atWord).not.toBe(7);
      }
    }
  });

  it('skips the first two words and the final word', () => {
    // With a small window (wordCount=10) we always pick exactly 1 extra, and
    // the legal range is indices [2, 8] minus the beat's claims.
    for (let seed = 1; seed < 100; seed++) {
      const extras = generateSpontaneousExtras(
        makeBeat({
          ambient: {
            environment: [{ layer: 'night', intensity: 'low' }],
            // Put the scheduled action outside the legal range so it doesn't
            // further constrain the pick.
            actions: [{ atWord: 0, variant: 'flash', intensity: 'high' }],
          },
          kinetic: {
            revealStyle: 'pop',
            oneShots: [{ atWord: 9, effect: 'surge' }],
          },
        }),
        10,
        seededRng(seed),
      );
      const picked = [
        ...extras.actions.map((a) => a.atWord),
        ...extras.oneShots.map((o) => o.atWord),
      ];
      for (const w of picked) {
        expect(w).toBeGreaterThanOrEqual(2);
        expect(w).toBeLessThanOrEqual(8);
      }
    }
  });

  it('is deterministic for the same seed', () => {
    const a = generateSpontaneousExtras(makeBeat(), 50, seededRng(42));
    const b = generateSpontaneousExtras(makeBeat(), 50, seededRng(42));
    expect(a).toEqual(b);
  });
});
