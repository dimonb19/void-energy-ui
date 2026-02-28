# Phase 2 — Toast Action Buttons

Extend the toast system with clickable action buttons, enabling the "undo over confirmation" UX pattern.

---

## Problem

The toast system supports types, auto-dismiss, loading controllers, and promise wrappers — but no inline action buttons. There's no way to show "Item deleted — **Undo**" as a toast. The only confirmation UX is the modal `ConfirmFragment`, which interrupts the user's flow.

---

## Files

- `src/types/void-ui.d.ts` (lines 229-241) — `VoidToastItem` interface
- `src/stores/toast.svelte.ts` (lines 1-159) — `ToastStore` class
- Toast rendering component (renders `toast.items`) — find via imports
- `src/styles/components/_toasts.scss` (lines 1-166) — toast styling

---

## Changes

### 1. Extend `VoidToastItem` type

In `src/types/void-ui.d.ts`, add optional `action` to `VoidToastItem`:

```typescript
interface VoidToastItem {
  id: number;
  message: string;
  type: VoidToastType;
  action?: {
    label: string;
    onclick: () => void;
  };
}
```

### 2. Update `ToastStore.show()` to accept action

In `src/stores/toast.svelte.ts`, extend the `show` method signature and the item push:

```typescript
show(
  message: string,
  type: VoidToastType = 'info',
  duration = 4000,
  action?: VoidToastItem['action']
) {
  // ...existing id generation...
  this.items.push({ id, message, type, action });
  // ...existing timer logic...
}
```

### 3. Add `toast.undo()` convenience method

Add to `ToastStore` class:

```typescript
/**
 * Shows a success toast with an Undo action button.
 * If the user clicks Undo within the duration, the callback fires.
 */
undo(message: string, callback: () => void, duration = 6000) {
  return this.show(message, 'success', duration, {
    label: 'Undo',
    onclick: () => {
      callback();
      // Close the toast after undo is triggered
      // (the id is returned from show, so we need to capture it)
    },
  });
}
```

Note: The `undo` method should capture the returned `id` from `show` and close the toast when the action is clicked. Refine the implementation to:

```typescript
undo(message: string, callback: () => void, duration = 6000) {
  const id = this.show(message, 'success', duration, {
    label: 'Undo',
    onclick: () => {
      callback();
      this.close(id);
    },
  });
  return id;
}
```

### 4. Render action button in Toast component

Find the toast rendering component (wherever `toast.items` is consumed). Add an action button next to the message text:

```svelte
{#if item.action}
  <button class="toast-action" onclick={item.action.onclick}>
    {item.action.label}
  </button>
{/if}
```

### 5. Style `.toast-action` in `_toasts.scss`

Add inside `.toast-message`:

```scss
.toast-action {
  // Ghost-style button within the toast capsule
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-base);
  white-space: nowrap;
  transition: opacity var(--speed-fast) var(--ease-out);

  &:hover {
    opacity: 0.8;
  }
}
```

---

## Usage After

```typescript
// Delete with undo
function deleteItem(item) {
  const backup = { ...item };
  removeFromList(item.id);
  toast.undo(`${item.name} deleted`, () => restoreToList(backup));
}

// Generic action toast
toast.show('File uploaded', 'success', 5000, {
  label: 'View',
  onclick: () => navigateTo('/files'),
});
```

---

## Verification

```bash
npm run dev     # Visual check: toast with action button
npm run check   # TypeScript
npm run scan    # Token compliance
```

Manual tests:
- Call `toast.undo('Deleted', () => console.log('undone'))` in console
- Verify action button appears, is clickable, closes toast on click
- Verify auto-dismiss still works if action is not clicked
- Test across all physics presets + both modes
- Verify toast without action still renders correctly (regression)
