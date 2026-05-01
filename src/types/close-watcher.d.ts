interface CloseWatcher extends EventTarget {
  requestClose(): void;
  close(): void;
  destroy(): void;
  oncancel: ((this: CloseWatcher, ev: Event) => unknown) | null;
  onclose: ((this: CloseWatcher, ev: Event) => unknown) | null;
}

interface CloseWatcherConstructor {
  prototype: CloseWatcher;
  new (options?: { signal?: AbortSignal }): CloseWatcher;
}

declare const CloseWatcher: CloseWatcherConstructor;

interface Window {
  CloseWatcher?: CloseWatcherConstructor;
}
