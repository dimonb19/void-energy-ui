# Phase 4 — Escape Layer Stack

Formalize Escape key precedence across all dismissible UI layers (modal, sidebar, dropdown, inline edit).

---

## Problem

Multiple components listen for Escape independently via separate `document.addEventListener('keydown')` handlers. Current behavior works by coincidence: Dropdown calls `e.preventDefault()` which happens to prevent double-dismissal. But there's no formal layer stack, no guaranteed precedence, and no coordination between layers. If a dropdown opens inside a modal and user presses Escape, behavior depends on listener registration order.

**Current Escape handlers:**
| Component | Listener | Cleanup |
|-----------|----------|---------|
| Modal | Native `<dialog>` `cancel` event | Automatic |
| Dropdown | `document.addEventListener` in `$effect` | Cleaned up on close |
| Sidebar | `window.addEventListener` in `$effect` | Cleaned up on close |
| EditField | `onkeydown` on `<input>` element | Event-scoped |
| EditTextarea | `onkeydown` on `<textarea>` element | Event-scoped |

---

## Files

- **New:** `src/lib/layer-stack.svelte.ts` — stack singleton
- `src/components/ui/Dropdown.svelte` (lines 166-180)
- `src/components/ui/Sidebar.svelte` (lines 108-120)
- `src/components/Modal.svelte` — dialog wrapper
- `src/components/ui/EditField.svelte` (lines 85-93)
- `src/components/ui/EditTextarea.svelte` — similar pattern

---

## Design

### Layer Stack Singleton

```typescript
// src/lib/layer-stack.svelte.ts

type CloseCallback = () => void;

class LayerStack {
  private stack = $state<CloseCallback[]>([]);

  /** Push a dismissible layer. Returns a cleanup function. */
  push(close: CloseCallback): () => void {
    this.stack.push(close);
    return () => this.remove(close);
  }

  /** Remove a specific layer (called on natural close, not just Escape). */
  private remove(close: CloseCallback) {
    this.stack = this.stack.filter((cb) => cb !== close);
  }

  /** Dismiss the topmost layer. Returns true if something was dismissed. */
  dismissTop(): boolean {
    if (this.stack.length === 0) return false;
    const top = this.stack.pop()!;
    top();
    return true;
  }

  /** Whether any layers are open. */
  get hasLayers(): boolean {
    return this.stack.length > 0;
  }
}

export const layerStack = new LayerStack();
```

### Global Escape Listener

The layer stack registers a single global Escape listener:

```typescript
// Inside layer-stack.svelte.ts, after class definition:
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (layerStack.dismissTop()) {
        e.preventDefault();
        e.stopPropagation();
      }
    }
  });
}
```

### Component Integration

**Dropdown** — Replace lines 166-180:
```typescript
$effect(() => {
  if (!open) return;
  const cleanup = layerStack.push(() => {
    close();
    triggerEl?.focus();
  });
  return cleanup;
});
// Remove the existing keydown listener entirely
```

**Sidebar** — Replace lines 108-120:
```typescript
$effect(() => {
  if (!open) return;
  const cleanup = layerStack.push(() => {
    open = false;
    onclose?.();
  });
  return cleanup;
});
```

**Modal** — Handle via `cancel` event on `<dialog>`, but also register:
```typescript
$effect(() => {
  if (!modal.state.key) return;
  const cleanup = layerStack.push(() => modal.close());
  return cleanup;
});
```

**EditField / EditTextarea** — These use element-scoped `onkeydown`, not document listeners. They should NOT register with the layer stack because:
- They only fire when the input is focused (scoped by default)
- Escape in an input should cancel editing, not dismiss a modal behind it
- No conflict with the layer stack since `onkeydown` on the element fires before the document listener

Leave EditField/EditTextarea as-is. The layer stack handles overlay-level layers (modal, dropdown, sidebar).

---

## Precedence (LIFO)

The stack naturally enforces: last opened = first dismissed.

Typical stacking scenario:
1. Modal opens → `stack: [modal]`
2. Dropdown opens inside modal → `stack: [modal, dropdown]`
3. Escape → dismisses dropdown, modal stays → `stack: [modal]`
4. Escape → dismisses modal → `stack: []`

---

## Verification

```bash
npm run dev     # Visual check
npm run check   # TypeScript
```

Manual tests:
- Open modal → press Escape → modal closes
- Open sidebar → press Escape → sidebar closes
- Open dropdown → press Escape → dropdown closes, focus returns to trigger
- Open modal → open dropdown inside it → press Escape → only dropdown closes
- Press Escape again → modal closes
- Open modal → open sidebar → press Escape → sidebar closes first
- Verify EditField Escape still cancels editing without closing parent modal
