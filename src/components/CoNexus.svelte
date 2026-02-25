<script lang="ts">
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import PortalLoader from '@components/ui/PortalLoader.svelte';

  let portalStatus = $state<'idle' | 'loading'>('loading');

  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="container py-2xl">
    <div class="flex flex-col gap-2xl">
      <!-- ─── PORTAL LOADER ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
        <h3 class="text-dim">Portal Loader</h3>
        <p class="text-small text-mute">
          The animated loading screen for CoNexus story worlds.
        </p>
      </div>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <details>
          <summary>Technical Details</summary>
          <div class="p-md flex flex-col gap-md">
            <p>
              The portal is a 4-layer absolute stack: a circuit-board texture at
              5% opacity, a vignette overlay at 50% opacity, an SVG circuitry
              layer with draw-on path animation, and a centered quill icon. All
              layers fill the same <code>aspect-ratio: 2048/1228</code>
              container with responsive max-width scaling up to
              <code>1024px</code>.
            </p>
            <p>
              <strong>LoadingPortal</strong> renders 4 staggered path groups (<code
                >.draw-a</code
              >
              through <code>.draw-d</code>) using
              <code>stroke-dasharray</code>/<code>stroke-dashoffset</code>
              animation on a 6s draw cycle with 1.5s stagger between groups. The
              entire circuitry rotates 360&deg; over 120s.
            </p>
            <p>
              <strong>LoadingQuill</strong> cycles a 3s lifecycle: the stroke traces
              the quill outline, the body fill fades in with a scale pulse, and an
              accent dot levitates from the pen tip before being absorbed back. A
              gentle breath translation keeps the whole quill alive.
            </p>
            <p>
              Two states control the animation:
              <code>idle</code> (frozen, dimmed) and
              <code>loading</code> (animated).
            </p>
          </div>
        </details>

        <div class="flex flex-col gap-sm items-center">
          <p class="text-small text-mute">
            Toggle between <code>idle</code> and <code>loading</code> states. In
            idle, all layers freeze and dim. In loading, circuitry paths draw on
            in staggered waves while the quill cycles its trace&ndash;fill&ndash;absorb
            animation.
          </p>

          <PortalLoader status={portalStatus} />
          <button
            class="btn-ghost"
            onclick={() =>
              (portalStatus = portalStatus === 'loading' ? 'idle' : 'loading')}
          >
            {portalStatus === 'loading' ? 'Stop' : 'Start'}
          </button>

          <p class="text-caption text-mute px-xs">
            The loader fills its container width, scaling from <code>640px</code
            >
            at tablet to <code>1024px</code> at full-HD. Pass
            <code>status="idle"</code> to hold the portal in a dormant state, or
            <code>status="loading"</code> to activate all animations.
          </p>
        </div>
      </div>

      <hr />

      <!-- ─── WHAT'S COMING ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
        <h3 class="text-dim">Coming Soon</h3>
        <p class="text-small text-mute">Features on the roadmap for CoNexus.</p>
      </div>

      <div class="surface-glass p-lg flex flex-col gap-lg">
        <ul class="flex flex-col gap-md">
          <li>
            <strong>Story categories</strong> &mdash; browsable tile grid that organizes
            stories by topic.
          </li>
          <li>
            <strong>Drag & drop</strong> &mdash; direct manipulation for reordering
            or organizing content by dragging elements into place.
          </li>

          <hr />

          <li>
            <strong>Ambient layers</strong> &mdash; atmospheric background visuals
            that shift with theme and context.
          </li>
        </ul>
      </div>
    </div>
  </div>
</PullRefresh>
