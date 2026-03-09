<script lang="ts">
  import { ArrowDown, ArrowUp, GripVertical } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import {
    draggable,
    dropTarget,
    reorderByDrop,
    type DropDetail,
  } from '@actions/drag';
  import { live } from '@lib/transitions.svelte';

  interface ListItem {
    id: string;
    label: string;
  }

  const initialItems: ListItem[] = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
    { id: 'd', label: 'Delta' },
    { id: 'e', label: 'Epsilon' },
  ];

  let sortableItems = $state<ListItem[]>([...initialItems]);

  const sortableOrder = $derived(
    sortableItems.map((item) => item.label).join(' / '),
  );

  function handleSortDrop(detail: DropDetail): void {
    sortableItems = reorderByDrop(sortableItems, detail);
  }

  function moveSortableItem(id: string, direction: -1 | 1): void {
    const fromIndex = sortableItems.findIndex((item) => item.id === id);
    if (fromIndex === -1) return;

    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= sortableItems.length) return;

    const next = [...sortableItems];
    const [moved] = next.splice(fromIndex, 1);
    if (!moved) return;

    next.splice(toIndex, 0, moved);
    sortableItems = next;
  }

  function resetSortable(): void {
    sortableItems = [...initialItems];
  }

  interface CardItem {
    id: string;
    label: string;
  }

  const initialZoneA: CardItem[] = [
    { id: 'card-1', label: 'Task A' },
    { id: 'card-2', label: 'Task B' },
    { id: 'card-3', label: 'Task C' },
  ];

  let zoneA = $state<CardItem[]>([...initialZoneA]);
  let zoneB = $state<CardItem[]>([]);

  function handleZoneDrop(targetZone: 'a' | 'b', detail: DropDetail): void {
    const card = detail.data as CardItem;

    if (targetZone === 'b') {
      zoneA = zoneA.filter((item) => item.id !== card.id);
      if (!zoneB.find((item) => item.id === card.id)) {
        zoneB = [...zoneB, card];
      }
      return;
    }

    zoneB = zoneB.filter((item) => item.id !== card.id);
    if (!zoneA.find((item) => item.id === card.id)) {
      zoneA = [...zoneA, card];
    }
  }

  function resetZones(): void {
    zoneA = [...initialZoneA];
    zoneB = [];
  }
</script>

<section id="drag-and-drop" class="flex flex-col gap-md">
  <h2>16 // DRAG & DROP</h2>

  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Custom drag-and-drop for real UI work: explicit sortable insertion,
      keyboard parity, pointer-safe handles, and finished physics states.
      Sortable drops expose <code>targetId</code> +
      <code>position</code>, so reorder logic stays in reactive data instead of
      DOM queries.
    </p>

    <div class="flex flex-col gap-sm">
      <div class="flex flex-col gap-xs">
        <h5>Sortable List</h5>
        <p class="text-small text-mute">
          Each item is both <code>use:draggable</code> and
          <code>use:dropTarget</code> with <code>mode: 'between'</code>. Drag
          from the handle, drop before or after a sibling, or use the move
          buttons as a non-drag alternative.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-wrap items-center justify-between gap-md">
          <ActionBtn
            icon={Restart}
            text="Reset"
            size="sm"
            onclick={resetSortable}
          />

          <p class="text-caption text-mute">
            Current order:
            <span class="text-dim">{sortableOrder}</span>
          </p>
        </div>

        <ol
          class="flex flex-col gap-md list-none m-0 p-0"
          aria-label="Sortable demo list"
        >
          {#each sortableItems as item, index (item.id)}
            <li
              class="drag-sort-item surface-glass p-sm px-md"
              aria-label={item.label}
              use:draggable={{
                id: item.id,
                group: 'sortable',
                data: item,
                handle: '[data-drag-handle]',
              }}
              use:dropTarget={{
                id: item.id,
                group: 'sortable',
                mode: 'between',
                axis: 'vertical',
                onDrop: handleSortDrop,
              }}
              animate:live
            >
              <div
                class="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-md"
              >
                <button
                  class="btn-icon shrink-0"
                  type="button"
                  data-drag-handle
                  aria-label={`Drag ${item.label}`}
                  title={`Drag ${item.label}`}
                >
                  <GripVertical class="icon" data-size="sm" />
                </button>

                <div class="min-w-0 flex flex-col gap-xs">
                  <span class="text-small font-medium">{item.label}</span>
                  <span class="text-caption text-mute">
                    Enter to pick up, arrows to choose a destination, Enter to
                    drop.
                  </span>
                </div>

                <div
                  class="inline-flex items-center gap-xs"
                  aria-label={`${item.label} move controls`}
                >
                  <button
                    class="btn-icon"
                    type="button"
                    aria-label={`Move ${item.label} up`}
                    title={`Move ${item.label} up`}
                    onclick={() => moveSortableItem(item.id, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp class="icon" data-size="sm" />
                  </button>

                  <button
                    class="btn-icon"
                    type="button"
                    aria-label={`Move ${item.label} down`}
                    title={`Move ${item.label} down`}
                    onclick={() => moveSortableItem(item.id, 1)}
                    disabled={index === sortableItems.length - 1}
                  >
                    <ArrowDown class="icon" data-size="sm" />
                  </button>
                </div>
              </div>
            </li>
          {/each}
        </ol>
      </div>

      <p class="text-caption text-mute px-xs">
        Sortable items no longer rely on <code>querySelector</code> against
        transient hover state. Use <code>reorderByDrop(items, detail)</code>
        with the emitted <code>targetId</code> and <code>position</code>.
      </p>
    </div>

    <div class="flex flex-col gap-sm">
      <div class="flex flex-col gap-xs">
        <h5>Drag Between Zones</h5>
        <p class="text-small text-mute">
          Zone containers use the default <code>inside</code> drop mode, so the detail
          represents a direct transfer rather than before/after insertion.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <ActionBtn icon={Restart} text="Reset" size="sm" onclick={resetZones} />

        <div class="grid grid-cols-1 gap-md md:grid-cols-2">
          <div
            class="drag-zone surface-glass flex flex-col gap-md p-lg"
            aria-label="Zone A"
            use:dropTarget={{
              group: 'zones',
              onDrop: (detail) => handleZoneDrop('a', detail),
            }}
          >
            <div class="flex items-center justify-between gap-sm">
              <h6 class="text-small text-dim">Zone A</h6>
              <span class="text-caption text-mute">{zoneA.length} cards</span>
            </div>

            <div class="flex flex-1 flex-col gap-sm">
              {#each zoneA as card (card.id)}
                <div
                  class="drag-zone-card surface-sunk p-md cursor-grab"
                  aria-label={card.label}
                  use:draggable={{
                    id: card.id,
                    group: 'zones',
                    data: card,
                  }}
                  animate:live
                >
                  <span class="text-small font-medium">{card.label}</span>
                </div>
              {/each}

              {#if zoneA.length === 0}
                <p class="drag-zone-empty grid place-items-center">
                  Drop cards here
                </p>
              {/if}
            </div>
          </div>

          <div
            class="drag-zone surface-glass flex flex-col gap-md p-lg"
            aria-label="Zone B"
            use:dropTarget={{
              group: 'zones',
              onDrop: (detail) => handleZoneDrop('b', detail),
            }}
          >
            <div class="flex items-center justify-between gap-sm">
              <h6 class="text-small text-dim">Zone B</h6>
              <span class="text-caption text-mute">{zoneB.length} cards</span>
            </div>

            <div class="flex flex-1 flex-col gap-sm">
              {#each zoneB as card (card.id)}
                <div
                  class="drag-zone-card surface-sunk p-md cursor-grab"
                  aria-label={card.label}
                  use:draggable={{
                    id: card.id,
                    group: 'zones',
                    data: card,
                  }}
                  animate:live
                >
                  <span class="text-small font-medium">{card.label}</span>
                </div>
              {/each}

              {#if zoneB.length === 0}
                <p class="drag-zone-empty grid place-items-center">
                  Drop cards here
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Containers use <code>use:dropTarget</code> with the default
        <code>inside</code> mode. Cards keep the interaction lightweight: pointer
        drag, keyboard pickup, and transfer on drop.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import &#123; draggable, dropTarget, reorderByDrop &#125; from '@actions/drag';
  import &#123; live &#125; from '@lib/transitions.svelte';

  function handleReorder(detail) &#123;
    items = reorderByDrop(items, detail);
  &#125;
&lt;/script&gt;

&lt;ol&gt;
  &#123;#each items as item (item.id)&#125;
    &lt;li
      use:draggable=&#123;&#123;
        id: item.id,
        group: 'list',
        data: item,
        handle: '[data-drag-handle]'
      &#125;&#125;
      use:dropTarget=&#123;&#123;
        id: item.id,
        group: 'list',
        mode: 'between',
        axis: 'vertical',
        onDrop: handleReorder
      &#125;&#125;
      animate:live
    &gt;
      &lt;button type="button" data-drag-handle&gt;Drag&lt;/button&gt;
      &#123;item.label&#125;
    &lt;/li&gt;
  &#123;/each&#125;
&lt;/ol&gt;</code
        ></pre>
    </details>
  </div>
</section>
