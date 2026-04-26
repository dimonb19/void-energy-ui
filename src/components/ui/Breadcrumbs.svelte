<script lang="ts">
  interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    hidden?: boolean;
    class?: string;
  }

  let {
    items,
    hidden = false,
    class: className = '',
  }: BreadcrumbsProps = $props();

  /** Peer mode: `/` separator when any item has `active` flag */
  const peerMode = $derived(items.some((i) => i.active));

  /** `›` for hierarchical, `/` for peer navigation */
  const separator = $derived(peerMode ? '/' : '\u203A');
</script>

{#if items.length > 0}
  <nav
    class="breadcrumbs hidden small-desktop:flex items-center px-sm {className}"
    aria-label="Breadcrumb"
    data-hidden={hidden}
  >
    <ol class="flex items-center gap-xs">
      {#each items as item, i}
        <li class="flex items-center gap-xs">
          {#if i > 0}
            <span class="breadcrumbs-separator" aria-hidden="true">
              {separator}
            </span>
          {/if}

          {#if item.active}
            <span class="breadcrumbs-current" aria-current="page">
              {item.label}
            </span>
          {:else if item.href}
            <a class="breadcrumbs-link" href={item.href}>
              {item.label}
            </a>
          {:else}
            <span class="breadcrumbs-current" aria-current="page">
              {item.label}
            </span>
          {/if}
        </li>
      {/each}
    </ol>
  </nav>
{/if}
