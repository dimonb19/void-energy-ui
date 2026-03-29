import {
  prepareWithSegments,
  layoutWithLines,
  type PreparedTextWithSegments,
  type LayoutLinesResult,
  type LayoutCursor,
} from '@chenglou/pretext';
import type { GraphemeInfo, CharPosition } from '../../types';
import { extractGraphemes } from './graphemes';
import { LayoutCache, type CachedLayout } from './cache';

export type { CachedLayout };

/**
 * PretextLayout: adapter around @chenglou/pretext for the kinetic text package.
 *
 * Handles font readiness, text preparation, line layout, grapheme extraction,
 * and position computation. Caches results to avoid redundant computation.
 */
export class PretextLayout {
  private cache = new LayoutCache();

  /**
   * Wait for font readiness, then prepare text for layout.
   */
  async prepare(text: string, font: string): Promise<PreparedTextWithSegments> {
    await document.fonts.ready;
    try {
      await document.fonts.load(font);
    } catch {
      // Font may not exist or load may fail — proceed with fallback
    }
    return prepareWithSegments(text, font);
  }

  /**
   * Compute layout at a given width. Returns lines with start/end cursors.
   */
  layout(
    prepared: PreparedTextWithSegments,
    maxWidth: number,
    lineHeight: number,
  ): LayoutLinesResult {
    return layoutWithLines(prepared, maxWidth, lineHeight);
  }

  /**
   * Full pipeline: prepare → layout → extract graphemes → compute positions.
   * Returns cached result if inputs haven't changed.
   */
  async computeLayout(
    text: string,
    font: string,
    lineHeight: number,
    width: number,
  ): Promise<CachedLayout> {
    const cached = this.cache.get(text, font, lineHeight, width);
    if (cached) return cached;

    const prepared = await this.prepare(text, font);
    const result = this.layout(prepared, width, lineHeight);
    const graphemes = extractGraphemes(prepared);
    const positions = computePositions(graphemes, result);

    const entry: CachedLayout = { prepared, layout: result, positions };
    this.cache.set(text, font, lineHeight, width, entry);
    return entry;
  }

  /**
   * Re-layout with new width only (no re-preparation needed).
   * Used by ResizeObserver to avoid redundant font loading.
   */
  relayout(
    text: string,
    font: string,
    lineHeight: number,
    width: number,
    prepared: PreparedTextWithSegments,
  ): CachedLayout {
    const cached = this.cache.get(text, font, lineHeight, width);
    if (cached) return cached;

    const result = this.layout(prepared, width, lineHeight);
    const graphemes = extractGraphemes(prepared);
    const positions = computePositions(graphemes, result);

    const entry: CachedLayout = { prepared, layout: result, positions };
    this.cache.set(text, font, lineHeight, width, entry);
    return entry;
  }

  /**
   * Clear cached preparations when text or font changes.
   */
  invalidate(): void {
    this.cache.invalidate();
  }
}

// ── Position computation ─────────────────────────────────────────

function cursorBefore(a: LayoutCursor, b: LayoutCursor): boolean {
  if (a.segmentIndex !== b.segmentIndex) return a.segmentIndex < b.segmentIndex;
  return a.graphemeIndex < b.graphemeIndex;
}

function cursorEqual(a: LayoutCursor, b: LayoutCursor): boolean {
  return (
    a.segmentIndex === b.segmentIndex && a.graphemeIndex === b.graphemeIndex
  );
}

function isInLine(
  segIdx: number,
  gIdx: number,
  start: LayoutCursor,
  end: LayoutCursor,
): boolean {
  const pos: LayoutCursor = { segmentIndex: segIdx, graphemeIndex: gIdx };
  if (cursorBefore(pos, start)) return false;
  if (cursorEqual(pos, end)) return false;
  if (cursorBefore(end, pos)) return false;
  return true;
}

const SPACE_RE = /^\s+$/;

/**
 * Walk graphemes + layout lines to compute per-grapheme CharPosition[].
 */
function computePositions(
  graphemes: GraphemeInfo[],
  layoutResult: LayoutLinesResult,
): CharPosition[] {
  const { lines } = layoutResult;
  const positions: CharPosition[] = [];

  let lineIdx = 0;
  let xInLine = 0;
  let charInLine = 0;
  let globalIndex = 0;

  for (const g of graphemes) {
    // Advance to the correct line
    while (
      lineIdx < lines.length - 1 &&
      !isInLine(
        g.segmentIndex,
        g.graphemeIndex,
        lines[lineIdx].start,
        lines[lineIdx].end,
      )
    ) {
      lineIdx++;
      xInLine = 0;
      charInLine = 0;
    }

    positions.push({
      char: g.char,
      x: xInLine,
      lineIndex: lineIdx,
      charIndexInLine: charInLine,
      globalIndex,
      width: g.width,
      isSpace: SPACE_RE.test(g.char),
    });

    xInLine += g.width;
    charInLine++;
    globalIndex++;
  }

  return positions;
}
