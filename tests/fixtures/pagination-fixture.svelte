<script lang="ts">
  import Pagination from '@components/ui/Pagination.svelte';

  interface PaginationFixtureProps {
    currentPage?: number;
    totalPages: number;
    siblings?: number;
    showFirstLast?: boolean;
    showPrevNext?: boolean;
    label?: string;
    onchange?: (page: number) => void;
  }

  let {
    currentPage = $bindable(1),
    totalPages,
    siblings,
    showFirstLast,
    showPrevNext,
    label,
    onchange,
  }: PaginationFixtureProps = $props();
</script>

<Pagination
  bind:currentPage
  {totalPages}
  {siblings}
  {showFirstLast}
  {showPrevNext}
  {label}
  {onchange}
/>
<output data-testid="page-output">{currentPage}</output>
