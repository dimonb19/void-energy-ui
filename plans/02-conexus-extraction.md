# 02 — CoNexus Extraction

> Extract all CoNexus-specific components, actions, styles, and types from the monorepo into a private CoNexus UI package.

**Status:** Planning — Wave 3 (after VE is fully complete)
**Depends on:** 03-public-repo (Wave 1), 04-premium-repo (Wave 2)
**Blocks:** 05-conexus-repo (Wave 3)

---

## Goal

Cleanly separate CoNexus-specific code from the public Void Energy core into a private package. This is **Wave 2 work** — it happens after the public repo launches.

After extraction:
- The public repo contains zero CoNexus references
- CoNexus UI lives in a private package that CoNexus imports alongside `void-energy`
- The current monorepo continues to work during transition
- CoNexus frontend migration (Wave 4) happens later — this wave is just the extraction

---

## Inventory: What Is CoNexus-Specific

### Components (move to conexus package)

| File | Current Location | Purpose |
|------|-----------------|---------|
| `StoryFeed.svelte` | `src/components/conexus/` | Paginated story feed with categories |
| `PortalLoaderDemo.svelte` | `src/components/conexus/` | Portal loading animation demo |
| `ReorderShowcase.svelte` | `src/components/conexus/` | Drag-and-drop tile reorder demo |
| `Tile.svelte` | `src/components/ui/` | Story tile card |
| `StoryCategory.svelte` | `src/components/ui/` | Story category header/container |
| `PortalLoader.svelte` | `src/components/ui/` | Portal ring loading animation |
| `LoadingTextCycler.svelte` | `src/components/ui/` | Cycling text during load states |
| `CoNexus.svelte` | `src/components/` | CoNexus showcase page component |

### Actions (evaluate: move vs keep public)

| File | Current Location | Size | Decision Needed |
|------|-----------------|------|-----------------|
| `narrative.ts` | `src/actions/` | 12KB | **See decision below** |
| `drag.ts` | `src/actions/` | 33KB | **See decision below** |

**Decision: narrative.ts**
The 18 narrative effects (shake, quake, glitch, etc.) are deeply tied to the CoNexus storytelling experience. However, they're also a compelling demo of the physics system. **Recommendation:** Keep public. They showcase Void Energy's capabilities and drive adoption. CoNexus's value isn't in the effects themselves but in the story engine that orchestrates them.

**Decision: drag.ts**
The drag-and-drop system is a general-purpose utility. **Recommendation:** Keep public. It's useful for any app (kanban boards, reorderable lists) and demonstrates Void Energy's interaction quality.

### Styles (move to conexus package)

| File | Current Location | Purpose |
|------|-----------------|---------|
| `_tiles.scss` | `src/styles/components/` | Tile layout, reorder animations, marks |

**Keep public** (used by narrative effects):
| File | Current Location | Purpose |
|------|-----------------|---------|
| `_narrative.scss` | `src/styles/components/` | Narrative effect animations |

### Types (move to conexus package)

| File | Current Location | Purpose |
|------|-----------------|---------|
| `story.d.ts` | `src/types/` | StoryData, TileAuthor, TileGate |
| `story-engine.d.ts` | `src/types/` | Story step, narrative engine types |

**Keep public** (general-purpose):
| File | Current Location | Purpose |
|------|-----------------|---------|
| `narrative.d.ts` | `src/types/` | NarrativeEffect union type |
| `drag.d.ts` | `src/types/` | Drag action types |

### Showcase/Demo Pages (move to conexus package or conexus repo)

| File | Current Location | Purpose |
|------|-----------------|---------|
| `TilesShowcase.svelte` | `src/components/ui-library/` | Tile component demo |
| `PortalRing.svelte` | `src/components/ui-library/` | Portal animation demo |
| `DragAndDrop.svelte` | `src/components/ui-library/` | Drag system demo (if drag stays public, this stays too) |

### Pages

| File | Current Location | Purpose |
|------|-----------------|---------|
| `conexus.astro` | `src/pages/` | CoNexus showcase route |

---

## Extraction Steps

### Step 1: Audit dependencies

Before moving anything, trace the import graph for each CoNexus component:

```
StoryFeed.svelte
  └── imports: Tile, StoryCategory, Pagination, Skeleton, SearchField, ...
      └── Tile imports: core UI (badges, icons, etc.)
      └── StoryCategory imports: core UI
```

**Key question:** Do any CoNexus components import from each other in ways that create circular dependencies with core? Map this first.

### Step 2: Move files to CoNexus repo

CoNexus components move directly into the `conexus` repo as local components (not a published package):

```
conexus/
  src/
    conexus-ui/
      Tile.svelte
      StoryCategory.svelte
      PortalLoader.svelte
      LoadingTextCycler.svelte
      StoryFeed.svelte
      PortalLoaderDemo.svelte
      ReorderShowcase.svelte
      styles/
        _tiles.scss
    types/
      story.ts               ← converted from ambient .d.ts to exported types
      story-engine.ts
```

### Step 3: Update imports in extracted components

All extracted components currently use path aliases (`@components/`, `@styles/`, etc.) that resolve within the monorepo. After extraction, core imports reference the public `void-energy` package, and CoNexus-internal imports use local paths:

```typescript
// BEFORE (monorepo)
import { Pagination } from '@components/ui/Pagination.svelte';
import { toast } from '@stores/toast.svelte';

// AFTER (CoNexus repo)
import { Pagination } from 'void-energy/components/Pagination';
import { toast } from 'void-energy/stores/toast';

// CoNexus-internal imports stay local
import Tile from '../conexus-ui/Tile.svelte';
```

**This is the most labor-intensive part.** Every import in every extracted file needs updating.

### Step 5: Clean the monorepo

After extraction, remove CoNexus-specific files from the monorepo:

1. Delete `src/components/conexus/` directory
2. Delete `src/components/CoNexus.svelte`
3. Move `Tile.svelte`, `StoryCategory.svelte`, `PortalLoader.svelte`, `LoadingTextCycler.svelte` out of `src/components/ui/`
4. Move `_tiles.scss` out of `src/styles/components/`
5. Move `story.d.ts`, `story-engine.d.ts` out of `src/types/`
6. Delete `src/pages/conexus.astro`
7. Remove CoNexus tab from Navigation
8. Update `component-registry.json` — remove CoNexus entries
9. Remove `TilesShowcase.svelte` and `PortalRing.svelte` from `ui-library/`

### Step 6: Clean showcase pages

**`/components` page:** Remove any tile demos, story feed references, portal loader demos. These no longer exist in the public tier.

**`/conexus` page:** This entire route is removed from the public repo. The CoNexus showcase becomes part of the conexus app repo or a premium demo site.

### Step 7: Update the component registry

Remove from `component-registry.json`:
- Tile
- StoryCategory
- PortalLoader
- LoadingTextCycler
- StoryFeed (if listed)
- Any CoNexus-specific entries

---

## Edge Cases

### Shared dependencies
Some CoNexus components use core primitives (Pagination, Skeleton, SearchField). These stay in the public repo. The conexus package declares `void-energy` as a peer dependency and imports from it.

### Drag action
If drag stays public (recommended), the `ReorderShowcase` in the conexus package can import `draggable` and `dropTarget` from the public `void-energy` package. No duplication needed.

### Narrative action
If narrative stays public (recommended), CoNexus just imports it. The `_narrative.scss` stays in the public repo's styles.

### SCSS for tiles
`_tiles.scss` moves to the conexus package. The global SCSS import chain in the public repo needs updating — remove `@use 'components/tiles'` from whatever aggregates it.

### Story types
`story.d.ts` and `story-engine.d.ts` are currently ambient (global) type declarations. In the package, convert them to explicit exports:
```typescript
// Package: explicit exports
export interface StoryData { ... }
export interface TileAuthor { ... }
```

---

## Transition Strategy

This extraction happens during **Wave 2** (after the public repo launches):
1. Wave 1 ships the public `void-energy` repo — CoNexus components are simply excluded (not shipped)
2. Extract CoNexus-specific files into a private package
3. CoNexus UI becomes an importable package that the CoNexus app (Wave 4) will consume
4. The monorepo stays available as reference during migration
5. CoNexus frontend migration is **Wave 4** — not part of this wave. This wave is extraction only.

---

## Verification Checklist

- [ ] All CoNexus imports resolve correctly in the extracted package
- [ ] The public repo builds cleanly without any CoNexus references
- [ ] `npm run check` passes in the public repo
- [ ] `npm run check:registry` passes after registry cleanup
- [ ] The conexus package builds independently
- [ ] CoNexus components render correctly when consumed from the package
- [ ] No circular dependencies between conexus package and core
- [ ] Tile, StoryCategory, PortalLoader are not in the public component list
- [ ] Navigation no longer shows a CoNexus tab in the public repo
