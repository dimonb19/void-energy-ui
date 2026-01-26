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

  @example Brand Collaboration - Custom Theme Object
  ```svelte
  <script>
    const brandTheme = {
      id: 'partner-acme',
      mode: 'dark',
      physics: 'glass',
      palette: {
        'bg-canvas': '#0a0a1a',
        'energy-primary': '#ff6b00',
      }
    };
  </script>

  <AtmosphereScope theme={brandTheme} label="ACME Experience">
    <BrandedContent />
  </AtmosphereScope>
  ```

  @prop theme - Atmosphere ID (string) or VoidThemeDefinition object
  @prop label - Optional label for UI indicator (default: 'Page theme')

  @see voidEngine.applyTemporaryTheme - Underlying API
  @see voidEngine.registerTheme - Used for object themes
  @see voidEngine.restoreUserTheme - Called on unmount
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';

  let {
    theme,
    label = 'Page theme',
    children,
  }: {
    theme: string | VoidThemeDefinition;
    label?: string;
    children: Snippet;
  } = $props();

  $effect(() => {
    let themeId: string;

    if (typeof theme === 'string') {
      themeId = theme;
    } else {
      // Theme object: register it first, then apply
      themeId = theme.id ?? `__brand_${Date.now()}`;
      voidEngine.registerTheme(themeId, theme);
    }

    voidEngine.applyTemporaryTheme(themeId, label);
    return () => voidEngine.restoreUserTheme();
  });
</script>

{@render children()}
