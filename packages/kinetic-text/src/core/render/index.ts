import type { CharPosition, UnitState, RenderOptions } from '../../types';

/**
 * CharacterRenderer: builds and manages the DOM tree for the visual and semantic layers.
 *
 * DOM structure:
 *   kt-visual (aria-hidden) > kt-line > kt-word > kt-unit > kt-oneshot > kt-glyph
 *   kt-semantic (sr-only, aria-live)
 *
 * kt-word (word wrapper) = word-scope effect target
 * kt-unit (outer) = continuous effect target
 * kt-oneshot (middle) = one-shot effect target (isolates from continuous layer)
 * kt-glyph (inner) = reveal animation target, holds text content
 *
 * Spaces are placed directly in kt-line (not inside kt-word).
 */
export class CharacterRenderer {
  private visual: HTMLSpanElement | null = null;
  private semantic: HTMLSpanElement | null = null;
  private lines: HTMLSpanElement[] = [];
  private words: HTMLSpanElement[] = [];
  private units: HTMLSpanElement[] = [];
  private oneshots: HTMLSpanElement[] = [];
  private glyphs: HTMLSpanElement[] = [];
  private collapsed = false;
  /** Maps unit index → index into this.words (-1 for spaces) */
  private unitToWord: number[] = [];

  constructor(
    private container: HTMLElement,
    private positions: CharPosition[],
    private options: RenderOptions,
    private fullText: string,
  ) {}

  /**
   * Build the full DOM tree: kt-visual > kt-line > kt-unit > kt-oneshot > kt-glyph, plus kt-semantic.
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

    // Create units, oneshots, glyphs, and word wrappers
    this.units = new Array(totalUnits);
    this.oneshots = new Array(totalUnits);
    this.glyphs = new Array(totalUnits);
    this.words = [];
    this.unitToWord = new Array(totalUnits).fill(-1);

    let currentWord: HTMLSpanElement | null = null;
    let currentWordIndex = -1;
    let currentWordLine = -1;

    for (let i = 0; i < totalUnits; i++) {
      const pos = positions[i];
      const phase = totalUnits > 1 ? i / (totalUnits - 1) : 0;

      // Outer: kt-unit (continuous effect layer)
      const unit = document.createElement('span');
      unit.className = pos.isSpace ? 'kt-unit kt-space' : 'kt-unit';
      unit.setAttribute('data-kt-index', String(i));
      unit.style.setProperty('--kt-phase', phase.toFixed(4));

      // Middle: kt-oneshot (one-shot effect layer)
      const oneshot = document.createElement('span');
      oneshot.className = 'kt-oneshot';

      // Inner: kt-glyph (reveal layer)
      const glyph = document.createElement('span');
      glyph.className = 'kt-glyph';
      glyph.setAttribute(
        'data-kt-state',
        options.preRevealed ? 'visible' : 'hidden',
      );
      glyph.style.setProperty('--kt-delay', '0ms');
      glyph.textContent = pos.char;

      oneshot.appendChild(glyph);
      unit.appendChild(oneshot);

      if (pos.isSpace) {
        // Spaces go directly in the line, closing any open word
        currentWord = null;
        this.lines[pos.lineIndex].appendChild(unit);
        this.unitToWord[i] = -1;
      } else {
        // Non-space: start or continue a word wrapper
        if (!currentWord || currentWordLine !== pos.lineIndex) {
          currentWord = document.createElement('span');
          currentWord.className = 'kt-word';
          currentWordIndex = this.words.length;
          currentWordLine = pos.lineIndex;
          this.words.push(currentWord);
          this.lines[pos.lineIndex].appendChild(currentWord);
        }
        currentWord.appendChild(unit);
        this.unitToWord[i] = currentWordIndex;
      }

      this.units[i] = unit;
      this.oneshots[i] = oneshot;
      this.glyphs[i] = glyph;
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
   * Get the one-shot effect span at a global character index.
   */
  getOneShotEl(index: number): HTMLSpanElement | null {
    return this.oneshots[index] ?? null;
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
   * Get the kt-word wrapper element for a given unit index.
   * Returns null for spaces or out-of-range indices.
   */
  getWordElement(unitIndex: number): HTMLSpanElement | null {
    const wordIdx = this.unitToWord[unitIndex];
    if (wordIdx === undefined || wordIdx < 0) return null;
    return this.words[wordIdx] ?? null;
  }

  /**
   * Get all kt-word wrapper elements.
   */
  getAllWordElements(): HTMLSpanElement[] {
    return this.words;
  }

  /**
   * Set effect attribute on a word wrapper element.
   */
  setWordEffect(wordIndex: number, effect: string | null): void {
    const word = this.words[wordIndex];
    if (word) {
      if (effect) {
        word.setAttribute('data-kt-effect', effect);
      } else {
        word.removeAttribute('data-kt-effect');
      }
    }
  }

  /**
   * Get the current reveal state of a glyph.
   */
  getGlyphState(index: number): UnitState {
    const glyph = this.glyphs[index];
    return (glyph?.getAttribute('data-kt-state') as UnitState) ?? 'hidden';
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
    this.oneshots = [];
    this.glyphs = [];
    this.words = [];
    this.unitToWord = [];
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

    // Capture unit-level effect attributes (per-char effects are recomputed
    // by the continuous effect $effect() after positions change, so we only
    // need to preserve the effect name for the brief re-render window)
    const unitEffects: (string | null)[] = [];
    for (let i = 0; i < this.units.length; i++) {
      unitEffects[i] = this.units[i]?.getAttribute('data-kt-effect') ?? null;
    }

    this.positions = positions;
    this.render();

    // Restore glyph states
    for (let i = 0; i < Math.min(states.length, this.glyphs.length); i++) {
      this.setGlyphState(i, states[i]);
    }

    // Restore unit effects
    for (let i = 0; i < Math.min(unitEffects.length, this.units.length); i++) {
      if (unitEffects[i]) {
        this.units[i].setAttribute('data-kt-effect', unitEffects[i]!);
      }
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
    this.words = [];
    this.units = [];
    this.oneshots = [];
    this.glyphs = [];
    this.unitToWord = [];
    this.collapsed = false;
  }
}
