# Phase 9 — Virtualized List

Render only visible rows for large datasets. A performance primitive consumers expect.

---

## Problem

When a consumer app has 100+ items (logs, users, search results), rendering all DOM nodes causes jank. The design system currently has no virtualization solution. Consumers would need to bring their own library or accept poor performance on large lists.

---

## Approach Decision

Two options:

### Option A: TanStack Virtual (recommended)
- Battle-tested, framework-agnostic, actively maintained
- Svelte adapter available (`@tanstack/svelte-virtual`)
- Handles variable row heights, horizontal/vertical, scroll-to-index
- Design system wraps it in a thin `VirtualList.svelte` component with Void Energy styling

### Option B: Custom lightweight implementation
- No dependency, full control
- Only handles fixed-height rows
- More work, less feature coverage

**Recommendation: Option A.** A design system shouldn't reinvent virtualization. Wrap TanStack Virtual with Void Energy styling and expose a simple slot-based API.

---

## Files

- **New:** `src/components/ui/VirtualList.svelte`
- `package.json` — add `@tanstack/svelte-virtual`
- `src/styles/components/_containers.scss` — minimal scroll container styling
- `src/components/ui-library/Effects.svelte` or new showcase section

---

## Component Design

### Props

```typescript
interface VirtualListProps<T> {
  /** The full array of items */
  items: T[];
  /** Estimated height of each item in pixels */
  itemHeight: number;
  /** Height of the scroll container */
  height?: string;
  /** Overscan — number of items to render beyond visible area */
  overscan?: number;
  /** Item renderer snippet — receives item and index */
  children: Snippet<[{ item: T; index: number }]>;
  class?: string;
}
```

### Template (simplified)

```svelte
<script lang="ts" generics="T">
  import { createVirtualizer } from '@tanstack/svelte-virtual';

  let {
    items,
    itemHeight,
    height = '24rem',
    overscan = 5,
    children,
    class: className = '',
  }: VirtualListProps<T> = $props();

  let scrollEl: HTMLDivElement;

  const virtualizer = createVirtualizer({
    get count() { return items.length; },
    getScrollElement: () => scrollEl,
    estimateSize: () => itemHeight,
    overscan,
  });
</script>

<div
  bind:this={scrollEl}
  class="virtual-list {className}"
  style:height
  style:overflow="auto"
>
  <div style:height="{$virtualizer.getTotalSize()}px" style:position="relative">
    {#each $virtualizer.getVirtualItems() as row}
      <div
        style:position="absolute"
        style:top="{row.start}px"
        style:width="100%"
        style:height="{row.size}px"
      >
        {@render children({ item: items[row.index], index: row.index })}
      </div>
    {/each}
  </div>
</div>
```

### Usage

```svelte
<VirtualList items={allUsers} itemHeight={48}>
  {#snippet children({ item, index })}
    <div class="flex flex-row items-center gap-md p-sm">
      <span class="text-dim">{index + 1}</span>
      <span>{item.name}</span>
    </div>
  {/snippet}
</VirtualList>
```

---

## SCSS

Minimal — the list container needs standard scroll styling:

```scss
.virtual-list {
  // Ensure scrollbar styling matches design system
  @include custom-scrollbar; // If this mixin exists, otherwise standard

  border-radius: var(--radius-base);
}
```

---

## Note on Svelte 5 Compatibility

TanStack Virtual's Svelte adapter may need verification for Svelte 5 runes mode. If the adapter isn't Svelte 5 compatible:
- Use the core `@tanstack/virtual-core` directly
- Create a reactive wrapper using `$state` and `$effect`
- The core library is framework-agnostic, so this is straightforward

---

## Verification

```bash
npm install @tanstack/svelte-virtual
npm run dev     # Visual check with 1000+ item demo
npm run check   # TypeScript
```

Manual tests:
- Render 10,000 items — scroll should be smooth (60fps)
- Check DOM inspector — only ~20-30 rows rendered at a time
- Scroll to bottom — all items accessible
- Works with keyboard (Tab into list, scroll with arrow keys)
- Physics presets don't affect scroll behavior
