# Phase 7 — Empty States

A reusable component for "no data" scenarios — icon, heading, body text, optional CTA.

---

## Problem

Every data-driven view needs a "nothing here" state: empty search results, empty lists, first-time dashboards. Currently this is handled with inline `<p>` tags and no consistent visual pattern. A design system should ship an EmptyState component like it ships buttons and inputs.

---

## Files

- **New:** `src/components/ui/EmptyState.svelte`
- `src/styles/components/_containers.scss` — add empty state styles (or new `_empty-state.scss`)
- `src/components/ui-library/Effects.svelte` — add showcase section

---

## Analog

Closest existing pattern: PortalLoader — centered content with generous spacing, muted text, visual anchor (SVG graphic). EmptyState follows the same layout philosophy but is static (no animation).

---

## Component Design

### Props

```typescript
interface EmptyStateProps {
  /** Optional heading text */
  heading?: string;
  class?: string;
  children?: Snippet;   // Body text / description
  icon?: Snippet;       // Icon or illustration slot
  action?: Snippet;     // CTA button slot
}
```

Using Svelte 5 snippets for maximum flexibility — consumer provides their own icon (Lucide or custom), body text, and optional action button.

### Template

```svelte
<div class="empty-state flex flex-col items-center gap-lg p-xl text-center {className}">
  {#if icon}
    <div class="empty-state-icon text-mute">
      {@render icon()}
    </div>
  {/if}

  {#if heading}
    <h3 class="text-h4 text-dim">{heading}</h3>
  {/if}

  {#if children}
    <div class="text-body text-mute">
      {@render children()}
    </div>
  {/if}

  {#if action}
    <div class="empty-state-action">
      {@render action()}
    </div>
  {/if}
</div>
```

### SCSS

```scss
.empty-state {
  // Let the container decide width; empty state fills it
  max-width: 28rem;
  margin-inline: auto;
}

.empty-state-icon {
  // Size the icon slot generously
  :global(.icon) {
    width: 3rem;
    height: 3rem;
  }
}
```

Minimal SCSS — layout is Tailwind (flex, gap, padding, text-center), only the icon sizing and max-width constraint are SCSS. The component inherits surface colors from its parent context.

---

## Usage

```svelte
<EmptyState heading="No results found">
  {#snippet icon()}<Search class="icon" />{/snippet}
  <p>Try adjusting your search terms or clearing filters.</p>
  {#snippet action()}<button class="btn-ghost">Clear search</button>{/snippet}
</EmptyState>
```

```svelte
<!-- Minimal version -->
<EmptyState heading="No items yet">
  <p>Create your first item to get started.</p>
</EmptyState>
```

---

## Verification

```bash
npm run dev     # Visual check in showcase
npm run check   # TypeScript
npm run scan    # Token compliance
```

Manual tests:
- Renders all 4 slots (icon, heading, body, action)
- Renders correctly with only heading + body (no icon, no action)
- Centers properly inside various container widths
- Text is readable across all physics presets + modes
- No layout shift — content is static
