import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import { layerStack } from '@lib/layer-stack.svelte';
import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
import { toast } from '@stores/toast.svelte';

class ResizeObserverMock {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

if (!('ResizeObserver' in globalThis)) {
  Object.defineProperty(globalThis, 'ResizeObserver', {
    value: ResizeObserverMock,
    configurable: true,
    writable: true,
  });
}

if (!('requestAnimationFrame' in globalThis)) {
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    value: (callback: FrameRequestCallback) =>
      setTimeout(() => callback(performance.now()), 0),
    configurable: true,
    writable: true,
  });
}

if (!('cancelAnimationFrame' in globalThis)) {
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    value: (id: number) => clearTimeout(id),
    configurable: true,
    writable: true,
  });
}

if (!('showPopover' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    value(this: HTMLElement) {
      this.setAttribute('data-popover-open', 'true');
    },
    configurable: true,
    writable: true,
  });
}

if (!('hidePopover' in HTMLElement.prototype)) {
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    value(this: HTMLElement) {
      this.removeAttribute('data-popover-open');
    },
    configurable: true,
    writable: true,
  });
}

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
    configurable: true,
    writable: true,
  });

  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
    configurable: true,
  });

  Object.defineProperty(document, 'execCommand', {
    value: vi.fn(() => true),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  cleanup();
  toast.clearAll();
  layerStack.clear();
  shortcutRegistry.clear();
  localStorage.clear();

  const root = document.documentElement;
  root.style.cssText = '';
  root.removeAttribute('data-atmosphere');
  root.removeAttribute('data-physics');
  root.removeAttribute('data-mode');
  root.removeAttribute('data-auth');

  document.head.innerHTML = '';
  document.body.innerHTML = '';

  vi.restoreAllMocks();
});
