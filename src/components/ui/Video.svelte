<!--
  VIDEO COMPONENT
  Native <video> wrapper with skeleton fallback, error state, and aspect-ratio.

  USAGE
  -------------------------------------------------------------------------
  <Video src="/clip.mp4" poster="/poster.jpg" />
  <Video src="/clip.mp4" aspectRatio="9 / 16" />
  <Video src="/loop.mp4" controls={false} autoplay muted loop playsinline />
  <Video src="/clip.mp4">
    <track kind="captions" src="/captions.vtt" srclang="en" label="English" default />
  </Video>
  -------------------------------------------------------------------------

  PROPS:
  - src:         Video source URL (required)
  - poster:      Poster image shown until playback starts
  - controls:    Native browser controls (default: true)
  - preload:     'none' | 'metadata' | 'auto' (default: 'metadata')
  - aspectRatio: CSS aspect-ratio value (default: '16 / 9')
  - element:     Bindable ref to the inner HTMLVideoElement
  - class:       Consumer classes on outer .video div
  - children:    <source> / <track> elements rendered inside <video>
  - ...rest:     Forwarded to <video> (autoplay, muted, loop, playsinline, etc.)

  STATES (data-state on outer wrapper):
  - loading: metadata not yet known (skeleton renders only when no poster)
  - ready:   metadata loaded, video faded in (poster or first frame visible)
  - error:   muted VideoOff icon centered

  POSTER PREEMPTS SKELETON
  Modern browsers treat preload="metadata" as a suggestion and frequently
  defer it for non-autoplay videos until user interaction. This means
  loadedmetadata may not fire for a long time. When a poster is supplied
  the browser already shows it as the loading state — overlaying a skeleton
  on top would be wrong UX. We only render the skeleton when no poster is
  provided (true blank loading state).

  CUSTOM CONTROLS
  Set controls={false}, capture the <video> ref via bind:element, and render
  a <MediaSlider> wired to it through $effect blocks for custom playback chrome.

  DEFAULT preload="metadata" RATIONALE
  'auto' is too aggressive for mobile data. With a poster, the browser
  shows it immediately regardless of preload value.

  @see _video.scss for physics styling
-->

<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLVideoAttributes } from 'svelte/elements';
  import { VideoOff } from '@lucide/svelte';
  import Skeleton from './Skeleton.svelte';

  interface VideoProps
    extends Omit<
      HTMLVideoAttributes,
      'src' | 'poster' | 'preload' | 'controls' | 'class' | 'children'
    > {
    src: string;
    poster?: string;
    controls?: boolean;
    preload?: 'none' | 'metadata' | 'auto';
    aspectRatio?: string;
    element?: HTMLVideoElement;
    class?: string;
    children?: Snippet;
  }

  let {
    src,
    poster,
    controls = true,
    preload = 'metadata',
    aspectRatio = '16 / 9',
    element = $bindable(),
    class: className = '',
    children,
    ...rest
  }: VideoProps = $props();

  let ready = $state(false);
  let errored = $state(false);

  // Reactive bindings on <video> properties: more reliable than the
  // loadedmetadata/loadeddata events, which some browsers skip on cached or
  // Range-fetched files. duration becomes a finite number once metadata
  // arrives; readyState >= 2 (HAVE_CURRENT_DATA) means a frame is renderable.
  let videoDuration = $state<number>(NaN);
  let videoReadyState = $state(0);

  let videoState = $derived(errored ? 'error' : ready ? 'ready' : 'loading');

  $effect(() => {
    src;
    ready = false;
    errored = false;
    videoDuration = NaN;
    videoReadyState = 0;
  });

  $effect(() => {
    if (Number.isFinite(videoDuration) && videoDuration > 0) {
      ready = true;
    }
    if (videoReadyState >= 2) {
      ready = true;
    }
  });

  // Post-hydration error backstop. SSR emits the <video src> directly, so the
  // browser may dispatch the `error` event before Svelte attaches onerror —
  // that event fires once and is lost. The element's `.error` property is
  // persistently set, so we check it once the bind:this ref resolves.
  $effect(() => {
    if (element?.error) {
      errored = true;
    }
  });

  function handleReady() {
    ready = true;
  }

  function handleError() {
    errored = true;
  }
</script>

<div
  class="video {className}"
  data-state={videoState}
  style:aspect-ratio={aspectRatio}
>
  {#if !ready && !errored && !poster}
    <!--
      Skeleton only when no poster: browsers defer preload="metadata" for
      non-autoplay videos, so loadedmetadata may not fire until user interaction.
      Poster IS the loading state in that case — overlaying a skeleton would be
      wrong UX. With no poster, the skeleton fills the visual void.
    -->
    <Skeleton variant="card" class="video-skeleton" />
  {/if}

  {#if errored}
    <div class="video-error" role="img" aria-label="Video unavailable">
      <VideoOff class="icon" data-size="xl" />
    </div>
  {:else}
    <!-- svelte-ignore a11y_media_has_caption -->
    <!--
      Spread comes BEFORE explicit handlers so consumer-passed extras
      (autoplay, muted, loop, playsinline, ...) apply but cannot clobber
      our load/error wiring. Both onloadedmetadata and onloadeddata trigger
      ready: the former is the canonical signal but some browsers / network
      paths skip it on cached/range-fetched files; loadeddata is a reliable
      backstop (always fires once the first frame is renderable).
    -->
    <video
      {...rest}
      bind:this={element}
      bind:duration={videoDuration}
      bind:readyState={videoReadyState}
      {src}
      {poster}
      {controls}
      {preload}
      onloadedmetadata={handleReady}
      onloadeddata={handleReady}
      onerror={handleError}
    >
      {#if children}{@render children()}{/if}
    </video>
  {/if}
</div>
