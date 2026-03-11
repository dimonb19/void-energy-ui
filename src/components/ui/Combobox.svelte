<script lang="ts">
  import { ChevronDown, Check } from '@lucide/svelte';
  import type { HTMLInputAttributes } from 'svelte/elements';
  import {
    computePosition,
    autoUpdate,
    offset as offsetMiddleware,
    flip,
    shift,
  } from '@floating-ui/dom';
  import { layerStack } from '@lib/layer-stack.svelte';
  import {
    DROPDOWN_PANEL_OFFSET_PX,
    DROPDOWN_VIEWPORT_PADDING_PX,
  } from '@config/ui-geometry';

  export interface ComboboxOption {
    value: string | number | null;
    label: string;
    description?: string;
    disabled?: boolean;
  }

  interface ComboboxProps
    extends Omit<
      HTMLInputAttributes,
      'value' | 'oninput' | 'onchange' | 'required' | 'name' | 'form'
    > {
    options: ComboboxOption[];
    value?: string | number | null;
    open?: boolean;
    allowCustomValue?: boolean;
    required?: boolean;
    name?: string;
    form?: string;
    onchange?: (value: string | number | null) => void;
    oninput?: (query: string) => void;
    class?: string;
  }

  let {
    options = [],
    value = $bindable<string | number | null>(null),
    open = $bindable(false),
    allowCustomValue = false,
    required,
    name,
    form,
    placeholder = 'Select...',
    disabled = false,
    autocomplete = 'off',
    onchange,
    oninput,
    class: className = '',
    id,
    ...rest
  }: ComboboxProps = $props();

  const componentId = $props.id();
  const comboboxId = `combobox-${componentId}`;
  const listboxId = `${comboboxId}-listbox`;
  const inputId = $derived(id ?? comboboxId);

  let inputEl = $state<HTMLInputElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  let query = $state('');
  let activeIndex = $state(-1);

  let cleanupAutoUpdate: (() => void) | null = null;
  let generation = 0;
  let layerId: number | null = null;

  // ── Derived ──────────────────────────────────────────────────────────────

  // For known options: use the option's display label.
  // For custom free-text values (allowCustomValue): no option matches, so
  // fall back to the value itself so the input doesn't blank out after commit.
  const selectedLabel = $derived.by(() => {
    const match = options.find((o) => Object.is(o.value, value));
    if (match) return match.label;
    if (value != null) return String(value);
    return '';
  });

  const filtered = $derived.by(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description?.toLowerCase().includes(q) ?? false),
    );
  });

  const activeOptionId = $derived(
    activeIndex >= 0 && activeIndex < filtered.length
      ? `${comboboxId}-option-${activeIndex}`
      : undefined,
  );

  function serializeValue(v: string | number | null): string {
    return v == null ? '' : String(v);
  }

  // ── Sync display query based on panel state ──────────────────────────────
  // When closed: restore query to the committed label (covers Escape, Tab,
  // click-outside, and external close via bind:open).
  // When opened externally (parent sets open=true without going through
  // openPanel()): clear query so all options are shown, same as clicking.
  $effect(() => {
    if (!open) {
      query = selectedLabel;
      activeIndex = -1;
    } else {
      // External open: initialize to "show all" state if query still shows
      // the committed label (i.e. openPanel() was not called by us).
      if (query === selectedLabel) {
        query = '';
        activeIndex =
          value != null
            ? options.findIndex((o) => Object.is(o.value, value))
            : -1;
      }
    }
  });

  // ── Inert management (same pattern as Dropdown.svelte) ───────────────────
  $effect(() => {
    if (!panelEl) return;
    if (open) {
      panelEl.removeAttribute('inert');
    } else {
      panelEl.setAttribute('inert', '');
    }
  });

  // ── Popover + positioning lifecycle ──────────────────────────────────────
  $effect(() => {
    if (!open || !inputEl || !panelEl) return;
    const gen = ++generation;

    try {
      panelEl.showPopover();
    } catch {}

    layerId = layerStack.push(() => {
      open = false;
      inputEl?.focus();
    });

    cleanupAutoUpdate = autoUpdate(inputEl, panelEl, () => {
      const input = inputEl;
      const panel = panelEl;
      if (!input || !panel) return;

      const triggerWidth = input.getBoundingClientRect().width;

      computePosition(input, panel, {
        placement: 'bottom-start',
        middleware: [
          offsetMiddleware(DROPDOWN_PANEL_OFFSET_PX),
          flip(),
          shift({ padding: DROPDOWN_VIEWPORT_PADDING_PX }),
        ],
      }).then(({ x, y }) => {
        if (panelEl !== panel) return;
        Object.assign(panel.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
          width: `${triggerWidth}px`,
        });
      });
    });

    // One frame for CSS transition from closed → open
    requestAnimationFrame(() => {
      if (gen === generation) {
        panelEl?.setAttribute('data-state', 'open');
      }
    });

    return () => {
      generation += 1;

      if (layerId !== null) {
        layerStack.remove(layerId);
        layerId = null;
      }

      if (cleanupAutoUpdate) {
        cleanupAutoUpdate();
        cleanupAutoUpdate = null;
      }

      if (panelEl) {
        panelEl.setAttribute('data-state', 'closed');

        const duration = parseFloat(
          getComputedStyle(panelEl).transitionDuration,
        );
        if (duration === 0) {
          try {
            panelEl.hidePopover();
          } catch {}
        } else {
          const el = panelEl;
          el.addEventListener(
            'transitionend',
            () => {
              if (gen === generation) {
                try {
                  el.hidePopover();
                } catch {}
              }
            },
            { once: true },
          );
        }
      }
    };
  });

  // ── Click outside ─────────────────────────────────────────────────────────
  $effect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (inputEl?.contains(target) || panelEl?.contains(target)) return;
      open = false;
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  });

  // ── Actions ───────────────────────────────────────────────────────────────

  // clearQuery: true when opening via click/keyboard (show all options);
  //             false when opening via user typing (preserve the typed query).
  function openPanel(clearQuery = true) {
    if (open || disabled) return;
    if (clearQuery) query = ''; // Show all options so user can browse or type fresh
    open = true;
    // Pre-highlight the committed option in the full option list
    activeIndex =
      value != null ? options.findIndex((o) => Object.is(o.value, value)) : -1;
    // Select all text so typing immediately replaces whatever is shown
    requestAnimationFrame(() => inputEl?.select());
  }

  function closePanel() {
    if (!open) return;
    open = false;
    activeIndex = -1;
    // $effect syncs query = selectedLabel on next tick
  }

  function commitOption(option: ComboboxOption) {
    if (option.disabled) return;
    value = option.value;
    query = option.label;
    activeIndex = -1;
    open = false;
    onchange?.(option.value);
    inputEl?.focus();
  }

  function commitCustom() {
    if (!allowCustomValue || !query.trim()) return;
    const committed = query.trim();
    value = committed; // Bind:value reflects the custom text so form submission works
    open = false;
    activeIndex = -1;
    onchange?.(committed);
    inputEl?.focus();
  }

  // Returns the next enabled option index in direction dir (1=down, -1=up).
  // Wraps around. Returns -1 if all options are disabled.
  function nextEnabledIndex(from: number, dir: 1 | -1): number {
    const len = filtered.length;
    if (len === 0) return -1;
    let i = from;
    for (let steps = 0; steps < len; steps++) {
      i = (((i + dir) % len) + len) % len;
      if (!filtered[i]?.disabled) return i;
    }
    return -1; // All disabled
  }

  function scrollActiveIntoView() {
    if (activeIndex < 0) return;
    const el = panelEl?.querySelector<HTMLElement>(
      `#${comboboxId}-option-${activeIndex}`,
    );
    try {
      el?.scrollIntoView({ block: 'nearest' });
    } catch {}
  }

  function handleKeydown(e: KeyboardEvent) {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) {
        openPanel();
        activeIndex = nextEnabledIndex(-1, 1);
      } else {
        activeIndex =
          activeIndex < 0
            ? nextEnabledIndex(-1, 1)
            : nextEnabledIndex(activeIndex, 1);
        scrollActiveIntoView();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        openPanel();
        activeIndex = nextEnabledIndex(filtered.length, -1);
      } else {
        activeIndex =
          activeIndex < 0
            ? nextEnabledIndex(filtered.length, -1)
            : nextEnabledIndex(activeIndex, -1);
        scrollActiveIntoView();
      }
    } else if (e.key === 'Enter') {
      if (!open) {
        e.preventDefault();
        openPanel();
      } else if (activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        commitOption(filtered[activeIndex]);
      } else if (allowCustomValue && query.trim()) {
        e.preventDefault();
        commitCustom();
      }
    } else if (e.key === 'Escape') {
      if (open) {
        // e.preventDefault() stops layerStack from firing a second dismiss
        // (same pattern as EditField / EditTextarea per CLAUDE.md)
        e.preventDefault();
        closePanel();
        inputEl?.focus();
      }
    } else if (e.key === 'Tab') {
      if (open) {
        // Close only — do NOT commit the highlighted option on Tab
        closePanel();
        // Do not preventDefault: Tab must continue to move focus naturally
      }
    }
  }

  function handleInput(e: Event) {
    const newQuery = (e.target as HTMLInputElement).value;
    query = newQuery;
    if (!open && newQuery.trim()) openPanel(false); // Don't clear the typed query
    // After query update, filtered recomputes — highlight first result
    activeIndex = nextEnabledIndex(-1, 1); // Skip disabled rows at position 0
    oninput?.(newQuery);
  }

  function handleFocus() {
    // Select all on focus so the user can immediately type to filter
    inputEl?.select();
  }
</script>

<!--
  COMBOBOX
  Input/select hybrid. Type to filter, arrow keys to navigate, Enter to commit.

  PROPS
  options         Array of ComboboxOption (value, label, description?, disabled?)
  value           string | number | null — bindable committed selection
  open            boolean — bindable panel visibility
  allowCustomValue  Commit raw query text on Enter when no option is active
  name/form       Route to hidden input only — NOT the visible text input
  required        Maps to aria-required only (no native constraint validation in v1)
  placeholder     Input placeholder (default 'Select...')
  disabled        Disables the combobox
  onchange        Callback when a value is committed
  oninput         Keystroke callback for async option loading
  class           Classes on the .field wrapper
  ...rest         All other HTMLInputAttributes → visible input (aria-*, autofocus…)

  KEYBOARD
  ArrowDown/Up    Open panel (if closed); navigate (skips disabled)
  Enter           Commit active option; or raw text if allowCustomValue
  Escape          Close + restore committed display value
  Tab             Close only — does NOT auto-commit the highlighted option
  Home/End        Native caret movement (not intercepted)

  FORM INTEROP
  - name/form route to a hidden input rendered only when name is set and !disabled
  - The visible input is intentionally unnamed to prevent double submission
  - required is aria-only — use FormField error prop for validation feedback

  @see /_combobox.scss
  @see /_fields.scss
  @see /_dropdown.scss
-->

<div class="field combobox-field {className}">
  <input
    bind:this={inputEl}
    id={inputId}
    type="text"
    role="combobox"
    aria-expanded={open}
    aria-controls={listboxId}
    aria-activedescendant={activeOptionId}
    aria-autocomplete="list"
    aria-required={required}
    {placeholder}
    {disabled}
    {autocomplete}
    value={query}
    onfocus={handleFocus}
    oninput={handleInput}
    onkeydown={handleKeydown}
    onclick={() => openPanel()}
    {...rest}
  />
  <span class="field-slot-right" aria-hidden="true">
    <ChevronDown class="icon" data-size="lg" />
  </span>
</div>

<!-- Hidden input for form submission. Intentionally separate from the visible
     input so FormData picks up the committed value, not the display text.
     Only rendered when a name is provided and the control is enabled. -->
{#if name && !disabled}
  <input type="hidden" {name} {form} value={serializeValue(value)} />
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={panelEl}
  id={listboxId}
  class="dropdown-panel combobox-panel"
  popover="manual"
  role="listbox"
  aria-label={placeholder}
  aria-hidden={open ? undefined : 'true'}
>
  <div class="combobox-listbox">
    {#if filtered.length === 0}
      <p class="text-mute text-center p-lg">No options</p>
    {:else}
      {#each filtered as option, i}
        <button
          id="{comboboxId}-option-{i}"
          class="combobox-option btn-ghost"
          type="button"
          role="option"
          tabindex="-1"
          aria-selected={Object.is(option.value, value) ? 'true' : 'false'}
          aria-disabled={option.disabled || undefined}
          data-state={i === activeIndex ? 'active' : ''}
          onpointerdown={(e) => {
            e.preventDefault(); // Keep focus on the input (blur-before-click fix)
            commitOption(option);
          }}
          onpointerenter={() => {
            if (!option.disabled) activeIndex = i;
          }}
        >
          <span class="combobox-option-label">
            <span>{option.label}</span>
            {#if option.description}
              <span class="combobox-option-description"
                >{option.description}</span
              >
            {/if}
          </span>
          {#if Object.is(option.value, value)}
            <Check class="icon combobox-option-check" data-size="sm" />
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</div>
