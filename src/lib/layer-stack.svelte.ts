/* Centralized Escape key dismissal stack.
 * Each dismissible surface (modal, dropdown, sidebar) pushes a layer when it opens
 * and removes it when it closes. Escape pops the topmost layer (LIFO). */

type DismissCallback = () => void;

interface Layer {
  id: number;
  dismiss: DismissCallback;
}

let nextId = 0;

class LayerStack {
  // Plain array — avoids creating reactive dependencies when push/remove
  // are called inside component $effects.
  private stack: Layer[] = [];

  /** Push a dismissible layer. Returns the layer ID (used to remove it later). */
  push(dismiss: DismissCallback): number {
    const id = nextId++;
    this.stack.push({ id, dismiss });
    this.syncListener();
    return id;
  }

  /** Remove a layer by ID. Safe to call with stale/already-removed IDs. */
  remove(id: number): void {
    this.stack = this.stack.filter((layer) => layer.id !== id);
    this.syncListener();
  }

  /** Clears all layers without invoking dismiss callbacks. */
  clear(): void {
    this.stack = [];
    this.syncListener();
  }

  /** Whether the stack has any layers. */
  get hasLayers(): boolean {
    return this.stack.length > 0;
  }

  // ── Keyboard handling ──────────────────────────────────────────────

  private listening = false;

  private syncListener(): void {
    if (typeof document === 'undefined') return;

    if (this.stack.length > 0 && !this.listening) {
      document.addEventListener('keydown', this.handleKeydown);
      this.listening = true;
      return;
    }

    if (this.stack.length === 0 && this.listening) {
      document.removeEventListener('keydown', this.handleKeydown);
      this.listening = false;
    }
  }

  private handleKeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape') return;
    if (this.stack.length === 0) return;
    if (e.defaultPrevented) return;

    e.preventDefault();

    const top = this.stack.pop()!;
    this.syncListener();
    top.dismiss();
  };
}

export const layerStack = new LayerStack();
