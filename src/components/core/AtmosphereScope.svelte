<!--
  AtmosphereScope Component

  Wraps content in a temporary atmosphere that auto-restores on unmount.
  Use this for story pages, previews, or any section requiring a specific mood.

  @example Basic Usage - Story Page
  ```svelte
  <AtmosphereScope theme="crimson" label="Horror story">
    <h1>The Haunted Manor</h1>
    <StoryContent />
  </AtmosphereScope>
  ```

  @example Dynamic Theme - Reactive to Props
  ```svelte
  <script>
    import AtmosphereScope from '$components/core/AtmosphereScope.svelte';
    let { story } = $props();
  </script>

  <AtmosphereScope theme={story.atmosphere} label={story.title}>
    <StoryPlayer {story} />
  </AtmosphereScope>
  ```

  @example Conditional Atmosphere
  ```svelte
  {#if previewMode}
    <AtmosphereScope theme={previewTheme} label="Preview">
      <PreviewContent />
    </AtmosphereScope>
  {:else}
    <RegularContent />
  {/if}
  ```

  @prop theme - Atmosphere ID (e.g., 'crimson', 'void', 'terminal')
  @prop label - Optional label for UI indicator (default: 'Page theme')

  @see voidEngine.applyTemporaryTheme - Underlying API
  @see voidEngine.restoreUserTheme - Called on unmount
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { voidEngine } from '../../adapters/void-engine.svelte';

  let {
    theme,
    label = 'Page theme',
    children,
  }: {
    theme: string;
    label?: string;
    children: Snippet;
  } = $props();

  $effect(() => {
    voidEngine.applyTemporaryTheme(theme, label);
    return () => voidEngine.restoreUserTheme();
  });
</script>

{@render children()}
