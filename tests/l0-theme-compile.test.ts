/**
 * L0 theme.css compile + grep verification.
 *
 * Uses @tailwindcss/node to compile theme.css against a fixed candidate set,
 * then grep-asserts the built CSS. These are the Session 3 built-CSS checks
 * from phase-1-l0-tailwind-preset.md → Verification Checklist → "Built CSS
 * spot-checks."
 *
 * Why grep-based instead of snapshot: v4's compiled output includes
 * preflight + theme layer + candidate-generated utilities, which changes
 * with the Tailwind version. Grep-asserting the load-bearing selectors
 * catches regressions without locking us to a single compiler version.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import { compile } from '@tailwindcss/node';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');
const THEME = path.join(PKG, 'dist/theme.css');

// Candidates we need Tailwind to emit to verify the namespace strategy
// and footgun fixes actually produce classes.
const CANDIDATES = [
  // Spacing (forwarders via @theme inline)
  'p-md',
  'gap-lg',
  'm-sm',
  // Colors: bridge aliases (@theme inline)
  'bg-surface',
  'bg-canvas',
  'text-main',
  'text-dim',
  'text-mute',
  // Colors: semantic (@theme reference)
  'bg-premium',
  'text-error',
  'bg-success',
  // Radius (@theme reference + @utility rounded override)
  'rounded',
  'rounded-sm',
  'rounded-lg',
  'rounded-full',
  'rounded-none',
  // Typography
  'text-h2',
  'text-base',
  'leading-body',
  'tracking-h1',
  'font-heading',
  'font-body',
  'font-mono',
  'font-weight-bold',
  // Shadows (@theme reference — physics owns real values)
  'shadow-float',
  'shadow-lift',
  'shadow-sunk',
  // Motion
  'duration-fast',
  'ease-flow',
  'delay-cascade',
  // Border family (@layer void-overrides)
  'border',
  'border-l',
  'border-r',
  'border-t',
  'border-b',
  'border-x',
  'border-y',
  'border-2',
  'border-l-2',
  // Utilities (custom)
  'backdrop-blur-physics',
  'min-h-control',
  // Container (void-overrides) + sizing
  'container',
  'max-w-2xl',
  'max-w-md',
];

let built: string;
let themeSource: string;

beforeAll(async () => {
  themeSource = fs.readFileSync(THEME, 'utf8');
  // Prepend tailwindcss import so compile() pulls in preflight + utilities.
  const css = `@import "tailwindcss";\n${themeSource}`;
  const compiled = await compile(css, {
    base: path.dirname(THEME),
    onDependency: () => {},
  });
  built = compiled.build(CANDIDATES);
});

describe('L0 theme.css — built CSS spot-checks', () => {
  it('emits .min-h-control{min-height:var(--control-height)}', () => {
    expect(built).toMatch(
      /\.min-h-control\s*\{\s*min-height:\s*var\(--control-height\)/,
    );
  });

  it('emits .rounded{border-radius:var(--radius-md)}', () => {
    expect(built).toMatch(
      /\.rounded\s*\{\s*border-radius:\s*var\(--radius-md\)/,
    );
  });

  it('emits .backdrop-blur-physics with var(--physics-blur)', () => {
    expect(built).toMatch(
      /\.backdrop-blur-physics\s*\{[^}]*blur\(var\(--physics-blur\)\)/,
    );
  });

  it('bare .border uses var(--physics-border-width) via void-overrides', () => {
    expect(built).toMatch(
      /\.border\s*\{\s*border-width:\s*var\(--physics-border-width\)/,
    );
  });

  it('all directional .border-{l,r,t,b,x,y} use --physics-border-width', () => {
    expect(built).toMatch(
      /\.border-l\s*\{\s*border-left-width:\s*var\(--physics-border-width\)/,
    );
    expect(built).toMatch(
      /\.border-r\s*\{\s*border-right-width:\s*var\(--physics-border-width\)/,
    );
    expect(built).toMatch(
      /\.border-t\s*\{\s*border-top-width:\s*var\(--physics-border-width\)/,
    );
    expect(built).toMatch(
      /\.border-b\s*\{\s*border-bottom-width:\s*var\(--physics-border-width\)/,
    );
    expect(built).toMatch(
      /\.border-x\s*\{\s*border-inline-width:\s*var\(--physics-border-width\)/,
    );
    expect(built).toMatch(
      /\.border-y\s*\{\s*border-block-width:\s*var\(--physics-border-width\)/,
    );
  });

  it('numeric .border-2 stays literal (2px)', () => {
    expect(built).toMatch(
      /\.border-2\s*\{\s*border-style:[\s\S]*?border-width:\s*2px/,
    );
  });

  it('.container is VE-scaled (720px at 768px breakpoint) from void-overrides', () => {
    // Match the void-overrides container specifically — check min-width:768px scoped to max-width:720px
    expect(built).toMatch(/min-width:\s*768px[\s\S]*?max-width:\s*720px/);
  });

  it('.bg-surface resolves to var(--bg-surface)', () => {
    expect(built).toMatch(
      /\.bg-surface\s*\{\s*background-color:\s*var\(--bg-surface\)/,
    );
  });

  it('.text-main resolves to var(--text-main)', () => {
    expect(built).toMatch(/\.text-main\s*\{\s*color:\s*var\(--text-main\)/);
  });

  it('semantic colors (e.g. .text-error) reference --color-error', () => {
    // v4 appends the @theme reference placeholder as a fallback:
    //   var(--color-error, #ef4444)
    // The real value comes from the active atmosphere; the fallback only
    // matters if --color-error is unset (e.g. no atmosphere imported).
    expect(built).toMatch(
      /\.text-error\s*\{\s*color:\s*var\(--color-error[,)]/,
    );
  });
});

describe('L0 theme.css — font namespace integrity (Session 3 gate)', () => {
  it('no --font-heading self-reference in @layer theme (Footgun verification)', () => {
    // Walk built CSS; a self-reference `--font-heading: var(--font-heading)` would
    // invalidate the token and fall the entire page back to browser default font.
    // The source declaration in tokens.css is a :root rule — those are fine; we
    // only fail if we find the self-cycle pattern anywhere.
    expect(built).not.toMatch(/--font-heading:\s*var\(--font-heading\)/);
    expect(built).not.toMatch(/--font-body:\s*var\(--font-body\)/);
    expect(built).not.toMatch(/--font-mono:\s*var\(--font-mono\)/);
  });

  it('emits .font-heading / .font-body / .font-mono utilities', () => {
    // v4 appends the @theme reference placeholder as a fallback:
    //   var(--font-heading, 'system-ui', sans-serif)
    // tokens.css + atmosphere CSS set real values, so the fallback is inert.
    expect(built).toMatch(
      /\.font-heading\s*\{\s*font-family:\s*var\(--font-heading[,)]/,
    );
    expect(built).toMatch(
      /\.font-body\s*\{\s*font-family:\s*var\(--font-body[,)]/,
    );
    expect(built).toMatch(
      /\.font-mono\s*\{\s*font-family:\s*var\(--font-mono[,)]/,
    );
  });
});

describe('L0 theme.css — source structure (namespace strategy)', () => {
  it('declares the void-scss → void-overrides layer order before Tailwind', () => {
    expect(themeSource).toMatch(
      /@layer\s+void-scss\s*,\s*properties\s*,\s*theme\s*,\s*base\s*,\s*components\s*,\s*utilities\s*,\s*void-overrides\s*;/,
    );
  });

  it('imports tokens.css, default atmosphere, default physics, density.css', () => {
    expect(themeSource).toMatch(/@import ['"]\.\/tokens\.css['"]/);
    expect(themeSource).toMatch(/@import ['"]\.\/atmospheres\/frost\.css['"]/);
    expect(themeSource).toMatch(/@import ['"]\.\/physics\/glass\.css['"]/);
    expect(themeSource).toMatch(/@import ['"]\.\/density\.css['"]/);
  });

  it('does NOT import tailwindcss (D-L0.4: consumer owns that import)', () => {
    expect(themeSource).not.toMatch(/@import\s+['"]tailwindcss['"]/);
  });

  it('contains all 15 required namespace resets', () => {
    const resets = [
      '--color-*',
      '--spacing-*',
      '--breakpoint-*',
      '--font-*',
      '--text-*',
      '--leading-*',
      '--tracking-*',
      '--font-weight-*',
      '--radius-*',
      '--ease-*',
      '--delay-*',
      '--duration-*',
      '--max-width-*',
      '--container-*',
      '--z-*',
    ];
    for (const key of resets) {
      expect(themeSource).toContain(`${key}: initial`);
    }
  });
});
