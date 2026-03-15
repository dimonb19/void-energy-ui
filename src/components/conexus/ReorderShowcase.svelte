<script lang="ts">
  import Tile from '@components/ui/Tile.svelte';
  import StoryCategory from '@components/ui/StoryCategory.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import { GripVertical, ChevronLeft, ChevronRight } from '@lucide/svelte';
  import { draggable, dropTarget, reorderByDrop } from '@actions/drag';
  import { live } from '@lib/transitions.svelte';

  // ── Reorder showcase data ──────────────────────────────────────────────
  // Two reorderable tile categories rendered below the main paginated feed.
  // Tiles can be reordered within a category and dragged between the two.
  //
  // DATA MODEL:
  // ReorderTile extends StoryData with a required `id` field. The `id` is
  // the stable identity used by the drag system for tracking, keyed lists,
  // and FLIP animations. In production, this maps to the story's database ID.
  //
  // BACKEND INTEGRATION:
  // 1. Replace `initialQueueStories` / `initialWatchLaterStories` with data
  //    fetched from your API (e.g., GET /api/user/queue, GET /api/user/watch-later).
  // 2. In `handleReorderDrop`, after calling `setZone(...)`, persist the new
  //    order to the backend. Use `resolveReorderByDrop` (from @actions/drag)
  //    instead of `reorderByDrop` to get a `ReorderRequest` payload with
  //    `id`, `targetId`, `position`, `fromIndex`, `toIndex`, `previousId`,
  //    `nextId`, and `orderedIds` — ready for a PATCH/PUT endpoint.
  //    Example:
  //      const { items, request } = resolveReorderByDrop(getZone(zone), detail);
  //      setZone(zone, items);
  //      await api.reorder(zoneEndpoint, request);
  // 3. For cross-zone transfers, send both the removal from the source zone
  //    and the insertion into the target zone as a single transaction.
  // 4. The `moveReorderTile` button handler also uses `reorderByDrop` —
  //    swap to `resolveReorderByDrop` for the same backend payload.
  //
  // ARCHITECTURE:
  // - Each category is wrapped in a zone-level `use:dropTarget` (mode: 'inside')
  //   so empty categories can still accept drops.
  // - Each tile wrapper is both `use:draggable` and `use:dropTarget`
  //   (mode: 'between', axis: 'horizontal') for insertion ordering.
  // - `handle: '[data-drag-handle]'` restricts drag initiation to the grip
  //   icon, preventing conflict with the tile's stretched link.
  // - `animate:live` on each wrapper provides FLIP reflow animation.
  //
  // @see /src/actions/drag.ts — draggable, dropTarget, reorderByDrop, resolveReorderByDrop
  // @see /src/components/ui-library/DragAndDrop.svelte — kanban zone pattern reference
  // @see /src/styles/components/_tiles.scss — Section 6 (tile-reorder styles)
  // @see /src/styles/components/_drag.scss — horizontal drop indicators

  interface ReorderTile extends StoryData {
    id: string;
  }

  const initialQueueStories: ReorderTile[] = [
    {
      id: 'q1',
      title: 'Iron Meridian',
      href: '#',
      author: {
        name: 'Viktor Hale',
        avatar: 'https://i.pravatar.cc/48?u=viktor',
        href: '#',
      },
      genres: ['Military Sci-Fi', 'Strategy'],
      image: 'https://picsum.photos/seed/queue1/400/600',
      mark: 'resume' as const,
    },
    {
      id: 'q2',
      title: 'Gossamer Thread',
      href: '#',
      author: { name: 'Mei Lin', href: '#' },
      genres: ['Fairy Tale', 'Dark Fantasy'],
      image: 'https://picsum.photos/seed/queue2/400/600',
    },
    {
      id: 'q3',
      title: 'Salt & Circuit',
      href: '#',
      author: {
        name: 'Joaquin Torres',
        avatar: 'https://i.pravatar.cc/48?u=joaquin',
        href: '#',
      },
      genres: ['Cyberpunk', 'Culinary'],
      image: 'https://picsum.photos/seed/queue3/400/600',
      gated: true,
    },
    {
      id: 'q4',
      title: 'The Ember Choir',
      href: '#',
      author: {
        name: 'Saoirse Flynn',
        avatar: 'https://i.pravatar.cc/48?u=saoirse',
        href: '#',
      },
      genres: ['Musical', 'Post-Apocalyptic'],
      image: 'https://picsum.photos/seed/queue4/400/600',
    },
    {
      id: 'q5',
      title: 'Nightjar',
      href: '#',
      author: { name: 'Oleg Petrov', href: '#' },
      genres: ['Espionage', 'Cold War'],
      image: 'https://picsum.photos/seed/queue5/400/600',
      mark: 'complete' as const,
    },
    {
      id: 'q6',
      title: 'Abyssal Crown',
      href: '#',
      author: {
        name: 'Thalassa Neri',
        avatar: 'https://i.pravatar.cc/48?u=thalassa',
        href: '#',
      },
      genres: ['Underwater', 'Epic Fantasy'],
      image: 'https://picsum.photos/seed/queue6/400/600',
    },
  ];

  const initialWatchLaterStories: ReorderTile[] = [
    {
      id: 'wl1',
      title: 'Rust & Reverie',
      href: '#',
      author: {
        name: 'Cassidy Wren',
        avatar: 'https://i.pravatar.cc/48?u=cassidy',
        href: '#',
      },
      genres: ['Steampunk', 'Romance'],
      image: 'https://picsum.photos/seed/later1/400/600',
    },
    {
      id: 'wl2',
      title: 'The Glass Menagerie',
      href: '#',
      author: { name: 'Dorian Ashby', href: '#' },
      genres: ['Gothic', 'Mystery'],
      image: 'https://picsum.photos/seed/later2/400/600',
      mark: 'replay' as const,
    },
    {
      id: 'wl3',
      title: 'Parallax',
      href: '#',
      author: {
        name: 'Yuna Nakashima',
        avatar: 'https://i.pravatar.cc/48?u=yuna',
        href: '#',
      },
      genres: ['Hard Sci-Fi', 'Philosophical'],
      image: 'https://picsum.photos/seed/later3/400/600',
      gated: true,
    },
    {
      id: 'wl4',
      title: 'Kindling',
      href: '#',
      author: {
        name: 'Rowan Blackthorn',
        avatar: 'https://i.pravatar.cc/48?u=rowan',
        href: '#',
      },
      genres: ['Survival', 'Coming of Age'],
      image: 'https://picsum.photos/seed/later4/400/600',
      mark: 'resume' as const,
    },
    {
      id: 'wl5',
      title: 'The Onyx Archive',
      href: '#',
      author: { name: 'Ezra Whitlock', href: '#' },
      genres: ['Lovecraftian', 'Library Fantasy'],
      image: 'https://picsum.photos/seed/later5/400/600',
    },
    {
      id: 'wl6',
      title: 'Vermillion Sky',
      href: '#',
      author: {
        name: 'Amara Diallo',
        avatar: 'https://i.pravatar.cc/48?u=amara',
        href: '#',
      },
      genres: ['Afrofuturism', 'Space Opera'],
      image: 'https://picsum.photos/seed/later6/400/600',
    },
  ];

  // ── Reorder state management ────────────────────────────────────────────
  // Two reactive arrays — one per zone. All mutations produce new arrays
  // (immutable updates) so Svelte 5 reactivity picks up changes.
  //
  // FUNCTIONS:
  // - findTileZone(id)          → which zone ('queue' | 'watchLater') owns this tile
  // - getZone(zone) / setZone   → read/write zone array by key
  // - handleReorderDrop(detail) → unified drop handler for both zones
  //     • detail.position 'before'|'after' → tile-on-tile drop (reorder or cross-zone)
  //     • detail.position undefined        → zone-container drop (transfer + append)
  // - moveReorderTile(zone, id, direction) → button-based within-row reorder only
  //     • direction -1 = move left, +1 = move right
  //     • Disabled at boundaries (first tile can't go left, last can't go right)
  //     • Does NOT cross zones — drag handles cross-zone transfers
  // - resetReorderZones()       → restore both zones to initial demo data

  let queueStories = $state<ReorderTile[]>([...initialQueueStories]);
  let watchLaterStories = $state<ReorderTile[]>([...initialWatchLaterStories]);

  function findTileZone(tileId: string): 'queue' | 'watchLater' | null {
    if (queueStories.some((s) => s.id === tileId)) return 'queue';
    if (watchLaterStories.some((s) => s.id === tileId)) return 'watchLater';
    return null;
  }

  function getZone(zone: 'queue' | 'watchLater'): ReorderTile[] {
    return zone === 'queue' ? queueStories : watchLaterStories;
  }

  function setZone(zone: 'queue' | 'watchLater', items: ReorderTile[]): void {
    if (zone === 'queue') queueStories = items;
    else watchLaterStories = items;
  }

  function handleReorderDrop(detail: DropDetail): void {
    const tile = detail.data as ReorderTile;
    const sourceZone = findTileZone(tile.id);
    if (!sourceZone) return;

    if (detail.position === 'before' || detail.position === 'after') {
      // Dropped on another tile — reorder or cross-zone insert
      const targetZone = findTileZone(detail.targetId!);
      if (!targetZone) return;

      if (sourceZone === targetZone) {
        setZone(targetZone, reorderByDrop(getZone(targetZone), detail));
      } else {
        // Cross-zone: remove from source, insert at position in target
        const sourceItems = getZone(sourceZone).filter((s) => s.id !== tile.id);
        setZone(sourceZone, sourceItems);

        const targetItems = [...getZone(targetZone)];
        const targetIndex = targetItems.findIndex(
          (s) => s.id === detail.targetId,
        );
        const insertAt =
          targetIndex === -1
            ? targetItems.length
            : detail.position === 'after'
              ? targetIndex + 1
              : targetIndex;
        targetItems.splice(insertAt, 0, tile);
        setZone(targetZone, targetItems);
      }
    } else {
      // Dropped on zone container (mode: 'inside') — transfer and append
      const targetZone =
        detail.targetId === 'reorder-queue' ? 'queue' : 'watchLater';
      if (sourceZone === targetZone) return;
      setZone(
        sourceZone,
        getZone(sourceZone).filter((s) => s.id !== tile.id),
      );
      setZone(targetZone, [...getZone(targetZone), tile]);
    }
  }

  function moveReorderTile(
    zone: 'queue' | 'watchLater',
    tileId: string,
    direction: -1 | 1,
  ): void {
    const items = getZone(zone);
    const fromIndex = items.findIndex((s) => s.id === tileId);
    if (fromIndex === -1) return;

    const toIndex = fromIndex + direction;
    if (toIndex < 0 || toIndex >= items.length) return;

    const targetId = items[toIndex]?.id;
    if (!targetId) return;

    setZone(
      zone,
      reorderByDrop(items, {
        id: tileId,
        targetId,
        position: direction > 0 ? 'after' : 'before',
      }),
    );
  }

  function resetReorderZones(): void {
    queueStories = [...initialQueueStories];
    watchLaterStories = [...initialWatchLaterStories];
  }
</script>

<!-- ─── REORDER SHOWCASE ──────────────────────────────────────────── -->
<!-- Gated on !feed.hasMore — only renders after all 5 normal feed    -->
<!-- categories have loaded. Two categories with reorderable tiles.   -->
<!--                                                                   -->
<!-- STRUCTURE (per zone):                                             -->
<!--   div[use:dropTarget mode:'inside'] ← zone-level, accepts empty   -->
<!--     └ StoryCategory                 ← standard strip + nav        -->
<!--         └ div.tile-reorder[use:draggable + use:dropTarget]         -->
<!--             ├ <Tile />              ← standard tile component      -->
<!--             └ div.tile-reorder-bar  ← ⠿ grip ... [◀] [▶]         -->
<!--                                                                   -->
<!-- INTERACTIONS:                                                      -->
<!-- • Drag from grip handle → reorder within row or transfer to other -->
<!-- • Left/right buttons → reorder within current row only            -->
<!-- • Keyboard DnD (Enter→pick, arrows→cycle, Enter→drop) → cross-row -->
<!-- • Empty zone shows "Drop stories here" placeholder                -->
<div class="flex flex-col gap-xs px-md">
  <h3 class="text-dim">Reorder Showcase</h3>
  <p class="text-small text-mute">
    Drag tiles between these two categories or use the arrow buttons to reorder.
    Each tile's addon bar provides a drag handle and move controls.
  </p>
  <div class="pt-xs">
    <ActionBtn
      icon={Restart}
      text="Reset"
      size="sm"
      onclick={resetReorderZones}
    />
  </div>
</div>

<!-- Zone A: Your Queue -->
<div
  aria-label="Your Queue reorder zone"
  use:dropTarget={{
    id: 'reorder-queue',
    group: 'reorder',
    onDrop: handleReorderDrop,
  }}
>
  <StoryCategory title="Your Queue" tagline="Stories you're reading next.">
    {#each queueStories as story, index (story.id)}
      <div
        class="tile-reorder"
        aria-label={story.title}
        use:draggable={{
          id: story.id,
          group: 'reorder',
          data: story,
          handle: '[data-drag-handle]',
        }}
        use:dropTarget={{
          id: story.id,
          group: 'reorder',
          mode: 'between',
          axis: 'horizontal',
          onDrop: handleReorderDrop,
        }}
        animate:live
      >
        <Tile
          title={story.title}
          href={story.href}
          author={story.author}
          genres={story.genres}
          image={story.image}
          mark={story.mark}
          gated={story.gated}
        />
        <div class="tile-reorder-bar">
          <button
            class="btn-icon"
            type="button"
            data-drag-handle
            aria-label={`Drag ${story.title}`}
            title={`Drag ${story.title}`}
          >
            <GripVertical class="icon" data-size="sm" />
          </button>

          <div class="inline-flex items-center gap-xs">
            <button
              class="btn-icon"
              type="button"
              aria-label={`Move ${story.title} left`}
              title={`Move ${story.title} left`}
              onclick={() => moveReorderTile('queue', story.id, -1)}
              disabled={index === 0}
            >
              <ChevronLeft class="icon" data-size="sm" />
            </button>

            <button
              class="btn-icon"
              type="button"
              aria-label={`Move ${story.title} right`}
              title={`Move ${story.title} right`}
              onclick={() => moveReorderTile('queue', story.id, 1)}
              disabled={index === queueStories.length - 1}
            >
              <ChevronRight class="icon" data-size="sm" />
            </button>
          </div>
        </div>
      </div>
    {/each}

    {#if queueStories.length === 0}
      <p class="text-mute text-center p-lg">Drop stories here</p>
    {/if}
  </StoryCategory>
</div>

<!-- Zone B: Watch Later -->
<div
  aria-label="Watch Later reorder zone"
  use:dropTarget={{
    id: 'reorder-watch-later',
    group: 'reorder',
    onDrop: handleReorderDrop,
  }}
>
  <StoryCategory title="Watch Later" tagline="Saved for another time.">
    {#each watchLaterStories as story, index (story.id)}
      <div
        class="tile-reorder"
        aria-label={story.title}
        use:draggable={{
          id: story.id,
          group: 'reorder',
          data: story,
          handle: '[data-drag-handle]',
        }}
        use:dropTarget={{
          id: story.id,
          group: 'reorder',
          mode: 'between',
          axis: 'horizontal',
          onDrop: handleReorderDrop,
        }}
        animate:live
      >
        <Tile
          title={story.title}
          href={story.href}
          author={story.author}
          genres={story.genres}
          image={story.image}
          mark={story.mark}
          gated={story.gated}
        />
        <div class="tile-reorder-bar">
          <button
            class="btn-icon"
            type="button"
            data-drag-handle
            aria-label={`Drag ${story.title}`}
            title={`Drag ${story.title}`}
          >
            <GripVertical class="icon" data-size="sm" />
          </button>

          <div class="inline-flex items-center gap-xs">
            <button
              class="btn-icon"
              type="button"
              aria-label={`Move ${story.title} left`}
              title={`Move ${story.title} left`}
              onclick={() => moveReorderTile('watchLater', story.id, -1)}
              disabled={index === 0}
            >
              <ChevronLeft class="icon" data-size="sm" />
            </button>

            <button
              class="btn-icon"
              type="button"
              aria-label={`Move ${story.title} right`}
              title={`Move ${story.title} right`}
              onclick={() => moveReorderTile('watchLater', story.id, 1)}
              disabled={index === watchLaterStories.length - 1}
            >
              <ChevronRight class="icon" data-size="sm" />
            </button>
          </div>
        </div>
      </div>
    {/each}

    {#if watchLaterStories.length === 0}
      <p class="text-mute text-center p-lg">Drop stories here</p>
    {/if}
  </StoryCategory>
</div>
