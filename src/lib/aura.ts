/* Aura color extraction.
 *
 * Sample a single dominant color from an image and clamp it into a
 * glow-friendly HSL range. Returns a CSS-ready color string suitable for
 * the `color` prop of `use:aura`. Always returns a valid color — never
 * throws on extraction failure (CORS, decode error, taint, missing image).
 *
 * @example
 * <img bind:this={img} src={url} crossorigin="anonymous" />
 * <div use:aura={{ color }}>...</div>
 *
 * $effect(() => {
 *   if (img) extractAura(img).then((c) => (color = c));
 * });
 */

import { FastAverageColor } from 'fast-average-color';

interface ExtractAuraOptions {
  clampSaturation?: number;
  clampLightness?: [number, number];
  fallback?: string;
}

const DEFAULT_CLAMP_S = 0.65;
const DEFAULT_CLAMP_L: [number, number] = [0.35, 0.75];
const DEFAULT_FALLBACK = 'var(--energy-primary)';

const fac = new FastAverageColor();

export async function extractAura(
  source: HTMLImageElement | string,
  options: ExtractAuraOptions = {},
): Promise<string> {
  const fallback = options.fallback ?? DEFAULT_FALLBACK;
  const clampS = options.clampSaturation ?? DEFAULT_CLAMP_S;
  const clampL = options.clampLightness ?? DEFAULT_CLAMP_L;

  try {
    const result =
      typeof source === 'string'
        ? await fac.getColorAsync(source, { silent: true })
        : await fac.getColorAsync(source, { silent: true });
    if (result.error) {
      if (import.meta.env.DEV) {
        console.warn('[aura] extraction failed, using fallback', result.error);
      }
      return fallback;
    }
    return clampHsl(result.hex, clampS, clampL);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[aura] extraction threw, using fallback', err);
    }
    return fallback;
  }
}

function clampHsl(
  hex: string,
  maxS: number,
  [minL, maxL]: [number, number],
): string {
  const { h, s, l } = hexToHsl(hex);
  const clampedS = Math.min(s, maxS);
  const clampedL = Math.min(Math.max(l, minL), maxL);
  return `hsl(${Math.round(h)} ${Math.round(clampedS * 100)}% ${Math.round(
    clampedL * 100,
  )}%)`;
}

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace(/^#/, '').slice(0, 6).padEnd(6, '0');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    default:
      h = (r - g) / d + 4;
  }
  return { h: h * 60, s, l };
}
