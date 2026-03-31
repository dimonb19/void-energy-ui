import type {
  CharPosition,
  TimelineConfig,
  KineticCue,
  PhysicsPreset,
} from '../../types';
import type { CharacterRenderer } from '../render/index';
import { fireOneShotEffect } from '../effects/one-shot';
import {
  computeScrambleParams,
  computeRiseParams,
  computeDropParams,
  computeRandomRevealParams,
  applyCharParams,
  clearCharParams,
} from '../effects/params';
import { createPRNG, hashSeed } from './prng';
import { computeStaggerDelays } from './stagger';

// ── Decode charsets ──────────────────────────────────────────────

const DECODE_CHARSET_FULL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+?~';
const DECODE_CHARSET_RETRO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function getDecodeCharset(physics: PhysicsPreset): string {
  return physics === 'retro' ? DECODE_CHARSET_RETRO : DECODE_CHARSET_FULL;
}

// ── Sentence boundary detection ──────────────────────────────────

const SENTENCE_END_RE = /[.!?]/;

/**
 * Group positions into sentence-sized chunks.
 * A sentence ends at `.!?` followed by whitespace (or end of text).
 * Returns arrays of global indices, one per sentence.
 */
function splitSentences(positions: CharPosition[]): number[][] {
  const sentences: number[][] = [];
  let current: number[] = [];

  for (let i = 0; i < positions.length; i++) {
    current.push(i);
    const ch = positions[i].char;
    const nextIsSpaceOrEnd =
      i === positions.length - 1 || positions[i + 1].isSpace;

    if (SENTENCE_END_RE.test(ch) && nextIsSpaceOrEnd) {
      // Include trailing space in this sentence
      if (i + 1 < positions.length && positions[i + 1].isSpace) {
        current.push(i + 1);
        i++; // skip the space in outer loop
      }
      sentences.push(current);
      current = [];
    }
  }

  // Remaining text is the last sentence
  if (current.length > 0) {
    sentences.push(current);
  }

  return sentences;
}

/**
 * Group positions into word groups (adjacent non-space units).
 * Returns arrays of global indices, one per word.
 * Spaces between words are included as single-element groups.
 */
function splitWords(positions: CharPosition[]): number[][] {
  const groups: number[][] = [];
  let current: number[] = [];
  let inSpace = false;

  for (let i = 0; i < positions.length; i++) {
    const isSpace = positions[i].isSpace;

    if (current.length === 0) {
      current.push(i);
      inSpace = isSpace;
    } else if (isSpace === inSpace) {
      current.push(i);
    } else {
      groups.push(current);
      current = [i];
      inSpace = isSpace;
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

// ── Timeline ─────────────────────────────────────────────────────

type TimelineState = 'idle' | 'running' | 'paused' | 'complete' | 'aborted';

export class RevealTimeline {
  private state: TimelineState = 'idle';
  private rafId: number | null = null;

  // Timing
  private startTime = 0;
  private pauseTime = 0;
  private pausedDuration = 0;

  // Per-unit scheduling
  private delays: number[] = [];
  private revealed: boolean[] = [];
  private revealedCount = 0;
  private totalUnits = 0;
  private lastRevealedIndex = -1;

  // Decode mode state
  private decodeResolved: boolean[] = [];
  private decodePassCount: number[] = [];

  // Cue tracking
  private sortedCues: KineticCue[] = [];
  private firedCues = new Set<string>();

  // animationend tracking for completion cues
  private pendingCompletionAnimations = 0;

  // animationend tracking for reveal animations (non-instant styles)
  private pendingRevealAnimations = 0;

  // Guard against double-firing oneffectscomplete
  private effectsCompleteFired = false;

  // Fallback timer IDs for revealing → visible transition
  private fallbackTimers: Map<number, number> = new Map();

  constructor(
    private renderer: CharacterRenderer,
    private positions: CharPosition[],
    private config: TimelineConfig,
  ) {
    this.totalUnits = positions.length;
    this.revealed = new Array(this.totalUnits).fill(false);

    // Sort cues: at-time ascending first, then on-complete.
    // Filter out cues with out-of-range targets and warn in dev.
    this.sortedCues = [...config.cues]
      .filter((cue) => {
        if (cue.range) {
          const start = cue.range.start;
          const end = cue.range.end;
          if (start >= this.totalUnits || end <= 0 || start >= end) {
            if (
              typeof process !== 'undefined' &&
              process.env?.NODE_ENV !== 'production'
            ) {
              console.warn(
                `[KineticText] Cue "${cue.id}" has out-of-range target ` +
                  `[${start}, ${end}) for text with ${this.totalUnits} units — skipping.`,
              );
            }
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (a.trigger === 'at-time' && b.trigger === 'at-time') {
          return (a.atMs ?? 0) - (b.atMs ?? 0);
        }
        if (a.trigger === 'at-time') return -1;
        if (b.trigger === 'at-time') return 1;
        return 0;
      });
  }

  // ── Public API ───────────────────────────────────────────────

  start(): void {
    if (this.state !== 'idle') return;

    // Reduced motion: skip to end immediately
    if (this.config.reducedMotion) {
      this.skipToEnd();
      return;
    }

    // Compute per-unit delays
    this.delays = this.computeDelays();

    // Set --kt-delay on each glyph
    for (let i = 0; i < this.totalUnits; i++) {
      const glyph = this.renderer.getGlyph(i);
      if (glyph) {
        glyph.style.setProperty('--kt-delay', '0ms');
      }
    }

    // Decode mode: make all glyphs visible with scrambled text from frame 0
    if (this.config.revealMode === 'decode') {
      this.initDecode();
    }

    this.state = 'running';
    this.startTime = performance.now();
    this.tick(this.startTime);
  }

  pause(): void {
    if (this.state !== 'running') return;
    this.state = 'paused';
    this.pauseTime = performance.now();
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (this.state !== 'paused') return;
    this.pausedDuration += performance.now() - this.pauseTime;
    this.state = 'running';
    this.rafId = requestAnimationFrame((t) => this.tick(t));
  }

  seek(ms: number): void {
    if (this.state === 'aborted' || this.state === 'idle') return;

    const wasPaused = this.state === 'paused';

    // Reset state
    this.revealedCount = 0;
    this.lastRevealedIndex = -1;
    this.revealed.fill(false);
    this.firedCues.clear();

    // Reset all glyphs to hidden
    for (let i = 0; i < this.totalUnits; i++) {
      this.renderer.setGlyphState(i, 'hidden');
    }

    // Adjust start time so elapsed = ms
    this.startTime = performance.now() - ms - this.pausedDuration;

    // Process up to the seeked time
    this.processFrame(ms);

    if (wasPaused) {
      this.state = 'paused';
      this.pauseTime = performance.now();
    }
  }

  skipToEnd(): void {
    if (this.state === 'aborted') return;

    // Cancel any running RAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Clear fallback timers
    for (const timerId of this.fallbackTimers.values()) {
      clearTimeout(timerId);
    }
    this.fallbackTimers.clear();

    // Decode mode: resolve all to real text
    if (this.config.revealMode === 'decode') {
      for (let i = 0; i < this.totalUnits; i++) {
        this.renderer.setGlyphText(i, this.positions[i].char);
        this.decodeResolved[i] = true;
      }
    }

    // Reveal all units immediately
    for (let i = 0; i < this.totalUnits; i++) {
      if (!this.revealed[i]) {
        this.renderer.setGlyphState(i, 'visible');
        this.revealed[i] = true;
      }
    }
    this.revealedCount = this.totalUnits;
    this.lastRevealedIndex = this.totalUnits - 1;
    this.pendingRevealAnimations = 0;

    this.completeReveal();
  }

  abort(): void {
    if (this.state === 'aborted') return;
    this.state = 'aborted';
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    for (const timerId of this.fallbackTimers.values()) {
      clearTimeout(timerId);
    }
    this.fallbackTimers.clear();
  }

  get progress(): number {
    if (this.totalUnits === 0) return 1;
    return this.revealedCount / this.totalUnits;
  }

  get elapsed(): number {
    if (this.state === 'idle') return 0;
    if (this.state === 'paused') {
      return this.pauseTime - this.startTime - this.pausedDuration;
    }
    if (this.state === 'complete' || this.state === 'aborted') {
      return this._finalElapsed;
    }
    return performance.now() - this.startTime - this.pausedDuration;
  }

  get isComplete(): boolean {
    return this.state === 'complete';
  }

  get isPaused(): boolean {
    return this.state === 'paused';
  }

  // ── Internal ─────────────────────────────────────────────────

  private _finalElapsed = 0;

  private tick(now: number): void {
    if (this.state !== 'running') return;

    const elapsed = now - this.startTime - this.pausedDuration;
    this.processFrame(elapsed);

    if (this.revealedCount < this.totalUnits) {
      this.rafId = requestAnimationFrame((t) => this.tick(t));
    }
  }

  private processFrame(elapsed: number): void {
    const mode = this.config.revealMode;

    if (mode === 'decode') {
      this.processDecodeTick(elapsed);
    } else if (mode === 'word') {
      this.processGroupedTick(elapsed, 'word');
    } else if (mode === 'sentence') {
      this.processGroupedTick(elapsed, 'sentence');
    } else if (mode === 'sentence-pair') {
      this.processGroupedTick(elapsed, 'sentence-pair');
    } else {
      // char mode (default)
      this.processCharTick(elapsed);
    }

    // Fire time-triggered cues
    this.fireTimeCues(elapsed);

    // Update cursor position
    if (this.config.cursor && this.lastRevealedIndex >= 0) {
      this.renderer.moveCursorAfter(this.lastRevealedIndex);
    }

    // Check completion — stop RAF but defer completeReveal until
    // all reveal animations have settled (non-instant styles)
    if (this.revealedCount >= this.totalUnits && this.state === 'running') {
      this._finalElapsed = elapsed;
      if (this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.checkRevealComplete();
    }
  }

  // ── Char mode ─────────────────────────────────────────────

  private processCharTick(elapsed: number): void {
    for (let i = 0; i < this.totalUnits; i++) {
      if (this.revealed[i]) continue;
      if (elapsed >= this.delays[i]) {
        this.revealUnit(i);
      }
    }
  }

  // ── Grouped modes (word, sentence, sentence-pair) ─────────

  private _wordGroups: number[][] | null = null;
  private _sentenceGroups: number[][] | null = null;
  private _groupedSchedule:
    | { groupIndices: number[]; startMs: number }[]
    | null = null;

  private processGroupedTick(
    elapsed: number,
    mode: 'word' | 'sentence' | 'sentence-pair',
  ): void {
    if (!this._groupedSchedule) {
      this._groupedSchedule = this.buildGroupSchedule(mode);
    }

    for (const entry of this._groupedSchedule) {
      if (elapsed < entry.startMs) continue;

      // Check if the group is already fully revealed
      let allRevealed = true;
      for (const idx of entry.groupIndices) {
        if (!this.revealed[idx]) {
          allRevealed = false;
          break;
        }
      }
      if (allRevealed) continue;

      // Reveal each unit in the group, optionally with inner charSpeed stagger
      const charSpeed = this.config.charSpeed;
      for (let j = 0; j < entry.groupIndices.length; j++) {
        const idx = entry.groupIndices[j];
        if (this.revealed[idx]) continue;

        const innerDelay = entry.startMs + j * charSpeed;
        if (elapsed >= innerDelay) {
          this.revealUnit(idx);
        }
      }
    }
  }

  private buildGroupSchedule(
    mode: 'word' | 'sentence' | 'sentence-pair',
  ): { groupIndices: number[]; startMs: number }[] {
    let groups: number[][];

    if (mode === 'word') {
      if (!this._wordGroups) this._wordGroups = splitWords(this.positions);
      groups = this._wordGroups;
    } else {
      if (!this._sentenceGroups)
        this._sentenceGroups = splitSentences(this.positions);

      if (mode === 'sentence-pair') {
        // Merge pairs of sentences
        const merged: number[][] = [];
        for (let i = 0; i < this._sentenceGroups.length; i += 2) {
          if (i + 1 < this._sentenceGroups.length) {
            merged.push([
              ...this._sentenceGroups[i],
              ...this._sentenceGroups[i + 1],
            ]);
          } else {
            merged.push(this._sentenceGroups[i]);
          }
        }
        groups = merged;
      } else {
        groups = this._sentenceGroups;
      }
    }

    const speed = this.config.speed;
    return groups.map((indices, groupIdx) => ({
      groupIndices: indices,
      startMs: groupIdx * speed,
    }));
  }

  // ── Decode mode ───────────────────────────────────────────

  private initDecode(): void {
    const rng = createPRNG(this.config.seed);
    const charset = getDecodeCharset(this.config.physics);

    this.decodeResolved = new Array(this.totalUnits).fill(false);
    this.decodePassCount = new Array(this.totalUnits).fill(0);

    // All units are visible from frame 0, but with scrambled content
    for (let i = 0; i < this.totalUnits; i++) {
      if (this.positions[i].isSpace) {
        // Spaces stay as spaces
        this.renderer.setGlyphState(i, 'visible');
        this.decodeResolved[i] = true;
        this.revealed[i] = true;
        this.revealedCount++;
      } else {
        const scrambled = charset[Math.floor(rng() * charset.length)];
        this.renderer.setGlyphText(i, scrambled);
        this.renderer.setGlyphState(i, 'visible');
      }
    }
  }

  private processDecodeTick(elapsed: number): void {
    const rng = createPRNG(this.config.seed + Math.floor(elapsed / 50));
    const charset = getDecodeCharset(this.config.physics);
    const passInterval = this.config.stagger;
    const maxPasses = this.config.scramblePasses;

    for (let i = 0; i < this.totalUnits; i++) {
      if (this.decodeResolved[i]) continue;

      const resolveTime = this.delays[i] + maxPasses * passInterval;

      if (elapsed >= resolveTime) {
        // Resolve to real character
        this.renderer.setGlyphText(i, this.positions[i].char);
        this.decodeResolved[i] = true;
        this.revealed[i] = true;
        this.revealedCount++;
        if (i > this.lastRevealedIndex) this.lastRevealedIndex = i;
      } else if (elapsed >= this.delays[i]) {
        // Cycle through scrambled characters
        const newPass = Math.floor((elapsed - this.delays[i]) / passInterval);
        if (newPass > this.decodePassCount[i]) {
          this.decodePassCount[i] = newPass;
          const scrambled = charset[Math.floor(rng() * charset.length)];
          this.renderer.setGlyphText(i, scrambled);
        }
      }
    }
  }

  // ── Reveal helpers ────────────────────────────────────────

  private revealUnit(index: number): void {
    if (this.revealed[index]) return;
    this.revealed[index] = true;
    this.revealedCount++;
    if (index > this.lastRevealedIndex) this.lastRevealedIndex = index;

    if (this.config.revealStyle === 'instant') {
      // Instant: skip revealing state, go straight to visible
      this.renderer.setGlyphState(index, 'visible');
    } else {
      // Parametric reveal styles: set per-character starting transform on kt-glyph
      // (not kt-unit) so vars don't conflict with continuous effect vars on kt-unit
      const style = this.config.revealStyle;
      if (
        style === 'scramble' ||
        style === 'rise' ||
        style === 'drop' ||
        style === 'random'
      ) {
        const glyph = this.renderer.getGlyph(index);
        if (glyph) {
          const computeFn =
            style === 'scramble'
              ? computeScrambleParams
              : style === 'rise'
                ? computeRiseParams
                : style === 'drop'
                  ? computeDropParams
                  : computeRandomRevealParams;
          const params = computeFn(index, this.totalUnits, this.config.seed);
          applyCharParams(glyph, params);
        }
      }

      this.pendingRevealAnimations++;
      this.renderer.setGlyphState(index, 'revealing');
      this.scheduleVisibleTransition(index);
    }
  }

  /**
   * After the reveal CSS animation completes, transition glyph to 'visible'.
   * Uses animationend listener with a fallback timer.
   */
  private scheduleVisibleTransition(index: number): void {
    const glyph = this.renderer.getGlyph(index);
    if (!glyph) return;

    const duration = this.config.revealDuration;
    const fallbackDelay = duration * 2;

    const cleanup = () => {
      glyph.removeEventListener('animationend', onEnd);
      const timerId = this.fallbackTimers.get(index);
      if (timerId !== undefined) {
        clearTimeout(timerId);
        this.fallbackTimers.delete(index);
      }
    };

    const settle = () => {
      // Clear parametric CSS vars from kt-glyph (where they were set)
      const style = this.config.revealStyle;
      if (
        style === 'scramble' ||
        style === 'rise' ||
        style === 'drop' ||
        style === 'random'
      ) {
        const glyph = this.renderer.getGlyph(index);
        if (glyph) clearCharParams(glyph);
      }
      this.renderer.setGlyphState(index, 'visible');
      this.pendingRevealAnimations--;
      this.checkRevealComplete();
    };

    const onEnd = () => {
      cleanup();
      settle();
    };

    glyph.addEventListener('animationend', onEnd, { once: true });

    // Fallback timer in case animationend doesn't fire
    const timerId = window.setTimeout(() => {
      this.fallbackTimers.delete(index);
      glyph.removeEventListener('animationend', onEnd);
      settle();
    }, fallbackDelay);
    this.fallbackTimers.set(index, timerId);
  }

  // ── Delay computation ─────────────────────────────────────

  private computeDelays(): number[] {
    return computeStaggerDelays(
      this.positions,
      this.config.staggerPattern,
      this.config.stagger,
      this.config.physics,
      this.config.seed,
    );
  }

  // ── Cue dispatching ───────────────────────────────────────

  private fireTimeCues(elapsed: number): void {
    for (const cue of this.sortedCues) {
      if (cue.trigger !== 'at-time') continue;
      if (this.firedCues.has(cue.id)) continue;
      if (cue.atMs !== undefined && elapsed >= cue.atMs) {
        this.firedCues.add(cue.id);
        fireOneShotEffect(
          this.renderer,
          cue,
          () => {
            // Time-triggered one-shot completed — no tracking needed
          },
          this.config.reducedMotion,
        );
      }
    }
  }

  private fireCompletionCues(): void {
    for (const cue of this.sortedCues) {
      if (cue.trigger !== 'on-complete') continue;
      if (this.firedCues.has(cue.id)) continue;
      this.firedCues.add(cue.id);
      this.pendingCompletionAnimations++;
      fireOneShotEffect(
        this.renderer,
        cue,
        () => {
          this.pendingCompletionAnimations--;
          if (
            this.pendingCompletionAnimations <= 0 &&
            !this.effectsCompleteFired
          ) {
            this.effectsCompleteFired = true;
            this.config.oneffectscomplete?.();
          }
        },
        this.config.reducedMotion,
      );
    }
  }

  // ── Completion sequence ───────────────────────────────────

  private checkRevealComplete(): void {
    if (
      this.revealedCount >= this.totalUnits &&
      this.pendingRevealAnimations <= 0
    ) {
      this.completeReveal();
    }
  }

  private completeReveal(): void {
    if (this.state === 'complete' || this.state === 'aborted') return;

    // Cancel RAF
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.state = 'complete';

    // Step 1: Fire all on-complete cues
    this.fireCompletionCues();

    // Step 2: Set aria-busy="false"
    this.renderer.setAriaBusy(false);

    // Step 3: Remove cursor if configured
    if (this.config.cursorRemoveOnComplete) {
      this.renderer.removeCursor();
    }

    // Step 4: Fire onrevealcomplete
    this.config.onrevealcomplete?.();

    // Step 5: Fire oneffectscomplete
    // If no completion cues exist (or all already finished synchronously),
    // fire immediately. Otherwise, the last one-shot's onComplete callback
    // (in fireCompletionCues) handles this.
    if (this.pendingCompletionAnimations <= 0 && !this.effectsCompleteFired) {
      this.effectsCompleteFired = true;
      this.config.oneffectscomplete?.();
    }
  }
}
