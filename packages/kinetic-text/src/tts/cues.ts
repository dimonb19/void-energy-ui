import type { KineticCue, KineticTextEffect } from '../types';
import type { WordTimestamp } from './types';

/**
 * An inline `{{fx:name}}` token extracted from raw script text, with the
 * position in the **cleaned** text (spaces and letters only) where the
 * effect should fire.
 */
export interface InlineEffectToken {
  /** Position in the stripped (clean) text, not the raw input. */
  cleanIndex: number;
  /** Effect name from `{{fx:name}}`. Caller validates against `KineticTextEffect`. */
  effect: string;
}

const FX_TOKEN_RE = /\{\{fx:([a-z][a-z0-9_-]*)\}\}/gi;

/**
 * Strip `{{fx:name}}` tokens from raw script text.
 *
 * Returns the clean text (safe to send to TTS) and a list of extracted
 * tokens with their positions in the clean text. The clean index is the
 * character index **at which the token was removed** — so the effect
 * fires as the character at that position reveals.
 */
export function stripEffectTokens(rawText: string): {
  cleanText: string;
  tokens: InlineEffectToken[];
} {
  const tokens: InlineEffectToken[] = [];
  let cleanText = '';
  let lastEnd = 0;

  // Use a fresh RegExp per call — lastIndex state is not shared.
  const re = new RegExp(FX_TOKEN_RE.source, FX_TOKEN_RE.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(rawText)) !== null) {
    cleanText += rawText.slice(lastEnd, match.index);
    tokens.push({
      cleanIndex: cleanText.length,
      effect: match[1].toLowerCase(),
    });
    lastEnd = match.index + match[0].length;
  }
  cleanText += rawText.slice(lastEnd);

  return { cleanText, tokens };
}

/**
 * Resolve extracted tokens to timed `KineticCue[]`.
 *
 * For each token, finds the word whose span in `cleanText` contains (or
 * immediately follows) the token's position, and schedules the cue at
 * that word's `startMs`. Falls back to 0 for tokens that precede the
 * first word and to the last word's `endMs` for tokens past the end.
 *
 * Pure — deterministic for identical input.
 */
export function resolveEffectCues(
  tokens: InlineEffectToken[],
  cleanText: string,
  wordTimestamps: WordTimestamp[],
): KineticCue[] {
  if (tokens.length === 0) return [];

  // Locate each word in cleanText so we can map token positions to times.
  // Case-insensitive so providers that uppercase sentence starts or
  // lowercase emphasis still align with the source.
  const lowerClean = cleanText.toLowerCase();
  const wordSpans: { start: number; end: number; ts: WordTimestamp }[] = [];
  let searchFrom = 0;
  for (const ts of wordTimestamps) {
    if (!ts.word) continue;
    const found = lowerClean.indexOf(ts.word.toLowerCase(), searchFrom);
    if (found === -1) continue;
    wordSpans.push({ start: found, end: found + ts.word.length, ts });
    searchFrom = found + ts.word.length;
  }

  const cues: KineticCue[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    let atMs = 0;

    if (wordSpans.length === 0) {
      atMs = 0;
    } else if (token.cleanIndex <= wordSpans[0].start) {
      atMs = wordSpans[0].ts.startMs;
    } else if (token.cleanIndex >= wordSpans[wordSpans.length - 1].end) {
      atMs = wordSpans[wordSpans.length - 1].ts.endMs;
    } else {
      // Find the first word whose end is past the token position
      for (const span of wordSpans) {
        if (span.end > token.cleanIndex) {
          atMs = span.ts.startMs;
          break;
        }
      }
    }

    cues.push({
      id: `fx-${i}-${token.effect}`,
      effect: token.effect as KineticTextEffect,
      trigger: 'at-time',
      atMs,
    });
  }

  return cues;
}
