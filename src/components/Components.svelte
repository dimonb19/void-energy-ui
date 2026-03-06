<script lang="ts">
  import { ChevronDown } from '@lucide/svelte';
  import PullRefresh from './ui/PullRefresh.svelte';
  import Sidebar from './ui/Sidebar.svelte';

  // Foundations
  import Typography from './ui-library/Typography.svelte';
  import Surfaces from './ui-library/Surfaces.svelte';
  import Prose from './ui-library/Prose.svelte';
  import Globals from './ui-library/Globals.svelte';
  // Primitives
  import Icons from './ui-library/Icons.svelte';
  import Buttons from './ui-library/Buttons.svelte';
  // Form Controls
  import Inputs from './ui-library/Inputs.svelte';
  // Composites
  import Composites from './ui-library/Composites.svelte';
  import UserState from './ui-library/UserState.svelte';
  // Overlays & Feedback
  import FloatingUI from './ui-library/FloatingUI.svelte';
  import Toasts from './ui-library/Toasts.svelte';
  import Modals from './ui-library/Modals.svelte';
  // Effects & Motion
  import Effects from './ui-library/Effects.svelte';
  import KineticTextShowcase from './ui-library/KineticText.svelte';
  import MotionPrimitives from './ui-library/MotionPrimitives.svelte';
  // Data Visualization
  import Charts from './ui-library/Charts.svelte';

  const sidebarSections = [
    {
      label: 'Foundations',
      items: [
        { id: 'typography', label: 'Typography' },
        { id: 'surfaces', label: 'Surfaces' },
        { id: 'prose', label: 'Prose & Content' },
        { id: 'globals', label: 'Global Treatments' },
      ],
    },
    {
      label: 'Primitives',
      items: [
        { id: 'icons', label: 'Icons' },
        { id: 'buttons', label: 'Buttons' },
      ],
    },
    {
      label: 'Form Controls',
      items: [{ id: 'inputs', label: 'Inputs' }],
    },
    {
      label: 'Composites',
      items: [
        { id: 'composites', label: 'Composites' },
        { id: 'user-state', label: 'User State' },
      ],
    },
    {
      label: 'Overlays & Feedback',
      items: [
        { id: 'floating-ui', label: 'Floating UI' },
        { id: 'toasts', label: 'Toasts' },
        { id: 'modals', label: 'Modals' },
      ],
    },
    {
      label: 'Effects & Motion',
      items: [
        { id: 'loading-states', label: 'Loading States' },
        { id: 'kinetic-text', label: 'Kinetic Text' },
        { id: 'motion-primitives', label: 'Motion Primitives' },
      ],
    },
    {
      label: 'Data Visualization',
      items: [{ id: 'charts', label: 'Charts' }],
    },
  ];

  let activeId = $state('');
  let sidebarOpen = $state(false);
  let toggleBtnRef: HTMLButtonElement | undefined = $state();

  const activeLabel = $derived(
    sidebarSections.flatMap((s) => s.items).find((item) => item.id === activeId)
      ?.label ?? 'Sections',
  );

  function closeSidebar() {
    sidebarOpen = false;
    toggleBtnRef?.focus();
  }

  // Pull-to-refresh handlers
  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<!-- Grid Layout (sidebar + content)                                        -->
<!-- ─────────────────────────────────────────────────────────────────────── -->
<div class="docs-layout">
  <!-- Sticky group: toggle bar + dropdown expand together -->
  <div class="page-sidebar-header">
    <div class="page-sidebar-toggle-bar">
      <button
        bind:this={toggleBtnRef}
        class="btn-ghost w-full"
        type="button"
        aria-expanded={sidebarOpen}
        aria-controls="page-sidebar-nav"
        aria-label={`Page sections: ${activeLabel}`}
        data-state={sidebarOpen ? 'open' : undefined}
        onclick={() => (sidebarOpen = !sidebarOpen)}
      >
        <span class="text-small font-semibold">
          {activeLabel}
        </span>
        <ChevronDown class="icon" data-size="sm" />
      </button>
    </div>

    <Sidebar
      sections={sidebarSections}
      bind:activeId
      bind:open={sidebarOpen}
      onclose={closeSidebar}
    />
  </div>

  <!-- Main content -->
  <div class="docs-main">
    <PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
      <div class="container py-2xl">
        <div class="flex flex-col gap-lg text-center mb-2xl">
          <h1>Component Library</h1>
          <p class="text-dim">
            The complete Void Energy toolkit. Every element adapts to all
            atmospheres, physics presets, and density settings. Interactive
            demos for everyone &mdash; expandable code examples for developers.
          </p>

          <details class="surface-glass text-left">
            <summary>New here? Key concepts</summary>
            <div class="p-md flex flex-col gap-md">
              <p>
                <strong>Atmosphere</strong> &mdash; the active color palette,
                typography, and mood. 12 built-in presets (Void, Onyx, Terminal,
                Nebula, and more).
                <a href="/">Learn more on the intro page.</a>
              </p>
              <p>
                <strong>Physics</strong> &mdash; how surfaces render: Glass (translucent,
                blurred, glowing), Flat (opaque, sharp), or Retro (pixel-perfect,
                CRT-style).
              </p>
              <p>
                <strong>Mode</strong> &mdash; light or dark contrast. Glass and Retro
                require dark mode; Flat works in both.
              </p>
            </div>
          </details>

          <p class="text-small text-mute">
            This page is wrapped in a <code>PullRefresh</code> component &mdash;
            pull down (or scroll past the top) to trigger a refresh indicator.
            Props: <code>onrefresh</code> (async callback),
            <code>onerror</code> (error handler).
          </p>
        </div>

        <div class="flex flex-col gap-2xl">
          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Foundations</h3>
            <p class="text-small text-mute">
              Typography, color, and surface primitives that everything else is
              built on.
            </p>
          </div>
          <Typography />
          <Surfaces />
          <Prose />
          <Globals />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Primitives</h3>
            <p class="text-small text-mute">
              The atomic building blocks &mdash; icons and interactive elements.
            </p>
          </div>
          <Icons />
          <Buttons />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Form Controls</h3>
            <p class="text-small text-mute">
              Native HTML form elements with physics-aware styling.
            </p>
          </div>
          <Inputs />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Composites</h3>
            <p class="text-small text-mute">
              Higher-order components that combine primitives into purpose-built
              UI patterns.
            </p>
          </div>
          <Composites />
          <UserState />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Overlays & Feedback</h3>
            <p class="text-small text-mute">
              Floating panels, notifications, and dialogs for user
              communication.
            </p>
          </div>
          <FloatingUI />
          <Toasts />
          <Modals />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Effects & Motion</h3>
            <p class="text-small text-mute">
              Loading indicators, kinetic typography, and motion primitives.
            </p>
          </div>
          <Effects />
          <KineticTextShowcase />
          <MotionPrimitives />

          <hr />

          <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
            <h3 class="text-dim">Data Visualization</h3>
            <p class="text-small text-mute">
              Charts and metrics for dashboards and data-driven interfaces.
            </p>
          </div>
          <Charts />
        </div>
      </div>
    </PullRefresh>
  </div>
</div>
