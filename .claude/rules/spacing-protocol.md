---
paths:
  - "src/**/*.svelte"
  - "src/**/*.scss"
  - "src/**/*.ts"
  - "src/**/*.astro"
---

# Spacing Protocol

Default generous. When unsure, go ONE size up.
_Applies to surface padding and layout gaps. Control sizing and typography live under the Modern-Chrome Defaults in CLAUDE.md §9._

## Surface Spacing Floor

| Surface | Padding | Inner Gap | Never |
|---------|---------|-----------|-------|
| Floating (`.surface-raised`, `.surface-raised-action`) | `p-lg` | `gap-lg` | Never `p-md` or `p-sm` |
| Sunk (`.surface-sunk`) | `p-md` | `gap-md` | Never `p-xs` |
| Sunk dense (justified exception: theme grid, picker) | `p-sm` | `gap-sm` | Must be explicitly justified |

## Layout Gaps by Context

| Context | Gap | Token | Notes |
|---------|-----|-------|-------|
| Page wrapper (between sections) | `gap-2xl` | 64px | + `py-2xl` vertical padding |
| Between content blocks in a section | `gap-xl` | 48px | Clear separation |
| Inside floating card (between groups) | `gap-lg` | 32px | Default card rhythm |
| Inside floating card (compact, flowing content) | `gap-md` | 24px | Only for single-topic cards with h3 -> p -> demo flow |
| Inside sunk container | `gap-md` | 24px | Standard content spacing |
| Card grids | `gap-lg` | 32px | Cards need breathing room |
| Between form field groups | `gap-md` | 24px | Comfortable grouping |
| Button / action rows | `gap-md` | 24px | Touch-target spacing |
| Subsection header (title + description) | `gap-xs` | 8px | Tight coupling |
| Label -> input (form field) | `gap-xs` | 8px | Tight coupling |
| Inline icon + text | `gap-xs` | 8px | Tight coupling |

## Common AI Mistakes

```
WRONG:  surface-raised p-md gap-sm   ->  CORRECT: surface-raised p-lg gap-lg
WRONG:  section gap-lg              ->  CORRECT: section gap-xl or gap-2xl
WRONG:  card grid gap-md            ->  CORRECT: card grid gap-lg
WRONG:  button row gap-sm           ->  CORRECT: button row gap-md
WRONG:  gap-xs between field groups ->  CORRECT: gap-md between groups, gap-xs only within a group
WRONG:  surface-sunk p-sm (default) ->  CORRECT: surface-sunk p-md (p-sm only for justified dense UI)
```

## Page Scaffold

```svelte
<div class="container flex flex-col gap-2xl py-2xl">        <!-- page wrapper -->
  <section class="flex flex-col gap-xl">                     <!-- section -->
    <div class="surface-raised p-lg flex flex-col gap-lg">    <!-- card -->
      <div class="flex flex-col gap-xs">                     <!-- subsection header -->
        <h3>Title</h3>
        <p class="text-dim">Description</p>
      </div>
      <div class="surface-sunk p-md flex flex-col gap-md">   <!-- well -->
        <!-- content -->
      </div>
    </div>
  </section>
</div>
```

## The xs/sm Exception Rule

`gap-xs` and `gap-sm` are ONLY for tight coupling:

- **`gap-xs`**: label -> input, icon + text, title + subtitle (semantically ONE unit)
- **`gap-sm`**: chip/tag rows, nav items, toggle groups, dense grid cells
- **Everything else**: `gap-md` minimum
