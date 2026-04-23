import { describe, expect, it, vi } from 'vitest';

import { VoidEngine } from '@adapters/void-engine.svelte';
import { VOID_TOKENS } from '@config/design-tokens';
import { parseAtmosphereMd, serializeAtmosphereMd } from '@lib/atmosphere-md';

function silenceThemeConsole() {
  vi.spyOn(console, 'group').mockImplementation(() => {});
  vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('atmosphere-md serialize', () => {
  it('emits YAML frontmatter with id, mode, physics, and tagline', () => {
    const frost = VOID_TOKENS.themes.frost;
    const md = serializeAtmosphereMd(frost, { id: 'frost' });

    expect(md.startsWith('---\n')).toBe(true);
    expect(md).toMatch(/^id: frost$/m);
    expect(md).toMatch(/^mode: dark$/m);
    expect(md).toMatch(/^physics: glass$/m);
    expect(md).toMatch(/^tagline: /m);
  });

  it('emits a Colors section with every non-font palette token', () => {
    const frost = VOID_TOKENS.themes.frost;
    const md = serializeAtmosphereMd(frost, { id: 'frost' });

    expect(md).toMatch(/## Colors/);
    expect(md).toMatch(/\| bg-canvas \| #080c14 \|/);
    expect(md).toMatch(/\| energy-primary \| #7ec8e3 \|/);
    expect(md).toMatch(/\| text-main \| #edf2f7 \|/);
  });

  it('emits a Typography section with both font tokens', () => {
    const frost = VOID_TOKENS.themes.frost;
    const md = serializeAtmosphereMd(frost, { id: 'frost' });

    expect(md).toMatch(/## Typography/);
    expect(md).toMatch(/- Heading font: `/);
    expect(md).toMatch(/- Body font: `/);
  });
});

describe('atmosphere-md parse', () => {
  it('parses a minimal valid document', () => {
    const md = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: flat',
      '---',
      '',
      '## Colors',
      '',
      '| Token | Value |',
      '| --- | --- |',
      '| energy-primary | #abcdef |',
      '',
    ].join('\n');

    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe('custom');
    expect(result.data.definition.mode).toBe('dark');
    expect(result.data.definition.physics).toBe('flat');
    expect(result.data.definition.palette?.['energy-primary']).toBe('#abcdef');
  });

  it('rejects a document with no frontmatter', () => {
    const result = parseAtmosphereMd('## Colors\n\n| foo | bar |\n');
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe('invalid_shape');
  });

  it('rejects a document missing required frontmatter fields', () => {
    const md =
      '---\nname: orphan\n---\n\n## Colors\n\n| energy-primary | #000 |\n';
    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(false);
  });

  it('tolerates unknown frontmatter keys for forward compat', () => {
    const md = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: glass',
      'future-field: something',
      'version: 2',
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #111111 |',
      '',
    ].join('\n');

    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
  });

  it('parses typography list with backticked font stacks', () => {
    const md = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: flat',
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #111 |',
      '',
      '## Typography',
      '',
      '- Heading font: `Space Grotesk, sans-serif`',
      '- Body font: `Inter, sans-serif`',
      '',
    ].join('\n');

    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.definition.palette?.['font-atmos-heading']).toBe(
      'Space Grotesk, sans-serif',
    );
    expect(result.data.definition.palette?.['font-atmos-body']).toBe(
      'Inter, sans-serif',
    );
  });

  it('handles CRLF line endings', () => {
    const md =
      '---\r\nid: custom\r\nmode: dark\r\nphysics: flat\r\n---\r\n\r\n## Colors\r\n\r\n| energy-primary | #222 |\r\n';
    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
  });

  it('preserves colons in frontmatter values', () => {
    const md = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: flat',
      "tagline: It's 4:20 somewhere",
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #333 |',
      '',
    ].join('\n');

    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.definition.tagline).toBe("It's 4:20 somewhere");
  });

  it('does not truncate at a quoted "---" sequence inside a value', () => {
    const md = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: flat',
      'tagline: "before --- after"',
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #444 |',
      '',
    ].join('\n');

    const result = parseAtmosphereMd(md);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.definition.tagline).toBe('before --- after');
  });

  it('parses identically with and without a UTF-8 BOM prefix', () => {
    const body = [
      '---',
      'id: custom',
      'mode: dark',
      'physics: flat',
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #555 |',
      '',
    ].join('\n');

    const withoutBom = parseAtmosphereMd(body);
    const withBom = parseAtmosphereMd(`﻿${body}`);

    expect(withoutBom.ok).toBe(true);
    expect(withBom.ok).toBe(true);
    if (!withoutBom.ok || !withBom.ok) return;
    expect(withBom.data.id).toBe(withoutBom.data.id);
    expect(withBom.data.definition.palette?.['energy-primary']).toBe(
      withoutBom.data.definition.palette?.['energy-primary'],
    );
  });
});

describe('atmosphere-md round-trip', () => {
  it('built-in atmospheres survive serialize -> parse with palette intact', () => {
    const fixtures: Array<keyof typeof VOID_TOKENS.themes> = [
      'frost',
      'terminal',
      'meridian',
      'slate',
    ];

    for (const id of fixtures) {
      const definition = VOID_TOKENS.themes[id];
      if (!definition) continue;

      const md = serializeAtmosphereMd(definition, { id: String(id) });
      const parsed = parseAtmosphereMd(md);

      expect(parsed.ok).toBe(true);
      if (!parsed.ok) continue;

      expect(parsed.data.id).toBe(id);
      expect(parsed.data.definition.mode).toBe(definition.mode);
      expect(parsed.data.definition.physics).toBe(definition.physics);

      // Every color key should round-trip verbatim.
      for (const key of Object.keys(definition.palette) as Array<
        keyof VoidPalette
      >) {
        if (key.startsWith('font-atmos-')) continue;
        expect(parsed.data.definition.palette?.[key]).toBe(
          definition.palette[key],
        );
      }

      // Typography round-trips too.
      expect(parsed.data.definition.palette?.['font-atmos-heading']).toBe(
        definition.palette['font-atmos-heading'],
      );
      expect(parsed.data.definition.palette?.['font-atmos-body']).toBe(
        definition.palette['font-atmos-body'],
      );
    }
  });
});

describe('voidEngine atmosphere-md integration', () => {
  it('exportAtmosphereMd returns null for unknown atmosphere', () => {
    silenceThemeConsole();
    const engine = new VoidEngine();
    expect(engine.exportAtmosphereMd('does-not-exist')).toBeNull();
  });

  it('exportAtmosphereMd defaults to the active atmosphere when no id passed', () => {
    silenceThemeConsole();
    const engine = new VoidEngine();
    const md = engine.exportAtmosphereMd();
    expect(md).not.toBeNull();
    expect(md!.startsWith('---\n')).toBe(true);
    expect(md!).toMatch(new RegExp(`^id: ${engine.atmosphere}$`, 'm'));
  });

  it('importAtmosphereMd registers a partial atmosphere via Safety Merge', () => {
    silenceThemeConsole();
    const engine = new VoidEngine();

    const md = [
      '---',
      'id: imported-test',
      'mode: dark',
      'physics: flat',
      'tagline: Imported',
      '---',
      '',
      '## Colors',
      '',
      '| energy-primary | #ff00ff |',
      '',
    ].join('\n');

    const result = engine.importAtmosphereMd(md);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe('imported-test');
    expect(engine.registry['imported-test']).toBeDefined();
    expect(engine.registry['imported-test'].palette['energy-primary']).toBe(
      '#ff00ff',
    );
    // Missing tokens filled in by Safety Merge.
    expect(engine.registry['imported-test'].palette['bg-canvas']).toBeTruthy();
  });

  it('importAtmosphereMd rejects malformed input without registering', () => {
    silenceThemeConsole();
    const engine = new VoidEngine();
    const before = Object.keys(engine.registry).length;

    const result = engine.importAtmosphereMd('not an atmosphere.md');
    expect(result.ok).toBe(false);
    expect(Object.keys(engine.registry).length).toBe(before);
  });

  it('export -> import preserves atmosphere identity', () => {
    silenceThemeConsole();
    const engine = new VoidEngine();

    const exported = engine.exportAtmosphereMd('frost');
    expect(exported).not.toBeNull();

    const result = engine.importAtmosphereMd(exported!);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.id).toBe('frost');
  });
});
