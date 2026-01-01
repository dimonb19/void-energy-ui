/*
 * ROLE: Modal State Machine (Singleton)
 * RESPONSIBILITY: Manages the lifecycle of dialogs and handles the Promise-based return values.
 */

export interface ModalOptions {
  title?: string;
  body?: string;
  confirmText?: string;
  cancelText?: string;
  cost?: number;
  type?: 'alert' | 'confirm' | 'input'; // Added 'input' for the example below
  size?: 'sm' | 'md' | 'lg' | 'full';
  placeholder?: string;
  inputValue?: string;
}

class ModalManager {
  // 1. Reactive State (The Truth)
  activeId = $state<string | null>(null);
  options = $state<ModalOptions>({});

  // 2. Internal Mechanics
  private resolvePromise: ((value: any) => void) | null = null;
  // We don't strictly need rejectPromise for UI flows usually, resolving null/false is safer
  private previousActiveElement: HTMLElement | null = null;

  // 3. The Public API

  /**
   * Opens a modal and waits for the user's decision.
   */
  open<T = any>(id: string, config: ModalOptions = {}): Promise<T | null> {
    if (this.activeId) {
      this.close(null);
    }

    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement;
    }

    this.activeId = id;
    this.options = config;

    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  /**
   * Closes the modal and returns data to the caller.
   */
  close(result: any) {
    if (this.resolvePromise) {
      this.resolvePromise(result);
    }

    this.activeId = null;
    this.options = {};
    this.resolvePromise = null;

    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  /**
   * Helper: Quickly trigger the standard "Confirm" modal.
   * We await the result and default to 'false' if null is returned.
   */
  async confirm(title: string, body: string, cost = 0): Promise<boolean> {
    const result = await this.open<boolean>('confirm', {
      title,
      body,
      cost,
      size: 'sm', // Default confirms to small
    });
    return result ?? false;
  }

  /**
   * Helper: Quickly trigger the standard "Alert" modal.
   */
  async prompt(title: string, placeholder = ''): Promise<string | null> {
    return this.open<string>('input', {
      title,
      placeholder,
      size: 'md', // Inputs get standard breathing room
      confirmText: 'Submit',
    });
  }
}

export const modal = new ModalManager();
