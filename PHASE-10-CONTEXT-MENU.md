# Phase 10 — Context Menu

Custom right-click menus positioned at the cursor, built on existing Dropdown/Popover infrastructure. Requires Phase 4 (layer stack).

---

## Problem

There's no way to attach custom right-click actions to elements. The browser's default context menu is the only option. For a design system, contextual menus are a power-user interaction pattern — file managers, code editors, data tables all use them. Dropdown.svelte already uses the Popover API, Floating UI, and Escape handling — Context Menu extends this pattern to right-click triggers.

---

## Dependencies

- **Phase 4** — Layer stack (context menu must participate in Escape precedence)

---

## Files

- **New:** `src/components/ui/ContextMenu.svelte`
- **New:** `src/actions/contextmenu.ts`
- `src/styles/components/_dropdowns.scss` — extend or share dropdown menu styling
- `src/components/ui-library/FloatingUI.svelte` — add showcase section

---

## Design

### Two pieces

1. **`use:contextmenu` action** — attaches to any element, intercepts right-click, opens the menu
2. **`ContextMenu.svelte`** — the floating menu component (renders items, handles keyboard nav)

### Action API

```typescript
// src/actions/contextmenu.ts
interface ContextMenuItem {
  label: string;
  icon?: Component;        // Lucide icon component
  onclick: () => void;
  disabled?: boolean;
  separator?: boolean;     // Renders a divider before this item
}

export function contextmenu(node: HTMLElement, items: () => ContextMenuItem[]) {
  // 1. Listen for 'contextmenu' event on node
  // 2. Prevent default browser menu
  // 3. Mount ContextMenu.svelte at cursor position
  // 4. Pass items to the component
  // 5. Register with layer stack (Phase 4) for Escape handling
  // 6. Close on item click, Escape, or click-outside
}
```

### Usage

```svelte
<div use:contextmenu={() => [
  { label: 'Edit', icon: Pencil, onclick: () => edit(item) },
  { label: 'Duplicate', icon: Copy, onclick: () => duplicate(item) },
  { separator: true, label: 'Delete', icon: Trash2, onclick: () => remove(item) },
]}>
  {item.name}
</div>
```

### Component Structure

ContextMenu.svelte renders a positioned floating panel:

```svelte
<div class="context-menu" popover="manual" role="menu">
  {#each items as item}
    {#if item.separator}
      <hr class="context-menu-divider" />
    {/if}
    <button
      class="context-menu-item"
      role="menuitem"
      disabled={item.disabled}
      onclick={() => { item.onclick(); close(); }}
    >
      {#if item.icon}
        <svelte:component this={item.icon} class="icon" data-size="sm" />
      {/if}
      <span>{item.label}</span>
    </button>
  {/each}
</div>
```

### Positioning

Use Floating UI (already a dependency) to position near cursor coordinates:

```typescript
// Virtual reference element at cursor position
const virtualRef = {
  getBoundingClientRect: () => ({
    x: event.clientX,
    y: event.clientY,
    width: 0,
    height: 0,
    top: event.clientY,
    left: event.clientX,
    right: event.clientX,
    bottom: event.clientY,
  }),
};

computePosition(virtualRef, menuEl, {
  placement: 'bottom-start',
  middleware: [flip(), shift({ padding: 8 })],
});
```

### Keyboard Navigation

Once open:
- `ArrowDown` / `ArrowUp` — navigate items
- `Enter` — execute focused item
- `Escape` — close (via layer stack)
- `Home` / `End` — jump to first/last item

### Accessibility

- Menu has `role="menu"`
- Items have `role="menuitem"`
- Active item tracked via `data-state="active"`
- Disabled items have `aria-disabled="true"` and are skipped in keyboard nav

---

## SCSS

Share base styling with Dropdown, extend for context-menu specifics:

```scss
.context-menu {
  // Same floating surface as dropdown
  @include glass-float;
  padding: var(--space-xs);
  min-width: 10rem;
}

.context-menu-item {
  // Similar to dropdown items
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-base);
  cursor: pointer;
  width: 100%;
  border: none;
  background: none;
  color: var(--text-main);

  &[data-state='active'] {
    background: alpha(var(--energy-primary), 10%);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.context-menu-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--space-xs) 0;
}
```

---

## Verification

```bash
npm run dev     # Visual check
npm run check   # TypeScript
npm run scan    # Token compliance
```

Manual tests:
- Right-click element with `use:contextmenu` — menu appears at cursor
- Click an item — action fires, menu closes
- Escape — menu closes (via layer stack)
- Click outside — menu closes
- Arrow keys navigate items
- Disabled items are visually dimmed and skipped by keyboard
- Menu flips/shifts when near viewport edges
- Works across glass/flat/retro + light/dark
- Right-clicking elsewhere on the page still shows browser default menu
