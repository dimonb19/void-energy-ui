import { UI_MODALS } from '../config/constants';

// Define the valid keys based on our constant
type ModalID = (typeof UI_MODALS)[keyof typeof UI_MODALS];

export interface ModalOptions {
  title?: string;
  body?: string;
  confirmText?: string;
  cancelText?: string;
  cost?: number;
  type?: ModalID;
  size?: 'sm' | 'md' | 'lg' | 'full';
  placeholder?: string;
  inputValue?: string;
}

class ModalManager {
  activeId = $state<string | null>(null);
  options = $state<ModalOptions>({});

  private resolvePromise: ((value: any) => void) | null = null;
  private previousActiveElement: HTMLElement | null = null;

  open<T = any>(id: string, config: ModalOptions = {}): Promise<T | null> {
    if (this.activeId) this.close(null);

    if (typeof document !== 'undefined') {
      this.previousActiveElement = document.activeElement as HTMLElement;
    }

    this.activeId = id;
    this.options = config;
    return new Promise((resolve) => {
      this.resolvePromise = resolve;
    });
  }

  close(result: any) {
    if (this.resolvePromise) this.resolvePromise(result);
    this.activeId = null;
    this.options = {};
    this.resolvePromise = null;
    if (this.previousActiveElement) {
      this.previousActiveElement.focus();
      this.previousActiveElement = null;
    }
  }

  // --- HELPERS (Now Type-Safe) ---

  async confirm(title: string, body: string, cost = 0): Promise<boolean> {
    const result = await this.open<boolean>(UI_MODALS.CONFIRM, {
      title,
      body,
      cost,
      size: 'sm',
    });
    return result ?? false;
  }

  async prompt(title: string, placeholder = ''): Promise<string | null> {
    return this.open<string>(UI_MODALS.INPUT, {
      title,
      placeholder,
      size: 'md',
      confirmText: 'Submit',
    });
  }
}

export const modal = new ModalManager();
