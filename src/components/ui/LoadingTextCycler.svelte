<script lang="ts">
  import { materialize, dematerialize } from '@lib/transitions.svelte';

  interface LoadingTextCyclerProps {
    words?: string[];
    interval?: number;
    class?: string;
  }

  const DEFAULT_WORDS = [
    'Synthesizing…',
    'Calibrating…',
    'Mapping…',
    'Resolving…',
    'Aligning…',
    'Rendering…',
    'Connecting…',
    'Traversing…',
    'Tuning…',
    'Assembling…',
  ];

  function shuffleTail(list: string[]): string[] {
    const [head, ...tail] = list;
    for (let i = tail.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tail[i], tail[j]] = [tail[j], tail[i]];
    }
    return [head, ...tail];
  }

  let {
    words = DEFAULT_WORDS,
    interval = 2000,
    class: className = '',
  }: LoadingTextCyclerProps = $props();

  const shuffledWords = shuffleTail(words);
  let index = $state(0);

  $effect(() => {
    const id = setInterval(() => {
      index = (index + 1) % shuffledWords.length;
    }, interval);
    return () => clearInterval(id);
  });

  const currentWord = $derived(shuffledWords[index]);
</script>

<span class="loading-text-cycler {className}">
  {#key currentWord}
    <span class="cycler-word" in:materialize out:dematerialize>
      {currentWord}
    </span>
  {/key}
</span>

<style lang="scss">
  @use '/src/styles/abstracts' as *;

  .loading-text-cycler {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 1.4em; // void-ignore
    overflow: hidden;
  }

  .cycler-word {
    display: block;
    white-space: nowrap;
  }
</style>
