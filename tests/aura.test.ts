import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getColorAsync } = vi.hoisted(() => ({ getColorAsync: vi.fn() }));

vi.mock('fast-average-color', () => ({
  FastAverageColor: class {
    getColorAsync = getColorAsync;
  },
}));

import { extractAura } from '@lib/aura';

beforeEach(() => {
  getColorAsync.mockReset();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('extractAura — clamp math', () => {
  it('clamps pure red saturation to the default 65% ceiling', async () => {
    getColorAsync.mockResolvedValue({ hex: '#ff0000' });
    expect(await extractAura('about:blank')).toBe('hsl(0 65% 50%)');
  });

  it('lifts near-black up to the 35% lightness floor', async () => {
    getColorAsync.mockResolvedValue({ hex: '#0a0a0a' });
    expect(await extractAura('about:blank')).toBe('hsl(0 0% 35%)');
  });

  it('pulls near-white down to the 75% lightness ceiling', async () => {
    getColorAsync.mockResolvedValue({ hex: '#fafafa' });
    expect(await extractAura('about:blank')).toBe('hsl(0 0% 75%)');
  });

  it('clamps neon green saturation, preserves hue and lightness', async () => {
    getColorAsync.mockResolvedValue({ hex: '#39ff14' });
    const out = await extractAura('about:blank');
    expect(out).toMatch(/^hsl\(11[01] 65% 5[34]%\)$/);
  });
});

describe('extractAura — custom clamp options', () => {
  it('respects custom clampSaturation', async () => {
    getColorAsync.mockResolvedValue({ hex: '#ff0000' });
    expect(await extractAura('about:blank', { clampSaturation: 0.4 })).toBe(
      'hsl(0 40% 50%)',
    );
  });

  it('respects custom clampLightness range', async () => {
    getColorAsync.mockResolvedValue({ hex: '#ffffff' });
    expect(
      await extractAura('about:blank', { clampLightness: [0.5, 0.6] }),
    ).toBe('hsl(0 0% 60%)');
  });
});

describe('extractAura — fallback path', () => {
  it('returns var(--energy-primary) when fast-average-color reports an error', async () => {
    getColorAsync.mockResolvedValue({
      hex: '#000000',
      error: new Error('tainted canvas'),
    });
    expect(await extractAura('about:blank')).toBe('var(--energy-primary)');
  });

  it('returns var(--energy-primary) when getColorAsync rejects', async () => {
    getColorAsync.mockRejectedValue(new Error('decode failed'));
    expect(await extractAura('about:blank')).toBe('var(--energy-primary)');
  });

  it('returns var(--energy-primary) when getColorAsync throws synchronously', async () => {
    getColorAsync.mockImplementation(() => {
      throw new Error('sync boom');
    });
    expect(await extractAura('about:blank')).toBe('var(--energy-primary)');
  });

  it('honors options.fallback over the default', async () => {
    getColorAsync.mockRejectedValue(new Error('boom'));
    expect(await extractAura('about:blank', { fallback: '#deadbe' })).toBe(
      '#deadbe',
    );
  });

  it('never throws on any failure path', async () => {
    getColorAsync.mockImplementation(() => {
      throw new Error('always fail');
    });
    await expect(extractAura('about:blank')).resolves.toBeTypeOf('string');
  });
});
