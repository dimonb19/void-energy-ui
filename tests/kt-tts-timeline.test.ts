import { describe, expect, it } from 'vitest';
import {
  buildKineticCues,
  resolveActionTimes,
  SPEED_TO_WORD_MS,
  wordSpansOf,
  wordStartTimes,
} from '../packages/kinetic-text/src/tts/timeline';
import type {
  TimedAction,
  TimedCue,
} from '../packages/kinetic-text/src/tts/timeline';

describe('wordSpansOf', () => {
  it('splits simple sentences into word spans', () => {
    const spans = wordSpansOf('Salt wind cuts the air.');
    expect(spans).toHaveLength(5);
    expect(spans[0]).toEqual({ start: 0, end: 4 });
    expect(spans[4].end).toBe(23);
  });

  it('collapses whitespace runs', () => {
    expect(wordSpansOf('a   b   c')).toHaveLength(3);
  });

  it('handles empty and whitespace-only strings', () => {
    expect(wordSpansOf('')).toEqual([]);
    expect(wordSpansOf('   ')).toEqual([]);
  });
});

describe('wordStartTimes', () => {
  it('uses uniform speed fallback when no timestamps are given', () => {
    const starts = wordStartTimes('one two three four', 'default');
    expect(starts).toEqual([0, 260, 520, 780]);
  });

  it('honours the speed preset in the fallback path', () => {
    expect(wordStartTimes('one two', 'slow')).toEqual([
      0,
      SPEED_TO_WORD_MS.slow,
    ]);
    expect(wordStartTimes('one two', 'fast')).toEqual([
      0,
      SPEED_TO_WORD_MS.fast,
    ]);
  });

  it('uses provider word timestamps when present', () => {
    const starts = wordStartTimes('one two three', 'default', [
      { word: 'one', startMs: 100, endMs: 300 },
      { word: 'two', startMs: 340, endMs: 600 },
      { word: 'three', startMs: 640, endMs: 1000 },
    ]);
    expect(starts).toEqual([100, 340, 640]);
  });

  it('pads trailing indices the provider did not cover', () => {
    const starts = wordStartTimes('one two three', 'default', [
      { word: 'one', startMs: 100, endMs: 300 },
    ]);
    expect(starts).toEqual([100, 100 + 260, 100 + 260 * 2]);
  });
});

describe('buildKineticCues', () => {
  const starts = [0, 260, 520, 780];

  it('resolves atWord to the word start time', () => {
    const cues = buildKineticCues(
      [
        { atWord: 1, effect: 'shake' },
        { atWord: 3, effect: 'shatter' },
      ] satisfies TimedCue[],
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

  it('prefers atMs over atWord when both are set', () => {
    const cues = buildKineticCues(
      [{ atWord: 1, atMs: 999, effect: 'flash' }] satisfies TimedCue[],
      starts,
    );
    expect(cues[0].atMs).toBe(999);
  });

  it('honors onComplete trigger', () => {
    const cues = buildKineticCues(
      [{ onComplete: true, effect: 'surge' }] satisfies TimedCue[],
      starts,
    );
    expect(cues[0]).toMatchObject({ trigger: 'on-complete', effect: 'surge' });
    expect(cues[0].atMs).toBeUndefined();
  });

  it('emits stable unique ids per index + effect when id is omitted', () => {
    const cues = buildKineticCues(
      [
        { atWord: 0, effect: 'shake' },
        { atWord: 2, effect: 'shake' },
      ] satisfies TimedCue[],
      starts,
    );
    expect(cues[0].id).not.toBe(cues[1].id);
  });

  it('uses provided id when present', () => {
    const cues = buildKineticCues(
      [{ atWord: 0, effect: 'shake', id: 'custom-id' }] satisfies TimedCue[],
      starts,
    );
    expect(cues[0].id).toBe('custom-id');
  });

  it('drops cues without a trigger position', () => {
    const cues = buildKineticCues(
      [{ effect: 'flash' }] satisfies TimedCue[],
      starts,
    );
    expect(cues).toEqual([]);
  });

  it('clamps out-of-range atWord to the nearest word', () => {
    const cues = buildKineticCues(
      [{ atWord: 99, effect: 'flash' }] satisfies TimedCue[],
      starts,
    );
    expect(cues[0].atMs).toBe(780);
  });

  it('clamps negative atMs to 0', () => {
    const cues = buildKineticCues(
      [{ atMs: -500, effect: 'flash' }] satisfies TimedCue[],
      starts,
    );
    expect(cues[0].atMs).toBe(0);
  });

  it('forwards range and durationMs', () => {
    const cues = buildKineticCues(
      [
        {
          atWord: 1,
          effect: 'shake',
          range: { start: 0, end: 5 },
          durationMs: 800,
        },
      ] satisfies TimedCue[],
      starts,
    );
    expect(cues[0]).toMatchObject({
      range: { start: 0, end: 5 },
      durationMs: 800,
    });
  });

  it('returns [] for undefined or empty input', () => {
    expect(buildKineticCues(undefined, starts)).toEqual([]);
    expect(buildKineticCues([], starts)).toEqual([]);
  });
});

describe('resolveActionTimes', () => {
  const starts = [0, 260, 520];

  it('returns atMs + payload tuples sorted by atMs', () => {
    const scheduled = resolveActionTimes(
      [
        { atWord: 2, payload: 'b' },
        { atWord: 0, payload: 'a' },
      ] satisfies TimedAction<string>[],
      starts,
    );
    expect(scheduled).toEqual([
      { atMs: 0, payload: 'a' },
      { atMs: 520, payload: 'b' },
    ]);
  });

  it('prefers atMs over atWord', () => {
    const scheduled = resolveActionTimes(
      [
        { atWord: 1, atMs: 1500, payload: 'late' },
      ] satisfies TimedAction<string>[],
      starts,
    );
    expect(scheduled[0]).toEqual({ atMs: 1500, payload: 'late' });
  });

  it('clamps out-of-range atWord to the last word start', () => {
    const scheduled = resolveActionTimes(
      [{ atWord: 99, payload: 'x' }] satisfies TimedAction<string>[],
      starts,
    );
    expect(scheduled[0].atMs).toBe(520);
  });

  it('drops actions with atWord when wordStarts is empty', () => {
    const scheduled = resolveActionTimes(
      [{ atWord: 0, payload: 'x' }] satisfies TimedAction<string>[],
      [],
    );
    expect(scheduled).toEqual([]);
  });

  it('keeps actions with atMs even when wordStarts is empty', () => {
    const scheduled = resolveActionTimes(
      [{ atMs: 1000, payload: 'x' }] satisfies TimedAction<string>[],
      [],
    );
    expect(scheduled).toEqual([{ atMs: 1000, payload: 'x' }]);
  });

  it('drops actions with no trigger position', () => {
    const scheduled = resolveActionTimes(
      [{ payload: 'orphan' }] satisfies TimedAction<string>[],
      starts,
    );
    expect(scheduled).toEqual([]);
  });

  it('clamps negative atMs to 0', () => {
    const scheduled = resolveActionTimes(
      [{ atMs: -200, payload: 'x' }] satisfies TimedAction<string>[],
      starts,
    );
    expect(scheduled[0].atMs).toBe(0);
  });

  it('returns [] for undefined or empty input', () => {
    expect(resolveActionTimes(undefined, starts)).toEqual([]);
    expect(resolveActionTimes([], starts)).toEqual([]);
  });
});
