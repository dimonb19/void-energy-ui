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
  - class:       Consumer classes on outer .image div
  - ...rest:     Forwarded to <img> (width, height, decoding, srcset, sizes, etc.)

  STATES (data-state on outer wrapper):
  - loading: skeleton visible, image hidden
  - loaded:  image faded in, skeleton removed
  - error:   muted ImageOff icon centered

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
    class?: string;
  }

  let {
    src,
    alt,
    aspectRatio,
    lazy = true,
    objectFit = 'cover',
    class: className = '',
    ...rest
  }: ImageProps = $props();

  let loaded = $state(false);
  let errored = $state(false);

  let imageState = $derived(errored ? 'error' : loaded ? 'loaded' : 'loading');

  $effect(() => {
    src;
    loaded = false;
    errored = false;
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
  style:aspect-ratio={aspectRatio}
  style:--image-fit={objectFit}
>
  {#if !loaded && !errored}
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
      {src}
      {alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onload={handleLoad}
      onerror={handleError}
    />
  {/if}
</div>
