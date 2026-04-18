import { describe, expect, it } from 'vitest';
import { estimateCharSpeed } from '../packages/kinetic-text/src/tts/fallback';

describe('estimateCharSpeed', () => {
  it('returns 0 for empty text', () => {
    expect(estimateCharSpeed(1000, '')).toBe(0);
  });

  it('returns 0 for non-positive duration', () => {
    expect(estimateCharSpeed(0, 'hello')).toBe(0);
    expect(estimateCharSpeed(-50, 'hello')).toBe(0);
  });

  it('returns 0 for whitespace-only text', () => {
    expect(estimateCharSpeed(1000, '   ')).toBe(0);
  });

  it('divides duration by printable character count', () => {
    // 5 printable chars, 1000ms → 200ms/char
    expect(estimateCharSpeed(1000, 'hello')).toBe(200);
  });

  it('ignores whitespace when counting chars', () => {
    // 10 printable chars ("hello" + "world"), 1000ms → 100ms/char
    expect(estimateCharSpeed(1000, 'hello world')).toBe(100);
  });

  it('counts punctuation as printable', () => {
    // "hi!" = 3 printable chars, 900ms → 300ms/char
    expect(estimateCharSpeed(900, 'hi!')).toBe(300);
  });
});
