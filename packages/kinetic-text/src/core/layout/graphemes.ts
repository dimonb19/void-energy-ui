import type { PreparedTextWithSegments } from '@chenglou/pretext';
import type { GraphemeInfo } from '../../types';

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

/**
 * Extract grapheme info aligned with Pretext's segment/breakableWidths arrays.
 *
 * For each segment in preparedText.segments:
 * - If breakableWidths[i] is non-null, it contains per-grapheme widths within
 *   that segment. Use Intl.Segmenter to split the segment into graphemes and
 *   pair each with its width.
 * - If breakableWidths[i] is null, the segment is a single unit (space, tab,
 *   punctuation, or single-grapheme word). Use the full segment width.
 */
export function extractGraphemes(
  preparedText: PreparedTextWithSegments,
): GraphemeInfo[] {
  const { segments, breakableWidths } = preparedText;
  const widths = (preparedText as unknown as { widths: number[] }).widths;
  const result: GraphemeInfo[] = [];

  for (let segIdx = 0; segIdx < segments.length; segIdx++) {
    const seg = segments[segIdx];
    const bw = breakableWidths[segIdx];

    if (bw !== null && bw.length > 0) {
      // Multi-grapheme segment: split with Intl.Segmenter
      const graphemes = Array.from(segmenter.segment(seg), (s) => s.segment);
      for (let gIdx = 0; gIdx < graphemes.length; gIdx++) {
        result.push({
          char: graphemes[gIdx],
          segmentIndex: segIdx,
          graphemeIndex: gIdx,
          width: gIdx < bw.length ? bw[gIdx] : 0,
        });
      }
    } else {
      // Single-unit segment: space, tab, punctuation, or single grapheme
      // Use Intl.Segmenter to handle potential multi-codepoint graphemes
      const graphemes = Array.from(segmenter.segment(seg), (s) => s.segment);
      const segWidth = widths[segIdx];
      if (graphemes.length <= 1) {
        result.push({
          char: seg,
          segmentIndex: segIdx,
          graphemeIndex: 0,
          width: segWidth,
        });
      } else {
        // Rare: null breakableWidths but multiple graphemes — distribute width evenly
        const perGrapheme = segWidth / graphemes.length;
        for (let gIdx = 0; gIdx < graphemes.length; gIdx++) {
          result.push({
            char: graphemes[gIdx],
            segmentIndex: segIdx,
            graphemeIndex: gIdx,
            width: perGrapheme,
          });
        }
      }
    }
  }

  return result;
}
