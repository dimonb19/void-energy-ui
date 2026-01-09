/* Reactive modal state manager (state-first). */

import { MODAL_KEYS } from '../config/modal-registry';

class ModalManager {
  state = $state<ModalState>({
    key: null,
    props: {},
    size: 'md',
  });

  // Focus restoration for accessibility.
  private returnFocusTo: HTMLElement | null = null;

  /**
   * Opens a modal.
   * @param key - The component key from registry
   * @param props - Data/Callbacks to pass to the component
   * @param size - Window size
   */
  open<K extends ModalKey>(
    key: K,
    props: ModalContract[K],
    size: ModalState['size'] = 'md',
  ) {
    // Capture the element that triggered the modal.
    if (typeof document !== 'undefined') {
      this.returnFocusTo = document.activeElement as HTMLElement;
    }

    this.state = { key, props, size };
  }

  /**
   * Closes the active modal.
   */
  close() {
    this.state = { key: null, props: {}, size: 'md' };

    // Restore focus after animation starts.
    if (this.returnFocusTo && typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        this.returnFocusTo?.focus();
        this.returnFocusTo = null;
      });
    }
  }

  // --- Convenience methods ---

  // Usage: modal.confirm('Delete?', 'Are you sure?', { onConfirm: () => deleteItem() })
  confirm(
    title: string,
    body: string,
    actions: { onConfirm: () => void; onCancel?: () => void; cost?: number },
  ) {
    this.open(
      MODAL_KEYS.CONFIRM,
      {
        title,
        body,
        cost: actions.cost,
        onConfirm: () => {
          actions.onConfirm();
          this.close();
        },
        onCancel: () => {
          if (actions.onCancel) actions.onCancel();
          this.close();
        },
      },
      'sm',
    );
  }

  /**
   * Shows a simple information modal.
   */
  alert(title: string, body: string) {
    this.open(
      MODAL_KEYS.ALERT,
      {
        title,
        body,
      },
      'sm',
    );
  }
}

export const modal = new ModalManager();
