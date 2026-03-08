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

  @prop theme - Atmosphere ID (string) or PartialThemeDefinition object
  @prop label - Optional label for UI indicator (default: 'Page theme')

  @see voidEngine.pushTemporaryTheme - Underlying scoped API
  @see voidEngine.registerEphemeralTheme - Used for object themes
  @see voidEngine.releaseTemporaryTheme - Called on unmount
-->
<script lang="ts">
  import { untrack, type Snippet } from 'svelte';
  import { voidEngine } from '@adapters/void-engine.svelte';

  let {
    theme,
    label = 'Page theme',
    children,
  }: {
    theme: string | PartialThemeDefinition;
    label?: string;
    children: Snippet;
  } = $props();

  const componentId = $props.id();
  const scopeThemeId = `__scope_${componentId}`;

  let temporaryHandle: number | null = null;

  $effect(() => {
    const adaptAtmosphere = voidEngine.userConfig.adaptAtmosphere;
    const isObjectTheme = typeof theme !== 'string';
    const themeId = isObjectTheme ? scopeThemeId : theme;
    const themeExists =
      isObjectTheme || untrack(() => Boolean(voidEngine.registry[themeId]));

    if (isObjectTheme) {
      untrack(() => voidEngine.registerEphemeralTheme(scopeThemeId, theme));
    } else {
      untrack(() => voidEngine.unregisterEphemeralTheme(scopeThemeId));
    }

    if (!adaptAtmosphere || !themeExists) {
      if (temporaryHandle !== null) {
        untrack(() => voidEngine.releaseTemporaryTheme(temporaryHandle!));
        temporaryHandle = null;
      }
      return;
    }

    if (temporaryHandle === null) {
      temporaryHandle = untrack(() =>
        voidEngine.pushTemporaryTheme(themeId, label),
      );
      return;
    }

    untrack(() =>
      voidEngine.updateTemporaryTheme(temporaryHandle!, themeId, label),
    );
  });

  $effect(() => {
    return () => {
      if (temporaryHandle !== null) {
        untrack(() => voidEngine.releaseTemporaryTheme(temporaryHandle!));
      }
      untrack(() => voidEngine.unregisterEphemeralTheme(scopeThemeId));
    };
  });
</script>

{@render children()}
