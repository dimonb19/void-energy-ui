import { describe, expect, it, vi } from 'vitest';

describe('transitions runtime physics resolution', () => {
  it('invalidates cached motion config when live physics changes on the same atmosphere', async () => {
    vi.resetModules();

    document.documentElement.setAttribute('data-atmosphere', 'runtime-theme');
    document.documentElement.setAttribute('data-physics', 'flat');

    const { materialize } = await import('@lib/transitions.svelte');
    const node = document.createElement('div');

    const flatTransition = materialize(node);
    expect(flatTransition.duration).toBeGreaterThan(0);
    expect(flatTransition.css?.(0.5, 0.5)).toContain('filter: blur(0px);');

    document.documentElement.setAttribute('data-physics', 'retro');

    const retroTransition = materialize(node);
    expect(retroTransition.duration).toBe(0);
    expect(retroTransition.css?.(0.5, 0.5)).toBe('opacity: 0.5;');
  });
});
