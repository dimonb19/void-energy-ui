---
paths:
  - "src/**/*.svelte"
  - "src/**/*.svelte.ts"
---

# Runes Doctrine (Law 3)

Svelte 5 runes only. Legacy Svelte 4 patterns are forbidden in this codebase — they compile, but they break reactivity contracts the rest of the system depends on.

## Why

The codebase has standardized on runes (`$props`, `$state`, `$derived`, `$effect`, `$bindable`) so that reactivity is locally legible: every reactive value is declared at its definition site. `export let` and `$:` move that information out of the script and into the framework's compile step, which makes it invisible to AI agents and harder for humans to grep. Stores duplicate `$state` for cross-file reactivity — but `$state` plus a module export does the same job with less ceremony.

## Always Use

```svelte
<script lang="ts">
  // Props
  interface Props {
    value: string;
    checked?: boolean;
    onchange?: (value: string) => void;
  }
  let { value, checked = $bindable(false), onchange }: Props = $props();

  // Local state
  let count = $state(0);

  // Derived values
  const doubled = $derived(count * 2);

  // Side effects (replaces onMount)
  $effect(() => { setupSomething(); });

  // Cleanup (replaces onDestroy)
  $effect(() => {
    const id = layerStack.push(dismiss);
    return () => layerStack.remove(id);
  });
</script>
```

## Never Use

```svelte
<script lang="ts">
  // WRONG — Svelte 4 props
  export let value;

  // WRONG — Svelte 4 reactive statement
  $: doubled = value * 2;

  // WRONG — lifecycle imports (use $effect instead)
  import { onMount, onDestroy } from 'svelte';
  onMount(() => {});
  onDestroy(() => {});

  // WRONG — stores for routine state
  import { writable } from 'svelte/store';
  const count = writable(0);
</script>
```

## Naming Trap

Never name a variable `state` in a runes file. `let state = $derived(...)` next to `$state(...)` triggers a misleading TS2448 "$state used before its declaration." Disambiguate with a qualified name (`imageState`, `loadState`, `panelState`).

## Cross-File Reactive State

Use a `.svelte.ts` module that exports `$state`-backed values directly. Singletons in `@stores/`, `@adapters/`, and `@lib/` follow this pattern (`voidEngine`, `modal`, `toast`, `user`, `layerStack`, `shortcutRegistry`). Import and use — never re-instantiate.
