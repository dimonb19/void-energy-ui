import type { RevealMark } from '../types';
import type { WordTimestamp } from './types';

/**
 * Case-insensitive `indexOf`. Providers often return words in a
 * different case than the source text (sentence-initial capitalization,
 * all-caps emphasis), and a strict match would silently drop those
 * words and force interpolation to fill the gap.
 */
function indexOfIgnoreCase(
  haystack: string,
  needle: string,
  fromIndex: number,
): number {
  if (needle.length === 0) return fromIndex;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  return h.indexOf(n, fromIndex);
}

/**
 * Convert word-level timestamps into character-level `RevealMark[]`.
 *
 * For each word in `wordTimestamps`, finds its span in `text` (starting
 * from the previous word's end, so repeated words don't collide) and
 * emits a mark per character distributed linearly across the word's
 * duration:
 *
 *     charTime(i) = startMs + (i / wordLength) * (endMs - startMs)
 *
 * Characters between words (spaces, punctuation that the TTS dropped)
 * inherit the preceding word's `endMs` so they reveal before the next
 * word starts — eliminating "empty pauses" where whitespace appears
 * long before the next spoken word.
 *
 * Word matching is case-insensitive so providers returning "Glass" for
 * source "glass" (or vice versa) still align. Words that cannot be
 * located in `text` (provider returns a word not present in the source
 * — punctuation stripped, contractions split) are silently skipped;
 * interpolation in `marksToDelays` fills their gaps.
 *
 * Pure — deterministic for identical input.
 */
export function wordTimesToRevealMarks(
  text: string,
  wordTimestamps: WordTimestamp[],
): RevealMark[] {
  if (text.length === 0 || wordTimestamps.length === 0) return [];

  const marks: RevealMark[] = [];
  let searchFrom = 0;
  let lastEndMs = 0;

  for (let w = 0; w < wordTimestamps.length; w++) {
    const { word, startMs, endMs } = wordTimestamps[w];
    if (!word) continue;

    const found = indexOfIgnoreCase(text, word, searchFrom);
    if (found === -1) {
      // Provider returned a word we can't locate — skip it. The gap is
      // filled by `marksToDelays` linear interpolation.
      lastEndMs = endMs;
      continue;
    }

    // Characters between the previous word and this one (spaces,
    // punctuation) — mark them at the previous word's endMs so they
    // don't stall the reveal.
    for (let i = searchFrom; i < found; i++) {
      marks.push({ index: i, timeMs: lastEndMs });
    }

    const wordLen = word.length;
    const span = Math.max(0, endMs - startMs);
    for (let i = 0; i < wordLen; i++) {
      const t = wordLen > 1 ? (i / (wordLen - 1)) * span : 0;
      marks.push({ index: found + i, timeMs: startMs + t });
    }

    searchFrom = found + wordLen;
    lastEndMs = endMs;
  }

  // Trailing characters after the last word (punctuation, final newline)
  for (let i = searchFrom; i < text.length; i++) {
    marks.push({ index: i, timeMs: lastEndMs });
  }

  return marks;
}
