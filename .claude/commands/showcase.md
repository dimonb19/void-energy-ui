Generate an interactive showcase page for a component in the ui-library.

## Input

`$ARGUMENTS` is the PascalCase component name (e.g., `Toggle`, `DropZone`).

If no argument is provided, ask the user which component to showcase.

## Before Creating

1. Read the component file at `src/components/ui/$ARGUMENTS.svelte` to understand its props, states, and behavior
2. Read its SCSS file to understand physics adaptations
3. Read `src/components/ui-library/DataUpload.svelte` as the canonical showcase template
4. Count existing showcase sections to determine the next section number

## Showcase Structure

Create `src/components/ui-library/SectionName.svelte` following this exact pattern:

```svelte
<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import ComponentName from '../ui/ComponentName.svelte';

  // Reactive state for interactive demos
  let demoState = $state(initialValue);
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>NN // SECTION TITLE</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <!-- Intro paragraph -->
    <p class="text-dim">
      The <code>ComponentName</code> component does X. It reuses the
      <code>.css-class</code> physics from <code>_file.scss</code> —
      describe key implementation details and SCSS dependencies.
    </p>

    <!-- Demo group: Basic usage -->
    <div class="flex flex-col gap-xs">
      <h5>Basic Usage</h5>
      <p class="text-small text-mute">
        Describe what this demo shows. Reference props:
        <code>propName</code>.
      </p>

      <div class="surface-sunk p-md">
        <ComponentName prop="value" />
      </div>
    </div>

    <!-- Demo group: Variant / Feature -->
    <div class="flex flex-col gap-xs">
      <h5>Feature Name</h5>
      <p class="text-small text-mute">
        Explain the variant. Show specific props used.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <ComponentName variant="special" bind:value={demoState} />
        <p class="text-caption text-mute px-xs">
          Props: <code>variant="special"</code>
        </p>
      </div>
    </div>
  </div>
</section>
```

## Rules

- **Section number**: Sequential after the last existing section (check existing showcases)
- **Intro paragraph**: Always explain the component AND reference its SCSS file
- **Demo containers**: Always use `surface-sunk p-md` wrapper
- **Interactive feedback**: Use `toast.show()` for user actions where appropriate
- **Props annotations**: Show the exact props used in each demo as `<code>` elements
- **State demos**: Include examples of different states (active, disabled, loading) if the component supports them
- **Size demos**: If the component supports `data-size`, show the size scale
- **Minimal imports**: Only import what's needed for the demos

## After Creating

1. Remind the user to import the new showcase in `src/components/Components.svelte` (or wherever showcases are aggregated)
2. Suggest running `/document $ARGUMENTS` to update CHEAT-SHEET.md