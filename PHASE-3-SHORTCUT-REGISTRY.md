# Phase 3 — Keyboard Shortcut Registry

Replace hardcoded keyboard shortcuts with a centralized registry that other components can register into, with dynamic rendering in the shortcuts modal.

---

## Problem

Navigation.svelte has 3 hardcoded shortcuts in a `switch` statement (lines 151-163). ShortcutsFragment is a static `<dl>` with those same 3 entries hardcoded as HTML (no data source). There's no way for other components to register shortcuts, no conflict detection, and the modal doesn't reflect actual registered shortcuts.

---

## Files

- **New:** `src/lib/shortcut-registry.svelte.ts` — singleton registry
- `src/components/Navigation.svelte` (lines 135-165) — keydown handler to refactor
- `src/components/modals/ShortcutsFragment.svelte` (lines 1-33) — static modal to make dynamic

---

## Design

### Registry Singleton

```typescript
// src/lib/shortcut-registry.svelte.ts

interface ShortcutEntry {
  key: string;         // The key to match (e.g., 'f', 't', '?')
  label: string;       // Human-readable description
  group: string;       // Category for display grouping (e.g., 'Navigation', 'Editor')
  callback: () => void;
}
```

**API:**
- `register(entry: ShortcutEntry)` — adds a shortcut; warns on duplicate key
- `unregister(key: string)` — removes by key
- `entries` — reactive `$state` array of all registered shortcuts
- `handle(event: KeyboardEvent)` — looks up key, calls callback, prevents default

**Conflict detection:** `register()` checks if the key is already taken. If so, `console.warn` with both labels. Does NOT throw — last-write-wins with a warning.

**Input guard:** The `handle()` method includes the same guards currently in Navigation.svelte: skip if target is INPUT/TEXTAREA/contentEditable, skip if modifier keys held, skip if modal is open.

### Migration

1. Create the registry singleton
2. In Navigation.svelte: replace the `switch` statement with 3 `register()` calls (in `$effect` or at module level)
3. Remove the `onkeydown` handler body — replace with `shortcutRegistry.handle(e)` or register a single document-level listener in the registry itself
4. In ShortcutsFragment: import `shortcutRegistry.entries`, render dynamically grouped by `group`

### ShortcutsFragment Dynamic Rendering

```svelte
<script lang="ts">
  import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
  import { modal } from '@lib/modal-manager.svelte';

  // Group entries by their group property
  const grouped = $derived(
    shortcutRegistry.entries.reduce((acc, entry) => {
      (acc[entry.group] ??= []).push(entry);
      return acc;
    }, {} as Record<string, typeof shortcutRegistry.entries>)
  );
</script>

{#each Object.entries(grouped) as [group, shortcuts]}
  <h4>{group}</h4>
  <dl class="surface-sunk p-md flex flex-col gap-md">
    {#each shortcuts as shortcut}
      <div class="flex flex-row items-center justify-between">
        <dt class="text-dim">{shortcut.label}</dt>
        <dd><kbd>{shortcut.key.toUpperCase()}</kbd></dd>
      </div>
    {/each}
  </dl>
{/each}
```

---

## Listener Strategy Decision

Two approaches for the global keydown listener:

**Option A: Registry owns the listener**
- Registry adds `document.addEventListener('keydown', handle)` on init
- Navigation.svelte just calls `register()`, no keydown handler needed
- Cleaner separation, single listener

**Option B: Navigation still owns the listener**
- Navigation.svelte keeps `<svelte:window onkeydown={...}>` but calls `shortcutRegistry.handle(e)`
- Registry is passive (just a data store + lookup)
- Simpler migration

Recommend **Option A** — the registry should own the listener since it owns the shortcut data. Navigation.svelte becomes purely a registration site.

---

## Verification

```bash
npm run dev     # Visual check: shortcuts modal shows dynamic list
npm run check   # TypeScript
```

Manual tests:
- Press `?` — modal should show all registered shortcuts dynamically
- Press `f` — fullscreen should still work
- Press `t` — themes modal should still open
- Register a duplicate key in dev console — should see console.warn
- Verify input/textarea still doesn't trigger shortcuts
