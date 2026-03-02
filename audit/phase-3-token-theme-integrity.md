# Phase 3: Token & Theme Integrity

> **Scope:** Fix broken token references, retro timing contradictions, phantom Tailwind utilities, and stale generated-file references.
> **Estimated fixes:** 1 broken token, 4 retro timing overrides, 6 Tailwind config lines, 2 CLAUDE.md references.

---

## 3A. Token Coverage — 6 fixes

### Fix 1 (HIGH): Nonexistent `--font-weight-normal` token

**File:** `src/styles/components/_page-sidebar.scss` line 261
**Issue:** References `var(--font-weight-normal)` which does NOT exist in the token system. The correct token is `var(--font-weight-regular)`. This causes the `.page-sidebar-item` font-weight to fall back to the CSS initial value, making it unpredictable.

```scss
// BEFORE
font-weight: var(--font-weight-normal);

// AFTER
font-weight: var(--font-weight-regular);
```

**Verify:** Check sidebar items render with the expected regular weight in all themes.

### Fix 2 (MED): Hardcoded `0.3s` in retro navigation

**File:** `src/styles/components/_navigation.scss` lines 75 and 423
**Issue:** Two `when-retro` blocks set `transition-duration: 0.3s`. Retro physics defines ALL durations as `0s` — transitions should be instant.

```scss
// BEFORE (line 75, inside when-retro)
transition-duration: 0.3s;

// AFTER
transition-duration: var(--speed-base);
```

Same fix at line 423 (breadcrumbs `when-retro` block).

**Context:** `--speed-base` resolves to `0s` in retro, `300ms` in glass, `200ms` in flat. Using the token instead of hardcoding ensures the retro "instant" contract is honored while glass/flat get their intended durations.

### Fix 3 (MED): Hardcoded `0.3s` in retro sidebar

**File:** `src/styles/components/_page-sidebar.scss` lines 219 and 314
**Issue:** Same pattern as Fix 2 — `when-retro` blocks with hardcoded `0.3s` instead of `var(--speed-base)`.

```scss
// BEFORE (lines 219 and 314, inside when-retro)
transition-duration: 0.3s;

// AFTER
transition-duration: var(--speed-base);
```

### Fix 4 (LOW): Hardcoded `font-weight: 400` in kinetic

**File:** `src/styles/components/_kinetic.scss` line 38

```scss
// BEFORE
font-weight: 400;

// AFTER
font-weight: var(--font-weight-regular);
```

### Fix 5 (LOW): Hardcoded `50ms` button micro-transition

**File:** `src/styles/components/_buttons.scss` lines 167, 321, 394, 453
**Issue:** Active-press micro-feedback uses `50ms` which is below the token scale minimum. This is a deliberate design choice for imperceptible press feedback.

**Action:** Add `// void-ignore (Micro-feedback)` annotation to each occurrence. This is not a token that should exist — it's a sub-perceptual duration that exists purely for haptic-like feedback.

### Fix 6 (LOW): Miscellaneous hardcoded values

These are acceptable system-level values that should be annotated:

| File | Line | Value | Action |
|------|------|-------|--------|
| `src/styles/base/_accessibility.scss` | 114 | `z-index: 1000` on `.skip-link` | Add `// void-ignore (Skip-link must be above everything)` |
| `src/styles/base/_reset.scss` | 54 | `--scrollbar-width: 6px` | Add `// void-ignore (Scrollbar constant)` |

---

## 3B. Physics Triad Coverage — PASS (no action needed)

All 20 component SCSS files handle glass, flat, and retro through direct `when-*` mixins or surface mixin variable cascade. No gaps found.

---

## 3C. Generated Files & Tailwind Config — 8 fixes

### Fix 1 (HIGH): Tailwind line-height utilities point to undefined CSS vars

**File:** `tailwind.config.mjs` lines 151-154, 160

The `lineHeight` mapping creates Tailwind utilities that reference CSS custom properties that are never defined:

| Tailwind utility | Points to | Actual CSS var |
|-----------------|-----------|----------------|
| `leading-h1` | `--line-height-h1` | `--line-height-heading` |
| `leading-h2` | `--line-height-h2` | `--line-height-heading-h2` |
| `leading-h3` | `--line-height-h3` | `--line-height-heading-h3` |
| `leading-h4` | `--line-height-h4` | `--line-height-subheading` |
| `leading-tight` | `--line-height-h1` | `--line-height-heading` |

**Two approaches — pick one:**

**Option A (recommended):** Fix the Tailwind config to use the actual CSS var names:
```javascript
// BEFORE
h1: 'var(--line-height-h1)',
h2: 'var(--line-height-h2)',
h3: 'var(--line-height-h3)',
h4: 'var(--line-height-h4)',
// ...
tight: 'var(--line-height-h1)',

// AFTER
h1: 'var(--line-height-heading)',
h2: 'var(--line-height-heading-h2)',
h3: 'var(--line-height-heading-h3)',
h4: 'var(--line-height-subheading)',
// ...
tight: 'var(--line-height-heading)',
```

**Option B:** Emit the h1/h2/h3/h4 aliases in `src/styles/base/_typography.scss` alongside the existing vars. This creates redundant vars but preserves the Tailwind utility names.

**Note:** These utilities don't appear to be used anywhere currently, so this is a latent bug rather than a visible one. But fixing it prevents silent failures when someone does use them.

### Fix 2 (MED): Tailwind `tracking-title` points to undefined var

**File:** `tailwind.config.mjs` line 169

```javascript
// BEFORE
title: 'var(--letter-spacing-title)',

// AFTER
title: 'var(--letter-spacing-h5)',
```

**Verify:** Check what CSS var name the typography system actually emits for title-level letter spacing by reading `src/styles/base/_typography.scss`.

### Fix 3 (MED): Remove stale `void-registry.json` / `void-physics.json` references

These files are referenced in CLAUDE.md gotchas section but do not exist in the project. Either:
- **Remove the references** from CLAUDE.md if these files were eliminated during a refactoring
- **Regenerate them** if they should exist (check if the build script is supposed to create them)

**Action:** Search git log for when these files were removed:
```bash
git log --diff-filter=D -- void-registry.json void-physics.json
```

If they were intentionally removed, update CLAUDE.md section 9 (Gotchas) to remove the reference.

---

## Verification Checklist

```bash
npm run scan          # Should still pass
npm run build:tokens  # Regenerate to verify token pipeline
npm run check         # TypeScript validation
npm run dev           # Visual check
```

- [ ] Sidebar items have correct font weight (not browser default)
- [ ] Navigation transitions are instant in retro (no 300ms delay)
- [ ] Sidebar transitions are instant in retro
- [ ] Tailwind `leading-h1` through `leading-h4` resolve to actual values (test in dev tools)
- [ ] No console warnings about undefined CSS custom properties
