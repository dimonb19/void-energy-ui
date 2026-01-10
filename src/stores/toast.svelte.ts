/* Toast notification state manager. */

class ToastStore {
  // Reactive toast queue for rendering.
  items = $state<VoidToastItem[]>([]);

  // Timer registry for auto-dismiss toasts.
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  // Counter to ensure unique IDs even within the same millisecond.
  private counter = 0;

  /**
   * Main entry point. Shows a toast of a specific type.
   * @param message - Trusted internal string (supports HTML). ⚠️ NO USER INPUT.
   * @param type - 'info' | 'success' | 'error' | 'warning' | 'loading'
   */
  show(message: string, type: VoidToastType = 'info', duration = 4000) {
    const id = Date.now() * 1000 + (this.counter++ % 1000);

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
   * Transitions an existing toast to a new type with optional message update.
   * Schedules auto-dismiss for non-loading types.
   */
  private transition(
    id: number,
    message: string,
    type: VoidToastType,
    duration: number,
  ) {
    const item = this.items.find((t) => t.id === id);
    if (!item) return;

    item.message = message;
    item.type = type;

    const timer = setTimeout(() => this.close(id), duration);
    this.timers.set(id, timer);
  }

  /**
   * Shows a loading toast and returns a controller for managing it.
   * Loading toasts persist until explicitly resolved via the controller.
   *
   * @example
   * const loader = toast.loading('Processing...');
   * loader.update('Step 2...');
   * loader.success('Done!');
   */
  loading(message: string): VoidLoadingToastController {
    const id = this.show(message, 'loading');
    let closed = false;

    return {
      id,
      update: (msg: string) => {
        if (closed) return;
        const item = this.items.find((t) => t.id === id);
        if (item) item.message = msg;
      },
      success: (msg?: string, duration = 4000) => {
        if (closed) return;
        closed = true;
        this.transition(id, msg ?? message, 'success', duration);
      },
      error: (msg?: string, duration = 4000) => {
        if (closed) return;
        closed = true;
        this.transition(id, msg ?? message, 'error', duration);
      },
      warning: (msg?: string, duration = 4000) => {
        if (closed) return;
        closed = true;
        this.transition(id, msg ?? message, 'warning', duration);
      },
      close: () => {
        if (closed) return;
        closed = true;
        this.close(id);
      },
    };
  }

  /**
   * Wraps a promise with automatic loading → success/error transitions.
   * Re-throws the error if the promise rejects.
   *
   * @example
   * const data = await toast.promise(fetchData(), {
   *   loading: 'Fetching...',
   *   success: (data) => `Loaded ${data.length} items`,
   *   error: 'Failed to load',
   * });
   */
  async promise<T>(
    promise: Promise<T>,
    messages: VoidPromiseMessages<T>,
    duration = 4000,
  ): Promise<T> {
    const id = this.show(messages.loading, 'loading');

    try {
      const result = await promise;
      const msg =
        typeof messages.success === 'function'
          ? messages.success(result)
          : messages.success;
      this.transition(id, msg, 'success', duration);
      return result;
    } catch (err) {
      const msg =
        typeof messages.error === 'function'
          ? messages.error(err)
          : messages.error;
      this.transition(id, msg, 'error', duration);
      throw err;
    }
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
