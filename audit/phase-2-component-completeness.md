# Phase 2: Component Completeness

> **Scope:** Fix component-SCSS gaps, props interface violations, accessibility issues, and icon compliance.
> **Estimated fixes:** 1 new SCSS file, 5 component refactors, 3 a11y fixes, 3 icon fixes.

---

## 2A. Component-SCSS Mapping — 2 fixes

### Fix 1 (HIGH): Switcher has zero SCSS

**File to create:** Add `.switcher-option` styles to `src/styles/components/_fields.scss` (where other field composites live) or create a new `_switcher.scss`.

**Current state:** `Switcher.svelte` uses `.switcher-option` class on its radio buttons, but this class has no SCSS definition anywhere. The segmented control has no visual treatment beyond Tailwind geometry — no physics differentiation, no hover states, no active/checked visual feedback.

**What to implement:**
1. Read `Switcher.svelte` to understand the markup structure (it uses `role="radiogroup"` with `role="radio"` children)
2. Read the nearest analog — `_toggle.scss` for physics patterns on a boolean switch, or `_buttons.scss` for interactive state patterns
3. Implement:
   - Base `.switcher` container styling (use `glass-sunk` for the track, matching Toggle)
   - `.switcher-option` styling with physics-aware hover/focus states
   - `data-state="active"` or `aria-checked="true"` styling for the selected segment
   - `when-glass`, `when-retro`, `when-light` differentiation
   - `:focus-visible` ring on individual options

**If creating `_switcher.scss`:** Add `@forward 'switcher';` to `src/styles/components/_index.scss`.

**Verify:** Test with 2, 3, and 4 segments in all 3 physics presets + both color modes.

### Fix 2 (MED): Skeleton lacks physics differentiation

**File:** `src/styles/components/_effects.scss`
**Issue:** The shimmer animation runs identically in all physics presets. Retro should use `steps()` timing for a CRT-scan effect.

**What to implement:**
```scss
// In the .skeleton or shimmer-related rules:
@include when-retro {
  animation-timing-function: steps(8); // Stepped shimmer for retro
}
```

**Verify:** The skeleton shimmer should look smooth in glass/flat and stepped in retro.

---

## 2B. Props Interface — 6 fixes

### Fix 1 (HIGH): SettingsRow legacy `$props<T>()`

**File:** `src/components/ui/SettingsRow.svelte`
**Issue:** Uses `$props<{ label: string; children: Snippet }>()` — the legacy generic syntax.

```svelte
<!-- BEFORE -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { label, children } = $props<{ label: string; children: Snippet }>();
</script>

<!-- AFTER -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface SettingsRowProps {
    label: string;
    children: Snippet;
    class?: string;
  }

  let { label, children, class: className = '' }: SettingsRowProps = $props();
</script>
```

Also add `{className}` to the root element's class string.

### Fix 2 (MED): ThemesBtn inline typing

**File:** `src/components/ui/ThemesBtn.svelte`
**Issue:** Inline `{ class?: string; icon?: boolean; size?: string; }` instead of named interface.

Extract to `ThemesBtnProps` interface at the top of the script block.

### Fix 3 (MED): PullRefresh inline typing + missing class

**File:** `src/components/ui/PullRefresh.svelte`
**Issue:** Inline typing and no `class?: string` passthrough.

Extract to `PullRefreshProps` interface. Add `class?: string` prop and apply to root element.

### Fix 4 (MED): KineticText callback casing

**File:** `src/components/ui/KineticText.svelte`
**Issue:** Callback prop named `onComplete` — should be `oncomplete` per system convention.

```typescript
// BEFORE
onComplete?: () => void;

// AFTER
oncomplete?: () => void;
```

**Important:** Search for all call sites that pass `onComplete` and update them too.

### Fix 5 (LOW): PortalLoader interface naming

**File:** `src/components/ui/PortalLoader.svelte`
**Issue:** Interface named `Props` instead of `PortalLoaderProps`.

Rename the interface. No external impact.

### Fix 6 (LOW): Selector/Switcher props location

**Files:** `src/components/ui/Selector.svelte`, `src/components/ui/Switcher.svelte`
**Issue:** Props interfaces live in `src/types/void-ui.d.ts` as ambient globals instead of locally in the component.

Move `SelectorProps` and `SwitcherProps` into their respective component files as local interfaces. Remove from `void-ui.d.ts` (keep shared types like `BreadcrumbItem` and `PasswordValidationState` there — those are used across multiple components).

---

## 2C. Accessibility — 5 fixes

### Fix 1 (HIGH): Toast action is `<span role="button">`

**File:** `src/components/Toast.svelte` around lines 83-101
**Issue:** Toast action button is `<span role="button" tabindex="0">` instead of native `<button>`. Loses free keyboard activation (Enter/Space), form semantics, and default focus styling.

```svelte
<!-- BEFORE -->
<span
  role="button"
  tabindex="0"
  class="..."
  onclick={...}
  onkeydown={...}
>
  {action.label}
</span>

<!-- AFTER -->
<button
  type="button"
  class="btn-ghost btn-sm ..."
  onclick={...}
>
  {action.label}
</button>
```

Remove the manual `onkeydown` handler (native `<button>` handles Enter/Space automatically). Use appropriate button classes per the system (`btn-ghost` for secondary actions in toasts).

### Fix 2 (HIGH): ThemesFragment missing `id="modal-title"`

**File:** `src/components/modals/ThemesFragment.svelte` line 177
**Issue:** The `<h2>` heading is missing `id="modal-title"`. The parent `<dialog>` has `aria-labelledby="modal-title"` pointing at nothing, so screen readers can't announce the modal title.

```svelte
<!-- BEFORE -->
<h2>Atmospheres</h2>

<!-- AFTER -->
<h2 id="modal-title">Atmospheres</h2>
```

**Check:** Verify all other modal fragments have `id="modal-title"` on their heading. The audit found Alert, Confirm, Settings, and Shortcuts all have it — only Themes is missing it.

### Fix 3 (HIGH): Toggle missing `:focus-visible`

**File:** `src/styles/components/_toggle.scss`
**Issue:** The `.toggle` button uses `@include btn-reset` which strips the default outline, but no focus ring is added back. The toggle is invisible to keyboard-only users.

```scss
// Add to .toggle styles:
&:focus-visible {
  outline: var(--focus-ring);
  outline-offset: 2px; // void-ignore (Focus offset)
}
```

**Reference:** See `_buttons.scss` line 303 for the existing `:focus-visible` pattern on buttons.

### Fix 4 (MED): ThemesBtn missing `type="button"`

**File:** `src/components/ui/ThemesBtn.svelte` line 17
**Issue:** `<button>` without explicit `type="button"` risks implicit form submission.

```svelte
<!-- BEFORE -->
<button class="..." onclick={...}>

<!-- AFTER -->
<button type="button" class="..." onclick={...}>
```

### Fix 5 (MED): MediaSlider range input missing `aria-label`

**File:** `src/components/ui/MediaSlider.svelte`
**Issue:** The `<input type="range">` has no accessible label.

```svelte
<!-- Add aria-label to the range input -->
<input type="range" aria-label="Volume" ... />
```

---

## 2D. Icon System — 3 fixes

### Fix 1 (MED): ArrowBack missing class prefix

**File:** `src/components/icons/ArrowBack.svelte` line 11

```svelte
<!-- BEFORE -->
<svg class="icon {className ?? ''}" ...>

<!-- AFTER -->
<svg class="icon-arrow-back icon {className ?? ''}" ...>
```

### Fix 2 (MED): Dream missing class prefix

**File:** `src/components/icons/Dream.svelte` line 10

```svelte
<!-- BEFORE -->
<svg class="icon {className ?? ''}" ...>

<!-- AFTER -->
<svg class="icon-dream icon {className ?? ''}" ...>
```

### Fix 3 (LOW): Quill missing class prefix

**File:** `src/components/icons/Quill.svelte` line 11

```svelte
<!-- BEFORE -->
<svg class="icon {className ?? ''}" ...>

<!-- AFTER -->
<svg class="icon-quill icon {className ?? ''}" ...>
```

**Note:** If any of these icons have scoped `<style>` blocks targeting the `.icon` class directly, update those selectors to target the `icon-[name]` class instead.

---

## Verification Checklist

```bash
npm run check         # TypeScript should pass after interface changes
npm run dev           # Visual check all components
```

- [ ] Switcher renders with physics-aware styling in all 3 presets
- [ ] Skeleton shimmer is stepped in retro
- [ ] Toast action button is keyboard-accessible (Tab to it, press Enter)
- [ ] ThemesFragment announces its title to screen readers
- [ ] Toggle shows visible focus ring when tabbed to
- [ ] KineticText `oncomplete` callback still fires correctly
- [ ] No TypeScript errors after props interface refactors
