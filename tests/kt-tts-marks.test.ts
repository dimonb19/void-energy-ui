import { describe, expect, it } from 'vitest';
import { marksToDelays } from '../packages/kinetic-text/src/core/timeline/stagger';
import { wordTimesToRevealMarks } from '../packages/kinetic-text/src/tts/marks';
import type { CharPosition } from '../packages/kinetic-text/src/types';

function positionsFor(text: string): CharPosition[] {
  return Array.from(text).map((ch, i) => ({
    char: ch,
    x: i,
    lineIndex: 0,
    charIndexInLine: i,
    globalIndex: i,
    width: 1,
    isSpace: ch === ' ',
  }));
}

describe('marksToDelays', () => {
  it('returns empty array for empty positions', () => {
    expect(marksToDelays([], [])).toEqual([]);
  });

  it('fills with 0 when no marks provided', () => {
    const positions = positionsFor('abc');
    expect(marksToDelays(positions, [])).toEqual([0, 0, 0]);
  });

  it('uses exact mark time for marked indices', () => {
    const positions = positionsFor('abc');
    const delays = marksToDelays(positions, [
      { index: 0, timeMs: 100 },
      { index: 2, timeMs: 300 },
    ]);
    expect(delays[0]).toBe(100);
    expect(delays[2]).toBe(300);
  });

  it('linearly interpolates between marks', () => {
    const positions = positionsFor('abcde');
    // Marks at 0 and 4, times 0ms and 400ms
    const delays = marksToDelays(positions, [
      { index: 0, timeMs: 0 },
      { index: 4, timeMs: 400 },
    ]);
    expect(delays).toEqual([0, 100, 200, 300, 400]);
  });

  it('fills pre-first-mark positions with first mark time', () => {
    const positions = positionsFor('abcde');
    const delays = marksToDelays(positions, [
      { index: 2, timeMs: 100 },
      { index: 4, timeMs: 300 },
    ]);
    expect(delays[0]).toBe(100);
    expect(delays[1]).toBe(100);
    expect(delays[2]).toBe(100);
  });

  it('fills post-last-mark positions with last mark time', () => {
    const positions = positionsFor('abcde');
    const delays = marksToDelays(positions, [
      { index: 0, timeMs: 0 },
      { index: 2, timeMs: 100 },
    ]);
    expect(delays[3]).toBe(100);
    expect(delays[4]).toBe(100);
  });

  it('sorts unordered marks before interpolation', () => {
    const positions = positionsFor('abcde');
    const delays = marksToDelays(positions, [
      { index: 4, timeMs: 400 },
      { index: 0, timeMs: 0 },
    ]);
    expect(delays).toEqual([0, 100, 200, 300, 400]);
  });

  it('drops out-of-range marks silently', () => {
    const positions = positionsFor('abc');
    const delays = marksToDelays(positions, [
      { index: 0, timeMs: 0 },
      { index: 99, timeMs: 9999 },
      { index: -1, timeMs: -1 },
    ]);
    expect(delays[0]).toBe(0);
    // After-last-valid fill uses the surviving mark
    expect(delays[2]).toBe(0);
  });
});

describe('wordTimesToRevealMarks', () => {
  it('returns empty for empty text', () => {
    expect(wordTimesToRevealMarks('', [])).toEqual([]);
  });

  it('distributes a single word across its span', () => {
    const marks = wordTimesToRevealMarks('hello', [
      { word: 'hello', startMs: 0, endMs: 400 },
    ]);
    expect(marks).toHaveLength(5);
    expect(marks[0]).toEqual({ index: 0, timeMs: 0 });
    expect(marks[4]).toEqual({ index: 4, timeMs: 400 });
    expect(marks[2].timeMs).toBe(200);
  });

  it('marks gap characters with previous word endMs', () => {
    const marks = wordTimesToRevealMarks('hi there', [
      { word: 'hi', startMs: 0, endMs: 200 },
      { word: 'there', startMs: 400, endMs: 900 },
    ]);
    // Space between (index 2) should be at previous endMs (200)
    const gap = marks.find((m) => m.index === 2);
    expect(gap?.timeMs).toBe(200);
  });

  it('advances searchFrom so repeated words align correctly', () => {
    const text = 'go go go';
    const marks = wordTimesToRevealMarks(text, [
      { word: 'go', startMs: 0, endMs: 100 },
      { word: 'go', startMs: 200, endMs: 300 },
      { word: 'go', startMs: 400, endMs: 500 },
    ]);
    // Three occurrences at 0, 3, 6. Each first char marked at its startMs.
    expect(marks.find((m) => m.index === 0)?.timeMs).toBe(0);
    expect(marks.find((m) => m.index === 3)?.timeMs).toBe(200);
    expect(marks.find((m) => m.index === 6)?.timeMs).toBe(400);
  });

  it('trailing characters after last word inherit last endMs', () => {
    const marks = wordTimesToRevealMarks('done!', [
      { word: 'done', startMs: 0, endMs: 400 },
    ]);
    const bang = marks.find((m) => m.index === 4);
    expect(bang?.timeMs).toBe(400);
  });

  it('skips words not found in text without throwing', () => {
    const marks = wordTimesToRevealMarks('hello', [
      { word: 'hello', startMs: 0, endMs: 100 },
      { word: 'missing', startMs: 200, endMs: 300 },
    ]);
    // Should still produce marks for 'hello'
    expect(marks.length).toBeGreaterThan(0);
  });
});
