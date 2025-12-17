/*
 * ROLE: Toast Notification State Manager
 * RESPONSIBILITY: Queues ephemeral system alerts.
 */

export type ToastType = 'info' | 'success' | 'error' | 'warning' | 'loading';

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

class ToastStore {
  // Svelte 5 Reactive State
  items = $state<ToastItem[]>([]);

  // Internal timer map to handle auto-dismissal
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  /**
   * Main entry point. Shows a toast of a specific type.
   * Usage: toast.show('Saved successfully', 'success')
   */
  show(message: string, type: ToastType = 'info', duration = 4000) {
    const id = Date.now();

    // 1. Add to the reactive stack
    this.items.push({ id, message, type });

    // 2. Set auto-dismiss timer (unless it's a loading state that needs manual closing)
    if (type !== 'loading') {
      const timer = setTimeout(() => {
        this.close(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id; // Return ID in case we need to close it manually later
  }

  /**
   * Removes a specific toast by ID.
   */
  close(id: number) {
    // 1. Clean up the timer to prevent memory leaks
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    // 2. Remove from the UI
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
