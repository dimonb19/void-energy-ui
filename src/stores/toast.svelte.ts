/* Toast notification state manager. */

class ToastStore {
  // Reactive toast queue for rendering.
  items = $state<VoidToastItem[]>([]);

  // Timer registry for auto-dismiss toasts.
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * Main entry point. Shows a toast of a specific type.
   * @param message - Trusted internal string (supports HTML). ⚠️ NO USER INPUT.
   * @param type - 'info' | 'success' | 'error' | 'warning' | 'loading'
   */
  show(message: string, type: VoidToastType = 'info', duration = 4000) {
    const id = Date.now();

    // Queue immediately, then schedule auto-dismiss unless it's a manual state.
    this.items.push({ id, message, type });

    if (type !== 'loading') {
      const timer = setTimeout(() => {
        this.close(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  /**
   * Removes a specific toast by ID.
   */
  close(id: number) {
    // Clear any pending timer to avoid leaks.
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    // Remove from the queue.
    this.items = this.items.filter((t) => t.id !== id);
  }

  /**
   * Force clears all active toasts.
   */
  clearAll() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
    this.items = [];
  }
}

export const toast = new ToastStore();
