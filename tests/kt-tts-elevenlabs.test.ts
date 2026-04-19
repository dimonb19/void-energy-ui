import { describe, expect, it } from 'vitest';
import { aggregateCharTimestamps } from '../packages/kinetic-text/src/tts/providers/elevenlabs';

describe('aggregateCharTimestamps (ElevenLabs char → word)', () => {
  it('collapses non-whitespace runs into WordTimestamp entries', () => {
    const alignment = {
      characters: ['H', 'i', ' ', 'y', 'o', 'u'],
      character_start_times_seconds: [0, 0.05, 0.1, 0.2, 0.25, 0.3],
      character_end_times_seconds: [0.05, 0.1, 0.2, 0.25, 0.3, 0.4],
    };
    const words = aggregateCharTimestamps(alignment);
    expect(words).toHaveLength(2);
    expect(words[0]).toEqual({ word: 'Hi', startMs: 0, endMs: 100 });
    expect(words[1]).toEqual({ word: 'you', startMs: 200, endMs: 400 });
  });

  it('handles punctuation attached to words as part of the word', () => {
    const alignment = {
      characters: ['g', 'o', '.', ' ', 'n', 'o', '!'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
    };
    const words = aggregateCharTimestamps(alignment);
    expect(words).toHaveLength(2);
    expect(words[0].word).toBe('go.');
    expect(words[1].word).toBe('no!');
  });

  it('tolerates multiple whitespace characters between words', () => {
    const alignment = {
      characters: ['a', ' ', ' ', ' ', 'b'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5],
    };
    const words = aggregateCharTimestamps(alignment);
    expect(words).toHaveLength(2);
    expect(words[0]).toEqual({ word: 'a', startMs: 0, endMs: 100 });
    expect(words[1]).toEqual({ word: 'b', startMs: 400, endMs: 500 });
  });

  it('uses the smallest length across the three parallel arrays', () => {
    const alignment = {
      characters: ['a', 'b', 'c'],
      character_start_times_seconds: [0, 0.1], // shorter — only 2 of 3 chars aligned
      character_end_times_seconds: [0.1, 0.2, 0.3],
    };
    const words = aggregateCharTimestamps(alignment);
    expect(words).toHaveLength(1);
    expect(words[0].word).toBe('ab'); // 'c' dropped — no start time
  });

  it('returns [] for empty or missing alignment', () => {
    expect(aggregateCharTimestamps(undefined)).toEqual([]);
    expect(aggregateCharTimestamps({})).toEqual([]);
    expect(
      aggregateCharTimestamps({
        characters: [],
        character_start_times_seconds: [],
        character_end_times_seconds: [],
      }),
    ).toEqual([]);
  });

  it('handles whitespace-only input without crashing', () => {
    const alignment = {
      characters: [' ', '\n', '\t'],
      character_start_times_seconds: [0, 0.1, 0.2],
      character_end_times_seconds: [0.1, 0.2, 0.3],
    };
    expect(aggregateCharTimestamps(alignment)).toEqual([]);
  });

  it('preserves end times from the last char of each word', () => {
    // Common quirk: start of word = start of first char; end = end of LAST char.
    const alignment = {
      characters: ['h', 'e', 'l', 'l', 'o'],
      character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4],
      character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5],
    };
    const [word] = aggregateCharTimestamps(alignment);
    expect(word.startMs).toBe(0);
    expect(word.endMs).toBe(500);
  });
});
