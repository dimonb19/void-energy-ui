/* Centralized Escape key dismissal stack.
 * Each dismissible surface (modal, dropdown, sidebar) pushes a layer when it opens
 * and removes it when it closes. Escape pops the topmost layer (LIFO).
 *
 * On Chromium/Firefox each layer also gets a CloseWatcher to handle the Android
 * Back button. Esc keypresses stay owned by the document keydown listener;
 * keydown.preventDefault suppresses CloseWatcher.close, so the watcher only
 * fires for the Back-button case. Safari falls back to keydown-only. */

type DismissCallback = () => void;

interface Layer {
  id: number;
  dismiss: DismissCallback;
  watcher?: CloseWatcher;
}

let nextId = 0;

const supportsCloseWatcher =
  typeof window !== 'undefined' && 'CloseWatcher' in window;

class LayerStack {
  // Plain array — avoids creating reactive dependencies when push/remove
  // are called inside component $effects.
  private stack: Layer[] = [];

  /** Push a dismissible layer. Returns the layer ID (used to remove it later). */
  push(dismiss: DismissCallback): number {
    const id = nextId++;
    const layer: Layer = { id, dismiss };

    if (supportsCloseWatcher) {
      const watcher = new CloseWatcher();
      watcher.addEventListener('close', () => this.popById(id));
      layer.watcher = watcher;
    }

    this.stack.push(layer);
    this.syncListener();
    return id;
  }

  /** Remove a layer by ID. Safe to call with stale/already-removed IDs. */
  remove(id: number): void {
    const layer = this.stack.find((l) => l.id === id);
    this.destroyWatcher(layer);
    this.stack = this.stack.filter((l) => l.id !== id);
    this.syncListener();
  }

  /** Clears all layers without invoking dismiss callbacks. */
  clear(): void {
    for (const layer of this.stack) this.destroyWatcher(layer);
    this.stack = [];
    this.syncListener();
  }

  /** Whether the stack has any layers. */
  get hasLayers(): boolean {
    return this.stack.length > 0;
  }

  // ── Internal ───────────────────────────────────────────────────────

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
    this.destroyWatcher(top);
    this.syncListener();
    top.dismiss();
  };

  // Pop a specific layer by id (invoked by CloseWatcher.close on Back press).
  // The watcher self-destroys after close fires; no manual destroy needed.
  private popById(id: number): void {
    const idx = this.stack.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const [layer] = this.stack.splice(idx, 1);
    this.syncListener();
    layer.dismiss();
  }

  private destroyWatcher(layer: Layer | undefined): void {
    if (!layer?.watcher) return;
    try {
      layer.watcher.destroy();
    } catch {
      /* idempotent — already destroyed by close event */
    }
  }
}

export const layerStack = new LayerStack();
