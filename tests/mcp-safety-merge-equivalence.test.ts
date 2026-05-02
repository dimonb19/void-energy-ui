/*
 * Drift contract: VoidEngine.normalizeThemeDefinition (the engine's Safety
 * Merge) and packages/void-energy-mcp's normalizeAtmosphere (the pure port)
 * must produce structurally equivalent normalized output for the same input.
 *
 * If this test fails after editing either side, the port is stale — see
 * packages/void-energy-mcp/src/safety-merge.ts header comment for the
 * drift-mitigation policy.
 */

import { describe, expect, it, vi } from 'vitest';

import { VoidEngine } from '@adapters/void-engine.svelte';
import { VOID_TOKENS } from '@config/design-tokens';

import { normalizeAtmosphere } from '../packages/void-energy-mcp/src/safety-merge';
import type { AtmospheresSnapshot } from '../packages/void-energy-mcp/src/types';

function silenceEngine() {
  vi.spyOn(console, 'group').mockImplementation(() => {});
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
}

function buildSnapshot(): AtmospheresSnapshot {
  const out: AtmospheresSnapshot = {};
  for (const [id, def] of Object.entries(VOID_TOKENS.themes)) {
    out[id] = {
      id,
      label: def.tagline ?? id,
      mode: def.mode,
      physics: def.physics,
      tagline: def.tagline ?? '',
      palette: { ...def.palette },
    };
  }
  return out;
}

describe('safety-merge equivalence: VoidEngine ↔ MCP port', () => {
  it('normalizes Frost identically through both surfaces', () => {
    silenceEngine();
    const snapshot = buildSnapshot();
    const frost = VOID_TOKENS.themes.frost;
    const candidate = {
      mode: frost.mode,
      physics: frost.physics,
      tagline: frost.tagline,
      palette: { ...frost.palette },
    };

    const engine = new VoidEngine();
    engine.registerTheme('frost-equiv', candidate);
    const fromEngine = engine.registry['frost-equiv'];

    const fromPort = normalizeAtmosphere(candidate, {
      snapshot,
      id: 'frost-equiv',
    });

    expect(fromPort.ok).toBe(true);
    expect(fromPort.normalized).not.toBeNull();
    const port = fromPort.normalized!;

    expect(port.mode).toBe(fromEngine.mode);
    expect(port.physics).toBe(fromEngine.physics);
    expect(port.palette).toEqual(fromEngine.palette);
    expect(port.fonts).toEqual(fromEngine.fonts ?? []);
  });

  it('auto-corrects glass+light identically through both surfaces', () => {
    silenceEngine();
    const snapshot = buildSnapshot();
    const candidate = {
      mode: 'light' as const,
      physics: 'glass' as const,
      palette: { 'energy-primary': '#abcdef' },
    };

    const engine = new VoidEngine();
    engine.registerTheme('glass-light-test', candidate);
    const fromEngine = engine.registry['glass-light-test'];

    const fromPort = normalizeAtmosphere(candidate, {
      snapshot,
      id: 'glass-light-test',
    });

    expect(fromPort.ok).toBe(true);
    expect(fromEngine.physics).toBe('flat');
    expect(fromPort.normalized!.physics).toBe('flat');
    expect(fromPort.normalized!.mode).toBe(fromEngine.mode);
    expect(fromPort.normalized!.palette['energy-primary']).toBe(
      fromEngine.palette['energy-primary'],
    );
    expect(fromPort.normalized!.palette).toEqual(fromEngine.palette);
    expect(fromPort.normalized!.fonts).toEqual(fromEngine.fonts ?? []);
  });

  it('auto-corrects retro+light identically through both surfaces', () => {
    silenceEngine();
    const snapshot = buildSnapshot();
    const candidate = {
      mode: 'light' as const,
      physics: 'retro' as const,
      palette: { 'energy-primary': '#fedcba' },
    };

    const engine = new VoidEngine();
    engine.registerTheme('retro-light-test', candidate);
    const fromEngine = engine.registry['retro-light-test'];

    const fromPort = normalizeAtmosphere(candidate, {
      snapshot,
      id: 'retro-light-test',
    });

    expect(fromPort.ok).toBe(true);
    expect(fromEngine.mode).toBe('dark');
    expect(fromEngine.physics).toBe('retro');
    expect(fromPort.normalized!.mode).toBe('dark');
    expect(fromPort.normalized!.physics).toBe('retro');
    expect(fromPort.normalized!.palette).toEqual(fromEngine.palette);
    expect(fromPort.normalized!.fonts).toEqual(fromEngine.fonts ?? []);
  });

  it('rejects non-object input', () => {
    const snapshot = buildSnapshot();
    const result = normalizeAtmosphere('not-an-object', { snapshot });
    expect(result.ok).toBe(false);
    expect(result.normalized).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects invalid physics value', () => {
    const snapshot = buildSnapshot();
    const result = normalizeAtmosphere(
      { physics: 'plasma', mode: 'dark', palette: {} },
      { snapshot, id: 'invalid' },
    );
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('physics'))).toBe(true);
  });
});
