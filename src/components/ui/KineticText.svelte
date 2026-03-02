<!--
  KINETIC TEXT
  Physics-aware kinetic typography component.

  Thin wrapper around the kinetic action (src/actions/kinetic.ts).
  Animation logic lives in the action. SCSS owns cursor appearance.

  USAGE EXAMPLES
  ───────────────────────────────────────────────────────────────
  Typewriter:
  <KineticText text="Hello world" mode="char" cursor />

  Word-by-word:
  <KineticText text="Long paragraph..." mode="word" speed={80} />

  Loading cycler:
  <KineticText words={LOADING_WORDS} mode="cycle" cycleTransition="decode" />

  Decode reveal:
  <KineticText text="SYSTEM ONLINE" mode="decode" />

  Custom tag:
  <KineticText tag="p" text="Paragraph text" mode="char" class="mb-md" />
  ───────────────────────────────────────────────────────────────

  @see src/actions/kinetic.ts for animation engine
  @see src/styles/components/_kinetic.scss for cursor physics
-->
<script lang="ts">
  import {
    kinetic,
    type KineticConfig,
    type KineticMode,
  } from '@actions/kinetic';

  interface KineticTextProps {
    /** Single text to animate (char, word, decode modes) */
    text?: string;
    /** Word list to cycle through (cycle mode) */
    words?: string[];
    /** Animation mode */
    mode?: KineticMode;
    /** Chunk size for word mode reveal. Default: 'word' */
    chunk?: 'word' | 'sentence' | 'sentence-pair';
    /** Ms per animation unit. Defaults vary by mode. */
    speed?: number;
    /** Pause between cycled words (ms). Default: 1800 */
    pauseDuration?: number;
    /** Transition style for cycle mode */
    cycleTransition?: 'type' | 'fade' | 'decode';
    /** Show blinking cursor */
    cursor?: boolean;
    /** Loop cycle mode */
    loop?: boolean;
    /** HTML tag to render. Default: 'span' */
    tag?: string;
    /** Completion callback */
    oncomplete?: () => void;
    /** Additional classes (layout/geometry only) */
    class?: string;
  }

  let {
    text,
    words,
    mode = 'char',
    chunk,
    speed,
    pauseDuration,
    cycleTransition,
    cursor = false,
    loop,
    tag = 'span',
    oncomplete,
    class: className = '',
  }: KineticTextProps = $props();

  let animating = $state(true);

  const actionConfig = $derived<KineticConfig>({
    text,
    words,
    mode,
    chunk,
    speed,
    pauseDuration,
    cycleTransition,
    cursor,
    loop,
    onComplete: () => {
      animating = false;
      oncomplete?.();
    },
  });
</script>

<svelte:element
  this={tag}
  class="kinetic-text {className}"
  data-mode={mode}
  data-state={animating ? 'animating' : undefined}
  aria-live="polite"
  aria-busy={animating}
  use:kinetic={actionConfig}
></svelte:element>
