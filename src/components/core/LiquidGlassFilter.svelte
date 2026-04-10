<!--
  LiquidGlassFilter — Global SVG filter definitions for glass refraction.

  Provides a displacement-based distortion filter that simulates light
  bending through curved glass. Used by the `glass-blur` SCSS mixin via
  `backdrop-filter: url(#liquid-glass)` (Chromium progressive enhancement).

  The filter chain runs: blur → generate noise → displace blurred result.
  Order matters: blur BEFORE displacement so the warping stays visible
  through the frost. If blur came after, it would smooth the distortion away.

  Place once in the app shell (Layout.astro). The filter is invisible —
  it only defines reusable SVG filter primitives referenced by CSS.

  Browser support:
  - Chromium (Chrome, Edge, Brave, Opera): full displacement + blur
  - Firefox / Safari: graceful fallback to blur-only (CSS cascade)

  @example Layout.astro
  ```astro
  <LiquidGlassFilter client:load />
  ```
-->
<script lang="ts">
  import { voidEngine } from '@adapters/void-engine.svelte';

  // Only render filter defs when glass physics is active.
  // Other physics modes don't use the filter — no need to pollute the DOM.
  const isGlass = $derived(voidEngine.currentTheme?.physics === 'glass');

  // Feature gate: only Chromium renders url() in backdrop-filter.
  // window.chrome exists in all Chromium browsers (Chrome, Edge, Brave, Opera)
  // but not in Firefox or Safari. Set data-liquid-glass on <html> AFTER the
  // SVG is in the DOM so CSS never references a filter that doesn't exist yet.
  $effect(() => {
    if (isGlass && typeof window !== 'undefined' && !!(window as any).chrome) {
      document.documentElement.dataset.liquidGlass = '';
      return () => delete document.documentElement.dataset.liquidGlass;
    }
  });
</script>

{#if isGlass}
  <svg
    class="liquid-glass-defs"
    aria-hidden="true"
    focusable="false"
    style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none"
  >
    <defs>
      <!--
        Liquid Glass Refraction Filter

        Pipeline:
        1. feGaussianBlur frosts the backdrop (same role as CSS backdrop blur)
        2. feTurbulence generates smooth fractal noise (the "glass surface")
        3. feDisplacementMap warps the BLURRED result using noise
        4. feColorMatrix boosts saturation (lensed glass brightens colors)
        Result: frosted glass with visible organic warping — the loupe effect.

        Why blur is inside the SVG, not in CSS:
        CSS backdrop-filter chains left→right. If we did url(#filter) blur(),
        the blur would run AFTER displacement and smooth the warping away.
        By putting blur first in the SVG chain, displacement operates on
        already-blurred content, keeping the warping clearly visible.

        Tuning knobs:
        - stdDeviation 8: frost intensity (lighter than --physics-blur // void-ignore 20px
          to let distortion show through more clearly)
        - baseFrequency 0.02: warp scale (detailed patterned-glass texture)
        - numOctaves 3: smoothness (fine detail + smooth transitions)
        - scale 14: displacement intensity in pixels (~7px max warp) // void-ignore

        Note: stdDeviation is hardcoded because SVG attributes can't use
        CSS custom properties. Glass physics always uses --physics-blur: 20px. // void-ignore
      -->
      <filter
        id="liquid-glass"
        x="-15%"
        y="-15%"
        width="130%"
        height="130%"
        color-interpolation-filters="sRGB"
      >
        <!-- Step 1: Frost the backdrop (light frost — lets distortion show through) -->
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blurred" />

        <!-- Step 2: Generate glass surface noise -->
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.02"
          numOctaves="3"
          seed="42"
          result="noise"
        />

        <!-- Step 3: Warp the frosted backdrop with the noise -->
        <feDisplacementMap
          in="blurred"
          in2="noise"
          scale="14"
          xChannelSelector="R"
          yChannelSelector="G"
          result="displaced"
        />

        <!-- Step 4: Boost saturation (lensed glass effect) -->
        <feColorMatrix in="displaced" type="saturate" values="1.8" />
      </filter>
    </defs>
  </svg>
{/if}
