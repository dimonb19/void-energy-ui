<script lang="ts">
  import { modal } from '@lib/modal-manager.svelte';
  import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
  import SearchField from '@components/ui/SearchField.svelte';
  import { morph } from '@actions/morph';

  // ── Data Sources ──────────────────────────────────────────────────────

  interface PaletteItem {
    id: string;
    label: string;
    group: string;
    hint?: string;
    action: () => void;
  }

  const pages: PaletteItem[] = [
    {
      id: 'page-home',
      label: 'Home',
      group: 'Pages',
      hint: '/',
      action: () => navigate('/'),
    },
    {
      id: 'page-components',
      label: 'Components',
      group: 'Pages',
      hint: '/components',
      action: () => navigate('/components'),
    },
    {
      id: 'page-kinetic-text',
      label: 'Kinetic Text',
      group: 'Pages',
      hint: '/kinetic-text',
      action: () => navigate('/kinetic-text'),
    },
    {
      id: 'page-conexus',
      label: 'CoNexus',
      group: 'Pages',
      hint: '/conexus',
      action: () => navigate('/conexus'),
    },
  ];

  function navigate(path: string) {
    modal.close();
    window.location.href = path;
  }

  // Build unified command list from all sources
  let allItems = $derived.by(() => {
    const shortcutItems: PaletteItem[] = shortcutRegistry.entries
      .filter((e) => !(e.key === 'k' && e.modifier === 'meta'))
      .map((entry) => ({
        id: `shortcut-${entry.key}`,
        label: entry.label,
        group: entry.group,
        hint: entry.modifier
          ? `${entry.modifier === 'meta' ? '⌘' : '⌥'}${entry.key.toUpperCase()}`
          : entry.key.toUpperCase(),
        action: () => {
          modal.close();
          entry.action();
        },
      }));

    return [...shortcutItems, ...pages];
  });

  // ── Search ────────────────────────────────────────────────────────────

  let query = $state('');

  let filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q) ||
        (item.hint && item.hint.toLowerCase().includes(q)),
    );
  });

  let grouped = $derived.by(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group);
      if (list) list.push(item);
      else map.set(item.group, [item]);
    }
    return Array.from(map, ([group, items]) => ({ group, items }));
  });

  // ── Keyboard Navigation ───────────────────────────────────────────────

  let activeIndex = $state(0);
  let itemRefs = $state<HTMLButtonElement[]>([]);

  // Reset index when results change
  $effect(() => {
    void filtered.length;
    activeIndex = 0;
  });

  function handleKeydown(e: KeyboardEvent) {
    if (filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % filtered.length;
      itemRefs[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
      itemRefs[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      filtered[activeIndex]?.action();
    } else if (e.key === 'Home') {
      e.preventDefault();
      activeIndex = 0;
      itemRefs[0]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'End') {
      e.preventDefault();
      activeIndex = filtered.length - 1;
      itemRefs[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }
</script>

<div
  use:morph={{ width: false }}
  class="modal-content command-palette"
  onclick={(e) => e.stopPropagation()}
  role="presentation"
  onkeydown={handleKeydown}
>
  <h2 id="palette-title" class="sr-only">Command Palette</h2>

  <!-- Search Input -->
  <SearchField
    bind:value={query}
    placeholder="Type a command..."
    autofocus
    role="combobox"
    aria-expanded="true"
    aria-controls="palette-list"
    aria-activedescendant={filtered[activeIndex]
      ? `palette-item-${filtered[activeIndex].id}`
      : undefined}
    aria-label="Command palette"
  />

  <!-- Results List -->
  <div
    id="palette-list"
    class="palette-results surface-sunk"
    role="listbox"
    aria-label="Commands"
  >
    {#if filtered.length === 0}
      <p class="text-mute text-center p-lg">No matching commands</p>
    {:else}
      {#each grouped as { group, items }}
        <div class="palette-group" role="group" aria-label={group}>
          <span class="palette-group-label text-mute">{group}</span>
          {#each items as item}
            {@const globalIndex = filtered.indexOf(item)}
            <button
              bind:this={itemRefs[globalIndex]}
              id="palette-item-{item.id}"
              class="btn-ghost flex flex-row items-center justify-between w-full"
              type="button"
              role="option"
              tabindex="-1"
              aria-selected={globalIndex === activeIndex}
              data-state={globalIndex === activeIndex ? 'active' : ''}
              onclick={() => item.action()}
              onpointerenter={() => (activeIndex = globalIndex)}
            >
              <span>{item.label}</span>
              {#if item.hint}
                <kbd>{item.hint}</kbd>
              {/if}
            </button>
          {/each}
        </div>
      {/each}
    {/if}
  </div>
</div>
