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
  - onsubmit: Callback on Enter key
  - oninput: Callback on every keystroke
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Search icon rotates 90° when input is focused
  - Enter key triggers onsubmit callback

  @see /_fields.scss for field overlay anatomy
-->
<script lang="ts">
  import Search from '@components/icons/Search.svelte';

  interface SearchFieldProps {
    value: string;
    id?: string;
    placeholder?: string;
    disabled?: boolean;
    zoom?: 'in' | 'out';
    onsubmit?: (value: string) => void;
    oninput?: (value: string) => void;
    class?: string;
  }

  let {
    value = $bindable(''),
    id,
    placeholder = 'Search...',
    disabled = false,
    zoom,
    onsubmit,
    oninput,
    class: className = '',
  }: SearchFieldProps = $props();

  // svelte-ignore state_referenced_locally
  const inputId = id ?? `search-${Math.random().toString(36).slice(2, 9)}`;

  let focused = $state(false);

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      onsubmit?.(value);
    }
  }

  function handleInput(e: Event) {
    value = (e.target as HTMLInputElement).value;
    oninput?.(value);
  }
</script>

<div class="field search-field {className}">
  <input
    id={inputId}
    type="search"
    {placeholder}
    {disabled}
    {value}
    onfocus={() => (focused = true)}
    onblur={() => (focused = false)}
    onkeydown={handleKeydown}
    oninput={handleInput}
  />
  <span class="field-slot-left">
    <Search
      data-state={focused ? 'active' : ''}
      data-zoom={zoom}
      data-size="lg"
    />
  </span>
</div>
