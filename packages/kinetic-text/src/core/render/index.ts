import type { CharPosition, UnitState, RenderOptions } from '../../types';

/**
 * CharacterRenderer: builds and manages the DOM tree for the visual and semantic layers.
 *
 * DOM structure (from 01-architecture.md):
 *   kt-visual (aria-hidden) > kt-line > kt-unit > kt-glyph
 *   kt-semantic (sr-only, aria-live)
 *
 * kt-unit (outer) = effect animation target
 * kt-glyph (inner) = reveal animation target, holds text content
 */
export class CharacterRenderer {
  private visual: HTMLSpanElement | null = null;
  private semantic: HTMLSpanElement | null = null;
  private lines: HTMLSpanElement[] = [];
  private units: HTMLSpanElement[] = [];
  private glyphs: HTMLSpanElement[] = [];
  private cursorEl: HTMLSpanElement | null = null;
  private collapsed = false;

  constructor(
    private container: HTMLElement,
    private positions: CharPosition[],
    private options: RenderOptions,
    private fullText: string,
  ) {}

  /**
   * Build the full DOM tree: kt-visual > kt-line > kt-unit > kt-glyph, plus kt-semantic.
   */
  render(): void {
    this.destroy();

    const { positions, options, fullText, container } = this;
    const totalUnits = positions.length;

    // ── Visual layer ───────────────────────────────────────
    const visual = document.createElement('span');
    visual.className = 'kt-visual';
    visual.setAttribute('aria-hidden', 'true');
    this.visual = visual;

    // Determine line count
    const lineCount =
      totalUnits > 0 ? positions[totalUnits - 1].lineIndex + 1 : 1;

    // Pre-create line containers
    this.lines = [];
    for (let i = 0; i < lineCount; i++) {
      const line = document.createElement('span');
      line.className = 'kt-line';
      line.setAttribute('data-kt-line', String(i));
      line.style.height = `${options.lineHeight}px`;
      this.lines.push(line);
      visual.appendChild(line);
    }

    // Set container min-height to prevent layout shift
    container.style.minHeight = `${lineCount * options.lineHeight}px`;

    // Create units and glyphs
    this.units = new Array(totalUnits);
    this.glyphs = new Array(totalUnits);

    for (let i = 0; i < totalUnits; i++) {
      const pos = positions[i];
      const phase = totalUnits > 1 ? i / (totalUnits - 1) : 0;

      // Outer: kt-unit (effect layer)
      const unit = document.createElement('span');
      unit.className = pos.isSpace ? 'kt-unit kt-space' : 'kt-unit';
      unit.setAttribute('data-kt-index', String(i));
      unit.style.setProperty('--kt-phase', phase.toFixed(4));

      // Inner: kt-glyph (reveal layer)
      const glyph = document.createElement('span');
      glyph.className = 'kt-glyph';
      glyph.setAttribute('data-kt-state', 'hidden');
      glyph.style.setProperty('--kt-delay', '0ms');
      glyph.textContent = pos.char;

      unit.appendChild(glyph);
      this.lines[pos.lineIndex].appendChild(unit);

      this.units[i] = unit;
      this.glyphs[i] = glyph;
    }

    // Cursor (appended after last unit, inside visual layer)
    if (options.cursor) {
      const cursor = document.createElement('span');
      cursor.className = 'kt-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      cursor.textContent = options.cursorChar;
      visual.appendChild(cursor);
      this.cursorEl = cursor;
    }

    // ── Semantic layer ─────────────────────────────────────
    const semantic = document.createElement('span');
    semantic.className = 'kt-semantic sr-only';
    semantic.setAttribute('aria-live', 'polite');
    semantic.setAttribute('aria-busy', 'true');
    semantic.textContent = fullText;
    this.semantic = semantic;

    // Append both layers to container
    container.appendChild(visual);
    container.appendChild(semantic);
  }

  /**
   * Get the outer (effect) span at a global character index.
   */
  getUnit(index: number): HTMLSpanElement | null {
    return this.units[index] ?? null;
  }

  /**
   * Get the inner (reveal) span at a global character index.
   */
  getGlyph(index: number): HTMLSpanElement | null {
    return this.glyphs[index] ?? null;
  }

  /**
   * Get a line container element.
   */
  getLineElement(lineIndex: number): HTMLSpanElement | null {
    return this.lines[lineIndex] ?? null;
  }

  /**
   * Get all units in a line.
   */
  getLine(lineIndex: number): HTMLSpanElement[] {
    const result: HTMLSpanElement[] = [];
    for (let i = 0; i < this.positions.length; i++) {
      if (this.positions[i].lineIndex === lineIndex) {
        result.push(this.units[i]);
      }
    }
    return result;
  }

  /**
   * Get all units in a word group (adjacent non-space units containing unitIndex).
   */
  getWordGroup(unitIndex: number): HTMLSpanElement[] {
    if (
      unitIndex < 0 ||
      unitIndex >= this.positions.length ||
      this.positions[unitIndex].isSpace
    ) {
      return [];
    }

    // Walk backward to find word start
    let start = unitIndex;
    while (start > 0 && !this.positions[start - 1].isSpace) {
      start--;
    }

    // Walk forward to find word end
    let end = unitIndex;
    while (
      end < this.positions.length - 1 &&
      !this.positions[end + 1].isSpace
    ) {
      end++;
    }

    const result: HTMLSpanElement[] = [];
    for (let i = start; i <= end; i++) {
      result.push(this.units[i]);
    }
    return result;
  }

  /**
   * Set reveal state on a glyph (inner node): 'hidden' | 'revealing' | 'visible'.
   */
  setGlyphState(index: number, state: UnitState): void {
    const glyph = this.glyphs[index];
    if (glyph) {
      glyph.setAttribute('data-kt-state', state);
    }
  }

  /**
   * Set reveal state on a range of glyphs.
   */
  setGlyphRangeState(start: number, end: number, state: UnitState): void {
    for (let i = start; i < end && i < this.glyphs.length; i++) {
      this.setGlyphState(i, state);
    }
  }

  /**
   * Set effect attribute on a unit (outer node).
   */
  setUnitEffect(index: number, effect: string | null): void {
    const unit = this.units[index];
    if (unit) {
      if (effect) {
        unit.setAttribute('data-kt-effect', effect);
      } else {
        unit.removeAttribute('data-kt-effect');
      }
    }
  }

  /**
   * Set aria-busy on the semantic layer.
   */
  setAriaBusy(busy: boolean): void {
    if (this.semantic) {
      this.semantic.setAttribute('aria-busy', String(busy));
    }
  }

  /**
   * Move cursor after the unit at the given index.
   * If index is -1, cursor moves before the first unit.
   */
  moveCursorAfter(index: number): void {
    if (!this.cursorEl) return;

    if (index < 0 || index >= this.units.length) {
      // Place at end of visual layer
      this.visual?.appendChild(this.cursorEl);
      return;
    }

    const unit = this.units[index];
    if (unit && unit.nextSibling) {
      unit.parentNode?.insertBefore(this.cursorEl, unit.nextSibling);
    } else if (unit) {
      unit.parentNode?.appendChild(this.cursorEl);
    }
  }

  /**
   * Set text content of a glyph (inner node). Used by decode mode
   * to show scrambled characters then resolve to the real character.
   */
  setGlyphText(index: number, text: string): void {
    const glyph = this.glyphs[index];
    if (glyph) {
      glyph.textContent = text;
    }
  }

  /**
   * Remove the cursor element.
   */
  removeCursor(): void {
    if (this.cursorEl) {
      this.cursorEl.remove();
      this.cursorEl = null;
    }
  }

  /**
   * Get the visual layer element.
   */
  getVisual(): HTMLSpanElement | null {
    return this.visual;
  }

  /**
   * Collapse visual layer to plain text (post-reveal optimization).
   * Line containers remain — only unit-level nodes are replaced with text nodes.
   */
  collapse(): void {
    if (this.collapsed) return;
    for (const line of this.lines) {
      const text = line.textContent ?? '';
      line.textContent = '';
      line.appendChild(document.createTextNode(text));
    }
    this.units = [];
    this.glyphs = [];
    this.collapsed = true;
  }

  /**
   * Total unit count.
   */
  get length(): number {
    return this.positions.length;
  }

  /**
   * Re-render with new positions (e.g., after resize).
   * Preserves unit states from the previous render.
   */
  rerender(positions: CharPosition[]): void {
    // Capture current glyph states before destroying
    const states: UnitState[] = [];
    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      states[i] =
        (glyph?.getAttribute('data-kt-state') as UnitState) ?? 'hidden';
    }

    this.positions = positions;
    this.render();

    // Restore states (indices may shift if line breaks changed, but globalIndex is stable)
    for (let i = 0; i < Math.min(states.length, this.glyphs.length); i++) {
      this.setGlyphState(i, states[i]);
    }
  }

  /**
   * Cleanup — remove all rendered elements.
   */
  destroy(): void {
    if (this.visual) {
      this.visual.remove();
      this.visual = null;
    }
    if (this.semantic) {
      this.semantic.remove();
      this.semantic = null;
    }
    this.lines = [];
    this.units = [];
    this.glyphs = [];
    this.cursorEl = null;
    this.collapsed = false;
  }
}
