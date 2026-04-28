<!--
  ADAPTIVE IMAGE
  Physics/mode-aware decorative image. Selects which pre-existing source URL
  to display based on the active atmosphere's physics × mode (4 valid
  combinations: glass-dark, flat-dark, flat-light, retro-dark). Mirrors
  <Image>'s `.image` SCSS surface (skeleton, error, aspect-ratio, opacity
  fade) but holds the previous frame across atmosphere-driven src swaps
  instead of resetting to the loading state.

  Per D33: never transforms pixels — only selects between consumer-provided
  source URLs. Resolution keys on the finite axes (physics × mode), never on
  unbounded atmosphere names.

  USAGE
  -------------------------------------------------------------------------
  <AdaptiveImage
    src="/hero.jpg"             {/* default fallback — required */}
    dark="/hero-dark.jpg"
    light="/hero-light.jpg"
    glass="/hero-glass.jpg"
    flat="/hero-flat.jpg"
    retro="/hero-retro.jpg"
    alt="Hero image"
    aspectRatio="16 / 9"
  />
  -------------------------------------------------------------------------

  RESOLUTION PRECEDENCE: physics > mode > default src
  - If active physics matches a physics-prop, use it
  - Else if active mode matches a mode-prop, use it
  - Else fall through to src

  SWAP BEHAVIOR (decode-then-swap):
  On atmosphere change the next variant is fetched and decoded off-DOM via
  Image().decode(). Only after decode resolves does the visible <img>'s src
  advance — the browser holds the previous frame on the element during the
  swap, so the wrapper never returns to the loading state. No skeleton
  flash, no opacity reset, no missing-image gap.

  The skeleton state is therefore only ever visible for the *initial* mount
  (before any variant has loaded). Subsequent atmosphere swaps go straight
  from old frame to new frame.

  SSR / SEO TRADE-OFF:
  The <img> is gated on a client-only `mounted` flag — pre-rendered HTML
  contains skeleton markup but no <img> element. Search engines that do not
  execute JS, and visitors with JS disabled, see only the skeleton. This is
  a deliberate consequence of the SSR-vs-client mismatch: voidEngine has no
  localStorage knowledge on the server, so any SSR-emitted <img> would lock
  in the default-atmosphere variant and lock the user out of their persisted
  choice (Svelte hydration trusts SSR HTML for static-equality bindings).
  For decorative atmosphere-aware imagery this is the right trade-off; for
  SEO-critical hero imagery without atmosphere variants, use plain <Image>.
  Revisit once the W5 SSR cookie bridge ships and the server can emit the
  correct variant.

  RELATIONSHIP TO <Image>:
  Reuses the `.image` SCSS class but reimplements its template (skeleton +
  error + img + opacity fade) instead of composing it. Composing <Image>
  would defeat swap-without-flash because <Image>'s effect resets `loaded`
  to false on every src change. If <Image> later gains features (e.g., the
  `progressive` prop hinted at in the registry), they will not propagate
  here without manual sync.
-->

<script lang="ts">
  import type { HTMLImgAttributes } from 'svelte/elements';
  import { ImageOff } from '@lucide/svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import Skeleton from './Skeleton.svelte';

  interface AdaptiveImageProps
    extends Omit<HTMLImgAttributes, 'src' | 'alt' | 'loading' | 'class'> {
    src: string;
    alt: string;
    dark?: string;
    light?: string;
    glass?: string;
    flat?: string;
    retro?: string;
    aspectRatio?: string;
    lazy?: boolean;
    objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
    class?: string;
  }

  let {
    src,
    alt,
    dark,
    light,
    glass,
    flat,
    retro,
    aspectRatio,
    lazy = true,
    objectFit = 'cover',
    class: className = '',
    ...rest
  }: AdaptiveImageProps = $props();

  // currentTheme is $derived in voidEngine, so reading .physics / .mode here
  // auto-tracks atmosphere changes — no $effect subscription needed.
  const resolvedSrc = $derived.by(() => {
    const physics = voidEngine.currentTheme.physics;
    const mode = voidEngine.currentTheme.mode;

    if (physics === 'glass' && glass) return glass;
    if (physics === 'flat' && flat) return flat;
    if (physics === 'retro' && retro) return retro;
    if (mode === 'dark' && dark) return dark;
    if (mode === 'light' && light) return light;
    return src;
  });

  // The <img> is gated on `mounted` and only renders client-side. SSR emits
  // skeleton-only HTML (no stale src), so there is no SSR-vs-client mismatch
  // to recover from on hydration. Once the first $effect runs, mounted flips
  // and displayedSrc captures the correct resolved variant — the <img>
  // mounts with that value already set, so the browser's first fetch is the
  // right URL.
  let mounted = $state(false);
  // svelte-ignore state_referenced_locally
  let displayedSrc = $state<string>(src);
  let loaded = $state(false);
  let errored = $state(false);

  let imageState = $derived(errored ? 'error' : loaded ? 'loaded' : 'loading');

  $effect(() => {
    // First-paint reconciliation. resolvedSrc may differ between SSR (where
    // voidEngine has no localStorage knowledge) and the client (where the
    // FOUC bootloader has already painted the persisted atmosphere onto
    // <html data-*> and voidEngine.init() has read it). Set displayedSrc
    // here so the <img> mounts with the correct variant from the start.
    if (!mounted) {
      displayedSrc = resolvedSrc;
      mounted = true;
      return;
    }

    // Subsequent atmosphere swaps: decode-then-swap. The next variant is
    // fetched and decoded off-DOM via a throwaway Image(); only after decode
    // resolves does `displayedSrc` advance. The browser holds the previous
    // frame on the visible <img> across the src change, so we deliberately
    // do NOT reset `loaded` — that would flip the wrapper back to the
    // skeleton state.
    const next = resolvedSrc;
    if (next === displayedSrc) return;
    if (typeof window === 'undefined') {
      displayedSrc = next;
      return;
    }
    let cancelled = false;
    // `window.Image` is the DOM's HTMLImageElement constructor — disambiguated
    // from this file's existence next to `Image.svelte`.
    const probe = new window.Image();
    const promote = () => {
      if (cancelled) return;
      errored = false;
      displayedSrc = next;
    };
    probe.src = next;
    if (typeof probe.decode === 'function') {
      // decode() resolves once the image is fully decoded and ready to paint
      // without jank. Promote on either resolve or reject — on reject the
      // <img> below will fire its own onerror and surface the error icon.
      probe.decode().then(promote, promote);
    } else {
      probe.onload = promote;
      probe.onerror = promote;
    }
    return () => {
      cancelled = true;
      probe.onload = null;
      probe.onerror = null;
    };
  });

  function handleLoad() {
    loaded = true;
    errored = false;
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
  {:else if mounted}
    <!--
      Client-only render. SSR emits skeleton-only HTML so there is no stale
      `<img src>` for hydration to reconcile against — the element mounts on
      the client with `displayedSrc` already pointing at the correct variant.
      Spread comes BEFORE explicit attrs and handlers so consumer-passed
      extras (srcset, sizes, crossorigin, ...) apply but cannot clobber
      our load/error wiring or the lazy/decoding defaults.
    -->
    <img
      {...rest}
      src={displayedSrc}
      {alt}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      onload={handleLoad}
      onerror={handleError}
    />
  {/if}
</div>
