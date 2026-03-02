# Phase 1: Law Enforcement (The 5 Laws)

> **Scope:** Fix all violations of the 5 Laws found during the full system audit.
> **Estimated fixes:** 2 token violations, 7 spacing violations, 5 annotation gaps.
> **No regressions expected** — these are all isolated value/class changes.

---

## 1A. Hybrid Protocol — PASS (no action needed)

Production components correctly separate layout (Tailwind) from physics (SCSS). Layout-in-SCSS exists only for documented bare-class patterns with `void-exception` comments. Showcase/demo files use token-mapped Tailwind color classes — acceptable for non-production pages.

---

## 1B. Token Law — 2 fixes + 5 annotation gaps

### Fix 1: `.arrow` chevron uses raw `2px`

**File:** `src/styles/components/_navigation.scss` lines 170-171
**Issue:** CSS chevron border uses hardcoded `2px` instead of `var(--physics-border-width)`. The chevron won't adapt across physics presets (glass=1px, retro=2px).

```scss
// BEFORE
border-right: 2px solid currentColor;
border-bottom: 2px solid currentColor;

// AFTER
border-right: var(--physics-border-width) solid currentColor;
border-bottom: var(--physics-border-width) solid currentColor;
```

**Verify:** Check the chevron renders correctly in all 3 physics presets. In glass it should be thinner (1px), in retro thicker (2px).

### Fix 2: Shimmer light gradient uses raw `rgba`

**File:** `src/styles/abstracts/_mixins.scss` line 107
**Issue:** `rgba(255, 255, 255, 0.6)` in the shimmer light-mode gradient. Should use the project's `alpha()` function with a token.

```scss
// BEFORE
rgba(255, 255, 255, 0.6) 50%,

// AFTER
alpha(var(--bg-surface), 80%) 50%,
```

**Note:** Using `--bg-surface` instead of raw white because in light mode the shimmer highlight should adapt to the surface color. Test that the shimmer effect is still visible on light mode surfaces. If `--bg-surface` is too subtle, try `alpha(var(--text-inverse), 60%)` or another light-appropriate token.

### Annotation gaps (5 items — add `// void-ignore` comments)

These are raw px values used for glow/motion physics that are intentional but lack the `void-ignore` annotation that identical patterns elsewhere have. Adding the annotation prevents future scanners from flagging them.

| File | Line(s) | Value | Suggested annotation |
|------|---------|-------|---------------------|
| `src/styles/components/_inputs.scss` | 142 | `drop-shadow(0 0 3px ...)` | `// void-ignore (Glow Physics)` |
| `src/styles/components/_inputs.scss` | 155 | `drop-shadow(0 0 2px ...)` | `// void-ignore (Glow Physics)` |
| `src/styles/components/_toasts.scss` | 110 | `0 0 15px -4px ...` | `// void-ignore (Glow Physics)` |
| `src/styles/abstracts/_mixins.scss` | 235 | `translateY(10px) scale(0.98)` | `// void-ignore (Motion Physics)` |
| `src/styles/abstracts/_mixins.scss` | 333 | `box-shadow: 0 0 6px ...` | `// void-ignore (Glow Physics)` |

---

## 1C. Runes Doctrine — PASS (no action needed)

100% Svelte 5 runes. Zero legacy patterns across all 93 files.

---

## 1D. State Protocol — PASS (no action needed)

All state communicated via `data-*` or ARIA attributes. Zero `class:active=`, `class:open=`, etc.

---

## 1E. Spacing Gravity — 7 fixes

All violations are on `surface-sunk` elements using padding/gap below the `p-md gap-md` floor.

### Fix 1 (HIGH): ThemesFragment theme menu

**File:** `src/components/modals/ThemesFragment.svelte` line 224
**Issue:** `surface-sunk ... gap-xs p-xs` on the theme selector radiogroup.

```svelte
<!-- BEFORE -->
<div class="surface-sunk ... gap-xs p-xs">

<!-- AFTER -->
<div class="surface-sunk ... gap-md p-md">
```

**Verify:** The theme cards in the Themes modal should have comfortable breathing room. Check that the modal doesn't overflow at small viewport sizes — if it does, `gap-sm p-sm` is the absolute floor, but try `p-md gap-md` first.

### Fixes 2-7 (MED): `index.svelte` sunk surfaces

These are all on the home/landing page. Each `surface-sunk` with `p-sm` should become `p-md`, and `gap-xs` on sunk containers should become at least `gap-sm` (or `gap-md` if the content allows).

| Line | Current | Fix to |
|------|---------|--------|
| 146 | `surface-sunk p-sm ... gap-xs` | `surface-sunk p-md ... gap-sm` |
| 150 | `surface-sunk p-sm ... gap-xs` | `surface-sunk p-md ... gap-sm` |
| 225 | `surface-sunk p-sm ... gap-md` | `surface-sunk p-md ... gap-md` |
| 508 | `surface-sunk ... gap-sm p-sm` | `surface-sunk ... gap-md p-md` |
| 613 | `surface-sunk p-sm ... gap-xs` | `surface-sunk p-md ... gap-sm` |
| 676 | `surface-sunk p-sm ... gap-sm` | `surface-sunk p-md ... gap-md` |

**Verify:** Check the home page in all 3 physics presets. The sunk containers should feel comfortably spaced, not cramped. If any specific container looks too padded with `p-md`, note it for discussion — but the Law 5 floor should be respected.

---

## Verification Checklist

After all fixes, run:

```bash
npm run scan          # Should still pass (no new magic values)
npm run dev           # Visual check: glass, flat, retro x light, dark
```

Specific visual checks:
- [ ] Navigation chevron arrow renders at correct thickness per physics preset
- [ ] Shimmer effect visible and appropriate in light mode
- [ ] ThemesFragment theme cards have comfortable spacing
- [ ] Home page sunk surfaces have adequate padding
- [ ] No layout breakage at mobile viewport sizes
