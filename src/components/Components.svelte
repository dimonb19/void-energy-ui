<script lang="ts">
  import { ChevronDown } from '@lucide/svelte';
  import PullRefresh from './ui/PullRefresh.svelte';
  import Sidebar from './ui/Sidebar.svelte';

  // Foundations
  import Typography from './ui-library/Typography.svelte';
  import Surfaces from './ui-library/Surfaces.svelte';
  import Atmospheres from './ui-library/Atmospheres.svelte';
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
  import TabsShowcase from './ui-library/TabsShowcase.svelte';
  import PaginationShowcase from './ui-library/PaginationShowcase.svelte';
  // Overlays & Feedback
  import FloatingUI from './ui-library/FloatingUI.svelte';
  import Toasts from './ui-library/Toasts.svelte';
  import Modals from './ui-library/Modals.svelte';
  // Effects & Motion
  import Effects from './ui-library/Effects.svelte';
  import MotionPrimitives from './ui-library/MotionPrimitives.svelte';
  import KineticText from './ui-library/KineticText.svelte';
  import DragAndDrop from './ui-library/DragAndDrop.svelte';
  import PortalRingShowcase from './ui-library/PortalRing.svelte';
  // Data Visualization
  import Charts from './ui-library/Charts.svelte';

  const sidebarSections = [
    {
      label: 'Foundations',
      items: [
        { id: 'typography', label: 'Typography' },
        { id: 'surfaces', label: 'Surfaces' },
        { id: 'atmospheres', label: 'Atmospheres' },
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
        { id: 'tabs', label: 'Tabs' },
        { id: 'pagination', label: 'Pagination' },
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
        { id: 'motion-primitives', label: 'Motion Primitives' },
        { id: 'kinetic-text', label: 'Kinetic Text' },
        { id: 'drag-and-drop', label: 'Drag & Drop' },
        { id: 'portal-ring', label: 'Portal Ring' },
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
          <p class="text-small text-mute max-w-3xl mx-auto">
            This library is native-first: some patterns ship as reusable Svelte
            primitives, some are provided as styled semantic HTML, and some are
            documented recipes built from Tailwind plus existing primitives. A
            missing wrapper does not automatically mean a missing capability.
          </p>

          <details class="surface-raised text-left">
            <summary>New here? Key concepts</summary>
            <div class="p-lg flex flex-col gap-md">
              <p>
                <strong>Atmosphere</strong> &mdash; the active color palette,
                typography, and mood. 4 built-in presets (Void, Onyx, Terminal,
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
              <p>
                <strong>Coverage model</strong> &mdash; use shipped primitives
                for reusable interaction logic (<code>Dropdown</code>,
                <code>Sidebar</code>, <code>Toggle</code>), raw semantic HTML
                for browser-native patterns (<code>&lt;details&gt;</code>,
                <code>&lt;table&gt;</code>), and documented recipes for
                app-specific compositions like nav menus.
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

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
            <h3 class="text-dim">Foundations</h3>
            <p class="text-small text-mute">
              Typography, color, and surface primitives that everything else is
              built on.
            </p>
          </div>
          <Typography />
          <Surfaces />
          <Atmospheres />
          <Prose />
          <Globals />

          <hr />

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
            <h3 class="text-dim">Primitives</h3>
            <p class="text-small text-mute">
              The atomic building blocks &mdash; icons and interactive elements.
            </p>
          </div>
          <Icons />
          <Buttons />

          <hr />

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
            <h3 class="text-dim">Form Controls</h3>
            <p class="text-small text-mute">
              Native HTML form elements with physics-aware styling.
            </p>
          </div>
          <Inputs />

          <hr />

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
            <h3 class="text-dim">Composites</h3>
            <p class="text-small text-mute">
              Higher-order components that combine primitives into purpose-built
              UI patterns.
            </p>
          </div>
          <Composites />
          <TabsShowcase />
          <PaginationShowcase />
          <UserState />

          <hr />

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
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

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
            <h3 class="text-dim">Effects & Motion</h3>
            <p class="text-small text-mute">
              Loading indicators and motion primitives.
            </p>
          </div>
          <Effects />
          <MotionPrimitives />
          <KineticText />
          <DragAndDrop />
          <PortalRingShowcase />

          <hr />

          <div
            class="flex flex-col gap-sm border-0 border-l border-solid border-primary pl-md"
          >
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
