---
paths:
  - "src/components/**/*.svelte"
---

# Native-First Protocol

Components are thin wrappers around native HTML elements — they add layout, labeling, and physics styling, never behavior reimplementations. The browser owns interaction, accessibility, and form integration; SCSS owns the material.

## Why

Reimplementing native behavior (custom `role="listbox"` instead of `<select>`, custom keyboard handlers instead of `<button>`) means re-shipping every accessibility, locale, and platform-integration concern the browser already solved. It is also a source of system inconsistency: hand-rolled widgets drift apart over time. The reference component `Selector.svelte` proves the pattern — a native `<select>` plus SCSS does everything a custom dropdown would, with zero JS and full a11y.

## Always Native

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`, `<a>`, `<form>`.

If the user's brief calls for a "dropdown" / "checkbox" / "radio" / "toggle" / "tab" — start from the native element, not a `<div>`.

## Custom Only When

No native element exists for the interaction:
- combobox / autocomplete
- multi-thumb slider
- virtualized data table
- command palette
- floating panel (Dropdown, Modal, Sidebar)

In those cases, follow ARIA Authoring Practices for the role and keyboard model.

## Reference Pattern

`Selector.svelte` wraps a native `<select>` with label association and layout. Zero custom dropdown JS. SCSS handles all physics.

```svelte
CORRECT:  <select onchange={handleChange}>           (native behavior)
CORRECT:  .select { @include surface-raised; }       (SCSS physics on native element)
WRONG:    <div role="listbox" on:keydown={...}>      (reimplementing <select> from scratch)
WRONG:    <div role="button" tabindex="0">           (just use <button>)
```

## Forwarding Native Attributes

If a wrapper does not currently support `...rest`, **extend it** rather than duplicating the template. Composites that already forward rest props (`SearchField`, `PasswordField`, `Selector`, `Toggle`, etc.) document the target element in the registry — pass native attributes there.
