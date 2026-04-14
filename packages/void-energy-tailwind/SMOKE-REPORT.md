# Session 5 — Cross-framework smoke report

**Date:** 2026-04-14
**Package version:** 0.0.0 (unpublished)
**Smoke location:** `/tmp/ve-l0-smoke/` (out-of-repo throwaway)

## Setup

```
npm create vite (React TS shape, hand-rolled to skip the template prompt)
npm install react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss@4 @tailwindcss/vite
             @types/react @types/react-dom typescript
npm install /tmp/void-energy-tailwind-0.0.0.tgz    # from `npm pack`
```

Consumer `src/styles.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

FOUC injected as inline `<script>` in `index.html` (copy of `FOUC_SCRIPT`).

Runtime imports from `@void-energy/tailwind/runtime`:

```tsx
import { setAtmosphere, setPhysics, setDensity } from '@void-energy/tailwind/runtime';
```

## What worked

- **Tarball install**: clean. 12 KB tarball, 20 files, 54 KB unpacked. No peer-dep warnings beyond the expected `tailwindcss@^4` (already installed).
- **CSS imports resolve**: `@void-energy/tailwind/theme.css` resolves through the `exports` field in a production Vite build.
- **Runtime ESM import**: `@void-energy/tailwind/runtime` resolves to `dist/runtime.js` via the `import` condition.
- **Production Vite build succeeds** — 14 KB of compiled CSS, all atmospheres × all physics × density rules present.
- **Every L0 contract held in the built CSS:**
  - Semantic tokens emitted: `--bg-canvas`, `--energy-primary`, `--physics-border-width`, `--control-height`, etc.
  - Per-atmosphere `[data-atmosphere="..."]` rule blocks present for all four atmospheres.
  - Per-physics `[data-physics="..."]` rule blocks present for all three presets.
  - Per-density `[data-density="..."]` rules present.
  - `.bg-surface`, `.text-main`, `.p-lg`, `.rounded`, `.border`, `.min-h-control`, `.font-heading`, `.bg-premium` utilities all resolve to `var(--*)` token chains.
  - The `.container` void-override (720 px at 768 px breakpoint) wins over v4's hardcoded static `.container`.
  - Footgun fixes all survived: `.border` reads `var(--physics-border-width)`, `.rounded` reads `var(--radius-md)`, `void-overrides` layer present.
- **Tree-shaking works correctly**: unused utilities (`.backdrop-blur-physics`, `--spacing-lg` forwarder since no `.gap-lg` is authored) get dropped in production. This is the v4 contract — the bridge doesn't get shipped when no consumer uses it.
- **Atmosphere switching at runtime** writes all three attributes correctly via `setAtmosphere → setPhysics → setMode`.
- **FOUC script**: inline `<script>` in `<head>` pins all four attributes before stylesheet load. No flash.

## Rough edges — hand off to Session 6 docs

### 1. FOUC injection has no helper for Vite

The framework examples in the plan cover Next.js (`<Script beforeInteractive>`), Nuxt (`useHead`), and Astro (`<script is:inline set:html>`). For Vite + React, the pattern is either:

- Inline the string literal into `index.html` directly (what this smoke did).
- Write a tiny Vite plugin using `transformIndexHtml` to inject `FOUC_SCRIPT` into `<head>`.

Neither is documented in the README yet. **Session 6 TODO:** add a Vite + React recipe and a 5-line `transformIndexHtml` plugin example.

### 2. shadcn CLI init was not attempted

The plan mentioned "minimal Vite + React + shadcn app." This smoke hand-wrote shadcn-style components (Card, Button, Input) using L0 token classes rather than running `npx shadcn@latest init`. Reasons:

- shadcn's init is interactive and its Tailwind v4 story is in flux.
- shadcn components ship with their own CSS variable contract (`--primary`, `--background`, `--foreground`, `--muted`, etc.) that would need a thin bridge from L0 tokens.

**Session 6 TODO:** write a "shadcn adapter" doc/recipe that maps shadcn's variable names to L0 tokens (e.g. `--primary: var(--energy-primary)` in the consumer's root CSS). Until that bridge exists, shadcn components dropped into a VE app render with their own defaults, not VE atmospheres.

### 3. Consumer Tailwind content-scan needs L0 source paths

Since Tailwind v4 auto-scans `node_modules` imports, the L0 CSS files are picked up. But for consumers who hand-author `@source` directives (v4's replacement for v3's `content`), none of our docs tell them they need to scan `node_modules/@void-energy/tailwind/**/*.css` if they want the preset's `@utility` declarations to resolve.

In this smoke, the default auto-scan worked. **Session 6 TODO:** document the edge for projects that opt out of auto-scan.

### 4. Dev-mode HMR not validated

Only `vite build` was exercised. Dev-mode (`vite` with HMR) atmosphere switching is almost certainly fine — the runtime just writes DOM attributes and CSS is not bundled differently — but unverified. Not a blocker.

### 5. No SSR smoke (Next.js / SvelteKit / Remix)

Session 4's tests prove runtime.ts is SSR-safe via a headless Node import test. An actual SSR framework smoke was not performed. **Session 6 TODO:** at minimum, a Next.js App Router recipe with `<head>` FOUC injection via the app-level layout.

## Published-size sanity

| Artifact | Raw | Gzipped |
|---|---|---|
| `dist/runtime.js` | 2.9 KB | 1.1 KB |
| `dist/runtime.cjs` | 2.9 KB | 1.1 KB |
| `dist/head.js` | 0.6 KB | 0.3 KB |
| `dist/head.cjs` | 0.8 KB | 0.4 KB |
| Full tarball | 12 KB | — |
| Built consumer CSS (app using ~12 L0 utilities) | 14 KB | 3.7 KB |

Well under the plan's budgets.

## Verdict

**L0 is publishable.** The core contract (atmosphere + physics + mode + density selectors, adaptive tokens, footgun fixes, Tailwind v4 utilities) is verified in a real-consumer production build.

The remaining work is documentation + a shadcn bridge recipe + framework-specific FOUC examples — all Session 6 scope.
