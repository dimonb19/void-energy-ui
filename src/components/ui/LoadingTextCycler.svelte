<script lang="ts">
  import { kinetic } from '@actions/kinetic';
  import { LOADING_WORDS } from '@config/constants';

  interface LoadingTextCyclerProps {
    words?: string[];
    interval?: number;
    speed?: number;
    class?: string;
  }

  function shuffleTail(list: string[]): string[] {
    const [head, ...tail] = list;
    for (let i = tail.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tail[i], tail[j]] = [tail[j], tail[i]];
    }
    return [head, ...tail];
  }

  let {
    words = [...LOADING_WORDS],
    interval = 2000,
    speed = 65,
    class: className = '',
  }: LoadingTextCyclerProps = $props();

  // svelte-ignore state_referenced_locally
  const shuffledWords = shuffleTail(words);
</script>

<span
  class="loading-text-cycler kinetic-text flex items-center justify-center {className}"
  use:kinetic={{
    words: shuffledWords,
    mode: 'cycle',
    cycleTransition: 'type',
    speed,
    pauseDuration: interval,
    loop: true,
  }}
></span>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .loading-text-cycler {
    min-height: 1.4em; // void-ignore
    white-space: nowrap;
  }
</style>
