<script lang="ts">
  interface SkeletonProps {
    /** Shape variant */
    variant?: 'text' | 'avatar' | 'card' | 'paragraph';
    /** Override width (token string or CSS value) */
    width?: string;
    /** Override height (token string or CSS value) */
    height?: string;
    /** Number of text lines for 'paragraph' variant */
    lines?: number;
    class?: string;
  }

  let {
    variant = 'text',
    width,
    height,
    lines = 3,
    class: className = '',
  }: SkeletonProps = $props();
</script>

{#if variant === 'paragraph'}
  <div
    class="skeleton-paragraph flex flex-col gap-md {className}"
    role="presentation"
    aria-hidden="true"
  >
    {#each Array(lines) as _, i}
      <div
        class="skeleton shimmer-surface"
        data-variant="text"
        style:width={i === lines - 1 ? '60%' : '100%'}
      ></div>
    {/each}
  </div>
{:else}
  <div
    class="skeleton shimmer-surface {className}"
    data-variant={variant}
    style:width
    style:height
    role="presentation"
    aria-hidden="true"
  ></div>
{/if}
