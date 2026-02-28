/* Keyboard shortcut registry. Document-level keydown handler with input guards. */

import { modal } from '@lib/modal-manager.svelte';

class ShortcutRegistry {
  /** Reactive list of all registered shortcuts (consumed by ShortcutsFragment). */
  entries = $state<VoidShortcutEntry[]>([]);

  /** Internal map for O(1) key lookup during handle(). */
  private map = new Map<string, VoidShortcutEntry>();

  /** Track whether the document listener is attached. */
  private listening = false;

  // ── Public API ──────────────────────────────────────────────────────

  /**
   * Registers a keyboard shortcut.
   * Conflict detection: warns on duplicate key, last-write-wins.
   */
  register(entry: VoidShortcutEntry) {
    if (this.map.has(entry.key)) {
      console.warn(
        `Void: Shortcut "${entry.key}" already registered ("${this.map.get(entry.key)!.label}"). Overwriting with "${entry.label}".`,
      );
      this.entries = this.entries.filter((e) => e.key !== entry.key);
    }

    this.map.set(entry.key, entry);
    this.entries.push(entry);
    this.ensureListener();
  }

  /**
   * Unregisters a shortcut by key.
   */
  unregister(key: string) {
    this.map.delete(key);
    this.entries = this.entries.filter((e) => e.key !== key);
  }

  /**
   * Handles a keyboard event. Called by the document-level listener.
   * Applies all safety guards before dispatching to the matching shortcut.
   */
  handle(e: KeyboardEvent) {
    // Guard: skip when focus is inside editable elements
    const tag = (e.target as HTMLElement)?.tagName;
    if (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      (e.target as HTMLElement)?.isContentEditable
    )
      return;

    // Guard: skip when any modifier is held (don't conflict with browser shortcuts)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Guard: skip when a modal is open (modal has its own keyboard handling)
    if (modal.state.key) return;

    // Dispatch
    const entry = this.map.get(e.key);
    if (entry) {
      e.preventDefault();
      entry.action();
    }
  }

  // ── Grouped entries (getter for ShortcutsFragment) ──────────────────

  /**
   * Returns entries grouped by their `group` field, preserving registration order.
   */
  get grouped(): { group: string; items: VoidShortcutEntry[] }[] {
    const map = new Map<string, VoidShortcutEntry[]>();
    for (const entry of this.entries) {
      const list = map.get(entry.group);
      if (list) list.push(entry);
      else map.set(entry.group, [entry]);
    }
    return Array.from(map, ([group, items]) => ({ group, items }));
  }

  // ── Listener lifecycle ──────────────────────────────────────────────

  private ensureListener() {
    if (this.listening || typeof document === 'undefined') return;
    document.addEventListener('keydown', this.boundHandle);
    this.listening = true;
  }

  /** Bound reference for addEventListener. */
  private boundHandle = (e: KeyboardEvent) => this.handle(e);
}

export const shortcutRegistry = new ShortcutRegistry();
