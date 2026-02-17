<script lang="ts">
  import PullRefresh from './ui/PullRefresh.svelte';

  // Foundations
  import Typography from './ui-library/Typography.svelte';
  import Surfaces from './ui-library/Surfaces.svelte';
  // Primitives
  import Icons from './ui-library/Icons.svelte';
  import Buttons from './ui-library/Buttons.svelte';
  // Form Controls
  import Inputs from './ui-library/Inputs.svelte';
  import DataUpload from './ui-library/DataUpload.svelte';
  // Composites
  import Composites from './ui-library/Composites.svelte';
  // Overlays & Feedback
  import FloatingUI from './ui-library/FloatingUI.svelte';
  import Toasts from './ui-library/Toasts.svelte';
  import Modals from './ui-library/Modals.svelte';

  const sections = [
    { id: 'typography', label: 'Typography', number: '01' },
    { id: 'surfaces', label: 'Surfaces', number: '02' },
    { id: 'icons', label: 'Icons', number: '03' },
    { id: 'buttons', label: 'Buttons', number: '04' },
    { id: 'inputs', label: 'Inputs', number: '05' },
    { id: 'data-upload', label: 'Data Upload', number: '06' },
    { id: 'composites', label: 'Composites', number: '07' },
    { id: 'floating-ui', label: 'Floating UI', number: '08' },
    { id: 'toasts', label: 'Toasts', number: '09' },
    { id: 'modals', label: 'Modals', number: '10' },
  ];

  // Pull-to-refresh handlers
  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="container flex flex-col gap-2xl py-2xl">
    <div class="flex flex-col gap-lg text-center">
      <h1>Component Library</h1>
      <p class="text-dim">
        The complete Void Energy toolkit. Every element adapts to all
        atmospheres, physics presets, and density settings. Interactive demos
        for everyone &mdash; expandable code examples for developers.
      </p>
      <p class="text-small text-mute">
        This page is wrapped in a <code>PullRefresh</code> component &mdash; pull
        down (or scroll past the top) to see it in action.
      </p>

      <nav
        class="flex flex-row flex-wrap gap-xs justify-center"
        aria-label="Section navigation"
      >
        {#each sections as s}
          <a href="#{s.id}" class="chip">
            <span class="chip-label">{s.label}</span>
          </a>
        {/each}
      </nav>
    </div>

    <hr />

    <div class="flex flex-col gap-xs">
      <h3 class="text-mute">Foundations</h3>
      <p class="text-small text-mute">
        Typography, color, and surface primitives that everything else is built
        on.
      </p>
    </div>
    <Typography />
    <Surfaces />

    <hr />

    <div class="flex flex-col gap-xs">
      <h3 class="text-mute">Primitives</h3>
      <p class="text-small text-mute">
        The atomic building blocks &mdash; icons and interactive elements.
      </p>
    </div>
    <Icons />
    <Buttons />

    <hr />

    <div class="flex flex-col gap-xs">
      <h3 class="text-mute">Form Controls</h3>
      <p class="text-small text-mute">
        Native HTML form elements with physics-aware styling.
      </p>
    </div>
    <Inputs />
    <DataUpload />

    <hr />

    <div class="flex flex-col gap-xs">
      <h3 class="text-mute">Composites</h3>
      <p class="text-small text-mute">
        Higher-order components that combine primitives into purpose-built UI
        patterns.
      </p>
    </div>
    <Composites />

    <hr />

    <div class="flex flex-col gap-xs">
      <h3 class="text-mute">Overlays & Feedback</h3>
      <p class="text-small text-mute">
        Floating panels, notifications, and dialogs for user communication.
      </p>
    </div>
    <FloatingUI />
    <Toasts />
    <Modals />
  </div>
</PullRefresh>
