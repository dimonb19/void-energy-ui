<script lang="ts">
  import type { StoryTextProps } from '../types';

  let {
    text,
    styleSnapshot,
    revealMode = 'char',
    activeEffect = null,
    cues = [],
    seed,
    reducedMotion = 'auto',
    as = 'span',
    class: className = '',
  }: StoryTextProps = $props();

  const cueCount = $derived(cues.length);
</script>

<svelte:element
  this={as}
  class="story-text-premium {className}"
  data-story-text="premium"
  data-reveal-mode={revealMode}
  data-effect={activeEffect ?? undefined}
  data-physics={styleSnapshot.physics}
  data-mode={styleSnapshot.mode}
  data-reduced-motion={reducedMotion}
  data-cues={cueCount > 0 ? cueCount : undefined}
  data-seed={seed !== undefined ? String(seed) : undefined}
  aria-live="polite"
  aria-busy="false"
>
  {text}
</svelte:element>
