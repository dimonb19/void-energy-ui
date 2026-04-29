/**
 * L0 SSR cookie bridge — primitives + ESM/CJS parity + round-trip with runtime.
 *
 * The SSR module lives in three hand-authored files:
 *   src/ssr.ts       — typed source of truth
 *   dist/ssr.js      — ESM output
 *   dist/ssr.cjs     — CJS output
 *
 * These tests verify all three stay in sync and verify that the runtime's
 * cookie dual-write (added in W5 Session 1) round-trips cleanly through
 * readAtmosphereCookie. R5 — cookie-key format drift — is the headline risk
 * this test suite guards.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const ROOT = path.resolve(__dirname, '..');
const PKG = path.join(ROOT, 'packages/void-energy-tailwind');
const SSR_JS = path.join(PKG, 'dist/ssr.js');
const SSR_CJS = path.join(PKG, 'dist/ssr.cjs');
const SSR_DTS = path.join(PKG, 'dist/ssr.d.ts');
const RUNTIME_JS = path.join(PKG, 'dist/runtime.js');

const EXPECTED_EXPORTS = [
  'readAtmosphereCookie',
  'serializeAtmosphereCookie',
  'renderRootAttributes',
];

function runInNode(code: string): string {
  return execFileSync(process.execPath, ['--input-type=module', '-e', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function runInNodeCJS(code: string): string {
  return execFileSync(process.execPath, ['-e', code], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function clearAllCookies(): void {
  const existing = document.cookie ? document.cookie.split(/;\s*/) : [];
  for (const pair of existing) {
    const eq = pair.indexOf('=');
    const name = (eq < 0 ? pair : pair.slice(0, eq)).trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
}

describe('L0 SSR — file layout', () => {
  it('dist/ssr.js exists', () => {
    expect(fs.existsSync(SSR_JS)).toBe(true);
  });
  it('dist/ssr.cjs exists', () => {
    expect(fs.existsSync(SSR_CJS)).toBe(true);
  });
  it('dist/ssr.d.ts exists', () => {
    expect(fs.existsSync(SSR_DTS)).toBe(true);
  });
});

describe('L0 SSR — ESM/CJS parity', () => {
  it('ESM exposes all expected named exports', () => {
    const out = runInNode(
      `import * as m from '${SSR_JS}'; process.stdout.write(JSON.stringify(Object.keys(m).sort()));`,
    );
    const names = JSON.parse(out);
    for (const exp of EXPECTED_EXPORTS) expect(names).toContain(exp);
  });

  it('CJS exposes all expected named exports via require()', () => {
    const out = runInNodeCJS(
      `const m = require(${JSON.stringify(SSR_CJS)}); process.stdout.write(JSON.stringify(Object.keys(m).sort()));`,
    );
    const names = JSON.parse(out);
    for (const exp of EXPECTED_EXPORTS) expect(names).toContain(exp);
  });

  it('ESM and CJS produce identical output for the same input', () => {
    const probe = `m.serializeAtmosphereCookie({ atmosphere: 'frost', physics: 'glass', mode: 'dark', density: 'default' })`;
    const esm = runInNode(
      `import * as m from '${SSR_JS}'; process.stdout.write(JSON.stringify(${probe}));`,
    );
    const cjs = runInNodeCJS(
      `const m = require(${JSON.stringify(SSR_CJS)}); process.stdout.write(JSON.stringify(${probe}));`,
    );
    expect(esm).toBe(cjs);
  });
});

describe('L0 SSR — Node SSR safety (no document, no localStorage)', () => {
  it('all functions are callable in Node and do not throw', () => {
    const code = `
      import * as m from '${SSR_JS}';
      m.readAtmosphereCookie(null);
      m.readAtmosphereCookie('');
      m.readAtmosphereCookie('ve-atmosphere=frost; ve-physics=glass; ve-mode=dark; ve-density=default');
      m.serializeAtmosphereCookie({});
      m.serializeAtmosphereCookie({ atmosphere: 'frost', physics: 'glass', mode: 'dark', density: 'default' });
      m.renderRootAttributes({});
      m.renderRootAttributes({ atmosphere: 'frost', physics: 'glass', mode: 'dark', density: 'default' });
      process.stdout.write('ok');
    `;
    expect(runInNode(code)).toBe('ok');
  });

  it('CJS: all functions are callable in Node and do not throw', () => {
    const code = [
      `const m = require(${JSON.stringify(SSR_CJS)});`,
      `m.readAtmosphereCookie(null);`,
      `m.readAtmosphereCookie('ve-atmosphere=frost');`,
      `m.serializeAtmosphereCookie({ atmosphere: 'frost' });`,
      `m.renderRootAttributes({ atmosphere: 'frost', physics: 'glass' });`,
      `process.stdout.write('ok');`,
    ].join(' ');
    expect(runInNodeCJS(code)).toBe('ok');
  });
});

describe('L0 SSR — readAtmosphereCookie', () => {
  let ssr: typeof import('../packages/void-energy-tailwind/dist/ssr.js');

  beforeEach(async () => {
    ssr = await import('../packages/void-energy-tailwind/dist/ssr.js');
  });

  it('returns empty for null / undefined / empty string', () => {
    expect(ssr.readAtmosphereCookie(null)).toEqual({});
    expect(ssr.readAtmosphereCookie(undefined)).toEqual({});
    expect(ssr.readAtmosphereCookie('')).toEqual({});
  });

  it('parses all four VE keys', () => {
    const header =
      've-atmosphere=frost; ve-physics=glass; ve-mode=dark; ve-density=comfortable';
    expect(ssr.readAtmosphereCookie(header)).toEqual({
      atmosphere: 'frost',
      physics: 'glass',
      mode: 'dark',
      density: 'comfortable',
    });
  });

  it('ignores unknown cookies', () => {
    const header =
      'session=abc123; ve-atmosphere=frost; tracking=xyz; ve-physics=glass';
    expect(ssr.readAtmosphereCookie(header)).toEqual({
      atmosphere: 'frost',
      physics: 'glass',
    });
  });

  it('drops malformed physics values', () => {
    expect(
      ssr.readAtmosphereCookie('ve-physics=quantum; ve-atmosphere=frost'),
    ).toEqual({ atmosphere: 'frost' });
  });

  it('drops malformed mode values (auto is not valid for SSR)', () => {
    expect(ssr.readAtmosphereCookie('ve-mode=auto')).toEqual({});
    expect(ssr.readAtmosphereCookie('ve-mode=light')).toEqual({
      mode: 'light',
    });
  });

  it('drops malformed density values', () => {
    expect(ssr.readAtmosphereCookie('ve-density=cozy')).toEqual({});
    expect(ssr.readAtmosphereCookie('ve-density=compact')).toEqual({
      density: 'compact',
    });
  });

  it('drops atmosphere names violating NAME_PATTERN (selector-injection guard)', () => {
    const evil = "ve-atmosphere=bad'; body{display:none}";
    expect(ssr.readAtmosphereCookie(evil)).toEqual({});
  });

  it('handles cookies with surrounding whitespace', () => {
    expect(
      ssr.readAtmosphereCookie('  ve-atmosphere=frost  ;  ve-physics=glass  '),
    ).toEqual({ atmosphere: 'frost', physics: 'glass' });
  });

  it('skips entries without an "=" or with empty value', () => {
    expect(
      ssr.readAtmosphereCookie('orphan; ve-atmosphere=; ve-mode=dark'),
    ).toEqual({
      mode: 'dark',
    });
  });
});

describe('L0 SSR — serializeAtmosphereCookie', () => {
  let ssr: typeof import('../packages/void-energy-tailwind/dist/ssr.js');

  beforeEach(async () => {
    ssr = await import('../packages/void-energy-tailwind/dist/ssr.js');
  });

  it('returns [] for empty state', () => {
    expect(ssr.serializeAtmosphereCookie({})).toEqual([]);
  });

  it('emits one Set-Cookie line per set key', () => {
    const out = ssr.serializeAtmosphereCookie({
      atmosphere: 'frost',
      physics: 'glass',
      mode: 'dark',
      density: 'default',
    });
    expect(out).toHaveLength(4);
    expect(out[0]).toMatch(
      /^ve-atmosphere=frost; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
    expect(out[1]).toMatch(
      /^ve-physics=glass; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
    expect(out[2]).toMatch(
      /^ve-mode=dark; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
    expect(out[3]).toMatch(
      /^ve-density=default; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
  });

  it('appends Secure when opts.secure is true', () => {
    const out = ssr.serializeAtmosphereCookie(
      { atmosphere: 'frost' },
      { secure: true },
    );
    expect(out[0]).toMatch(/; Secure$/);
  });

  it('respects maxAge override', () => {
    const out = ssr.serializeAtmosphereCookie(
      { atmosphere: 'frost' },
      { maxAge: 60 },
    );
    expect(out[0]).toContain('Max-Age=60');
  });

  it('respects sameSite override', () => {
    const out = ssr.serializeAtmosphereCookie(
      { atmosphere: 'frost' },
      { sameSite: 'Strict' },
    );
    expect(out[0]).toContain('SameSite=Strict');
  });

  it('drops invalid values silently', () => {
    const out = ssr.serializeAtmosphereCookie({
      atmosphere: 'frost',
      // @ts-expect-error — testing runtime validation
      physics: 'quantum',
      mode: 'dark',
    });
    expect(out).toHaveLength(2);
    expect(out[0]).toContain('ve-atmosphere=frost');
    expect(out[1]).toContain('ve-mode=dark');
  });
});

describe('L0 SSR — renderRootAttributes', () => {
  let ssr: typeof import('../packages/void-energy-tailwind/dist/ssr.js');

  beforeEach(async () => {
    ssr = await import('../packages/void-energy-tailwind/dist/ssr.js');
  });

  it('returns empty string for empty state', () => {
    expect(ssr.renderRootAttributes({})).toBe('');
  });

  it('emits all four data-* attrs when fully set', () => {
    expect(
      ssr.renderRootAttributes({
        atmosphere: 'frost',
        physics: 'glass',
        mode: 'dark',
        density: 'default',
      }),
    ).toBe(
      'data-atmosphere="frost" data-physics="glass" data-mode="dark" data-density="default"',
    );
  });

  it('omits unset keys without leading/trailing space', () => {
    expect(
      ssr.renderRootAttributes({ atmosphere: 'frost', mode: 'dark' }),
    ).toBe('data-atmosphere="frost" data-mode="dark"');
  });

  it('drops invalid values to prevent broken HTML', () => {
    const out = ssr.renderRootAttributes({
      atmosphere: 'frost',
      // @ts-expect-error — testing runtime validation
      physics: 'quantum',
    });
    expect(out).toBe('data-atmosphere="frost"');
  });

  it('rejects atmosphere names with HTML-meta characters', () => {
    const evil = ssr.renderRootAttributes({
      atmosphere: 'bad" onclick="alert(1)',
    });
    expect(evil).toBe('');
  });
});

describe('L0 SSR — runtime round-trip (R5 cookie-key format drift guard)', () => {
  // The headline test: setAtmosphere() → document.cookie → readAtmosphereCookie()
  // must produce identical state. If the runtime's persistCookie format ever
  // drifts away from the SSR parser, this test fails.
  let runtime: typeof import('../packages/void-energy-tailwind/dist/runtime.js');
  let ssr: typeof import('../packages/void-energy-tailwind/dist/ssr.js');

  beforeEach(async () => {
    runtime = await import('../packages/void-energy-tailwind/dist/runtime.js');
    ssr = await import('../packages/void-energy-tailwind/dist/ssr.js');
    clearAllCookies();
  });

  afterEach(() => {
    clearAllCookies();
  });

  it('setAtmosphere writes a cookie that readAtmosphereCookie parses back', () => {
    runtime.setAtmosphere('frost');
    const parsed = ssr.readAtmosphereCookie(document.cookie);
    expect(parsed.atmosphere).toBe('frost');
  });

  it('full state cycle round-trips through runtime → cookie → parser', () => {
    runtime.setAtmosphere('meridian'); // cascades flat + light
    runtime.setDensity('comfortable');
    const parsed = ssr.readAtmosphereCookie(document.cookie);
    expect(parsed).toEqual({
      atmosphere: 'meridian',
      physics: 'flat',
      mode: 'light',
      density: 'comfortable',
    });
  });

  it('setMode("auto") writes RESOLVED light/dark to cookie (server cannot evaluate auto)', () => {
    // setup.ts mocks matchMedia to matches:false → resolves to 'light'
    runtime.setMode('auto');
    const parsed = ssr.readAtmosphereCookie(document.cookie);
    expect(parsed.mode).toBe('light');
    // localStorage retains the literal 'auto' for the existing FOUC contract
    expect(localStorage.getItem('ve-mode')).toBe('auto');
  });

  it('renderRootAttributes(parsed) produces the data-* attrs the runtime would set', () => {
    runtime.setAtmosphere('terminal'); // cascades retro + dark
    const attrs = ssr.renderRootAttributes(
      ssr.readAtmosphereCookie(document.cookie),
    );
    expect(attrs).toContain('data-atmosphere="terminal"');
    expect(attrs).toContain('data-physics="retro"');
    expect(attrs).toContain('data-mode="dark"');
  });

  it('runtime cookie format and serializeAtmosphereCookie format both round-trip cleanly', () => {
    // setAtmosphere('frost') cascades glass + dark via lookupMeta — the
    // cookie ends up with all three keys, not just atmosphere. This is the
    // intended dual-write behavior; the test asserts both the runtime path
    // and the SSR serializer parse back to the same shape.
    runtime.setAtmosphere('frost');
    const fromRuntime = ssr.readAtmosphereCookie(document.cookie);
    expect(fromRuntime).toEqual({
      atmosphere: 'frost',
      physics: 'glass',
      mode: 'dark',
    });

    // Serializer-emitted Set-Cookie line (jsdom is http://localhost — Secure off)
    // parses back to the input state. Format parity is enforced by both code
    // paths producing parser-compatible output.
    const serialized = ssr.serializeAtmosphereCookie(
      { atmosphere: 'frost' },
      { secure: false },
    )[0];
    expect(serialized).toMatch(
      /^ve-atmosphere=frost; Path=\/; Max-Age=31536000; SameSite=Lax$/,
    );
    expect(ssr.readAtmosphereCookie(serialized)).toEqual({
      atmosphere: 'frost',
    });
  });

  it('full SSR pipeline: live <html> attrs match what the server would render from the cookie', () => {
    // Closes the W5 verification loop end-to-end. The runtime sets state and
    // writes the cookie (the wire format that lands at the server on the next
    // request). The server-side parser + renderer read that cookie back and
    // produce the data-* string the layout would inject. The string must
    // contain the same atmosphere/physics/mode the runtime applied to the
    // live <html>, proving server-render + client-hydrate observe the same
    // state with no drift.
    runtime.setAtmosphere('meridian'); // cascades flat + light
    runtime.setDensity('comfortable');

    const liveAttrs = {
      atmosphere: document.documentElement.getAttribute('data-atmosphere'),
      physics: document.documentElement.getAttribute('data-physics'),
      mode: document.documentElement.getAttribute('data-mode'),
      density: document.documentElement.getAttribute('data-density'),
    };

    // What the server would do with the cookie this browser session emitted:
    const fromServer = ssr.renderRootAttributes(
      ssr.readAtmosphereCookie(document.cookie),
    );

    expect(fromServer).toContain(`data-atmosphere="${liveAttrs.atmosphere}"`);
    expect(fromServer).toContain(`data-physics="${liveAttrs.physics}"`);
    expect(fromServer).toContain(`data-mode="${liveAttrs.mode}"`);
    expect(fromServer).toContain(`data-density="${liveAttrs.density}"`);
  });
});

describe('L0 SSR — runtime SSR no-op safety (Node, no document)', () => {
  // Importing runtime.js + setAtmosphere in pure Node must not throw despite
  // the new persistCookie call. This is the same SSR-safety contract as
  // l0-runtime.test.ts but extended to verify the cookie write path.
  it('Node: setters with cookie dual-write do not throw', () => {
    const code = `
      import * as m from '${RUNTIME_JS}';
      m.setAtmosphere('frost');
      m.setPhysics('glass');
      m.setMode('dark');
      m.setMode('auto');
      m.setDensity('comfortable');
      process.stdout.write('ok');
    `;
    expect(runInNode(code)).toBe('ok');
  });
});
