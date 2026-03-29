# 02 — CoNexus Extraction

> Extract all CoNexus-specific components, actions, styles, and types from the monorepo into the `@dgrslabs/void-energy-conexus` premium package.

**Status:** Planning
**Depends on:** Nothing (can start immediately, parallel with 01)
**Blocks:** 03-public-repo, 04-premium-repo

---

## Goal

Cleanly separate CoNexus-specific code from the public Void Energy core. After extraction:
- The public repo contains zero CoNexus references
- CoNexus UI lives in `@dgrslabs/void-energy-conexus` as a premium package
- The CoNexus app imports this package as a dependency
- The current monorepo showcase keeps working during transition

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

### Step 2: Create the package structure

```
@dgrslabs/void-energy-conexus/
  src/
    components/
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
    index.ts                  ← main entry, re-exports all components
  package.json
  README.md
```

### Step 3: Package configuration

```json
{
  "name": "@dgrslabs/void-energy-conexus",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.svelte",
    "./styles": "./src/styles/_tiles.scss",
    "./types": "./src/types/index.ts"
  },
  "peerDependencies": {
    "void-energy": ">=0.1.0",
    "svelte": "^5.0.0"
  }
}
```

### Step 4: Update imports in extracted components

All extracted components currently use path aliases (`@components/`, `@styles/`, etc.) that resolve within the monorepo. After extraction, these need to reference the public `void-energy` package:

```typescript
// BEFORE (monorepo)
import { Pagination } from '@components/ui/Pagination.svelte';
import { toast } from '@stores/toast.svelte';

// AFTER (package)
import { Pagination } from 'void-energy/components/Pagination';
import { toast } from 'void-energy/stores/toast';
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

During the monorepo development period:
1. Create the package structure in `packages/conexus/` (alongside `packages/kinetic-text/`)
2. Move files there but keep the monorepo working via workspace resolution
3. The showcase pages import from the local package
4. When the premium repo is ready, move the package there

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
