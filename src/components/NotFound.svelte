<script lang="ts">
  import PortalRing from './icons/PortalRing.svelte';
  import { House } from '@lucide/svelte';
  import { navlink } from '@actions/navlink';
</script>

<div
  class="flex flex-col items-center justify-center gap-lg py-2xl"
  style="min-height: calc(100vh - var(--nav-height));"
>
  <div class="portal-ring-container">
    <PortalRing intensity={1.2} />
  </div>

  <div class="flex flex-col items-center gap-xs text-center">
    <h1 class="text-h3 text-dim">Lost in the Void</h1>
    <p class="text-mute">
      This page doesn't exist, but the portal remains open.
    </p>
  </div>

  <a href="/" class="btn btn-ghost inline-flex items-center gap-xs" use:navlink>
    <House class="icon" data-size="sm" />
    Return Home
  </a>
</div>

<style lang="scss">
  .portal-ring-container {
    width: min(24rem, 80vw);
    aspect-ratio: 1;
  }
</style>
