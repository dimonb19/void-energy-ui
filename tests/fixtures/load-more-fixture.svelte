<script lang="ts">
  import LoadMore from '@components/ui/LoadMore.svelte';

  interface LoadMoreFixtureProps {
    loading?: boolean;
    hasMore?: boolean;
    onloadmore: () => void;
    rootMargin?: number;
    observer?: boolean;
    label?: string;
  }

  let {
    loading = false,
    hasMore = true,
    onloadmore,
    rootMargin,
    observer,
    label,
  }: LoadMoreFixtureProps = $props();
</script>

<LoadMore {loading} {hasMore} {onloadmore} {rootMargin} {observer} {label} />
