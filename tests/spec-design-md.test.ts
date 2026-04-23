import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parse as parseYaml } from 'yaml';
import { describe, expect, it } from 'vitest';

import {
  flattenAlpha,
  serializeFrostSpecDocument,
  serializeFrostSpecFrontmatter,
} from '@lib/spec-design-md';

describe('flattenAlpha', () => {
  it('locks border-color (rgba(126, 200, 227, 0.2)) over bg-spotlight (#141c2e) to #293E52', () => {
    // This is the canonical Frost "outline" compositing used by the exporter.
    // If this ever drifts, the emitted DESIGN.md drifts with it — the test is
    // the contract.
    expect(flattenAlpha('rgba(126, 200, 227, 0.2)', '#141c2e')).toBe('#293E52');
  });

  it('sanity check: bg-surface (rgba(20, 30, 50, 0.45)) over bg-canvas (#080c14) → #0D1422', () => {
    // Not emitted in DESIGN.md (surface uses bg-spotlight directly per plan),
    // but a useful fixture that the helper is doing the right math.
    expect(flattenAlpha('rgba(20, 30, 50, 0.45)', '#080c14')).toBe('#0D1422');
  });

  it('passes through a fully opaque source unchanged', () => {
    expect(flattenAlpha('rgba(255, 255, 255, 1.0)', '#000000')).toBe('#FFFFFF');
  });

  it('returns the background when alpha is zero', () => {
    expect(flattenAlpha('rgba(255, 255, 255, 0.0)', '#000000')).toBe('#000000');
  });

  it('accepts integer alpha via `rgba(R, G, B, 1)` form', () => {
    expect(flattenAlpha('rgba(126, 200, 227, 1)', '#000000')).toBe('#7EC8E3');
  });

  it('tolerates whitespace variations in the rgba input', () => {
    expect(flattenAlpha('rgba( 126 , 200 , 227 , 0.2 )', '#141c2e')).toBe(
      '#293E52',
    );
  });

  it('throws on rgb() (no alpha channel)', () => {
    expect(() => flattenAlpha('rgb(126, 200, 227)', '#000000')).toThrow();
  });

  it('throws on a malformed rgba() missing the alpha component', () => {
    expect(() => flattenAlpha('rgba(126, 200, 227)', '#000000')).toThrow();
  });

  it('throws on a non-hex background', () => {
    expect(() =>
      flattenAlpha('rgba(126, 200, 227, 0.2)', 'rgb(0, 0, 0)'),
    ).toThrow();
  });

  it('throws on a short-form hex background (#fff)', () => {
    expect(() => flattenAlpha('rgba(126, 200, 227, 0.2)', '#fff')).toThrow();
  });
});

// Helper: extract YAML frontmatter from a DESIGN.md-style document.
function extractFrontmatter(doc: string): unknown {
  const match = doc.match(/^---\n([\s\S]*?)\n---/);
  if (!match) throw new Error('No frontmatter found in serialized document');
  return parseYaml(match[1]);
}

describe('serializeFrostSpecFrontmatter', () => {
  const frontmatter = serializeFrostSpecFrontmatter();
  const parsed = extractFrontmatter(`${frontmatter}\n`) as {
    name: string;
    version: string;
    description: string;
    colors: Record<string, string>;
    typography: Record<string, Record<string, unknown>>;
    spacing: Record<string, string | number>;
    rounded: Record<string, string>;
    components: Record<string, Record<string, string>>;
  };

  it('emits a valid YAML document', () => {
    expect(parsed).toBeTypeOf('object');
    expect(parsed.name).toBe('Void Energy');
    expect(parsed.version).toBe('alpha');
    expect(parsed.description).toBeTypeOf('string');
    expect(parsed.description.length).toBeGreaterThan(40);
  });

  it('emits every color as a 7-character #RRGGBB hex', () => {
    const hex7 = /^#[0-9a-fA-F]{6}$/;
    for (const [key, value] of Object.entries(parsed.colors)) {
      expect(value, `colors.${key} must be #RRGGBB`).toMatch(hex7);
    }
  });

  it('locks Frost canonical values at their expected slots', () => {
    expect(parsed.colors.primary).toBe('#7ec8e3');
    expect(parsed.colors.secondary).toBe('#4a6fa5');
    expect(parsed.colors.neutral).toBe('#607080');
    expect(parsed.colors.surface).toBe('#141c2e');
    expect(parsed.colors['surface-container']).toBe('#080c14');
    expect(parsed.colors['on-surface']).toBe('#edf2f7');
    expect(parsed.colors['on-surface-variant']).toBe('#a0b0c0');
    expect(parsed.colors.outline).toBe('#293E52');
    expect(parsed.colors.error).toBe('#ff3c40');
  });

  it('deliberately omits tertiary (Frost has no third accent)', () => {
    expect(parsed.colors.tertiary).toBeUndefined();
  });

  it('resolves every {colors.*} reference in components to a defined color', () => {
    const colorRefPattern = /^\{colors\.([a-z-]+)\}$/;
    for (const [component, props] of Object.entries(parsed.components)) {
      for (const [prop, value] of Object.entries(props)) {
        if (typeof value !== 'string') continue;
        const match = value.match(colorRefPattern);
        if (!match) continue;
        const refName = match[1];
        expect(
          parsed.colors[refName],
          `components.${component}.${prop} → {colors.${refName}} is not defined`,
        ).toBeDefined();
      }
    }
  });

  it('resolves every {rounded.*} reference to a defined radius', () => {
    const refPattern = /^\{rounded\.([a-z0-9-]+)\}$/;
    for (const [component, props] of Object.entries(parsed.components)) {
      for (const [prop, value] of Object.entries(props)) {
        if (typeof value !== 'string') continue;
        const match = value.match(refPattern);
        if (!match) continue;
        const refName = match[1];
        expect(
          parsed.rounded[refName],
          `components.${component}.${prop} → {rounded.${refName}} is not defined`,
        ).toBeDefined();
      }
    }
  });

  it('resolves every {typography.*} reference to a defined scale', () => {
    const refPattern = /^\{typography\.([a-z0-9-]+)\}$/;
    for (const [component, props] of Object.entries(parsed.components)) {
      for (const [prop, value] of Object.entries(props)) {
        if (typeof value !== 'string') continue;
        const match = value.match(refPattern);
        if (!match) continue;
        const refName = match[1];
        expect(
          parsed.typography[refName],
          `components.${component}.${prop} → {typography.${refName}} is not defined`,
        ).toBeDefined();
      }
    }
  });

  it('emits the full VE spacing scale (xs → 5xl)', () => {
    for (const key of [
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      '2xl',
      '3xl',
      '4xl',
      '5xl',
    ]) {
      expect(parsed.spacing[key], `spacing.${key} missing`).toBeDefined();
    }
  });

  it('emits typography scales covering display / headline / body / label', () => {
    for (const key of [
      'display-lg',
      'headline-lg',
      'headline-md',
      'headline-sm',
      'body-lg',
      'body-md',
      'body-sm',
      'label-md',
      'label-sm',
    ]) {
      expect(parsed.typography[key], `typography.${key} missing`).toBeDefined();
    }
  });
});

describe('serializeFrostSpecDocument', () => {
  const doc = serializeFrostSpecDocument();

  it('begins with a YAML frontmatter block', () => {
    expect(doc.startsWith('---\n')).toBe(true);
  });

  it('contains all required body sections', () => {
    // Spec canonical sections + plan-required unknown sections.
    const required = [
      '## Overview',
      '## Colors',
      '## Typography',
      '## Layout & Spacing',
      '## Elevation & Depth',
      '## Shapes',
      '## Components',
      "## Do's and Don'ts",
      '## Responsive Behavior',
      '## Agent Prompt Guide',
      '## License',
      '## The Full System',
    ];
    for (const section of required) {
      expect(doc, `missing section: ${section}`).toContain(`\n${section}`);
    }
  });

  it('mentions sentence-case explicitly and does not contain "uppercase letter-spacing"', () => {
    // Enforces the sentence-case correction called out in the plan:
    // the v1 draft used "uppercase letter-spacing" in the Dashboard metric-card
    // prompt, which contradicted VE doctrine. The exporter must not regress.
    expect(doc.toLowerCase()).toContain('sentence case');
    expect(doc.toLowerCase()).not.toContain('uppercase letter-spacing');
  });

  it('describes glass surface with both alpha value and solid fallback', () => {
    // rgba(20, 30, 50, 0.45) should appear as the glass description;
    // #141c2e should appear as the labeled fallback.
    expect(doc).toContain('rgba(20, 30, 50, 0.45)');
    expect(doc).toContain('#141c2e');
    expect(doc).toContain('backdrop-filter');
  });

  it('describes the border with both alpha value and solid fallback', () => {
    expect(doc).toContain('rgba(126, 200, 227, 0.2)');
    expect(doc).toContain('#293E52');
  });

  it('passes `design.md lint` with zero errors and zero warnings (plan acceptance criterion)', () => {
    const binary = path.join(
      process.cwd(),
      'node_modules',
      '.bin',
      'design.md',
    );
    if (!fs.existsSync(binary)) {
      // Keep tests runnable without the devDep installed.
      // eslint-disable-next-line no-console
      console.warn('design.md binary not found; skipping lint assertion');
      return;
    }

    const tmp = path.join(os.tmpdir(), `frost-spec-${process.pid}.md`);
    fs.writeFileSync(tmp, doc, 'utf8');
    try {
      const result = spawnSync(binary, ['lint', '--format', 'json', tmp], {
        encoding: 'utf8',
      });
      expect(result.status, result.stderr).toBe(0);
      const output = JSON.parse(result.stdout) as {
        summary: { errors: number; warnings: number };
      };
      expect(output.summary.errors).toBe(0);
      expect(output.summary.warnings).toBe(0);
    } finally {
      fs.unlinkSync(tmp);
    }
  });
});
