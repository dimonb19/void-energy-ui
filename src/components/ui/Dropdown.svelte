<!--
  DROPDOWN COMPONENT
  A generic trigger + floating panel container.
  Uses Popover API for top-layer positioning and @floating-ui/dom for smart placement.

  USAGE
  ─────────────────────────────────────
  <Dropdown label="Options">
    {#snippet trigger()}
      <span>Click me <ChevronDown class="icon" /></span>
    {/snippet}
    <div class="p-md">Any content here</div>
  </Dropdown>
  ─────────────────────────────────────

  PROPS:
  - trigger: Snippet — content rendered inside the toggle button
  - children: Snippet — panel content (arbitrary markup)
  - placement: Floating UI placement (default: 'bottom-start')
  - offset: Pixel gap between trigger and panel (default: 8)
  - open: Boolean — bindable open state
  - onchange: Callback fired when open state changes
  - label: Accessible label for the trigger button
  - class: Additional CSS classes on wrapper

  ACCESSIBILITY:
  - Trigger: button with aria-expanded, aria-haspopup="true", aria-controls
  - Panel: role="region" (generic container)
  - Escape closes dropdown, returns focus to trigger
  - Click outside closes dropdown

  @see /_dropdown.scss for physics-aware styling
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { Placement } from '@floating-ui/dom';
  import {
    computePosition,
    autoUpdate,
    offset as offsetMiddleware,
    flip,
    shift,
  } from '@floating-ui/dom';

  interface DropdownProps {
    trigger: Snippet;
    children: Snippet;
    placement?: Placement;
    offset?: number;
    class?: string;
    open?: boolean;
    onchange?: (open: boolean) => void;
    label?: string;
  }

  let {
    trigger,
    children,
    placement = 'bottom-start',
    offset: offsetPx = 8,
    class: className = '',
    open = $bindable(false),
    onchange,
    label = 'Toggle dropdown',
  }: DropdownProps = $props();

  let triggerEl = $state<HTMLButtonElement | null>(null);
  let panelEl = $state<HTMLDivElement | null>(null);

  const panelId = `dropdown-${Math.random().toString(36).slice(2, 9)}`;

  let cleanupAutoUpdate: (() => void) | null = null;
  let generation = 0;

  function toggle() {
    open = !open;
    onchange?.(open);
  }

  function close() {
    if (!open) return;
    open = false;
    onchange?.(false);
  }

  // Positioning & popover lifecycle (generation counter prevents stale callbacks)
  $effect(() => {
    if (!open || !triggerEl || !panelEl) return;
    const gen = ++generation;

    try {
      panelEl.showPopover();
    } catch {}

    cleanupAutoUpdate = autoUpdate(triggerEl, panelEl, () => {
      if (!panelEl || !triggerEl) return;
      computePosition(triggerEl, panelEl, {
        placement,
        middleware: [offsetMiddleware(offsetPx), flip(), shift({ padding: 8 })],
      }).then(({ x, y }) => {
        Object.assign(panelEl!.style, {
          left: `${x}px`,
          top: `${y}px`,
          position: 'absolute',
        });
      });
    });

    // Allow one frame for CSS transition from closed → open
    requestAnimationFrame(() => {
      if (gen === generation) {
        panelEl?.setAttribute('data-state', 'open');
      }
    });

    return () => {
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

  // Click outside (registered only while open)
  $effect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerEl?.contains(target) || panelEl?.contains(target)) return;
      close();
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  });

  // Escape key (registered only while open)
  $effect(() => {
    if (!open) return;

    function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        triggerEl?.focus();
      }
    }

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="dropdown {className}">
  <button
    bind:this={triggerEl}
    type="button"
    class="dropdown-trigger"
    aria-expanded={open}
    aria-haspopup="true"
    aria-controls={panelId}
    aria-label={label}
    onclick={toggle}
  >
    {@render trigger()}
  </button>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={panelEl}
    id={panelId}
    class="dropdown-panel"
    popover="manual"
    role="region"
    aria-label={label}
  >
    {@render children()}
  </div>
</div>
