import type { KineticTextEffect } from '../../types';
import { createPRNG } from '../timeline/prng';

// ── Per-character effect parameters ─────────────────────────────

export interface CharEffectParams {
  dx: number; // --kt-dx (px)
  dy: number; // --kt-dy (px)
  rotate: number; // --kt-rotate (deg)
  scale: number; // --kt-scale (factor, default 1)
  skew: number; // --kt-skew (deg)
  opacityMin: number; // --kt-opacity-min (0-1)
  delayOffset: number; // --kt-delay-offset (ms)
  durationMult: number; // --kt-duration-mult (factor, default 1)
  // Secondary layer params (applied on kt-word for harmonic motion)
  dx2: number; // --kt-dx2 (px)
  dy2: number; // --kt-dy2 (px)
  rotate2: number; // --kt-rotate2 (deg)
}

const DEFAULTS: CharEffectParams = {
  dx: 0,
  dy: 0,
  rotate: 0,
  scale: 1,
  skew: 0,
  opacityMin: 1,
  delayOffset: 0,
  durationMult: 1,
  dx2: 0,
  dy2: 0,
  rotate2: 0,
};

// ── PRNG helpers ────────────────────────────────────────────────

/** Random float in [min, max] */
function range(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Random float in [-mag, +mag] */
function signed(rng: () => number, mag: number): number {
  return (rng() - 0.5) * 2 * mag;
}

/** Random float in [-max, -min] or [+min, +max] */
function signedRange(rng: () => number, min: number, max: number): number {
  const val = range(rng, min, max);
  return rng() < 0.5 ? -val : val;
}

// ── Compute per-character params ─────────────────────────────────

export function computeCharParams(
  effect: KineticTextEffect,
  index: number,
  totalUnits: number,
  seed: number,
): CharEffectParams {
  const rng = createPRNG(seed + index * 7919 + effect.charCodeAt(0));
  const phase = totalUnits > 1 ? index / (totalUnits - 1) : 0;

  switch (effect) {
    // ── One-shot effects ──────────────────────────────────
    case 'shake':
      return shakeParams(rng, phase);
    case 'quake':
      return quakeParams(rng, phase);
    case 'jolt':
      return joltParams(rng, phase, seed);
    case 'glitch':
      return glitchParams(rng, phase);
    case 'surge':
      return surgeParams(rng, phase);
    case 'warp':
      return warpParams(rng, phase);
    case 'explode':
      return explodeParams(rng, phase);
    case 'collapse':
      return collapseParams(rng, phase);
    case 'scatter':
      return scatterParams(rng, phase);
    case 'spin':
      return spinParams(rng, phase);
    case 'bounce':
      return bounceParams(rng, phase);
    case 'flash':
      return flashParams(rng, phase);
    case 'shatter':
      return shatterParams(rng, phase);
    case 'vortex':
      return vortexParams(rng, phase);
    case 'ripple':
      return rippleParams(rng, phase);
    case 'slam':
      return slamParams(rng, phase);

    // ── Continuous effects ────────────────────────────────
    case 'drift':
      return driftParams(rng, phase);
    case 'flicker':
      return flickerParams(rng, phase);
    case 'breathe':
      return breatheParams(rng, phase);
    case 'tremble':
      return trembleParams(rng, phase);
    case 'pulse':
      return pulseParams(rng, phase);
    case 'whisper':
      return whisperParams(rng, phase);
    case 'fade':
      return fadeParams(rng, phase);
    case 'freeze':
      return freezeParams(rng, phase);
    case 'burn':
      return burnParams(rng, phase);
    case 'static':
      return staticParams(rng, phase);
    case 'distort':
      return distortParams(rng, phase);
    case 'sway':
      return swayParams(rng, phase);
    case 'glow':
      return glowParams(rng, phase);
    case 'wave':
      return waveParams(rng, phase);
    case 'float':
      return floatParams(rng, phase);
    case 'wobble':
      return wobbleParams(rng, phase);
    case 'sparkle':
      return sparkleParams(rng, phase);
    case 'drip':
      return dripParams(rng, phase);
    case 'stretch':
      return stretchParams(rng, phase);
    case 'vibrate':
      return vibrateParams(rng, phase);
    case 'haunt':
      return hauntParams(rng, phase);
    default:
      return { ...DEFAULTS };
  }
}

// ── One-shot generators ──────────────────────────────────────────

function shakeParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 2, 5),
    dy: signedRange(rng, 0.5, 1.5),
    rotate: signedRange(rng, 1.5, 4),
    delayOffset: phase * 50 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function quakeParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 3, 7),
    dy: signedRange(rng, 2, 5),
    rotate: signedRange(rng, 2, 6),
    delayOffset: phase * 30 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function joltParams(
  rng: () => number,
  phase: number,
  seed: number,
): CharEffectParams {
  // All chars displace in a similar direction — powerful impact wave
  const dirRng = createPRNG(seed);
  const angle = dirRng() * Math.PI * 2;
  const mag = range(rng, 4, 10);
  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 2, 5),
    scale: range(rng, 1.02, 1.06),
    delayOffset: phase * 35 + range(rng, 0, 8),
  };
}

function glitchParams(rng: () => number, phase: number): CharEffectParams {
  // Bimodal: ~25% of chars get large displacement, rest get moderate jitter
  const isLoud = rng() < 0.25;
  return {
    ...DEFAULTS,
    dx: isLoud ? signedRange(rng, 4, 10) : signedRange(rng, 0.5, 2),
    dy: isLoud ? signedRange(rng, 1, 3) : 0,
    skew: isLoud ? signedRange(rng, 3, 8) : signedRange(rng, 0, 1),
    delayOffset: phase * 80 + range(rng, 0, 20),
  };
}

function surgeParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dy: -range(rng, 1.5, 4),
    scale: range(rng, 1.03, 1.08),
    delayOffset: phase * 50 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function warpParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    scale: range(rng, 0.82, 1.18),
    skew: signedRange(rng, 4, 10),
    delayOffset: phase * 45 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function explodeParams(rng: () => number, phase: number): CharEffectParams {
  // Radial direction from center — chars near edges fly further
  const centerDist = Math.abs(phase - 0.5) * 2; // 0 at center, 1 at edges
  const angle = rng() * Math.PI * 2;
  const mag = range(rng, 12, 28) * (0.4 + centerDist * 0.6);
  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 15, 50),
    scale: range(rng, 0.4, 0.7),
    opacityMin: range(rng, 0.05, 0.2),
    delayOffset: phase * 50 + range(rng, 0, 10),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function collapseParams(rng: () => number, phase: number): CharEffectParams {
  // Gravity-like: each char falls different height, tumbles
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 1, 3),
    dy: range(rng, 8, 18),
    rotate: signedRange(rng, 10, 35),
    scale: range(rng, 0.85, 0.95),
    delayOffset: phase * 55 + range(rng, 0, 10),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function scatterParams(rng: () => number, phase: number): CharEffectParams {
  // Gentle drift in random directions like dandelion seeds
  const angle = rng() * Math.PI * 2;
  const mag = range(rng, 5, 12);
  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 4, 15),
    opacityMin: range(rng, 0.35, 0.6),
    delayOffset: phase * 70 + range(rng, 0, 12),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function spinParams(rng: () => number, phase: number): CharEffectParams {
  // Full 360° rotation, alternating direction
  const direction = rng() < 0.5 ? 1 : -1;
  return {
    ...DEFAULTS,
    rotate: direction * 360,
    scale: range(rng, 0.92, 1.08),
    dy: signedRange(rng, 1, 3),
    delayOffset: phase * 45 + range(rng, 0, 10),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function bounceParams(rng: () => number, phase: number): CharEffectParams {
  // Drop height varies per char; keyframe handles the bounce physics
  return {
    ...DEFAULTS,
    dy: range(rng, 8, 16),
    rotate: signedRange(rng, 2, 5),
    scale: range(rng, 0.95, 1.0),
    delayOffset: phase * 40 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function flashParams(rng: () => number, phase: number): CharEffectParams {
  // Quick scale pulse + brightness; wave-based delay for ripple feel
  return {
    ...DEFAULTS,
    scale: range(rng, 1.08, 1.2),
    opacityMin: 1,
    delayOffset: phase * 60 + range(rng, 0, 6),
  };
}

function shatterParams(rng: () => number, phase: number): CharEffectParams {
  // Sharp angular displacement like broken glass — skew is the fingerprint
  const angle = rng() * Math.PI * 2;
  const mag = range(rng, 3, 10);
  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 5, 20),
    skew: signedRange(rng, 4, 12),
    scale: range(rng, 0.8, 0.95),
    delayOffset: phase * 35 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function vortexParams(rng: () => number, phase: number): CharEffectParams {
  // Converge toward center — distance based on position from center
  const centerDist = Math.abs(phase - 0.5) * 2;
  // Direction points inward toward center
  const direction = phase < 0.5 ? 1 : -1;
  const mag = range(rng, 4, 10) * centerDist;
  return {
    ...DEFAULTS,
    dx: direction * mag,
    dy: signedRange(rng, 1, 4) * centerDist,
    rotate: signedRange(rng, 20, 60),
    scale: range(rng, 0.6, 0.85),
    opacityMin: range(rng, 0.3, 0.5),
    delayOffset: centerDist * 60 + range(rng, 0, 10),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function rippleParams(rng: () => number, phase: number): CharEffectParams {
  // Vertical wave propagating left-to-right; phase-based delay IS the wave
  return {
    ...DEFAULTS,
    dy: signedRange(rng, 3, 6),
    rotate: signedRange(rng, 1, 3),
    delayOffset: phase * 150 + range(rng, 0, 5),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function slamParams(rng: () => number, phase: number): CharEffectParams {
  // Heavy downward impact — scale squash on landing, not scale-up
  return {
    ...DEFAULTS,
    scale: range(rng, 1.15, 1.35),
    dy: range(rng, 3, 8),
    rotate: signedRange(rng, 1, 3),
    delayOffset: phase * 40 + range(rng, 0, 8),
    durationMult: range(rng, 0.85, 1.15),
  };
}

// ── Continuous generators ────────────────────────────────────────

function driftParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dy: -range(rng, 1.5, 4),
    delayOffset: phase * 400 + range(rng, 0, 60),
    durationMult: range(rng, 0.85, 1.15),
    dx2: signedRange(rng, 0.5, 1.5),
    rotate2: signedRange(rng, 0.3, 0.8),
  };
}

function flickerParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    opacityMin: range(rng, 0.35, 0.7),
    delayOffset: phase * 200 + range(rng, 0, 80),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function breatheParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    scale: range(rng, 1.1, 1.2),
    opacityMin: range(rng, 0.85, 0.92),
    delayOffset: phase * 500 + range(rng, 0, 80),
    durationMult: range(rng, 0.85, 1.15),
    dy2: signedRange(rng, 0.5, 1.5),
    rotate2: signedRange(rng, 0.3, 1),
  };
}

function trembleParams(rng: () => number, _phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0.3, 1.2),
    dy: signedRange(rng, 0.3, 1.2),
    delayOffset: range(rng, 0, 40),
    durationMult: range(rng, 0.85, 1.15),
    rotate2: signedRange(rng, 0.5, 1.5),
  };
}

function pulseParams(rng: () => number, phase: number): CharEffectParams {
  // Sharp heartbeat: fast scale-up + brightness flash, quick decay
  return {
    ...DEFAULTS,
    scale: range(rng, 1.15, 1.25),
    delayOffset: phase * 200 + range(rng, 0, 30),
    durationMult: range(rng, 0.85, 1.15),
    dy2: signedRange(rng, 0.3, 0.8),
    rotate2: signedRange(rng, 0.2, 0.5),
  };
}

function whisperParams(rng: () => number, phase: number): CharEffectParams {
  // Shrinking away — scale-down + upward drift + opacity fade
  return {
    ...DEFAULTS,
    dy: -range(rng, 0.8, 1.8),
    scale: range(rng, 0.88, 0.94),
    opacityMin: range(rng, 0.3, 0.55),
    delayOffset: phase * 400 + range(rng, 0, 60),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function fadeParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    opacityMin: range(rng, 0.15, 0.4),
    delayOffset: phase * 600 + range(rng, 0, 80),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function freezeParams(rng: () => number, phase: number): CharEffectParams {
  // Cold rigidity — horizontal shiver + desaturation + brightness drop
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0.3, 0.8),
    scale: range(rng, 0.95, 0.98),
    opacityMin: range(rng, 0.6, 0.75),
    delayOffset: phase * 400 + range(rng, 0, 60),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function burnParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dy: range(rng, 1, 3),
    skew: signedRange(rng, 1, 3),
    delayOffset: phase * 180 + range(rng, 0, 30),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function staticParams(rng: () => number, _phase: number): CharEffectParams {
  // TV static: jitter + opacity flicker + mild skew/scale glitches
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0.5, 1.2),
    dy: signedRange(rng, 0.3, 1),
    skew: signedRange(rng, 0.5, 1.5),
    scale: range(rng, 0.98, 1.02),
    opacityMin: range(rng, 0.35, 0.65),
    delayOffset: range(rng, 0, 40),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function distortParams(rng: () => number, phase: number): CharEffectParams {
  // Doubled intensity — woozy perception warp
  return {
    ...DEFAULTS,
    rotate: signedRange(rng, 5, 12),
    scale: range(rng, 0.82, 1.18),
    skew: signedRange(rng, 3, 8),
    delayOffset: phase * 350 + range(rng, 0, 50),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function swayParams(rng: () => number, phase: number): CharEffectParams {
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0.8, 2),
    delayOffset: phase * 300 + range(rng, 0, 40),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function glowParams(rng: () => number, phase: number): CharEffectParams {
  // Actual glow — brightness + drop-shadow cycling. Scale adds subtle swell.
  return {
    ...DEFAULTS,
    scale: range(rng, 1.03, 1.08),
    delayOffset: phase * 400 + range(rng, 0, 60),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function waveParams(rng: () => number, phase: number): CharEffectParams {
  // Coordinated sine-wave — positive-only dy, wave shape from phase delay
  return {
    ...DEFAULTS,
    dy: range(rng, 2, 3.5),
    delayOffset: phase * 350 + range(rng, 0, 10),
    durationMult: range(rng, 0.85, 1.15),
    dx2: signedRange(rng, 0.3, 0.8),
    rotate2: signedRange(rng, 0.2, 0.6),
  };
}

function floatParams(rng: () => number, phase: number): CharEffectParams {
  // Dual-axis gentle drift — Lissajous-like weightless motion
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 1, 2.5),
    dy: -range(rng, 1.5, 3.5),
    rotate: signedRange(rng, 0.5, 1.5),
    delayOffset: phase * 500 + range(rng, 0, 80),
    durationMult: range(rng, 0.85, 1.15),
    rotate2: signedRange(rng, 0.5, 1.2),
    dy2: signedRange(rng, 0.3, 0.8),
  };
}

function wobbleParams(rng: () => number, phase: number): CharEffectParams {
  // Pure rotation oscillation — jelly-like instability
  return {
    ...DEFAULTS,
    rotate: signedRange(rng, 3, 7),
    delayOffset: phase * 200 + range(rng, 0, 40),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function sparkleParams(rng: () => number, _phase: number): CharEffectParams {
  // Fully random delay so chars twinkle asynchronously — not phase-based
  return {
    ...DEFAULTS,
    scale: range(rng, 1.05, 1.12),
    delayOffset: range(rng, 0, 2500),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function dripParams(rng: () => number, phase: number): CharEffectParams {
  // Downward sag — gravity pull, opposite of drift
  return {
    ...DEFAULTS,
    dy: range(rng, 1.5, 4),
    rotate: signedRange(rng, 0.5, 2),
    delayOffset: phase * 350 + range(rng, 0, 60),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function stretchParams(rng: () => number, phase: number): CharEffectParams {
  // Horizontal elastic — scaleX oscillation (keyframe reads --kt-scale as scaleX)
  return {
    ...DEFAULTS,
    scale: range(rng, 1.08, 1.2),
    delayOffset: phase * 250 + range(rng, 0, 40),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function vibrateParams(rng: () => number, phase: number): CharEffectParams {
  // Medium-frequency lateral hum — between tremble (180ms) and sway (3.5s)
  return {
    ...DEFAULTS,
    dx: signedRange(rng, 1, 3),
    delayOffset: phase * 150 + range(rng, 0, 30),
    durationMult: range(rng, 0.85, 1.15),
  };
}

function hauntParams(rng: () => number, phase: number): CharEffectParams {
  // Ghostly presence — slow rotation + upward drift + deep opacity fade
  return {
    ...DEFAULTS,
    dy: -range(rng, 1, 2.5),
    rotate: signedRange(rng, 1.5, 4),
    opacityMin: range(rng, 0.25, 0.5),
    delayOffset: phase * 600 + range(rng, 0, 100),
    durationMult: range(rng, 0.85, 1.15),
    dx2: signedRange(rng, 0.3, 1),
    rotate2: signedRange(rng, 0.5, 1.5),
  };
}

// ── Reveal-style generators ─────────────────────────────────────

/**
 * Compute per-character starting transform for the scramble reveal style.
 * Each character starts at a random offset/rotation and the CSS animation
 * transitions it to its resting position (translate 0, rotate 0, scale 1).
 */
export function computeScrambleParams(
  index: number,
  totalUnits: number,
  seed: number,
): CharEffectParams {
  const rng = createPRNG(seed + index * 7919 + 83); // 83 = 'S'.charCodeAt(0)
  const _phase = totalUnits > 1 ? index / (totalUnits - 1) : 0;

  // Random direction for displacement
  const angle = rng() * Math.PI * 2;
  const mag = range(rng, 30, 80);

  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 45, 180),
    scale: range(rng, 0.3, 0.7),
    opacityMin: 0,
    delayOffset: 0,
  };
}

/**
 * Compute per-character starting transform for the rise reveal style.
 * Characters ascend from below into their resting position.
 */
export function computeRiseParams(
  index: number,
  totalUnits: number,
  seed: number,
): CharEffectParams {
  const rng = createPRNG(seed + index * 7919 + 82); // 82 = 'R'.charCodeAt(0)

  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0, 2),
    dy: range(rng, 16, 32),
    rotate: signedRange(rng, 2, 6),
    scale: range(rng, 0.85, 0.95),
    opacityMin: 0,
    delayOffset: 0,
  };
}

/**
 * Compute per-character starting transform for the drop reveal style.
 * Characters fall from above into their resting position with gravity feel.
 */
export function computeDropParams(
  index: number,
  totalUnits: number,
  seed: number,
): CharEffectParams {
  const rng = createPRNG(seed + index * 7919 + 68); // 68 = 'D'.charCodeAt(0)

  return {
    ...DEFAULTS,
    dx: signedRange(rng, 0, 2),
    dy: -range(rng, 18, 36),
    rotate: signedRange(rng, 3, 8),
    scale: range(rng, 0.8, 0.95),
    opacityMin: 0,
    delayOffset: 0,
  };
}

/**
 * Compute per-character starting transform for the pop reveal style.
 * Characters pop in from random offsets/rotations — fast, chaotic entrance.
 * Similar to scramble but with tighter radius and less rotation for speed.
 */
export function computePopRevealParams(
  index: number,
  totalUnits: number,
  seed: number,
): CharEffectParams {
  const rng = createPRNG(seed + index * 7919 + 78); // 78 = 'N'.charCodeAt(0)

  const angle = rng() * Math.PI * 2;
  const mag = range(rng, 10, 40);

  return {
    ...DEFAULTS,
    dx: Math.cos(angle) * mag,
    dy: Math.sin(angle) * mag,
    rotate: signedRange(rng, 10, 45),
    scale: range(rng, 0.5, 0.85),
    opacityMin: 0,
    delayOffset: 0,
  };
}

// ── DOM helpers ──────────────────────────────────────────────────

const PARAM_KEYS: [keyof CharEffectParams, string, string][] = [
  ['dx', '--kt-dx', 'px'],
  ['dy', '--kt-dy', 'px'],
  ['rotate', '--kt-rotate', 'deg'],
  ['scale', '--kt-scale', ''],
  ['skew', '--kt-skew', 'deg'],
  ['opacityMin', '--kt-opacity-min', ''],
  ['delayOffset', '--kt-delay-offset', 'ms'],
  ['durationMult', '--kt-duration-mult', ''],
  ['dx2', '--kt-dx2', 'px'],
  ['dy2', '--kt-dy2', 'px'],
  ['rotate2', '--kt-rotate2', 'deg'],
];

export function applyCharParams(
  el: HTMLElement,
  params: CharEffectParams,
): void {
  for (const [key, prop, unit] of PARAM_KEYS) {
    el.style.setProperty(prop, `${params[key]}${unit}`);
  }
}

export function clearCharParams(el: HTMLElement): void {
  for (const [, prop] of PARAM_KEYS) {
    el.style.removeProperty(prop);
  }
}
