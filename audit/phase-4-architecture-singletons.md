# Phase 4: Architecture & Singletons

> **Scope:** Singleton usage, layer stack, escape handling, transition system.
> **Result: CLEAN PASS — no fixes needed.**

This phase is documented for completeness. The audit found zero violations across all three sub-sections.

---

## 4A. Singleton Usage — PASS

- `VoidEngine` instantiated exactly once in `src/adapters/void-engine.svelte.ts` line 461
- All 6 singletons imported from canonical paths with zero deviations
- `localStorage` access confined to authorized locations only:
  - `src/adapters/void-engine.svelte.ts` (theme persistence)
  - `src/stores/user.svelte.ts` (user hydration)
  - `src/lib/void-boot.js` (pre-paint bootloader)
  - `src/components/core/ThemeScript.astro` (inline boot)
  - `src/components/core/UserScript.astro` (anti-FOUC boot)
- All storage access uses shared `STORAGE_KEYS` constants from `src/config/constants.ts`
- `sessionStorage` is not used anywhere

---

## 4B. Layer Stack & Escape Handling — PASS

All 3 dismissible surfaces register with `layerStack`:
- **Modal** — `layerStack.push(() => modal.close())` on open
- **Dropdown** — `layerStack.push(...)` when `open` becomes true
- **Sidebar** — `layerStack.push(...)` when `open` becomes true

All deregister properly in `$effect` cleanup blocks.

Element-scoped Escape handlers all call `e.preventDefault()` before their local action, which the layer stack respects via its `e.defaultPrevented` check:
- `EditField.svelte` — `e.preventDefault()` then `reset()`
- `EditTextarea.svelte` — `e.preventDefault()` then `reset()`
- `GenerateField.svelte` — `e.preventDefault()` then `abortController?.abort()`
- `GenerateTextarea.svelte` — `e.preventDefault()` then `abortController?.abort()`

Shortcut registry guards against firing during open layers:
- `if (layerStack.hasLayers) return;` before processing any shortcut

No double-dismissal risk exists.

---

## 4C. Transition System — PASS

Zero imports from `svelte/transition` or `svelte/animate`. All transitions use the physics-aware system:

| Transition | Context | Usage |
|-----------|---------|-------|
| `in:emerge` / `out:dissolve` | Layout-aware (document flow) | Toast, FormField errors, PasswordMeter, PasswordChecklist |
| `in:materialize` / `out:dematerialize` | Visual-only (positioned/overlay) | ThemesFragment, Edit/Generate fields, Sidebar |
| `out:implode` | Horizontal collapse | Chip removal |
| `animate:live` | FLIP list reflow | Chip lists |

All pairings are correct (layout-aware pairs used for flow elements, visual-only pairs for overlays).

---

## No Action Required

This phase requires no changes. It exists as a reference for the system's architectural health.
