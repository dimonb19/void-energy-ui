# Phase 8 — Command Palette

Global Cmd+K search/action launcher. Requires Phase 3 (shortcut registry) and Phase 6 (debounce).

---

## Problem

Modern design systems provide a command palette — a keyboard-driven way to navigate pages, trigger actions, and search settings without reaching for the mouse. The modal system and shortcut registry (Phase 3) provide 70% of the infrastructure. This phase assembles it into a searchable palette component.

---

## Dependencies

- **Phase 3** — Shortcut registry (provides the command list to search over)
- **Phase 6** — Debounce utility (debounces search input in the palette)

---

## Files

- **New:** `src/components/modals/CommandPaletteFragment.svelte`
- `src/config/modal-registry.ts` — register the palette
- `src/lib/modal-manager.svelte.ts` — add `modal.palette()` convenience method
- `src/lib/shortcut-registry.svelte.ts` — already provides `entries` to search over
- `src/types/modal.d.ts` — add palette key

---

## Design

### Command Sources

The palette searches over a unified list of "commands" from multiple sources:

1. **Registered shortcuts** — from `shortcutRegistry.entries` (Phase 3)
2. **Pages** — hardcoded array of `{ label, path }` for available routes
3. **Actions** — extensible array of `{ label, callback, group }` (toggle theme, toggle fullscreen, etc.)

All sources conform to a common shape:

```typescript
interface PaletteCommand {
  label: string;
  group: string;         // 'Shortcuts' | 'Pages' | 'Actions'
  shortcut?: string;     // Display key hint (e.g., 'F', 'T')
  execute: () => void;
}
```

### Fuzzy Search

Lightweight substring match — no external library needed. Filter commands where `label.toLowerCase().includes(query.toLowerCase())`. If a more sophisticated fuzzy match is desired later, swap in a library.

### Component Structure

```
CommandPaletteFragment.svelte
├── Search input (autofocused)
├── Filtered results list (grouped by category)
│   ├── Arrow key navigation (roving focus)
│   └── Enter to execute
└── Empty state when no matches
```

### Keyboard Flow

- `Cmd+K` / `Ctrl+K` — opens the palette (registered in shortcut registry)
- Type to filter — debounced search over all commands
- `ArrowDown` / `ArrowUp` — navigate results
- `Enter` — execute selected command, close palette
- `Escape` — close palette (handled by layer stack from Phase 4)

### Registration

In `modal-registry.ts`:
```typescript
palette: CommandPaletteFragment,
```

In `modal-manager.svelte.ts`:
```typescript
palette() {
  this.open('palette', {}, 'md');
}
```

In `Navigation.svelte` or shortcut registry init:
```typescript
shortcutRegistry.register({
  key: 'k',
  label: 'Open command palette',
  group: 'Navigation',
  modifier: 'meta',  // Cmd+K / Ctrl+K
  callback: () => modal.palette(),
});
```

Note: The shortcut registry (Phase 3) may need a `modifier` field added to support Cmd/Ctrl combos, not just single keys.

---

## SCSS

Minimal — the palette is a modal fragment, so it inherits `modal-content` styling. Custom styles needed:

```scss
.command-palette {
  // Input at top
  .palette-input {
    // Reuse existing input styling from _inputs.scss
  }

  // Results list
  .palette-results {
    max-height: 20rem;
    overflow-y: auto;
  }

  // Individual result item
  .palette-item {
    cursor: pointer;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-base);

    &[data-state='active'] {
      background: alpha(var(--energy-primary), 10%);
    }
  }

  // Shortcut hint badge
  .palette-shortcut {
    // kbd-like styling
  }
}
```

---

## Verification

```bash
npm run dev     # Visual check
npm run check   # TypeScript
```

Manual tests:
- `Cmd+K` opens the palette
- Type "full" — "Toggle fullscreen" appears in results
- Arrow keys navigate results, Enter executes
- Escape closes
- Palette shows grouped results (Shortcuts, Pages, Actions)
- Empty state shows when no commands match query
- Works across glass/flat/retro + light/dark
