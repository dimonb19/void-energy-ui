import { describe, expect, it } from 'vitest';
import {
  resolveEffectCues,
  stripEffectTokens,
} from '../packages/kinetic-text/src/tts/cues';

describe('stripEffectTokens', () => {
  it('returns clean text and empty tokens when no fx present', () => {
    const result = stripEffectTokens('hello world');
    expect(result.cleanText).toBe('hello world');
    expect(result.tokens).toEqual([]);
  });

  it('extracts a single inline effect token', () => {
    const { cleanText, tokens } = stripEffectTokens(
      'The glass {{fx:shatter}}shattered.',
    );
    expect(cleanText).toBe('The glass shattered.');
    expect(tokens).toHaveLength(1);
    expect(tokens[0].effect).toBe('shatter');
    // cleanIndex points at the 's' of 'shattered'
    expect(
      cleanText.slice(tokens[0].cleanIndex, tokens[0].cleanIndex + 1),
    ).toBe('s');
  });

  it('extracts multiple tokens with correct positions', () => {
    const { cleanText, tokens } = stripEffectTokens(
      '{{fx:burn}}Fire and {{fx:freeze}}ice.',
    );
    expect(cleanText).toBe('Fire and ice.');
    expect(tokens).toHaveLength(2);
    expect(tokens[0].effect).toBe('burn');
    expect(tokens[0].cleanIndex).toBe(0);
    expect(tokens[1].effect).toBe('freeze');
    expect(
      cleanText.slice(tokens[1].cleanIndex, tokens[1].cleanIndex + 3),
    ).toBe('ice');
  });

  it('lowercases effect names', () => {
    const { tokens } = stripEffectTokens('hi {{fx:SHAKE}} there');
    expect(tokens[0].effect).toBe('shake');
  });

  it('ignores malformed tokens', () => {
    const { cleanText, tokens } = stripEffectTokens('{{fx:}} {{notfx:shake}}');
    expect(cleanText).toBe('{{fx:}} {{notfx:shake}}');
    expect(tokens).toEqual([]);
  });
});

describe('resolveEffectCues', () => {
  it('returns empty for no tokens', () => {
    expect(resolveEffectCues([], 'hello', [])).toEqual([]);
  });

  it('maps a token to the startMs of the word at its position', () => {
    const cleanText = 'The glass shattered.';
    const tokens = [{ cleanIndex: 10, effect: 'shatter' }]; // 's' in shattered
    const cues = resolveEffectCues(tokens, cleanText, [
      { word: 'The', startMs: 0, endMs: 200 },
      { word: 'glass', startMs: 200, endMs: 600 },
      { word: 'shattered', startMs: 700, endMs: 1400 },
    ]);
    expect(cues).toHaveLength(1);
    expect(cues[0].atMs).toBe(700);
    expect(cues[0].trigger).toBe('at-time');
    expect(cues[0].effect).toBe('shatter');
  });

  it('uses first word startMs for tokens before the first word', () => {
    const cues = resolveEffectCues(
      [{ cleanIndex: 0, effect: 'flash' }],
      'hello',
      [{ word: 'hello', startMs: 500, endMs: 900 }],
    );
    expect(cues[0].atMs).toBe(500);
  });

  it('uses last word endMs for tokens past the last word', () => {
    const cues = resolveEffectCues(
      [{ cleanIndex: 100, effect: 'fade' }],
      'hello',
      [{ word: 'hello', startMs: 0, endMs: 400 }],
    );
    expect(cues[0].atMs).toBe(400);
  });

  it('assigns unique ids to each cue', () => {
    const cues = resolveEffectCues(
      [
        { cleanIndex: 0, effect: 'flash' },
        { cleanIndex: 5, effect: 'flash' },
      ],
      'hello world',
      [
        { word: 'hello', startMs: 0, endMs: 400 },
        { word: 'world', startMs: 500, endMs: 900 },
      ],
    );
    expect(new Set(cues.map((c) => c.id)).size).toBe(2);
  });

  it('defaults to atMs 0 when there are no word timestamps', () => {
    const cues = resolveEffectCues(
      [{ cleanIndex: 0, effect: 'flash' }],
      'hello',
      [],
    );
    expect(cues[0].atMs).toBe(0);
  });
});
