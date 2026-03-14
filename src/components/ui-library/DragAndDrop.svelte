<script lang="ts">
  import { ArrowDown, ArrowUp, GripVertical } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import { draggable, dropTarget, reorderByDrop } from '@actions/drag';
  import { live, emerge, dissolve } from '@lib/transitions.svelte';

  // ── Sortable List ───────────────────────────────────────────────────────

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

    const targetId = sortableItems[toIndex]?.id;
    if (!targetId) return;

    sortableItems = reorderByDrop(sortableItems, {
      id,
      targetId,
      position: direction > 0 ? 'after' : 'before',
    });
  }

  function resetSortable(): void {
    sortableItems = [...initialItems];
  }

  // ── Kanban Zones ────────────────────────────────────────────────────────

  interface CardItem {
    id: string;
    label: string;
  }

  const initialZoneA: CardItem[] = [
    { id: 'card-1', label: 'Design Review' },
    { id: 'card-2', label: 'API Integration' },
    { id: 'card-3', label: 'Unit Tests' },
  ];

  const initialZoneB: CardItem[] = [
    { id: 'card-4', label: 'Documentation' },
    { id: 'card-5', label: 'Code Review' },
  ];

  let zoneA = $state<CardItem[]>([...initialZoneA]);
  let zoneB = $state<CardItem[]>([...initialZoneB]);

  function findCardZone(cardId: string): 'a' | 'b' | null {
    if (zoneA.some((c) => c.id === cardId)) return 'a';
    if (zoneB.some((c) => c.id === cardId)) return 'b';
    return null;
  }

  function removeFromZone(zone: 'a' | 'b', cardId: string): void {
    if (zone === 'a') zoneA = zoneA.filter((c) => c.id !== cardId);
    else zoneB = zoneB.filter((c) => c.id !== cardId);
  }

  function insertIntoZone(
    zone: 'a' | 'b',
    card: CardItem,
    targetId: string,
    position: DropPosition,
  ): void {
    const items = zone === 'a' ? [...zoneA] : [...zoneB];
    const targetIndex = items.findIndex((c) => c.id === targetId);

    if (targetIndex === -1) {
      appendToZone(zone, card);
      return;
    }

    const insertAt = position === 'after' ? targetIndex + 1 : targetIndex;
    items.splice(insertAt, 0, card);

    if (zone === 'a') zoneA = items;
    else zoneB = items;
  }

  function appendToZone(zone: 'a' | 'b', card: CardItem): void {
    if (zone === 'a') zoneA = [...zoneA, card];
    else zoneB = [...zoneB, card];
  }

  function handleKanbanDrop(detail: DropDetail): void {
    const card = detail.data as CardItem;
    const sourceZone = findCardZone(card.id);
    if (!sourceZone) return;

    if (detail.position === 'before' || detail.position === 'after') {
      // Dropped on another card — reorder or cross-zone insert
      const targetZone = findCardZone(detail.targetId!);
      if (!targetZone) return;

      if (sourceZone === targetZone) {
        // Same zone: reorder in place
        if (targetZone === 'a') {
          zoneA = reorderByDrop(zoneA, detail);
        } else {
          zoneB = reorderByDrop(zoneB, detail);
        }
      } else {
        // Cross-zone: remove from source, insert at position in target
        removeFromZone(sourceZone, card.id);
        insertIntoZone(targetZone, card, detail.targetId!, detail.position);
      }
    } else {
      // Dropped on zone container (mode: 'inside') — transfer and append
      const targetZone = detail.targetId === 'zone-a' ? 'a' : 'b';
      if (sourceZone === targetZone) return;
      removeFromZone(sourceZone, card.id);
      appendToZone(targetZone, card);
    }
  }

  function resetZones(): void {
    zoneA = [...initialZoneA];
    zoneB = [...initialZoneB];
  }
</script>

<section id="drag-and-drop" class="flex flex-col gap-md">
  <h2>20 // DRAG & DROP</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Pointer Events-based drag-and-drop with a custom ghost element,
      physics-aware visual states, full keyboard parity, and screen reader
      announcements. Not built on the HTML5 Drag and Drop API.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">Keyboard</p>
          <p class="text-small text-mute">
            <strong>Enter</strong> or <strong>Space</strong> to pick up,
            <strong>Arrow keys</strong> to cycle targets,
            <strong>Home / End</strong> to jump to first / last,
            <strong>Enter</strong> to drop, <strong>Escape</strong> to cancel.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">Screen Reader</p>
          <p class="text-small text-mute">
            An <code>aria-live</code> region announces pickup, navigation between
            targets, drop confirmation, and cancellation.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">Physics Integration</p>
          <p class="text-small text-mute">
            The ghost element adapts per physics preset: glass adds a glow and
            lift, flat uses a subtle shadow, retro uses a hard outline with an
            offset shadow. Transition speeds are read from
            <code>--speed-base</code> and <code>--ease-spring-gentle</code>. All
            feedback is disabled under <code>prefers-reduced-motion</code>.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">Sortable Insertion</p>
          <p class="text-small text-mute">
            <code>mode: 'between'</code> resolves <code>before</code> or
            <code>after</code> by comparing the pointer position to the target
            element's midpoint. A <code>::before</code> pseudo-element renders the
            insertion indicator line.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">WCAG 2.2 Compliance</p>
          <p class="text-small text-mute">
            Move buttons satisfy
            <strong>2.5.7 Dragging Movements</strong> by providing a
            single-pointer alternative. When a <code>handle</code> selector is set,
            nested interactive children (buttons, links, inputs) are automatically
            excluded from drag initiation.
          </p>
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-small text-dim font-medium">Backend Persistence</p>
          <p class="text-small text-mute">
            <code>resolveReorderByDrop(items, detail)</code> returns both the
            reordered array and a <code>ReorderRequest</code> payload with
            <code>id</code>, <code>targetId</code>, <code>position</code>,
            <code>fromIndex</code>, <code>toIndex</code>,
            <code>previousId</code>, <code>nextId</code>, and
            <code>orderedIds</code>. Use
            <code>reorderByDrop(items, detail)</code>
            when you only need the reordered array.
          </p>
        </div>
      </div>
    </details>

    <!-- Sortable List -->
    <div class="flex flex-col gap-sm">
      <div class="flex flex-col gap-xs">
        <h5>Sortable List</h5>
        <p class="text-small text-mute">
          Each item is both <code>use:draggable</code> and
          <code>use:dropTarget</code> with <code>mode: 'between'</code>. Drag
          from the grip handle, drop before or after a sibling. Move buttons
          provide a non-drag alternative for WCAG 2.5.7.
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
              class="drag-sort-item surface-raised p-md"
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
        Use <code>reorderByDrop(items, detail)</code> for local reorder, or
        <code>resolveReorderByDrop(items, detail)</code> when you also need a
        backend-ready <code>ReorderRequest</code> payload.
      </p>
    </div>

    <!-- Kanban Zones -->
    <div class="flex flex-col gap-sm">
      <div class="flex flex-col gap-xs">
        <h5>Kanban Zones</h5>
        <p class="text-small text-mute">
          Cards are sortable within each column and transferable between
          columns. Each card registers both <code>use:draggable</code> and
          <code>use:dropTarget</code> with <code>mode: 'between'</code> for
          insertion ordering. Zone containers register a second
          <code>use:dropTarget</code> with <code>mode: 'inside'</code> so empty zones
          can still accept drops.
        </p>
      </div>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <ActionBtn icon={Restart} text="Reset" size="sm" onclick={resetZones} />

        <div class="grid grid-cols-1 gap-md md:grid-cols-2">
          <div
            class="drag-zone surface-sunk flex flex-col gap-md p-lg"
            aria-label="To Do"
            use:dropTarget={{
              id: 'zone-a',
              group: 'kanban',
              onDrop: handleKanbanDrop,
            }}
          >
            <div class="flex items-center justify-between gap-sm">
              <h6 class="text-small text-dim">To Do</h6>
              <span class="text-caption text-mute">{zoneA.length} cards</span>
            </div>

            <div class="flex flex-1 flex-col gap-md">
              {#each zoneA as card (card.id)}
                <div
                  class="drag-zone-card surface-raised p-md cursor-grab"
                  aria-label={card.label}
                  use:draggable={{
                    id: card.id,
                    group: 'kanban',
                    data: card,
                  }}
                  use:dropTarget={{
                    id: card.id,
                    group: 'kanban',
                    mode: 'between',
                    axis: 'vertical',
                    onDrop: handleKanbanDrop,
                  }}
                  in:emerge
                  out:dissolve
                  animate:live
                >
                  <span class="text-small font-medium">{card.label}</span>
                </div>
              {/each}

              {#if zoneA.length === 0}
                <p
                  class="drag-zone-empty grid place-items-center"
                  in:emerge
                  out:dissolve
                >
                  Drop cards here
                </p>
              {/if}
            </div>
          </div>

          <div
            class="drag-zone surface-sunk flex flex-col gap-md p-lg"
            aria-label="Done"
            use:dropTarget={{
              id: 'zone-b',
              group: 'kanban',
              onDrop: handleKanbanDrop,
            }}
          >
            <div class="flex items-center justify-between gap-sm">
              <h6 class="text-small text-dim">Done</h6>
              <span class="text-caption text-mute">{zoneB.length} cards</span>
            </div>

            <div class="flex flex-1 flex-col gap-md">
              {#each zoneB as card (card.id)}
                <div
                  class="drag-zone-card surface-raised p-md cursor-grab"
                  aria-label={card.label}
                  use:draggable={{
                    id: card.id,
                    group: 'kanban',
                    data: card,
                  }}
                  use:dropTarget={{
                    id: card.id,
                    group: 'kanban',
                    mode: 'between',
                    axis: 'vertical',
                    onDrop: handleKanbanDrop,
                  }}
                  in:emerge
                  out:dissolve
                  animate:live
                >
                  <span class="text-small font-medium">{card.label}</span>
                </div>
              {/each}

              {#if zoneB.length === 0}
                <p
                  class="drag-zone-empty grid place-items-center"
                  in:emerge
                  out:dissolve
                >
                  Drop cards here
                </p>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Nested drop targets resolve naturally: the pointer over a card hits the
        card's <code>mode: 'between'</code> target first; over empty space it
        hits the zone's <code>mode: 'inside'</code> target. A single handler
        checks <code>detail.position</code> to distinguish reorder from transfer.
      </p>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;!-- Sortable List --&gt;
&lt;script&gt;
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
&lt;/ol&gt;

&lt;!-- Kanban (cross-zone + within-zone sorting) --&gt;
&lt;script&gt;
  // Cards: use:draggable + use:dropTarget mode:'between'
  // Zones: use:dropTarget mode:'inside' (accepts drops on empty space)

  function handleKanbanDrop(detail) &#123;
    const card = detail.data;
    const sourceZone = findCardZone(card.id);

    if (detail.position === 'before' || detail.position === 'after') &#123;
      // Dropped on a card — reorder or cross-zone insert
      const targetZone = findCardZone(detail.targetId);
      if (sourceZone === targetZone) &#123;
        zones[targetZone] = reorderByDrop(zones[targetZone], detail);
      &#125; else &#123;
        removeFromZone(sourceZone, card.id);
        insertIntoZone(targetZone, card, detail.targetId, detail.position);
      &#125;
    &#125; else &#123;
      // Dropped on zone container — transfer and append
      const targetZone = detail.targetId;
      removeFromZone(sourceZone, card.id);
      appendToZone(targetZone, card);
    &#125;
  &#125;
&lt;/script&gt;

&lt;div use:dropTarget=&#123;&#123; id: 'todo', group: 'kanban', onDrop: handleKanbanDrop &#125;&#125;&gt;
  &#123;#each todoCards as card (card.id)&#125;
    &lt;div
      use:draggable=&#123;&#123; id: card.id, group: 'kanban', data: card &#125;&#125;
      use:dropTarget=&#123;&#123;
        id: card.id, group: 'kanban',
        mode: 'between', axis: 'vertical',
        onDrop: handleKanbanDrop
      &#125;&#125;
      animate:live
    &gt;
      &#123;card.label&#125;
    &lt;/div&gt;
  &#123;/each&#125;
&lt;/div&gt;</code
        ></pre>
    </details>
  </div>
</section>
