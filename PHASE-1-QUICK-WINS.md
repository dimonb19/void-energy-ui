# Phase 1 — Quick Wins

Three small, independent improvements that can be completed in a single session.

---

## 1A. Tooltip Hover Delay

**Problem:** Tooltips appear instantly on `pointerenter`, which feels jarring in dense UI. No way to configure a delay.

**Files:**
- `src/types/void-ui.d.ts` (lines 286-299) — `VoidTooltipOptions` interface
- `src/lib/void-tooltip.ts` (lines 37-46, 49-88, 91-118) — show/hide handlers

**Changes:**

1. Add `delay?: number` to `VoidTooltipOptions` in `void-ui.d.ts`
2. In `VoidTooltip` class (`void-tooltip.ts`):
   - Add private `showTimer: ReturnType<typeof setTimeout> | null = null`
   - In `show()`: wrap existing logic in `setTimeout` using `this.options.delay ?? 0`
   - In `hide()`: call `clearTimeout(this.showTimer)` before existing hide logic
   - In `destroy()`: clear timer as well
3. Default delay: `0` (backward compatible — all existing tooltips remain instant)

**Usage after:**
```svelte
<button use:tooltip={{ content: 'Settings', placement: 'bottom', delay: 200 }}>
```

---

## 1B. Autocomplete Passthrough

**Problem:** `EditField`, `PasswordField`, and `SearchField` don't pass `autocomplete` to native `<input>`, preventing browser autofill hints.

**Files:**
- `src/components/ui/EditField.svelte` (props: lines 42-49, input: lines 97-107)
- `src/components/ui/PasswordField.svelte` (props: lines 27-33, input: lines 53-59)
- `src/components/ui/SearchField.svelte` (props: lines 29-38, input: lines 69-79)

**Changes per component:**

1. Add `autocomplete?: string` to props interface
2. Pass `autocomplete` attribute to the native `<input>` element
3. Set sensible defaults:
   - **PasswordField** → `autocomplete = 'current-password'`
   - **SearchField** → `autocomplete = 'off'`
   - **EditField** → no default (pass-through only)

**Example (PasswordField):**
```svelte
<!-- Before -->
<input type={visible ? 'text' : 'password'} {placeholder} {disabled} bind:value />

<!-- After -->
<input type={visible ? 'text' : 'password'} {placeholder} {disabled} {autocomplete} bind:value />
```

---

## 1C. DropZone Drag-Over Elevation

**Problem:** DropZone's `data-state="active"` only changes border color and background tint. No shadow or elevation to signal "drop here."

**Files:**
- `src/styles/components/_inputs.scss` (lines 208-234) — DropZone active state
- `src/components/ui/DropZone.svelte` (line 162-164) — already sets `data-state={dragActive ? 'active' : ''}`

**Changes:**

Add shadow and subtle scale to the existing `[data-state='active']` rule in `_inputs.scss`, physics-aware:

```scss
// Inside .dropzone active state block:
&[data-state='active'] {
  // Existing: border-color + background-color changes

  // Add elevation feedback:
  box-shadow: var(--shadow-lg);
  transform: scale(1.005);
  transition: transform var(--speed-fast) var(--ease-spring-snappy),
              box-shadow var(--speed-fast) var(--ease-out);
}
```

Physics overrides:
- **Glass**: glow shadow (use `--energy-primary` in shadow color)
- **Retro**: no shadow, thicker border only (`border-width: 3px`)
- **Flat**: standard `--shadow-lg`

---

## Verification

```bash
npm run dev     # Visual check: tooltip delay, autofill, DropZone drag
npm run check   # TypeScript
npm run scan    # Token compliance
```

Manual tests:
- Hover over a tooltip — should delay before appearing (if delay set)
- Open browser autofill on a password field — should suggest saved passwords
- Drag a file over DropZone — should see elevation effect
- Test all 3 physics presets (glass/flat/retro) + both modes (light/dark)
