<script lang="ts">
  import PullRefresh from '@components/ui/PullRefresh.svelte';
  import PortalLoader from '@components/ui/PortalLoader.svelte';
  import Tile from '@components/ui/Tile.svelte';
  import StoryCategory from '@components/ui/StoryCategory.svelte';

  let portalStatus = $state<'idle' | 'loading'>('loading');

  async function handleRefresh(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  function handleRefreshError(error: unknown): void {
    console.error('Refresh error:', error);
  }

  // ── Mock story data ─────────────────────────────────────────────────────
  const hottestStories = [
    {
      title: 'Machine Rebellion',
      href: '#',
      author: {
        name: 'Ada Sterling',
        avatar: 'https://i.pravatar.cc/48?u=ada',
        href: '#',
      },
      genres: ['Psychological', 'Sci-Fi'],
      image: 'https://picsum.photos/seed/hot1/400/600',
      mark: 'resume' as const,
    },
    {
      title: 'The Last Archive',
      href: '#',
      author: {
        name: 'Marcus Voss',
        avatar: 'https://i.pravatar.cc/48?u=marcus',
        href: '#',
      },
      genres: ['Mystery', 'Historical'],
      image: 'https://picsum.photos/seed/hot2/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Neon Requiem',
      href: '#',
      author: { name: 'Zara Okafor', href: '#' },
      genres: ['Cyberpunk', 'Thriller'],
      image: 'https://picsum.photos/seed/hot3/400/600',
    },
    {
      title: 'Verdant Echoes',
      href: '#',
      author: {
        name: 'Liam Chen',
        avatar: 'https://i.pravatar.cc/48?u=liam',
        href: '#',
      },
      genres: ['Fantasy'],
      image: 'https://picsum.photos/seed/hot4/400/600',
      mark: 'replay' as const,
    },
    {
      title: 'Crimson Meridian',
      href: '#',
      author: {
        name: 'Ivy Nakamura',
        avatar: 'https://i.pravatar.cc/48?u=ivy',
        href: '#',
      },
      genres: ['Horror', 'Supernatural'],
      image: 'https://picsum.photos/seed/hot5/400/600',
    },
  ];

  const beginnerStories = [
    {
      title: 'First Light',
      href: '#',
      author: { name: 'CoNexus Team', href: '#' },
      genres: ['Tutorial', 'Adventure'],
      image: 'https://picsum.photos/seed/begin1/400/600',
    },
    {
      title: 'The Whispering Woods',
      href: '#',
      author: {
        name: 'Elena Frost',
        avatar: 'https://i.pravatar.cc/48?u=elena',
        href: '#',
      },
      genres: ['Fantasy', 'Relaxing'],
      image: 'https://picsum.photos/seed/begin2/400/600',
      mark: 'complete' as const,
    },
    {
      title: 'Signal Lost',
      href: '#',
      author: {
        name: 'Kai Brandt',
        avatar: 'https://i.pravatar.cc/48?u=kai',
        href: '#',
      },
      genres: ['Sci-Fi', 'Puzzle'],
      image: 'https://picsum.photos/seed/begin3/400/600',
    },
    {
      title: 'Echoes of Stone',
      href: '#',
      author: { name: 'Priya Sharma', href: '#' },
      genres: ['Historical', 'Drama'],
      image: 'https://picsum.photos/seed/begin4/400/600',
      mark: 'resume' as const,
    },
  ];
</script>

<PullRefresh onrefresh={handleRefresh} onerror={handleRefreshError}>
  <div class="h-2xl"></div>

  <StoryCategory title="Hottest right now" tagline="Most played this week.">
    {#each hottestStories as story}
      <Tile
        title={story.title}
        href={story.href}
        author={story.author}
        genres={story.genres}
        image={story.image}
        mark={story.mark}
      />
    {/each}
  </StoryCategory>

  <StoryCategory
    title="Getting Started"
    tagline="Short, beginner-friendly journeys."
  >
    {#each beginnerStories as story}
      <Tile
        title={story.title}
        href={story.href}
        author={story.author}
        genres={story.genres}
        image={story.image}
        mark={story.mark}
      />
    {/each}
  </StoryCategory>

  <div class="container py-2xl">
    <div class="flex flex-col gap-2xl">
      <hr />

      <!-- ─── PORTAL LOADER ─────────────────────────────────────────── -->
      <div class="flex flex-col gap-sm border-l-2 border-primary pl-md">
        <h3 class="text-dim">Portal Loader</h3>
        <p class="text-small text-mute">
          The animated loading screen for CoNexus story worlds.
        </p>
      </div>

      <div class="surface-raised p-lg flex flex-col gap-lg">
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
    </div>
  </div>
</PullRefresh>

<style lang="scss">
  :global(.portal-ring-demo) {
    width: 100%;
    max-width: 480px; // void-ignore
  }
</style>
