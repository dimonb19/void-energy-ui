import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildUserMessage,
  generateAtmosphere,
} from '@lib/atmosphere-generator';

// ── buildUserMessage ────────────────────────────────────────────────────────

describe('buildUserMessage', () => {
  it('includes the vibe and randomized seeds when no prefs are set', () => {
    const msg = buildUserMessage('deep space');
    expect(msg).toContain('Create an atmosphere for: "deep space"');
    expect(msg).toContain('Randomized seeds');
    expect(msg).toContain('Physics:');
    expect(msg).toContain('Mode:');
    expect(msg).toContain('Tonal direction');
    expect(msg).not.toContain('MUST');
  });

  it('includes physics constraint when physics is set', () => {
    const msg = buildUserMessage('deep space', 'glass');
    expect(msg).toContain('physics MUST be exactly "glass"');
  });

  it('includes mode constraint when mode is set', () => {
    const msg = buildUserMessage('deep space', undefined, 'light');
    expect(msg).toContain('mode MUST be exactly "light"');
  });

  it('includes both constraints when both are set', () => {
    const msg = buildUserMessage('deep space', 'flat', 'light');
    expect(msg).toContain('physics MUST be exactly "flat"');
    expect(msg).toContain('mode MUST be exactly "light"');
  });

  it('produces varied output across multiple calls', () => {
    const messages = new Set<string>();
    // Generate enough calls that randomness should produce at least 2 unique messages
    for (let i = 0; i < 20; i++) {
      messages.add(buildUserMessage('test'));
    }
    expect(messages.size).toBeGreaterThan(1);
  });
});

// ── generateAtmosphere preference validation ────────────────────────────────

describe('generateAtmosphere preference enforcement', () => {
  const validGlassResponse = JSON.stringify({
    mode: 'dark',
    physics: 'glass',
    tagline: 'Deep / Cosmic',
    label: 'Deep Space',
    fontHeadingKey: 'tech',
    fontBodyKey: 'clean',
    palette: {
      'bg-canvas': '#0a0a1a',
      'bg-spotlight': '#1a1a3a',
      'bg-surface': 'rgba(20, 20, 60, 0.5)',
      'bg-sunk': 'rgba(10, 10, 30, 0.6)',
      'energy-primary': '#6366f1',
      'energy-secondary': '#8b5cf6',
      'border-color': 'rgba(99, 102, 241, 0.3)',
      'text-main': '#f0f0ff',
      'text-dim': '#b0b0cc',
      'text-mute': '#707088',
    },
  });

  function mockFetchWith(responseText: string) {
    return vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ type: 'text', text: responseText }],
        }),
    });
  }

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('passes physics and mode into the request body', async () => {
    const fetchSpy = mockFetchWith(validGlassResponse);
    vi.stubGlobal('fetch', fetchSpy);

    await generateAtmosphere({
      apiKey: 'sk-test',
      vibe: 'deep space',
      physics: 'glass',
      mode: 'dark',
    });

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    const userMsg = body.messages[0].content;
    expect(userMsg).toContain('physics MUST be exactly "glass"');
    expect(userMsg).toContain('mode MUST be exactly "dark"');
  });

  it('rejects when AI returns wrong physics', async () => {
    vi.stubGlobal('fetch', mockFetchWith(validGlassResponse));

    const result = await generateAtmosphere({
      apiKey: 'sk-test',
      vibe: 'deep space',
      physics: 'flat', // requested flat, AI returned glass
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('preference_mismatch');
      expect(result.error.message).toContain('flat');
      expect(result.error.message).toContain('glass');
    }
  });

  it('rejects when AI returns wrong mode', async () => {
    vi.stubGlobal('fetch', mockFetchWith(validGlassResponse));

    const result = await generateAtmosphere({
      apiKey: 'sk-test',
      vibe: 'deep space',
      mode: 'light', // requested light, AI returned dark
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe('preference_mismatch');
      expect(result.error.message).toContain('light');
      expect(result.error.message).toContain('dark');
    }
  });

  it('accepts when AI matches requested preferences', async () => {
    vi.stubGlobal('fetch', mockFetchWith(validGlassResponse));

    const result = await generateAtmosphere({
      apiKey: 'sk-test',
      vibe: 'deep space',
      physics: 'glass',
      mode: 'dark',
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.definition.physics).toBe('glass');
      expect(result.data.definition.mode).toBe('dark');
    }
  });

  it('accepts when no preferences are specified', async () => {
    vi.stubGlobal('fetch', mockFetchWith(validGlassResponse));

    const result = await generateAtmosphere({
      apiKey: 'sk-test',
      vibe: 'deep space',
    });

    expect(result.ok).toBe(true);
  });
});
