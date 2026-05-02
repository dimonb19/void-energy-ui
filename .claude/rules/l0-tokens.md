---
paths:
  - "packages/void-energy-tailwind/**/*"
---

# L0 Tokens — Framework-Agnostic Boundary

You are inside the L0 Tailwind package. L0 ships **tokens and runtime only** — no Svelte, no SCSS, no L1 components. Output must be pure CSS plus vanilla JS that works in React, Vue, Astro, Solid, plain HTML, or any other consumer.

## Why

L0 is the framework-agnostic distribution surface. Consumers who can't or won't take Svelte still get the full Void Energy token vocabulary, atmosphere switching, and physics adaptation. The contract is: **a token's CSS variable value in L0 is byte-identical to the same token in L1.** If a token changes in `src/config/design-tokens.ts`, both layers must produce identical `:root` values. Drift here breaks the only thing L0 guarantees.

## Hard Rules

```
CORRECT:  pure CSS file with @theme + @utility declarations
CORRECT:  vanilla TS file that toggles data-atmosphere on <html>
CORRECT:  test fixture in test/ as a plain .html file (no framework)
WRONG:    import 'svelte' / import { onMount } from 'svelte'
WRONG:    @use '../abstracts' as *;        (no SCSS toolkit dependency)
WRONG:    new <Button />.svelte component   (L0 has no components)
WRONG:    React/Vue/Solid imports           (framework-agnostic means agnostic)
```

## Token Parity

Every CSS variable L0 emits at `:root` must be derivable from the same `design-tokens.ts` source as L1. The token-build script regenerates both — do not hand-edit token values in L0 source.

When adding or changing a token:
1. Edit `src/config/design-tokens.ts` (the SSOT for both layers).
2. Run `npm run build:tokens`.
3. Verify the generated `:root` block in L0's CSS matches L1's `_generated-themes.scss` for that token.

## Runtime

The runtime is a single small TS module — no framework dependencies, no DOM helpers beyond standard `document.documentElement.dataset`. Test it in `test/*.html` (plain HTML, opened directly in a browser) before claiming it works.

## What L0 Does NOT Ship

- L1's Svelte components (`Button`, `SearchField`, `Modal`, etc.) — those are L1.
- The full constraint system (5 Laws enforcement) — without Svelte primitives, L0 can document but cannot enforce.
- `_participation.scss`'s SCSS source — only the compiled `participation.css` artifact.

If a consumer needs the full constraint system, they take L1 (Svelte). L0 is the deliberate downgrade for non-Svelte stacks.
