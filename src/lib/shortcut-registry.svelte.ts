/* Keyboard shortcut registry. Document-level keydown handler with input guards. */

import { layerStack } from '@lib/layer-stack.svelte';

function serializeShortcut(
  key: string,
  modifier?: VoidShortcutEntry['modifier'],
) {
  return modifier ? `${modifier}:${key}` : key;
}

function formatShortcut(key: string, modifier?: VoidShortcutEntry['modifier']) {
  return modifier ? `${modifier}+${key}` : key;
}

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
    const shortcutId = serializeShortcut(entry.key, entry.modifier);

    if (this.map.has(shortcutId)) {
      console.warn(
        `Void: Shortcut "${formatShortcut(entry.key, entry.modifier)}" already registered ("${this.map.get(shortcutId)!.label}"). Overwriting with "${entry.label}".`,
      );
      this.entries = this.entries.filter(
        (e) => serializeShortcut(e.key, e.modifier) !== shortcutId,
      );
    }

    this.map.set(shortcutId, entry);
    this.entries.push(entry);
    this.syncListener();
  }

  /**
   * Unregisters a shortcut by key.
   */
  unregister(key: string, modifier?: VoidShortcutEntry['modifier']) {
    const shortcutId = serializeShortcut(key, modifier);
    this.map.delete(shortcutId);
    this.entries = this.entries.filter(
      (e) => serializeShortcut(e.key, e.modifier) !== shortcutId,
    );
    this.syncListener();
  }

  /**
   * Clears all registered shortcuts.
   * Useful for test isolation and predictable teardown.
   */
  clear() {
    this.map.clear();
    this.entries = [];
    this.syncListener();
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
      tag === 'SELECT' ||
      tag === 'TEXTAREA' ||
      (e.target as HTMLElement)?.isContentEditable
    )
      return;

    // Phase 1: Modifier combos (Cmd+K, Alt+X, etc.)
    if (e.metaKey || e.ctrlKey || e.altKey) {
      if (layerStack.hasLayers) return;
      // Normalize: treat metaKey and ctrlKey both as 'meta' (cross-platform)
      const mod: 'meta' | 'alt' = e.metaKey || e.ctrlKey ? 'meta' : 'alt';
      const entry = this.map.get(serializeShortcut(e.key, mod));
      if (entry) {
        e.preventDefault();
        entry.action();
      }
      return;
    }

    // Phase 2: Plain single-key shortcuts (original behavior)
    if (layerStack.hasLayers) return;
    const entry = this.map.get(serializeShortcut(e.key));
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

  private syncListener() {
    if (typeof document === 'undefined') return;

    if (this.map.size > 0 && !this.listening) {
      document.addEventListener('keydown', this.boundHandle, { capture: true });
      this.listening = true;
      return;
    }

    if (this.map.size === 0 && this.listening) {
      document.removeEventListener('keydown', this.boundHandle, {
        capture: true,
      });
      this.listening = false;
    }
  }

  /** Bound reference for addEventListener. */
  private boundHandle = (e: KeyboardEvent) => this.handle(e);
}

export const shortcutRegistry = new ShortcutRegistry();
