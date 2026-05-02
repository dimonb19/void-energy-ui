# Package Rules — `@void-energy/tailwind` (L0)

You are editing the **L0 framework-agnostic Tailwind preset**. Specialization of [packages/_TEMPLATE/CLAUDE.md](../_TEMPLATE/CLAUDE.md). The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply; the strict library audit in [src/CLAUDE.md](../../src/CLAUDE.md) does not — L0 has its own boundaries.

The path-triggered companion is [.claude/rules/l0-tokens.md](../../.claude/rules/l0-tokens.md), which loads automatically on any file in this package. This file holds what the rule does not: the package boundary and the L0 audience model.

---

## 1. L0 = tokens + runtime, no components, no Svelte, no SCSS

L0 is the deliberate framework-agnostic downgrade. Consumers in React, Vue, Solid, Astro, or plain HTML get the full Void Energy token vocabulary, atmosphere switching, and physics adaptation — without taking Svelte. The contract:

- **Output is pure CSS + vanilla TS.** No `import 'svelte'`. No `@use '../abstracts' as *;` (L1's SCSS toolkit is not available here). No React/Vue/Solid imports — framework-agnostic means agnostic.
- **No components.** L0 ships `theme.css`, `tokens.css`, `density.css`, `components.css` (styled native HTML, not framework components), `participation.css`, plus a small vanilla runtime (`runtime`, `head`, `ssr`, `config`, `generator`, `vite` exports).
- **Test fixtures are plain `.html`.** Open them in a browser directly — no framework, no build step.

## 2. Token parity with L1 (the only thing L0 guarantees)

Every CSS variable L0 emits at `:root` is byte-identical to the same token in L1. **The SSOT is `src/config/design-tokens.ts`.** Drift between layers breaks the only thing L0 promises consumers.

When changing a token:
1. Edit `src/config/design-tokens.ts` (L1 SSOT).
2. Run `npm run build:tokens` from the repo root — both layers regenerate.
3. Verify L0's generated `:root` block matches L1's `_generated-themes.scss` for the touched token.

Never hand-edit token values inside `dist/` or in any L0 source meant to mirror generated output.

---

## 3. Package boundary (carries through from the template)

L0 is a **peer of `void-energy`**, not a downstream of `src/`. Same rule as any other package: no `../../src/...` relative imports, no path aliases (`@adapters/*` etc. are L1-internal), no imports from other `packages/*`. The L0 build script reads `src/config/design-tokens.ts` via the monorepo build pipeline (`npm --prefix ../.. run build:tokens -- --target=l0`), not via runtime imports — that is the only sanctioned crossing.

---

## 4. What L0 does NOT ship

- L1's Svelte components (`Button`, `SearchField`, `Modal`, …) — those stay in `src/`.
- The full constraint system (5 Laws enforcement). Without Svelte primitives, L0 can document but cannot enforce — that is the deliberate trade.
- `_participation.scss`'s SCSS source — only the compiled `participation.css` artifact.

If a consumer needs the full constraint system, they take L1 (Svelte). L0 is the off-ramp for non-Svelte stacks.

---

## 5. Ecosystem bridges

`bridges/shadcn.css`, `bridges/radix-themes.css`, `bridges/mantine.css` alias each library's CSS variables onto VE tokens. Bridges are **alias-only** — no new visual rules, no component overrides, no JS. If a bridge needs more than aliasing to work, surface it; do not extend the bridge silently.
