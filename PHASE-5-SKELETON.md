# Phase 5 — Skeleton Component

Wrap existing shimmer infrastructure into a reusable `Skeleton.svelte` component with shape variants.

---

## Problem

The shimmer animation system is fully built (`.shimmer-surface` class, `@include shimmer` mixin, physics-aware gradients for glass/flat/retro). But there's no component wrapper — consumers must manually apply CSS classes and set dimensions. There's no quick way to show a text-line skeleton, an avatar placeholder, or a card skeleton.

---

## Existing Infrastructure

**Shimmer mixin** — `src/styles/abstracts/_mixins.scss` (lines 85-125):
- `@include shimmer` — container shimmer via `::before` pseudo-element
- `@include text-shimmer` — text shimmer via `background-clip: text`
- Both adapt to glass/flat/retro physics and light/dark modes

**Utility classes** — `src/styles/components/_effects.scss` (lines 1-26):
- `.shimmer-surface` — applies `@include shimmer` with `position: relative; overflow: hidden`
- `.text-shimmer` — applies `@include text-shimmer`

---

## Files

- **New:** `src/components/ui/Skeleton.svelte`
- `src/styles/components/_effects.scss` — add skeleton variant styles
- `src/components/ui-library/Effects.svelte` — add skeleton showcase section

---

## Component Design

### Props

```typescript
interface SkeletonProps {
  /** Shape variant */
  variant?: 'text' | 'avatar' | 'card' | 'paragraph';
  /** Override width (token string or CSS value) */
  width?: string;
  /** Override height (token string or CSS value) */
  height?: string;
  /** Number of text lines for 'paragraph' variant */
  lines?: number;
  class?: string;
}
```

### Variant Defaults

| Variant | Width | Height | Shape |
|---------|-------|--------|-------|
| `text` | `100%` | `1em` | Rounded (radius-base) |
| `avatar` | `3rem` | `3rem` | Circle (radius-full) |
| `card` | `100%` | `8rem` | Rounded (radius-base) |
| `paragraph` | `100%` | auto | 3-4 text lines with varying widths |

### Implementation

```svelte
<script lang="ts">
  interface SkeletonProps {
    variant?: 'text' | 'avatar' | 'card' | 'paragraph';
    width?: string;
    height?: string;
    lines?: number;
    class?: string;
  }

  let {
    variant = 'text',
    width,
    height,
    lines = 3,
    class: className = '',
  }: SkeletonProps = $props();
</script>

{#if variant === 'paragraph'}
  <div class="skeleton-paragraph flex flex-col gap-sm {className}" role="presentation" aria-hidden="true">
    {#each Array(lines) as _, i}
      <div
        class="skeleton shimmer-surface"
        data-variant="text"
        style:width={i === lines - 1 ? '60%' : '100%'}
      ></div>
    {/each}
  </div>
{:else}
  <div
    class="skeleton shimmer-surface {className}"
    data-variant={variant}
    style:width={width}
    style:height={height}
    role="presentation"
    aria-hidden="true"
  ></div>
{/if}
```

### SCSS

Add to `src/styles/components/_effects.scss`:

```scss
.skeleton {
  &[data-variant='text'] {
    width: 100%;
    height: 1em;
    border-radius: var(--radius-base);
  }

  &[data-variant='avatar'] {
    width: 3rem;
    height: 3rem;
    border-radius: var(--radius-full);
  }

  &[data-variant='card'] {
    width: 100%;
    height: 8rem;
    border-radius: var(--radius-base);
  }
}
```

Note: `width` and `height` set via `style:` props override the CSS defaults when provided.

---

## Showcase

Add a "Skeleton" section to `src/components/ui-library/Effects.svelte`:

```svelte
<h5>Skeleton Loading</h5>
<p class="text-small text-mute">
  Placeholder shapes that shimmer while content loads.
  Built on the same shimmer infrastructure as other loading effects.
</p>

<div class="surface-sunk p-md flex flex-col gap-lg">
  <!-- Single text line -->
  <Skeleton variant="text" />

  <!-- Avatar -->
  <div class="flex flex-row items-center gap-md">
    <Skeleton variant="avatar" />
    <div class="flex flex-col gap-sm" style="flex: 1">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="60%" />
    </div>
  </div>

  <!-- Card -->
  <Skeleton variant="card" />

  <!-- Paragraph -->
  <Skeleton variant="paragraph" lines={4} />
</div>
```

---

## Verification

```bash
npm run dev     # Visual check in Effects showcase
npm run check   # TypeScript
npm run scan    # Token compliance (no magic pixels)
```

Manual tests:
- All 4 variants render correctly
- Shimmer animation plays on all variants
- Test across glass/flat/retro + light/dark
- Inline `width`/`height` overrides work
- `paragraph` variant renders correct number of lines with last line shorter
- Component is `aria-hidden="true"` and `role="presentation"` (no screen reader noise)
