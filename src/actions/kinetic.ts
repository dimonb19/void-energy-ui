// ─────────────────────────────────────────────────────────────
// kinetic.ts — Kinetic Typography Engine
// Physics-aware text animation for Void Energy UI
// ─────────────────────────────────────────────────────────────
//
// Modes:
//   char    — Classic typewriter, character by character
//   word    — Word-by-word reveal, ideal for long paragraphs
//   cycle   — Rotates through a word list (loading states)
//   decode  — Scramble → resolve effect (sci-fi terminal feel)
//
// Usage as Svelte action:
//   <span use:kinetic={{ text: 'Hello world', mode: 'char', speed: 40 }} />
//   <span use:kinetic={{ words: ['Synthesizing…', 'Calibrating…'], mode: 'cycle' }} />
//
// Usage as standalone:
//   const k = new KineticEngine(el, { text: 'Hello', mode: 'decode' });
//   k.start();
//   k.abort();
// ─────────────────────────────────────────────────────────────

export type KineticMode = 'char' | 'word' | 'cycle' | 'decode';
export type KineticWordChunk = 'word' | 'sentence' | 'sentence-pair';

export interface KineticConfig {
  /** Single text string (for char, word, decode modes) */
  text?: string;
  /** Array of strings to rotate through (for cycle mode) */
  words?: string[];
  /** Animation mode — defaults to 'char' */
  mode?: KineticMode;
  /** Milliseconds per unit: per-char, per-word, or per-scramble tick. Default: 40 */
  speed?: number;
  /** Initial delay before animation starts (ms). Default: 0 */
  delay?: number;
  /** Show a blinking cursor during animation. Default: false */
  cursor?: boolean;
  /** Cursor character. Default: '▍' */
  cursorChar?: string;
  /** Remove cursor after animation completes. Default: true */
  cursorRemoveOnComplete?: boolean;

  // ── Word mode ──
  /** Chunk size for word mode reveal. Default: 'word' */
  chunk?: KineticWordChunk;
  /** Per-character speed (ms) for smooth chunk reveal in sentence modes. Default: 8 */
  charSpeed?: number;

  // ── Cycle mode ──
  /** Pause duration on each word before transitioning (ms). Default: 1800 */
  pauseDuration?: number;
  /** Loop the cycle indefinitely. Default: true */
  loop?: boolean;
  /** Transition style between cycled words. Default: 'type' */
  cycleTransition?: 'type' | 'fade' | 'decode';
  /** Fade duration in ms (only for cycleTransition: 'fade'). Default: 200 */
  fadeDuration?: number;

  // ── Decode mode ──
  /** Characters used for scramble noise. */
  scrambleChars?: string;
  /** Number of scramble iterations before resolving each character. Default: 4 */
  scramblePasses?: number;

  // ── Callbacks ──
  onComplete?: () => void;
  onCycle?: (index: number, word: string) => void;
}

// ── Physics Profile ─────────────────────────────────────────

type PhysicsPreset = 'glass' | 'flat' | 'retro';

interface PhysicsProfile {
  speedMultiplier: number;
  scramblePassesOffset: number;
  scrambleChars: string | null;
  delayVariance: number;
  forceCycleTransition: KineticConfig['cycleTransition'] | null;
}

const DEFAULT_SCRAMBLE_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
const RETRO_SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%';

function getPhysicsProfile(): PhysicsProfile {
  const physics =
    (document.documentElement.dataset.physics as PhysicsPreset) ?? 'glass';

  switch (physics) {
    case 'flat':
      return {
        speedMultiplier: 0.8,
        scramblePassesOffset: -1,
        scrambleChars: null,
        delayVariance: 0,
        forceCycleTransition: null,
      };
    case 'retro':
      return {
        speedMultiplier: 1,
        scramblePassesOffset: 0,
        scrambleChars: RETRO_SCRAMBLE_CHARS,
        delayVariance: 0.3,
        forceCycleTransition: null,
      };
    case 'glass':
    default:
      return {
        speedMultiplier: 1,
        scramblePassesOffset: 0,
        scrambleChars: null,
        delayVariance: 0,
        forceCycleTransition: null,
      };
  }
}

// ── Defaults ────────────────────────────────────────────────

const DEFAULTS: Required<
  Omit<KineticConfig, 'text' | 'words' | 'onComplete' | 'onCycle'>
> = {
  mode: 'char',
  chunk: 'word' as KineticWordChunk,
  charSpeed: 8,
  speed: 40,
  delay: 0,
  cursor: false,
  cursorChar: '▍',
  cursorRemoveOnComplete: true,
  pauseDuration: 1800,
  loop: true,
  cycleTransition: 'type',
  fadeDuration: 200,
  scrambleChars: DEFAULT_SCRAMBLE_CHARS,
  scramblePasses: 4,
};

// ── Reduced motion check ────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ── Random char from set ────────────────────────────────────

function randomChar(chars: string): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

// ── Sentence splitting ───────────────────────────────────────

function splitSentences(text: string): string[] {
  const pattern = /.*?[.!?](?:\s+|$)/g;
  const chunks: string[] = [];
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    chunks.push(match[0]);
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    chunks.push(text.slice(lastIndex));
  }

  return chunks.length > 0 ? chunks : [text];
}

// ── Active instances (cleanup / abort) ──────────────────────

const activeInstances = new WeakMap<HTMLElement, KineticEngine>();

// ─────────────────────────────────────────────────────────────
// KineticEngine
// ─────────────────────────────────────────────────────────────

export class KineticEngine {
  private el: HTMLElement;
  private config: Required<
    Omit<KineticConfig, 'text' | 'words' | 'onComplete' | 'onCycle'>
  > &
    Pick<KineticConfig, 'text' | 'words' | 'onComplete' | 'onCycle'>;

  private physics: PhysicsProfile;
  private aborted = false;
  private timeouts = new Set<ReturnType<typeof setTimeout>>();
  private frameId: number | null = null;
  private cursorEl: HTMLSpanElement | null = null;

  constructor(el: HTMLElement, config: KineticConfig = {}) {
    // Abort any existing instance on this element
    activeInstances.get(el)?.abort();

    this.el = el;
    this.physics = getPhysicsProfile();

    // Merge: DEFAULTS → physics overrides → user config (user wins)
    const physicsDefaults: Partial<KineticConfig> = {};

    // Physics speed adjustment (only if user didn't explicitly set speed)
    if (config.speed === undefined && this.physics.speedMultiplier !== 1) {
      physicsDefaults.speed = Math.round(
        DEFAULTS.speed * this.physics.speedMultiplier,
      );
    }

    // Physics scramble chars (only if user didn't explicitly set)
    if (config.scrambleChars === undefined && this.physics.scrambleChars) {
      physicsDefaults.scrambleChars = this.physics.scrambleChars;
    }

    // Physics scramble passes offset (only if user didn't explicitly set)
    if (
      config.scramblePasses === undefined &&
      this.physics.scramblePassesOffset !== 0
    ) {
      physicsDefaults.scramblePasses = Math.max(
        1,
        DEFAULTS.scramblePasses + this.physics.scramblePassesOffset,
      );
    }

    // Retro forces 'type' for cycle transition (override 'fade', keep 'decode')
    if (
      config.cycleTransition === undefined &&
      this.physics.forceCycleTransition
    ) {
      physicsDefaults.cycleTransition = this.physics.forceCycleTransition;
    }

    this.config = { ...DEFAULTS, ...physicsDefaults, ...config };
    activeInstances.set(el, this);
  }

  // ── Public API ────────────────────────────────────────────

  start(): Promise<void> {
    if (prefersReducedMotion()) {
      return this.skipToEnd();
    }

    return new Promise((resolve) => {
      const begin = () => {
        if (this.aborted) return resolve();

        switch (this.config.mode) {
          case 'char':
            this.runChar(resolve);
            break;
          case 'word':
            this.runWord(resolve);
            break;
          case 'cycle':
            this.runCycle(resolve);
            break;
          case 'decode':
            this.runDecode(resolve);
            break;
          default:
            this.runChar(resolve);
        }
      };

      if (this.config.delay > 0) {
        this.setTimeout(begin, this.config.delay);
      } else {
        begin();
      }
    });
  }

  abort(): void {
    this.aborted = true;
    this.timeouts.forEach((id) => clearTimeout(id));
    this.timeouts.clear();
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.removeCursor();
  }

  /** Immediately show final text, no animation */
  private skipToEnd(): Promise<void> {
    const { mode, text, words } = this.config;

    if (mode === 'cycle' && words?.length) {
      this.setText(words[0]);
    } else if (text) {
      this.setText(text);
    }

    this.config.onComplete?.();
    return Promise.resolve();
  }

  // ── Text & Cursor helpers ─────────────────────────────────

  private setText(value: string): void {
    // Preserve cursor if active
    if (this.cursorEl && this.el.contains(this.cursorEl)) {
      const textNode = this.el.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = value;
      } else {
        this.el.insertBefore(document.createTextNode(value), this.cursorEl);
      }
    } else {
      this.el.textContent = value;
    }
  }

  private showCursor(): void {
    if (!this.config.cursor || this.cursorEl) return;

    this.cursorEl = document.createElement('span');
    this.cursorEl.textContent = this.config.cursorChar;
    this.cursorEl.className = 'kinetic-cursor';
    this.cursorEl.setAttribute('aria-hidden', 'true');

    this.el.appendChild(this.cursorEl);
  }

  private removeCursor(): void {
    if (this.cursorEl && this.el.contains(this.cursorEl)) {
      this.el.removeChild(this.cursorEl);
    }
    this.cursorEl = null;
  }

  private setTimeout(
    fn: () => void,
    ms: number,
  ): ReturnType<typeof setTimeout> {
    let id: ReturnType<typeof setTimeout>;
    id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  /** Apply retro delay variance (±N% randomization per tick) */
  private getTickDelay(): number {
    const base = this.config.speed;
    if (this.physics.delayVariance <= 0) return base;

    const variance = this.physics.delayVariance;
    const jitter = 1 + (Math.random() * 2 - 1) * variance;
    return Math.round(base * jitter);
  }

  // ── Mode: Char (typewriter) ───────────────────────────────

  private runChar(resolve: () => void): void {
    const text = this.config.text ?? '';
    if (!text) return resolve();

    this.el.textContent = '';
    this.showCursor();
    let i = 0;

    const tick = () => {
      if (this.aborted) return resolve();

      if (i < text.length) {
        this.setText(text.slice(0, ++i));
        this.setTimeout(tick, this.getTickDelay());
      } else {
        this.onAnimationEnd(resolve);
      }
    };

    tick();
  }

  // ── Mode: Word ────────────────────────────────────────────

  private runWord(resolve: () => void): void {
    const text = this.config.text ?? '';
    if (!text) return resolve();

    const { chunk } = this.config;

    let tokens: string[];
    if (chunk === 'sentence' || chunk === 'sentence-pair') {
      const sentences = splitSentences(text);
      if (chunk === 'sentence-pair') {
        tokens = [];
        for (let s = 0; s < sentences.length; s += 2) {
          tokens.push(sentences[s] + (sentences[s + 1] ?? ''));
        }
      } else {
        tokens = sentences;
      }
    } else {
      tokens = text.split(/(\s+)/); // preserve whitespace
    }

    this.el.textContent = '';
    this.showCursor();
    let i = 0;
    let built = '';

    const tick = () => {
      if (this.aborted) return resolve();

      if (i < tokens.length) {
        const token = tokens[i++];

        if (token.length > 1) {
          // Rapid char-by-char reveal within the chunk
          let c = 0;
          const charTick = () => {
            if (this.aborted) return resolve();
            built += token[c++];
            this.setText(built);
            if (c < token.length) {
              this.setTimeout(charTick, this.config.charSpeed);
            } else {
              // Pause between chunks (simulates streaming bursts)
              this.setTimeout(tick, this.getTickDelay());
            }
          };
          charTick();
        } else {
          built += token;
          this.setText(built);
          this.setTimeout(tick, this.config.charSpeed);
        }
      } else {
        this.onAnimationEnd(resolve);
      }
    };

    tick();
  }

  // ── Mode: Cycle ───────────────────────────────────────────

  private runCycle(resolve: () => void): void {
    const words = this.config.words ?? [];
    if (!words.length) return resolve();

    let index = 0;

    // Retro physics: force 'type' when 'fade' is configured (CRTs don't fade)
    const effectiveTransition =
      this.physics.forceCycleTransition === null &&
      document.documentElement.dataset.physics === 'retro' &&
      this.config.cycleTransition === 'fade'
        ? 'type'
        : this.config.cycleTransition;

    const showWord = () => {
      if (this.aborted) return resolve();

      const word = words[index];
      this.config.onCycle?.(index, word);

      switch (effectiveTransition) {
        case 'fade':
          this.cycleFade(word, () => advanceOrEnd());
          break;
        case 'decode':
          this.cycleDecode(word, () => advanceOrEnd());
          break;
        case 'type':
        default:
          this.cycleType(word, () => advanceOrEnd());
          break;
      }
    };

    const advanceOrEnd = () => {
      if (this.aborted) return resolve();

      index++;

      if (index >= words.length) {
        if (this.config.loop) {
          index = 0;
          this.setTimeout(showWord, this.config.pauseDuration);
        } else {
          this.onAnimationEnd(resolve);
        }
      } else {
        this.setTimeout(showWord, this.config.pauseDuration);
      }
    };

    showWord();
  }

  /** Cycle sub-transition: type out each word */
  private cycleType(word: string, done: () => void): void {
    let i = 0;
    this.el.textContent = '';
    this.cursorEl = null; // textContent = '' detached it from DOM
    this.showCursor();

    const tick = () => {
      if (this.aborted) return done();

      if (i < word.length) {
        this.setText(word.slice(0, ++i));
        this.setTimeout(tick, this.getTickDelay());
      } else {
        done();
      }
    };

    tick();
  }

  /** Cycle sub-transition: fade between words */
  private cycleFade(word: string, done: () => void): void {
    const dur = this.config.fadeDuration;

    this.el.style.transition = `opacity ${dur}ms ease`;
    this.el.style.opacity = '0';

    this.setTimeout(() => {
      if (this.aborted) return done();
      this.setText(word);
      this.el.style.opacity = '1';
      this.setTimeout(() => {
        // Clean up inline transition style
        this.el.style.transition = '';
        this.el.style.opacity = '';
        done();
      }, dur);
    }, dur);
  }

  /** Cycle sub-transition: decode/scramble into each word */
  private cycleDecode(word: string, done: () => void): void {
    const chars = this.config.scrambleChars;
    const passes = this.config.scramblePasses;
    const resolved = new Array(word.length).fill(false);
    let tick = 0;
    const totalTicks = word.length * passes;

    const frame = () => {
      if (this.aborted) return done();

      const resolveUpTo = Math.floor((tick / totalTicks) * word.length);

      let display = '';
      for (let c = 0; c < word.length; c++) {
        if (c < resolveUpTo || resolved[c]) {
          resolved[c] = true;
          display += word[c];
        } else if (word[c] === ' ') {
          display += ' ';
        } else {
          display += randomChar(chars);
        }
      }

      this.setText(display);
      tick++;

      if (tick <= totalTicks) {
        this.setTimeout(frame, this.config.speed);
      } else {
        this.setText(word);
        done();
      }
    };

    frame();
  }

  // ── Mode: Decode (standalone, single text) ────────────────

  private runDecode(resolve: () => void): void {
    const text = this.config.text ?? '';
    if (!text) return resolve();

    const chars = this.config.scrambleChars;
    const passes = this.config.scramblePasses;
    const resolved = new Array(text.length).fill(false);
    let tick = 0;
    const totalTicks = text.length * passes;

    this.showCursor();

    const frame = () => {
      if (this.aborted) return resolve();

      const resolveUpTo = Math.floor((tick / totalTicks) * text.length);

      let display = '';
      for (let c = 0; c < text.length; c++) {
        if (c < resolveUpTo || resolved[c]) {
          resolved[c] = true;
          display += text[c];
        } else if (text[c] === ' ') {
          display += ' ';
        } else {
          display += randomChar(chars);
        }
      }

      this.setText(display);
      tick++;

      if (tick <= totalTicks) {
        this.setTimeout(frame, this.config.speed);
      } else {
        this.setText(text);
        this.onAnimationEnd(resolve);
      }
    };

    frame();
  }

  // ── Completion ────────────────────────────────────────────

  private onAnimationEnd(resolve: () => void): void {
    if (this.config.cursorRemoveOnComplete) {
      this.removeCursor();
    }
    this.config.onComplete?.();
    resolve();
  }
}

// ─────────────────────────────────────────────────────────────
// Svelte Action
// ─────────────────────────────────────────────────────────────
//
// Usage:
//   <span use:kinetic={{ text: 'Hello', mode: 'char', speed: 40 }} />
//
//   <span use:kinetic={{
//     words: ['Synthesizing…', 'Calibrating…', 'Traversing…'],
//     mode: 'cycle',
//     cycleTransition: 'decode',
//     speed: 30,
//     pauseDuration: 1800
//   }} />
//
// Reactive updates (Svelte 5):
//   The action's `update` function re-triggers the animation
//   whenever the config object reference changes.
// ─────────────────────────────────────────────────────────────

export function kinetic(el: HTMLElement, config: KineticConfig) {
  let engine = new KineticEngine(el, config);
  engine.start();

  return {
    update(newConfig: KineticConfig) {
      engine.abort();
      engine = new KineticEngine(el, newConfig);
      engine.start();
    },
    destroy() {
      engine.abort();
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Standalone helper (Promise-based)
// ─────────────────────────────────────────────────────────────
//
// Usage:
//   await typewrite(el, 'Hello world', { speed: 30 });
//   const k = typewrite(el, 'Loading…');
//   k.abort();
// ─────────────────────────────────────────────────────────────

export interface KineticHandle extends Promise<void> {
  abort: () => void;
}

export function typewrite(
  el: HTMLElement,
  text: string,
  options: Omit<KineticConfig, 'text' | 'words'> = {},
): KineticHandle {
  const engine = new KineticEngine(el, { text, ...options });
  const promise = engine.start();

  return Object.assign(promise, {
    abort: () => engine.abort(),
  });
}
