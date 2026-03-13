<!--
  STORYCATEGORY COMPONENT
  A categorized row of story tiles with a title, tagline, and horizontal scroll strip.

  USAGE
  -------------------------------------------------------------------------
  <StoryCategory title="Hottest right now" tagline="Most played this week.">
    <Tile ... />
    <Tile ... />
    <Tile ... />
  </StoryCategory>
  -------------------------------------------------------------------------

  PROPS:
  - title: Category heading (required)
  - tagline: Short description below the heading (optional)
  - children: Snippet — tile elements rendered inside the scroll strip
  - class: Additional CSS classes

  @see /src/styles/components/_tiles.scss
  @see /src/components/ui/Tile.svelte
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface StoryCategoryProps {
    title: string;
    tagline?: string;
    children: Snippet;
    class?: string;
  }

  let {
    title,
    tagline,
    children,
    class: className = '',
  }: StoryCategoryProps = $props();
</script>

<section class="story-category {className}">
  <div class="story-category-header">
    <h3>{title}</h3>
    {#if tagline}
      <p>{tagline}</p>
    {/if}
  </div>

  <div class="story-category-strip">
    {@render children()}
  </div>
</section>
