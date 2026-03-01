<!--
  SEARCH FIELD COMPONENT
  An input with a search icon that animates on focus.

  USAGE
  -------------------------------------------------------------------------
  <SearchField bind:value={query} placeholder="Search..." />
  <SearchField bind:value={query} onsubmit={handleSearch} zoom="in" />
  -------------------------------------------------------------------------

  PROPS:
  - value: Search text (bindable)
  - placeholder: Placeholder text
  - disabled: Disables the input
  - zoom: Search icon lens variant ('in' | 'out')
  - delay: Debounce oninput by this many ms (0 or omitted = no debounce)
  - onsubmit: Callback on Enter key
  - oninput: Callback on every keystroke (debounced if delay is set)
  - class: Additional CSS classes on the wrapper
  - ...rest: All native input attributes (autofocus, role, aria-*, etc.)

  BEHAVIOR:
  - Search icon rotates 90° when input is focused
  - Enter key triggers onsubmit callback

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import Search from '@components/icons/Search.svelte';
  import { debounce } from '@lib/timing';
  import type { HTMLInputAttributes } from 'svelte/elements';

  interface SearchFieldProps
    extends Omit<HTMLInputAttributes, 'value' | 'oninput' | 'onsubmit'> {
    value: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    autocomplete?: HTMLInputElement['autocomplete'];
    zoom?: 'in' | 'out';
    /** Debounce oninput callback by this many ms. 0 or omitted = no debounce. */
    delay?: number;
    onsubmit?: (value: string) => void;
    oninput?: (value: string) => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = 'Search...',
    disabled = false,
    autocomplete = 'off',
    zoom,
    delay,
    onsubmit,
    oninput,
    class: className = '',
    ...rest
  }: SearchFieldProps = $props();

  // svelte-ignore state_referenced_locally
  const inputId = id ?? `search-${Math.random().toString(36).slice(2, 9)}`;

  let focused = $state(false);
  let debouncedInput: ((value: string) => void) | undefined;

  $effect(() => {
    if (delay && oninput) {
      const d = debounce(oninput, delay);
      debouncedInput = d;
      return () => d.cancel();
    } else {
      debouncedInput = undefined;
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onsubmit?.(value);
    }
  }

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    if (debouncedInput) {
      debouncedInput(value);
    } else {
      oninput?.(value);
    }
  }
</script>

<div class="field search-field {className}">
  <input
    id={inputId}
    type="search"
    {placeholder}
    {disabled}
    {autocomplete}
    {value}
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    onkeydown={handleKeydown}
    oninput={handleInput}
    {...rest}
  />
  <span class="field-slot-left">
    <Search
      data-state={focused ? 'active' : ''}
      data-zoom={zoom}
      data-size="lg"
    />
  </span>
</div>
