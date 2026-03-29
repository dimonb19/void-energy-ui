import type {
  PreparedTextWithSegments,
  LayoutLinesResult,
} from '@chenglou/pretext';
import type { CharPosition } from '../../types';

export interface CachedLayout {
  prepared: PreparedTextWithSegments;
  layout: LayoutLinesResult;
  positions: CharPosition[];
}

/**
 * Simple layout cache keyed by text + font + lineHeight + width.
 * Stores a single entry — if the key changes, the old entry is discarded.
 */
export class LayoutCache {
  private key = '';
  private entry: CachedLayout | null = null;

  private static buildKey(
    text: string,
    font: string,
    lineHeight: number,
    width: number,
  ): string {
    return `${text}\0${font}\0${lineHeight}\0${Math.round(width)}`;
  }

  get(
    text: string,
    font: string,
    lineHeight: number,
    width: number,
  ): CachedLayout | null {
    const key = LayoutCache.buildKey(text, font, lineHeight, width);
    if (key === this.key && this.entry) {
      return this.entry;
    }
    return null;
  }

  set(
    text: string,
    font: string,
    lineHeight: number,
    width: number,
    value: CachedLayout,
  ): void {
    this.key = LayoutCache.buildKey(text, font, lineHeight, width);
    this.entry = value;
  }

  invalidate(): void {
    this.key = '';
    this.entry = null;
  }
}
