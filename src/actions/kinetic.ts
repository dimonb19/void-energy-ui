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
// Speed presets:
//   'slow'    — speed: 40ms, charSpeed: 8ms  (deliberate, visible typing)
//   'default' — speed: 20ms, charSpeed: 4ms  (standard baseline)
//   'fast'    — speed: 8ms,  charSpeed: 2ms  (near-instant)
//
//   Explicit speed/charSpeed values override any preset.
//
// Usage as Svelte action:
//   <span use:kinetic={{ text: 'Hello world', mode: 'char', speedPreset: 'fast' }} />
//   <span use:kinetic={{ words: ['Synthesizing…', 'Calibrating…'], mode: 'cycle' }} />
//
// Usage as standalone:
//   const k = new KineticEngine(el, { text: 'Hello', mode: 'decode' });
//   k.start();
//   k.abort();
//
// ── Chaining with Narrative effects ────────────────────────
//
// Kinetic reveals text; narrative reacts to it.
// Continuous narrative effects (drift, breathe, etc.) start
// immediately as ambient atmosphere during reveal.
// One-shot effects (shake, jolt, etc.) fire from onComplete
// after kinetic finishes. See narrative.ts for the full pattern
// and isOneShotEffect() helper.
//
//   use:kinetic={{ text, mode: 'word', onComplete }}
//   use:narrative={{ effect: narrativeEffect, enabled }}
//
// ─────────────────────────────────────────────────────────────

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

// ── Speed Presets ───────────────────────────────────────────

const SPEED_PRESETS: Record<
  KineticSpeedPreset,
  { speed: number; charSpeed: number }
> = {
  slow: { speed: 40, charSpeed: 8 },
  default: { speed: 20, charSpeed: 4 },
  fast: { speed: 8, charSpeed: 2 },
};

function resolveSpeedPreset(config: KineticConfig): {
  speed: number;
  charSpeed: number;
} {
  const preset = SPEED_PRESETS[config.speedPreset ?? 'default'];
  return {
    speed: config.speed ?? preset.speed,
    charSpeed: config.charSpeed ?? preset.charSpeed,
  };
}

// ── Defaults ────────────────────────────────────────────────

const DEFAULTS: Required<
  Omit<
    KineticConfig,
    'text' | 'words' | 'onComplete' | 'onCycle' | 'speedPreset'
  >
> = {
  mode: 'char',
  charSpeed: 8,
  speed: 40,
  delay: 0,
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

// ── Active instances (cleanup / abort) ──────────────────────

const activeInstances = new WeakMap<HTMLElement, KineticEngine>();

// ─────────────────────────────────────────────────────────────
// KineticEngine
// ─────────────────────────────────────────────────────────────

export class KineticEngine {
  private el: HTMLElement;
  private config: Required<
    Omit<
      KineticConfig,
      'text' | 'words' | 'onComplete' | 'onCycle' | 'speedPreset'
    >
  > &
    Pick<KineticConfig, 'text' | 'words' | 'onComplete' | 'onCycle'>;

  private physics: PhysicsProfile;
  private aborted = false;
  private timeouts = new Set<ReturnType<typeof setTimeout>>();
  private frameId: number | null = null;

  constructor(el: HTMLElement, config: KineticConfig = {}) {
    // Abort any existing instance on this element
    activeInstances.get(el)?.abort();

    this.el = el;
    this.physics = getPhysicsProfile();

    // Resolve speed preset first (explicit speed/charSpeed override preset)
    const presetSpeeds = resolveSpeedPreset(config);

    // Merge: DEFAULTS → preset speeds → physics overrides → user config (user wins)
    const physicsDefaults: Partial<KineticConfig> = {};

    // Physics speed adjustment (only if user didn't explicitly set speed and no preset override)
    if (
      config.speed === undefined &&
      config.speedPreset === undefined &&
      this.physics.speedMultiplier !== 1
    ) {
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

    this.config = {
      ...DEFAULTS,
      ...presetSpeeds,
      ...physicsDefaults,
      ...config,
    };
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

  // ── Text helpers ───────────────────────────────────────────

  private setText(value: string): void {
    this.el.textContent = value;
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

    const tokens = text.split(/(\s+)/); // preserve whitespace

    this.el.textContent = '';
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
