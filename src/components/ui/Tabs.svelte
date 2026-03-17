<!--
  TABS COMPONENT
  A horizontal tabbed interface with proper WAI-ARIA tablist/tab/tabpanel semantics.

  USAGE:
  <Tabs
    tabs={[
      { id: 'general', label: 'General' },
      { id: 'advanced', label: 'Advanced', icon: Settings },
      { id: 'locked', label: 'Locked', disabled: true },
    ]}
    bind:value={activeTab}
  >
    {#snippet panel(tab)}
      {#if tab.id === 'general'}
        <p>General content</p>
      {:else if tab.id === 'advanced'}
        <p>Advanced content</p>
      {/if}
    {/snippet}
  </Tabs>

  PROPS:
  - tabs: Array of { id, label, icon?, disabled? } objects
  - value: Currently selected tab ID (bindable, defaults to first non-disabled tab)
  - onchange: Callback when selection changes
  - panel: Snippet receiving the active TabItem for rendering panel content
  - class: Additional CSS classes on the root container

  ACCESSIBILITY:
  - role="tablist" on tab bar, role="tab" on buttons, role="tabpanel" on content
  - Roving tabindex: last-focused tab is tabbable (tabindex="0"), others are -1
  - Arrow Left/Right moves focus and tabindex, Home/End jump to first/last enabled tab
  - Manual activation: focus and selection are independent (Enter/Space activates)
  - Tabindex resets to selected tab when selection changes

  @see /_tabs.scss for physics-aware styling
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface TabsProps {
    tabs: TabItem[];
    value?: string;
    onchange?: (id: string) => void;
    panel: Snippet<[TabItem]>;
    class?: string;
  }

  let {
    tabs,
    value = $bindable(),
    onchange,
    panel,
    class: className = '',
  }: TabsProps = $props();

  const componentId = $props.id();

  // Coerce to first enabled tab when value is missing, stale, or disabled
  $effect(() => {
    const current = tabs.find((t) => t.id === value);
    if (!current || current.disabled) {
      const first = tabs.find((t) => !t.disabled);
      value = first?.id;
    }
  });

  const activeTab = $derived(tabs.find((t) => t.id === value));

  // Roving tabindex tracks focus independently from selection.
  // Arrow keys move focusedTabId; Enter/Space activates (changes value).
  // Reset to selected tab when selection changes.
  let focusedTabId = $state(value);

  $effect(() => {
    focusedTabId = value;
  });

  function tabbableId(): string | undefined {
    return focusedTabId ?? value;
  }

  function tabId(id: string) {
    return `tabs-${componentId}-tab-${id}`;
  }

  function panelId(id: string) {
    return `tabs-${componentId}-panel-${id}`;
  }

  function select(id: string) {
    value = id;
    onchange?.(id);
  }

  function enabledTabs() {
    return tabs.filter((t) => !t.disabled);
  }

  // --- Sliding indicator ---
  let listEl = $state<HTMLElement>();
  let mounted = false;

  function updateIndicator() {
    if (!listEl) return;

    const activeEl = listEl.querySelector<HTMLElement>(`[data-state="active"]`);

    // No active tab — hide indicator (e.g. all tabs disabled)
    if (!activeEl) {
      listEl.style.setProperty('--_indicator-width', '0');
      return;
    }

    const indicator = listEl.querySelector<HTMLElement>('.tabs-indicator');
    if (!indicator) return;

    // Suppress transition on first paint so indicator doesn't animate from origin
    if (!mounted) {
      indicator.style.transition = 'none';
      mounted = true;
    } else {
      indicator.style.transition = '';
    }

    const listRect = listEl.getBoundingClientRect();
    const tabRect = activeEl.getBoundingClientRect();
    listEl.style.setProperty(
      '--_indicator-left',
      `${tabRect.left - listRect.left}px`,
    );
    listEl.style.setProperty('--_indicator-width', `${tabRect.width}px`);
  }

  // Recompute on value/tabs change
  $effect(() => {
    void value;
    void tabs;
    requestAnimationFrame(() => requestAnimationFrame(updateIndicator));
  });

  // Recompute on layout shifts (resize, font load, density/theme change).
  // Observe the list AND every trigger so child-only reflows are caught too.
  // Re-runs when tabs change so new/removed triggers are observed.
  $effect(() => {
    if (!listEl) return;
    void tabs; // Re-observe when tab set changes
    const ro = new ResizeObserver(updateIndicator);
    ro.observe(listEl);
    for (const trigger of listEl.querySelectorAll<HTMLElement>(
      '.tabs-trigger',
    )) {
      ro.observe(trigger);
    }
    return () => ro.disconnect();
  });

  function handleKeydown(e: KeyboardEvent) {
    const enabled = enabledTabs();
    if (enabled.length === 0) return;

    const currentIndex = enabled.findIndex((t) => t.id === tabbableId());
    let nextIndex: number;

    switch (e.key) {
      case 'ArrowRight':
        nextIndex = (currentIndex + 1) % enabled.length;
        break;
      case 'ArrowLeft':
        nextIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    const next = enabled[nextIndex];
    focusedTabId = next.id;
    const el = document.getElementById(tabId(next.id));
    el?.focus();
  }
</script>

<div class="tabs flex flex-col gap-md {className}">
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="tabs-list flex flex-row"
    role="tablist"
    tabindex={-1}
    onkeydown={handleKeydown}
    bind:this={listEl}
  >
    {#each tabs as tab}
      <button
        id={tabId(tab.id)}
        type="button"
        role="tab"
        class="tabs-trigger"
        aria-selected={tab.id === value}
        aria-controls={panelId(tab.id)}
        aria-disabled={tab.disabled || undefined}
        data-state={tab.id === value ? 'active' : undefined}
        tabindex={tab.id === tabbableId() ? 0 : -1}
        disabled={tab.disabled}
        onclick={() => select(tab.id)}
      >
        {#if tab.icon}
          {#if typeof tab.icon === 'string'}
            <span aria-hidden="true">{tab.icon}</span>
          {:else}
            {@const Icon = tab.icon}
            <Icon class="icon" aria-hidden="true" />
          {/if}
        {/if}
        <span class="tabs-trigger-label">{tab.label}</span>
      </button>
    {/each}
    <span class="tabs-indicator" aria-hidden="true"></span>
  </div>

  {#if activeTab}
    <div
      id={panelId(activeTab.id)}
      role="tabpanel"
      class="tabs-panel"
      aria-labelledby={tabId(activeTab.id)}
      tabindex={0}
    >
      {@render panel(activeTab)}
    </div>
  {/if}
</div>
