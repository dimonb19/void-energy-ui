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
  computePopRevealParams,
  applyCharParams,
  clearCharParams,
} from '../effects/params';
import { createPRNG, hashSeed } from './prng';
import { computeStaggerDelays, marksToDelays } from './stagger';

// ── Decode charsets ──────────────────────────────────────────────

const DECODE_CHARSET_FULL =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+?~';
const DECODE_CHARSET_RETRO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function getDecodeCharset(physics: PhysicsPreset): string {
  return physics === 'retro' ? DECODE_CHARSET_RETRO : DECODE_CHARSET_FULL;
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

  // Word boundary tracking (for onrevealword)
  /** Word index assigned to each position (-1 for pure-space groups). */
  private wordIndexOf: number[] = [];
  /** The globalIndex at which each word starts (non-space groups only). */
  private wordFirstIndex: number[] = [];
  /** Concatenated text for each word, by wordIndex. */
  private wordTexts: string[] = [];
  private wordsRevealed = new Set<number>();

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

    this.buildWordIndex();

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

    // Reduced motion path. When external marks are provided the user has asked
    // us to respect external timing (e.g. TTS audio) — we keep the timing but
    // skip per-char animation, revealing each word as a block at its start.
    if (this.config.reducedMotion) {
      if (this.config.revealMarks && this.config.revealMarks.length > 0) {
        this.startReducedMotionWithMarks();
        return;
      }
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

    // External-clock mode: hold at elapsed=0 until the consumer (or a
    // synchronizer like syncAudioToKT) resumes us. Skip the first RAF tick
    // so no marks with timeMs near 0 fire before the clock engages.
    if (this.config.startPaused) {
      this.state = 'paused';
      this.pauseTime = this.startTime;
      return;
    }

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

    // Cancel any running RAF before we rewrite state — a stale tick that
    // lands between the reset and the post-seek restart would double-fire
    // reveals at unstable elapsed values.
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    // Clear any pending fallback "revealing → visible" timers so animations
    // from before the seek don't flip post-seek glyphs to visible.
    for (const timerId of this.fallbackTimers.values()) {
      clearTimeout(timerId);
    }
    this.fallbackTimers.clear();

    // Reset state
    this.revealedCount = 0;
    this.lastRevealedIndex = -1;
    this.revealed.fill(false);
    this.firedCues.clear();
    this.wordsRevealed.clear();
    this.pendingRevealAnimations = 0;
    this.effectsCompleteFired = false;

    // Reset all glyphs to hidden
    for (let i = 0; i < this.totalUnits; i++) {
      this.renderer.setGlyphState(i, 'hidden');
    }

    // Seeks from a 'complete' state re-engage the timeline — callers may
    // scrub audio back after it finished. Treat it like a fresh run.
    if (this.state === 'complete') {
      this.state = wasPaused ? 'paused' : 'running';
    }

    // Adjust start time so elapsed = ms
    this.startTime = performance.now() - ms - this.pausedDuration;

    // Process up to the seeked time
    this.processFrame(ms);

    if (wasPaused) {
      this.state = 'paused';
      this.pauseTime = performance.now();
      return;
    }

    // Restart RAF if we're still short of the end — processFrame cancels
    // when fully revealed, so only restart when there's more to do.
    if (this.revealedCount < this.totalUnits && this.rafId === null) {
      this.rafId = requestAnimationFrame((t) => this.tick(t));
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
        this.notifyWordReveal(i);
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
      this.processGroupedTick(elapsed);
    } else {
      // char mode (default)
      this.processCharTick(elapsed);
    }

    // Fire time-triggered cues
    this.fireTimeCues(elapsed);

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

  // ── Grouped mode (word) ────────────────────────────────────

  private _wordGroups: number[][] | null = null;
  private _groupedSchedule:
    | { groupIndices: number[]; startMs: number }[]
    | null = null;

  private processGroupedTick(elapsed: number): void {
    if (!this._groupedSchedule) {
      if (!this._wordGroups) this._wordGroups = splitWords(this.positions);

      const speed = this.config.speed;
      const groups = this._wordGroups;

      this._groupedSchedule = groups.map((indices, groupIdx) => ({
        groupIndices: indices,
        startMs: groupIdx * speed,
      }));
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

      // Reveal each unit in the group, with inner charSpeed stagger
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
        this.notifyWordReveal(i);
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

    this.notifyWordReveal(index);

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
        style === 'pop'
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
                  : computePopRevealParams;
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
        style === 'pop'
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
    if (this.config.revealMarks && this.config.revealMarks.length > 0) {
      return marksToDelays(this.positions, this.config.revealMarks);
    }
    return computeStaggerDelays(
      this.positions,
      this.config.staggerPattern,
      this.config.stagger,
    );
  }

  // ── Word index (drives onrevealword) ─────────────────────────

  private buildWordIndex(): void {
    const groups = splitWords(this.positions);
    this.wordIndexOf = new Array(this.totalUnits).fill(-1);
    this.wordFirstIndex = [];
    this.wordTexts = [];

    let wordIdx = 0;
    for (const group of groups) {
      // splitWords returns runs of all-space or all-non-space units.
      // Only non-space runs count as words.
      if (group.length === 0) continue;
      const isSpaceRun = this.positions[group[0]].isSpace;
      if (isSpaceRun) continue;

      let text = '';
      for (const idx of group) {
        this.wordIndexOf[idx] = wordIdx;
        text += this.positions[idx].char;
      }
      this.wordFirstIndex.push(group[0]);
      this.wordTexts.push(text);
      wordIdx++;
    }
  }

  private notifyWordReveal(index: number): void {
    const cb = this.config.onrevealword;
    if (!cb) return;
    const w = this.wordIndexOf[index];
    if (w < 0) return;
    if (this.wordsRevealed.has(w)) return;
    this.wordsRevealed.add(w);
    cb(w, this.wordTexts[w]);
  }

  // ── Reduced-motion + revealMarks: word-block reveal at word start times ──

  private startReducedMotionWithMarks(): void {
    // Build per-char delays, derive each word's start time (min of its chars),
    // schedule a single setTimeout per word that flips all its glyphs to
    // visible at once — preserves external timing without any animation.
    const delays = marksToDelays(this.positions, this.config.revealMarks ?? []);

    this.state = 'running';
    this.startTime = performance.now();

    // Reveal pure-space groups immediately — they have no narrative weight
    // and animating them adds nothing under reduced motion.
    for (let i = 0; i < this.totalUnits; i++) {
      if (this.positions[i].isSpace) {
        this.renderer.setGlyphState(i, 'visible');
        this.revealed[i] = true;
        this.revealedCount++;
        if (i > this.lastRevealedIndex) this.lastRevealedIndex = i;
      }
    }

    for (let w = 0; w < this.wordFirstIndex.length; w++) {
      const first = this.wordFirstIndex[w];
      // All chars in a word share the same word index
      let startMs = delays[first];
      for (let i = first + 1; i < this.totalUnits; i++) {
        if (this.wordIndexOf[i] !== w) break;
        if (delays[i] < startMs) startMs = delays[i];
      }

      const timerId = window.setTimeout(
        () => {
          this.fallbackTimers.delete(first);
          if (this.state === 'aborted' || this.state === 'complete') return;

          for (let i = 0; i < this.totalUnits; i++) {
            if (this.wordIndexOf[i] !== w) continue;
            if (this.revealed[i]) continue;
            this.renderer.setGlyphState(i, 'visible');
            this.revealed[i] = true;
            this.revealedCount++;
            if (i > this.lastRevealedIndex) this.lastRevealedIndex = i;
          }

          // Fire word-reveal callback for the group (once, cheap)
          this.notifyWordReveal(first);

          // Time-triggered cues may be due by now — process them
          const elapsed =
            performance.now() - this.startTime - this.pausedDuration;
          this.fireTimeCues(elapsed);

          if (this.revealedCount >= this.totalUnits) {
            this._finalElapsed = elapsed;
            this.completeReveal();
          }
        },
        Math.max(0, startMs),
      );
      this.fallbackTimers.set(first, timerId);
    }

    // No words at all (empty or all-space text) — complete immediately.
    if (this.wordFirstIndex.length === 0) {
      this._finalElapsed = 0;
      this.completeReveal();
    }
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

    // Step 3: Fire onrevealcomplete
    this.config.onrevealcomplete?.();

    // Step 4: Fire oneffectscomplete
    // If no completion cues exist (or all already finished synchronously),
    // fire immediately. Otherwise, the last one-shot's onComplete callback
    // (in fireCompletionCues) handles this.
    if (this.pendingCompletionAnimations <= 0 && !this.effectsCompleteFired) {
      this.effectsCompleteFired = true;
      this.config.oneffectscomplete?.();
    }
  }
}
