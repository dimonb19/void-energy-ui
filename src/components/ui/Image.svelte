<!--
  IMAGE COMPONENT
  Native <img> wrapper with skeleton fallback, error state, and aspect-ratio.

  USAGE
  -------------------------------------------------------------------------
  <Image src="/hero.jpg" alt="Hero image" aspectRatio="16 / 9" />
  <Image src="/avatar.jpg" alt="Avatar" aspectRatio="1 / 1" objectFit="cover" />
  <Image src="/banner.jpg" alt="Banner" lazy={false} />
  -------------------------------------------------------------------------

  PROPS:
  - src:         Image source URL (required)
  - alt:         Alt text (required — accessibility)
  - aspectRatio: CSS aspect-ratio value (e.g., "16 / 9", "1 / 1")
  - lazy:        Native lazy loading (default: true)
  - objectFit:   How the image fills the wrapper (default: "cover")
  - progressive: Reveal bytes as they arrive instead of skeleton-then-pop (default: false)
  - class:       Consumer classes on outer .image div
  - ...rest:     Forwarded to <img> (width, height, decoding, srcset, sizes, etc.)

  STATES (data-state on outer wrapper):
  - loading: skeleton visible, image hidden
  - loaded:  image faded in, skeleton removed
  - error:   muted ImageOff icon centered

  PROGRESSIVE MODE:
  Set progressive={true} when the server streams the image (baseline JPEG over
  chunked transfer, or progressive JPEG). The skeleton + fade-in are suppressed
  so the browser's native top-down paint is visible. Set aspectRatio to prevent
  layout shift while bytes arrive. For frame-by-frame AI streaming over
  SSE/WebSocket, this component is the wrong shape — use a streaming variant.

  NAMING NOTE — Astro <Image> collision:
  Astro 5+ ships <Image> from `astro:assets` for responsive srcset. If you
  need both in a single .astro file, alias one:
    import { Image as VoidImage } from '@components/ui/Image.svelte';
  In .svelte files there is no collision (Astro's <Image> is .astro-only).

  @see _image.scss for physics styling
-->

<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { ImageOff } from '@lucide/svelte';
  import Skeleton from './Skeleton.svelte';

  interface ImageProps
    extends Omit<HTMLImgAttributes, 'src' | 'alt' | 'loading' | 'class'> {
    src: string;
    alt: string;
    aspectRatio?: string;
    lazy?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    progressive?: boolean;
    class?: string;
  }

  let {
    src,
    alt,
    aspectRatio,
    lazy = true,
    objectFit = 'cover',
    progressive = false,
    class: className = '',
    ...rest
  }: ImageProps = $props();

  let loaded = $state(false);
  let errored = $state(false);
  let imgEl = $state<HTMLImageElement>();

  let imageState = $derived(errored ? 'error' : loaded ? 'loaded' : 'loading');

  $effect(() => {
    src;
    loaded = false;
    errored = false;
  });

  // Post-hydration backstop. Browsers may finish (or fail) the image fetch
  // before Svelte attaches onload/onerror — that event fires once and is
  // lost, leaving the wrapper stuck in the loading state with the SCSS
  // opacity:0 hiding the image. The element's `complete` flag is
  // persistent: true once the fetch settles either way. naturalWidth tells
  // us which way it settled (>0 = decoded successfully, 0 with complete =
  // network/decode error). Same shape as Video.svelte's element.error
  // backstop.
  $effect(() => {
    if (!imgEl?.complete) return;
    if (imgEl.naturalWidth > 0) {
      loaded = true;
    } else {
      errored = true;
    }
  });

  function handleLoad() {
    loaded = true;
  }

  function handleError() {
    errored = true;
  }
</script>

<div
  class="image {className}"
  data-state={imageState}
  data-progressive={progressive ? 'true' : undefined}
  style:aspect-ratio={aspectRatio}
  style:--image-fit={objectFit}
>
  {#if !loaded && !errored && !progressive}
    <Skeleton variant="card" class="image-skeleton" />
  {/if}

  {#if errored}
    <div class="image-error" role="img" aria-label={alt}>
      <ImageOff class="icon" data-size="xl" />
    </div>
  {:else}
    <!--
      Spread comes BEFORE explicit attrs and handlers so consumer-passed
      extras (srcset, sizes, crossorigin, ...) apply but cannot clobber
      our load/error wiring or the lazy/decoding defaults.
    -->
    <img
      {...rest}
      bind:this={imgEl}
      {src}
      {alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onload={handleLoad}
      onerror={handleError}
    />
  {/if}
</div>
