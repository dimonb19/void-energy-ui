# Phase 0 — Tailwind CSS v4 Migration

> Upgrade the existing codebase from Tailwind CSS v3.4 to v4. This is a config-level migration — no template changes, no class renames. The codebase is already structured for a clean upgrade.

**Status:** Planning
**Priority:** Phase 0 (prerequisite — do this before L0 extraction)
**Depends on:** nothing
**Blocks:** Phase 1 (L0 must target v4's CSS-first `@theme` API)
**Estimated effort:** Single session, low risk

---

## Why Phase 0

L0 (`@void-energy/tailwind`) must target Tailwind v4's CSS-first API — that's how presets work in v4. Building L0 for v4 while L1 runs on v3 means maintaining two Tailwind integration approaches simultaneously. Upgrading first means:

- L0 and L1 share the same Tailwind version and configuration approach
- The `@theme` block we write for L0 is validated against the actual running system
- No dual-maintenance of v3 JS config + v4 CSS config

---

## Current State (Tailwind v3.4.17)

### Dependencies
```
tailwindcss: ^3.4.17
@astrojs/tailwind: ^5.1.0
@tailwindcss/container-queries: ^0.1.1
autoprefixer: ^10.4.23
postcss: ^8.5.6
```

### Configuration
- `tailwind.config.mjs` — JS config with `mapToVars()` helper
- No PostCSS config file (Astro's `@astrojs/tailwind` integration handles it)
- `applyBaseStyles: false` in Astro config (our SCSS reset owns the canvas)
- `corePlugins: { preflight: false, container: false }`
- One custom plugin: `.backdrop-blur-physics` utility
- `@tailwindcss/container-queries` for `@container` support

### Codebase Usage
- **Zero `@apply` directives** — no SCSS/CSS depends on Tailwind internals
- **Zero `@tailwindcss` or `@layer` directives** in stylesheets
- **All theme values are CSS variable references** — `var(--space-md)`, `var(--energy-primary)`, etc.
- **Container queries** used in 1 file (`src/components/ui-library/Globals.svelte`)
- Tailwind consumed purely as utility classes in Svelte/Astro templates

This is the cleanest possible starting point for a v4 migration.

---

## What Changes in Tailwind v4

### Removed concepts
- **`content` array** — v4 auto-detects template files (no manual glob needed)
- **`corePlugins`** — preflight control moves to CSS layer ordering
- **`presets` key** — replaced by CSS `@import`
- **`@tailwindcss/container-queries` plugin** — built into v4 core
- **`autoprefixer`** — built into v4

### New concepts
- **`@theme` blocks** — define tokens in CSS, auto-generates utilities + `:root` CSS variables
- **`@utility` directive** — define custom utilities in CSS (replaces `addUtilities()` plugin)
- **`@custom-variant`** — define custom variants in CSS (replaces `addVariant()` plugin)
- **`@config`** — escape hatch to load a v3-style JS config (legacy path)
- **`@theme inline`** — needed when token values reference other CSS variables

### What stays the same
- All utility class names (`bg-surface`, `p-md`, `gap-lg`, `text-main`, etc.)
- How CSS variables work at runtime
- Responsive variants (though breakpoint names come from `@theme`)
- Template class usage — zero template changes needed

---

## Migration Steps

### Step 1 — Update dependencies

```bash
npm uninstall tailwindcss @astrojs/tailwind @tailwindcss/container-queries autoprefixer
npm install tailwindcss@latest @astrojs/tailwind@latest
```

v4 bundles its own PostCSS plugin and autoprefixer. `postcss` stays as a peer dependency (Astro needs it). `@tailwindcss/container-queries` is built into v4.

**Check:** Astro's `@astrojs/tailwind` v6+ supports Tailwind v4. If the Astro integration hasn't updated yet, use the Vite plugin directly:
```js
// astro.config.mjs — fallback approach
import tailwindcss from '@tailwindcss/vite';
// ...
vite: { plugins: [tailwindcss()] }
```

### Step 2 — Create the CSS theme file

Create `src/styles/tailwind-theme.css` (or a similar name) that replaces the JS config:

```css
@import "tailwindcss";

/*
 * Void Energy — Tailwind v4 Theme
 *
 * All values reference CSS custom properties from _reset.scss + _themes.scss.
 * This file maps those variables to Tailwind's @theme namespace so utility
 * classes are generated. The actual runtime values come from SCSS.
 *
 * Source of truth: src/config/design-tokens.ts
 */

/* ── Disable Tailwind's preflight (our _reset.scss owns the canvas) ── */
@layer base;  /* empty — prevents Tailwind from injecting its own reset */

/* ── Spacing ── */
@theme inline {
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-xs: var(--space-xs);
  --spacing-sm: var(--space-sm);
  --spacing-md: var(--space-md);
  --spacing-lg: var(--space-lg);
  --spacing-xl: var(--space-xl);
  --spacing-2xl: var(--space-2xl);
  --spacing-3xl: var(--space-3xl);
  --spacing-4xl: var(--space-4xl);
  --spacing-5xl: var(--space-5xl);
}

/* ── Colors ── */
@theme inline {
  --color-*: initial;  /* wipe Tailwind defaults */

  --color-transparent: transparent;
  --color-current: currentColor;
  --color-inherit: inherit;

  /* Canvas */
  --color-canvas: var(--bg-canvas);
  --color-surface: var(--bg-surface);
  --color-sunk: var(--bg-sunk);
  --color-spotlight: var(--bg-spotlight);

  /* Energy */
  --color-primary: var(--energy-primary);
  --color-secondary: var(--energy-secondary);

  /* Structure */
  --color-border: var(--border-color);

  /* Text signals */
  --color-main: var(--text-main);
  --color-dim: var(--text-dim);
  --color-mute: var(--text-mute);

  /* Semantics */
  --color-premium: var(--color-premium);
  --color-system: var(--color-system);
  --color-success: var(--color-success);
  --color-error: var(--color-error);

  /* Semantic variants */
  --color-premium-light: var(--color-premium-light);
  --color-premium-dark: var(--color-premium-dark);
  --color-premium-subtle: var(--color-premium-subtle);
  --color-system-light: var(--color-system-light);
  --color-system-dark: var(--color-system-dark);
  --color-system-subtle: var(--color-system-subtle);
  --color-success-light: var(--color-success-light);
  --color-success-dark: var(--color-success-dark);
  --color-success-subtle: var(--color-success-subtle);
  --color-error-light: var(--color-error-light);
  --color-error-dark: var(--color-error-dark);
  --color-error-subtle: var(--color-error-subtle);
}

/* ── Breakpoints ── */
@theme {
  --breakpoint-mobile: 480px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
  --breakpoint-wide: 1280px;
  --breakpoint-ultrawide: 1536px;
  --breakpoint-quad-hd: 1920px;
}

/* ── Border Radius ── */
@theme inline {
  --radius-none: 0;
  --radius-sm: var(--radius-sm);
  --radius-md: var(--radius-md);
  --radius-lg: var(--radius-lg);
  --radius-xl: var(--radius-xl);
  --radius-full: var(--radius-full);
  --radius: var(--radius-md);  /* DEFAULT */
}

/* ── Border Width ── */
@theme inline {
  --border-width: var(--physics-border-width);  /* DEFAULT */
}

/* ── Z-Index ── */
@theme {
  --z-sunk: -1;
  --z-floor: 0;
  --z-base: 1;
  --z-decorate: 2;
  --z-float: 10;
  --z-sticky: 20;
  --z-header: 40;
  --z-dropdown: 50;
  --z-overlay: 90;
}

/* ── Motion ── */
@theme inline {
  --duration-0: 0ms;
  --duration-instant: var(--speed-instant);
  --duration-fast: var(--speed-fast);
  --duration-base: var(--speed-base);
  --duration-slow: var(--speed-slow);

  --delay-cascade: var(--delay-cascade);
  --delay-sequence: var(--delay-sequence);

  --ease-flow: var(--ease-flow);
  --ease-spring-gentle: var(--ease-spring-gentle);
  --ease-spring-snappy: var(--ease-spring-snappy);
  --ease-spring-bounce: var(--ease-spring-bounce);
  --ease-linear: linear;
}

/* ── Typography ── */
@theme inline {
  --font-heading: var(--font-heading), sans-serif;
  --font-body: var(--font-body), sans-serif;
  --font-mono: var(--font-code), monospace;

  --text-caption: var(--font-size-caption);
  --text-small: var(--font-size-small);
  --text-base: var(--font-size-body);
  --text-h6: var(--font-size-h6);
  --text-h5: var(--font-size-h5);
  --text-h4: var(--font-size-h4);
  --text-h3: var(--font-size-h3);
  --text-h2: var(--font-size-h2);
  --text-h1: var(--font-size-h1);

  --leading-none: 1;
  --leading-h1: var(--line-height-h1);
  --leading-h2: var(--line-height-h2);
  --leading-h3: var(--line-height-h3);
  --leading-h4: var(--line-height-h4);
  --leading-title: var(--line-height-h5);
  --leading-subtitle: var(--line-height-h6);
  --leading-body: var(--line-height-body);
  --leading-small: var(--line-height-small);
  --leading-caption: var(--line-height-caption);
  --leading-tight: var(--line-height-h1);
  --leading-normal: var(--line-height-body);

  --tracking-h1: var(--letter-spacing-h1);
  --tracking-h2: var(--letter-spacing-h2);
  --tracking-h3: var(--letter-spacing-h3);
  --tracking-h4: var(--letter-spacing-h4);
  --tracking-title: var(--letter-spacing-h5);
  --tracking-subtitle: var(--letter-spacing-h6);
  --tracking-body: var(--letter-spacing-body);
  --tracking-small: var(--letter-spacing-small);
  --tracking-caption: var(--letter-spacing-caption);

  --font-weight-regular: var(--font-weight-regular);
  --font-weight-medium: var(--font-weight-medium);
  --font-weight-semibold: var(--font-weight-semibold);
  --font-weight-bold: var(--font-weight-bold);
}

/* ── Extensions ── */
@theme inline {
  --min-h-control: var(--control-height);
}

/* ── Custom Utilities (replaces JS plugin) ── */
@utility backdrop-blur-physics {
  backdrop-filter: blur(var(--physics-blur));
}

/* ── Container Query Breakpoints ── */
@theme {
  --container-sm: 320px;
  --container-md: 480px;
  --container-lg: 640px;
  --container-xl: 800px;
}
```

### Step 3 — Update Astro config

```js
// astro.config.mjs
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  integrations: [svelte(), vercel()],
  vite: {
    plugins: [tailwindcss()],
    // ... existing vite config
  },
});
```

Remove `@astrojs/tailwind` import and integration call. The Vite plugin is the v4-native approach.

### Step 4 — Wire up the CSS entry point

Make sure the theme CSS file is imported before Tailwind processes templates. In the global SCSS or layout:

```scss
/* Import order matters: Tailwind theme first, then our SCSS */
@import './tailwind-theme.css';  /* @theme + @utility definitions */
```

Or let Astro handle it via the layout's `<style>` import. The exact wiring depends on whether `@astrojs/tailwind` v6 handles this automatically or if we use the Vite plugin directly.

### Step 5 — Delete the old config

- Delete `tailwind.config.mjs`
- Remove `@tailwindcss/container-queries` from `package.json` (already uninstalled in step 1)
- Remove `autoprefixer` from `package.json` (already uninstalled in step 1)

### Step 6 — Verify class name mapping

v4's `@theme` namespaces generate utilities using specific naming conventions. Verify these critical mappings still produce the same class names:

| v3 config key | v3 class | v4 `@theme` namespace | v4 class | Match? |
|---|---|---|---|---|
| `spacing.md` | `p-md`, `gap-md` | `--spacing-md` | `p-md`, `gap-md` | Yes |
| `colors.surface` | `bg-surface`, `text-surface` | `--color-surface` | `bg-surface`, `text-surface` | Yes |
| `colors.main` | `text-main` | `--color-main` | `text-main` | Yes |
| `borderRadius.lg` | `rounded-lg` | `--radius-lg` | `rounded-lg` | Yes |
| `zIndex.overlay` | `z-overlay` | `--z-overlay` | `z-overlay` | Yes |
| `transitionDuration.fast` | `duration-fast` | `--duration-fast` | `duration-fast` | Verify |
| `transitionTimingFunction.flow` | `ease-flow` | `--ease-flow` | `ease-flow` | Verify |
| `fontSize.h1` | `text-h1` | `--text-h1` | `text-h1` | Verify |
| `fontFamily.heading` | `font-heading` | `--font-heading` | `font-heading` | Verify |
| `fontWeight.bold` | `font-bold` | `--font-weight-bold` | `font-bold` | Verify |

**Potential naming conflicts:** In v4, `--text-*` controls font size and `--color-*` controls color. Both generate `text-*` classes. If `--color-main` and `--text-main` both exist, v4 might produce a conflict for `text-main`. This needs testing — if it conflicts, we may need to use `--color-text-main` or a similar namespace adjustment.

**This is the primary risk of the migration.** The v3 config uses `colors.main` → `text-main` for color. But v4 auto-generates `text-*` from both `--color-*` (as `text-main` = color) and `--text-*` (as `text-main` = font-size). Test this explicitly.

### Step 7 — Visual regression check

Run the dev server, open the showcase, and check:
- [ ] All pages render correctly
- [ ] Colors, spacing, radius, shadows all match pre-migration
- [ ] Atmosphere switching still works
- [ ] Physics switching still works
- [ ] Container queries work in Globals showcase
- [ ] All 3 physics presets look correct
- [ ] Both light and dark modes look correct

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `text-*` namespace collision (color vs font-size) | Medium | Test explicitly. May need to rename color tokens or font-size tokens to avoid overlap. |
| `@astrojs/tailwind` v6 not available | Low | Fall back to `@tailwindcss/vite` plugin directly — works with any Vite-based framework. |
| Preflight disabling works differently | Low | Use `@layer base;` empty declaration or Tailwind's v4 preflight control. |
| Utility class name changes | Very Low | v4 preserves all v3 class names. Only new utilities added. |
| SCSS processing order vs Tailwind | Low | May need to ensure SCSS compiles before Tailwind processes the `@theme` block. Test the build pipeline. |

---

## What Does NOT Change

- **Zero template changes** — all Svelte/Astro files keep their existing classes
- **Zero SCSS changes** — the SCSS engine, mixins, physics, themes are untouched
- **Zero token changes** — `design-tokens.ts` stays exactly the same
- **Zero runtime changes** — VoidEngine, atmosphere switching, physics all work identically
- **Zero component changes** — every `.svelte` file stays as-is

This is purely a build-tool configuration migration.

---

## Verification Checklist

- [ ] `tailwindcss` v4.x installed
- [ ] `@tailwindcss/container-queries` removed (built-in)
- [ ] `autoprefixer` removed (built-in)
- [ ] `tailwind.config.mjs` deleted
- [ ] `tailwind-theme.css` created with `@theme` blocks
- [ ] Astro config updated (either `@astrojs/tailwind` v6 or `@tailwindcss/vite`)
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm run check` passes
- [ ] All utility classes resolve to correct values (spot-check in browser DevTools)
- [ ] `text-*` namespace verified (no color/font-size collision)
- [ ] `backdrop-blur-physics` utility works via `@utility` directive
- [ ] Container queries work in Globals showcase
- [ ] All 4 atmospheres render correctly
- [ ] All 3 physics presets render correctly
- [ ] Both light and dark modes render correctly
- [ ] No visual regressions on showcase pages

---

## Out of Scope

- **Token value changes** — this phase changes the Tailwind bridge, not the design system.
- **New utility classes** — only port existing ones. Add new ones in Phase 1 if needed for L0.
- **SCSS migration** — SCSS stays. Only the Tailwind config layer changes.
- **Shadow extraction** — that's Phase 1 (L0). Shadows are SCSS-computed today and stay that way after this migration.
