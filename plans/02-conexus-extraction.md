# 02 — CoNexus Extraction

> Extract all CoNexus-specific components, styles, and types from the monorepo into the CoNexus repo.

**Status:** Planning — Wave 3 (after VE is fully complete)
**Depends on:** 03-public-repo (Wave 1), 04-premium-repo (Wave 2)
**Blocks:** 05-conexus-repo (Wave 3)
**Updated:** 2026-04-04

---

## Goal

Cleanly separate CoNexus-specific code from the public Void Energy core. CoNexus UI components move directly into the `conexus` repo as local components — not a published package.

After extraction:
- The public repo contains zero CoNexus references
- CoNexus UI lives in the `conexus` repo alongside app logic
- Kinetic Text is a separate premium package — independent of CoNexus extraction
- The current monorepo continues to work during transition

---

## What Is NOT Part of This Extraction

### Kinetic Text — Independent Premium Package
Kinetic Text (`packages/kinetic-text/`) is its own premium package (`@dgrslabs/void-energy-kinetic-text`). It moves to the `void-energy-premium` repo in Wave 2. CoNexus *consumes* KT as a dependency — they are independent packages. KT extraction is covered in [04-premium-repo.md](04-premium-repo.md), not here.

### Drag Action — Public, Stays in Core
`src/actions/drag.ts` is a general-purpose drag-and-drop system useful for any app (kanban boards, reorderable lists). It stays public in `void-energy`.

### Kinetic Action — Public, Stays in Core
`src/actions/kinetic.ts` is the lightweight kinetic text action (typewriter, word-by-word, cycle, decode modes). It stays public as a free taste of text animation. The premium KT package is the full-featured version.

### Portal Ring — Public, Stays in Core
`src/components/icons/PortalRing.svelte` is a physics-adaptive parallax SVG that fits the Void Energy identity. It stays public and ships with a ready-made 404 page as an out-of-box feature. The Portal Ring showcase stays on `/components`.

**Note:** Portal Ring (the interactive SVG icon) is different from Portal Loader (the CoNexus loading animation that uses Portal Ring). Portal Loader moves to CoNexus; Portal Ring stays free.

---

## Inventory: What Moves to CoNexus

### Components

| File | Current Location | Purpose |
|------|-----------------|---------|
| `StoryFeed.svelte` | `src/components/conexus/` | Paginated story feed with dual-level pagination |
| `PortalLoaderDemo.svelte` | `src/components/conexus/` | Portal loading animation demo |
| `ReorderShowcase.svelte` | `src/components/conexus/` | Drag-and-drop tile reorder demo |
| `Tile.svelte` | `src/components/ui/` | Story tile card |
| `StoryCategory.svelte` | `src/components/ui/` | Story category header/container |
| `PortalLoader.svelte` | `src/components/ui/` | Portal ring loading animation |
| `LoadingTextCycler.svelte` | `src/components/ui/` | Cycling text during load states |
| `CoNexus.svelte` | `src/components/` | CoNexus showcase page component |

### Styles

| File | Current Location | Purpose |
|------|-----------------|---------|
| `_tiles.scss` | `src/styles/components/` | Tile layout, reorder animations, marks |

### Types

| File | Current Location | Purpose |
|------|-----------------|---------|
| `story.d.ts` | `src/types/` | StoryData, TileAuthor, TileGate |
| `story-engine.d.ts` | `src/types/` | Story step, narrative engine types |

### Showcase/Demo Pages

| File | Current Location | Purpose |
|------|-----------------|---------|
| `TilesShowcase.svelte` | `src/components/ui-library/` | Tile component demo (not wired into `/components` page, but exists as a file) |

**Stays public:** `PortalRing.svelte` showcase stays in `src/components/ui-library/` — Portal Ring is a free feature.

### Pages

| File | Current Location | Purpose |
|------|-----------------|---------|
| `conexus.astro` | `src/pages/` | CoNexus showcase route |

### Atmospheres

| File | Current Location | Purpose |
|------|-----------------|---------|
| `atmospheres-conexus.ts` | `src/config/` | 12 DGRS-private atmosphere definitions |

These 12 atmospheres are already isolated in their own file (from Plan 01). They move to `conexus/src/atmospheres/` and are registered at boot via `voidEngine.registerTheme()`.

---

## Extraction Steps

### Step 1: Audit dependencies

Trace the import graph for each CoNexus component before moving anything:

```
StoryFeed.svelte
  └── imports: Tile, StoryCategory, Pagination, Skeleton, SearchField, LoadMore, ...
      └── Tile imports: core UI (badges, icons, etc.)
      └── StoryCategory imports: core UI
```

**Key question:** Do any CoNexus components import from each other in ways that create circular dependencies with core? Map this first.

### Step 2: Move files to CoNexus repo

CoNexus components move directly into the `conexus` repo as local components:

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
    atmospheres/              ← 12 DGRS-private atmospheres
      void.ts
      onyx.ts
      terminal.ts
      nebula.ts
      solar.ts
      overgrowth.ts
      velvet.ts
      crimson.ts
      paper.ts
      focus.ts
      laboratory.ts
      playground.ts
      fonts/                  ← Font files for private themes
      index.ts                ← re-exports all as privateThemes record
```

### Step 3: Update imports in extracted components

All extracted components currently use path aliases (`@components/`, `@styles/`, etc.) that resolve within the monorepo. After extraction, core imports reference the public `void-energy` package:

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

### Step 4: Clean the monorepo

After extraction, remove CoNexus-specific files from the monorepo:

1. Delete `src/components/conexus/` directory
2. Delete `src/components/CoNexus.svelte`
3. Move `Tile.svelte`, `StoryCategory.svelte`, `PortalLoader.svelte`, `LoadingTextCycler.svelte` out of `src/components/ui/`
4. Move `_tiles.scss` out of `src/styles/components/`
5. Move `story.d.ts`, `story-engine.d.ts` out of `src/types/`
6. Delete `src/pages/conexus.astro`
7. Delete `src/config/atmospheres-conexus.ts`
8. Remove CoNexus tab from Navigation
9. Update `component-registry.json` — remove CoNexus entries
10. Remove `TilesShowcase.svelte` from `ui-library/` (Portal Ring showcase stays — it's a free feature)

### Step 5: Clean showcase pages

**`/components` page:** Remove tile demos and portal loader demos. Portal Ring showcase stays (it's a free feature). Add `use:kinetic` showcase with examples for all 4 modes (char, word, cycle, decode).

**`/conexus` page:** This entire route is removed. The CoNexus showcase becomes part of the conexus app.

### Step 6: Update the component registry

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
CoNexus components use core primitives (Pagination, Skeleton, SearchField, LoadMore). These stay in the public repo. The conexus app declares `void-energy` as a dependency and imports from it.

### Drag action
Drag stays public. `ReorderShowcase` in the conexus repo imports `draggable` and `dropTarget` from the public `void-energy` package. No duplication needed.

### SCSS for tiles
`_tiles.scss` moves to the conexus repo. The global SCSS import chain in the public repo needs updating — remove `@use 'components/tiles'` from whatever aggregates it.

### Story types
`story.d.ts` and `story-engine.d.ts` are currently ambient (global) type declarations. In the conexus repo, convert them to explicit exports:
```typescript
// CoNexus repo: explicit exports
export interface StoryData { ... }
export interface TileAuthor { ... }
```

### Atmosphere duplication
Terminal and Solar exist in both `atmospheres.ts` (free) and `atmospheres-conexus.ts` (DGRS-private). In the free repo they ship as part of the 4 built-in themes. In CoNexus they are registered at boot alongside the other 10 private themes. The boot sequence should skip themes that already exist in the base set to avoid conflicts — `voidEngine.registerTheme()` already handles this via Safety Merge.

---

## Transition Strategy

1. Wave 1 ships the public `void-energy` repo — CoNexus components are simply excluded (not shipped)
2. Wave 2 ships premium packages (Kinetic Text, Ambience Layers) — independent of CoNexus extraction
3. Wave 3 creates the `conexus` repo, moves CoNexus-specific files into it
4. The monorepo stays available as reference during migration

---

## Verification Checklist

- [ ] All CoNexus imports resolve correctly in the conexus repo
- [ ] The public repo builds cleanly without any CoNexus references
- [ ] `npm run check` passes in the public repo
- [ ] `npm run check:registry` passes after registry cleanup
- [ ] CoNexus components render correctly when consuming `void-energy` from npm
- [ ] No circular dependencies between conexus code and core
- [ ] Tile, StoryCategory, PortalLoader, LoadingTextCycler are not in the public component list
- [ ] Portal Ring stays in the public repo with its showcase and 404 page
- [ ] Navigation no longer shows a CoNexus tab in the public repo
- [ ] All 16 atmospheres available after boot (4 free from void-energy + 12 DGRS-private registered at boot)
- [ ] Kinetic Text imports correctly from `@dgrslabs/void-energy-kinetic-text` (premium, independent)
