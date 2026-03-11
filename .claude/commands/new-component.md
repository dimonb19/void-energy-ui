Scaffold a new Void Energy UI component following established project patterns.

## Input

`$ARGUMENTS` is the PascalCase component name (e.g., `DataGrid`, `RangeSlider`).

If no argument is provided, ask the user for the component name before proceeding.

## What to Create

### 1. Svelte Component — `src/components/ui/$ARGUMENTS.svelte`

Follow the exact pattern from `src/components/ui/Toggle.svelte`:

```svelte
<!--
  COMPONENT_NAME
  Brief one-sentence description.

  USAGE
  ─────────────────────────────────────
  <ComponentName prop="value" />
  ─────────────────────────────────────

  PROPS:
  - prop: Type — description (bindable if applicable)
  - class: Additional CSS classes

  ACCESSIBILITY:
  - Describe role, aria attributes, keyboard interaction

  @see /_componentname.scss for physics-aware styling
-->
<script lang="ts">
  interface ComponentNameProps {
    // Define props with proper types
    class?: string;
  }

  let {
    class: className = '',
  }: ComponentNameProps = $props();
</script>

<div class="component-name {className}">
  <!-- Layout via Tailwind classes -->
  <!-- State via data-* attributes or ARIA -->
  <!-- Visual physics via SCSS class -->
</div>
```

Rules:
- Svelte 5 runes only (`$props()`, `$state()`, `$derived()`, `$effect()`, `$bindable()`)
- Props interface defined inline with TypeScript
- State via `data-state`, `data-size`, `aria-*` — never `.is-*` classes
- Layout via Tailwind utility classes on elements
- CSS class name: kebab-case version of the PascalCase name
- `class` prop always available, aliased to `className`

### 2. SCSS File — `src/styles/components/_componentname.scss`

Follow the exact pattern from `src/styles/components/_toggle.scss`:

```scss
@use '../abstracts' as *;

.component-name {
  @include surface-raised;  // or surface-sunk for input-like components

  // State handling
  @include when-state('active') {
    border-color: var(--energy-primary);
  }

  // Physics adaptations
  @include when-glass {
    // glass-specific styling
  }

  @include when-flat {
    // flat-specific styling
  }

  @include when-retro {
    border-width: var(--physics-border-width);
  }

  // Mode adaptations
  @include when-light {
    background: var(--bg-surface);
  }
}
```

Rules:
- Always start with `@use '../abstracts' as *;`
- Use semantic tokens only — no raw px, hex, or rgb values
- Include `when-retro` and `when-light` blocks for components with visible surfaces
- Include `when-glass` only if you need glass-specific overrides beyond what `surface-raised`/`surface-sunk` provides
- Omit empty physics blocks — they add noise without value
- Transitions use `var(--speed-fast)` and `var(--ease-spring-snappy)`

### 3. Register the SCSS

Add the import to `src/styles/global.scss` in the components section:
```scss
@use 'components/componentname';
```

## After Scaffolding

Tell the user:
1. The component is ready at `src/components/ui/ComponentName.svelte`
2. SCSS physics are at `src/styles/components/_componentname.scss`
3. Next steps: implement the component logic, then run `/showcase ComponentName` to create the demo page and `/document ComponentName` to update CHEAT-SHEET.md
