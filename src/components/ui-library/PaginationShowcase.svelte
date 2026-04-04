<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import Pagination from '../ui/Pagination.svelte';
  import LoadMore from '../ui/LoadMore.svelte';

  let basicPage = $state(1);
  let callbackPage = $state(5);
  let widePage = $state(8);
  let minimalPage = $state(3);
  let smallPage = $state(2);

  // ─── Load More demo state ─────────────────────────────────────────────
  const BATCH_SIZE = 8;
  const MAX_ITEMS = 40;

  let autoItems = $state<number[]>(
    Array.from({ length: BATCH_SIZE }, (_, i) => i + 1),
  );
  let autoLoading = $state(false);
  let autoHasMore = $derived(autoItems.length < MAX_ITEMS);

  let manualItems = $state<number[]>(
    Array.from({ length: BATCH_SIZE }, (_, i) => i + 1),
  );
  let manualLoading = $state(false);
  let manualHasMore = $derived(manualItems.length < MAX_ITEMS);

  function loadMoreAuto() {
    if (autoLoading) return;
    autoLoading = true;
    setTimeout(() => {
      const start = autoItems.length + 1;
      const next = Array.from(
        { length: Math.min(BATCH_SIZE, MAX_ITEMS - autoItems.length) },
        (_, i) => start + i,
      );
      autoItems = [...autoItems, ...next];
      autoLoading = false;
    }, 800);
  }

  function loadMoreManual() {
    if (manualLoading) return;
    manualLoading = true;
    setTimeout(() => {
      const start = manualItems.length + 1;
      const next = Array.from(
        { length: Math.min(BATCH_SIZE, MAX_ITEMS - manualItems.length) },
        (_, i) => start + i,
      );
      manualItems = [...manualItems, ...next];
      manualLoading = false;
    }, 800);
  }
</script>

<section id="pagination" class="flex flex-col gap-md">
  <h2>11 // PAGINATION</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The <code>Pagination</code> component provides controlled page navigation
      with prev/next arrows, optional first/last jump buttons, and a windowed
      page number display with ellipsis collapse. Responsive: on mobile it
      collapses to a compact
      <code>[‹] Page X of Y [›]</code> indicator. Physics-aware: glass gets a glowing
      active page, flat gets a solid fill, and retro gets an inverted terminal-style
      indicator.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        All buttons are native <code>&lt;button&gt;</code> elements with
        <code>aria-label</code> for navigation controls and
        <code>aria-current="page"</code> on the active page. Active state is
        driven via <code>data-state="active"</code>. The windowing algorithm
        always shows the first and last page, with <code>siblings</code> pages
        visible on each side of the current page. Ellipsis appears when gaps
        exist between visible ranges. The component only renders when
        <code>totalPages &gt; 1</code>. On mobile (&lt; tablet), page numbers
        and first/last buttons are hidden; a compact "Page X of Y" indicator
        replaces them. Prev/next arrows are always visible on mobile, even when
        <code>showPrevNext={false}</code>.
      </p>
    </details>

    <!-- ─── BASIC ─────────────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Basic Pagination</h5>
      <p class="text-small text-mute">
        Default configuration with 20 pages. First/last and prev/next buttons
        are shown by default. <code>siblings=1</code> shows one page on each side
        of the current page.
      </p>

      <div
        class="surface-sunk py-md px-sm tablet:px-md flex flex-col tablet:items-center gap-md overflow-x-auto"
      >
        <Pagination
          bind:currentPage={basicPage}
          totalPages={20}
          label="Basic pagination"
        />
        <p class="text-caption text-mute">
          Page <code>{basicPage}</code> of 20
        </p>
      </div>
    </div>

    <!-- ─── WITH CALLBACK ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Controlled with Callback</h5>
      <p class="text-small text-mute">
        Use <code>bind:currentPage</code> for two-way binding and
        <code>onchange</code> for side effects like data fetching.
      </p>

      <div
        class="surface-sunk py-md px-sm small-desktop:px-md flex flex-col small-desktop:items-center gap-md overflow-x-auto"
      >
        <Pagination
          bind:currentPage={callbackPage}
          totalPages={50}
          onchange={(page) => toast.show(`Loading page ${page}`, 'info')}
          label="Callback pagination"
        />
        <p class="text-caption text-mute">
          Page <code>{callbackPage}</code> of 50
        </p>
      </div>
    </div>

    <!-- ─── WIDER WINDOW ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Wider Window (siblings=2)</h5>
      <p class="text-small text-mute">
        Increase <code>siblings</code> to show more page numbers around the
        current page. With <code>siblings=2</code>, two pages are visible on
        each side.
      </p>

      <div
        class="surface-sunk py-md px-sm large-desktop:px-md flex flex-col large-desktop:items-center gap-md overflow-x-auto"
      >
        <Pagination
          bind:currentPage={widePage}
          totalPages={30}
          siblings={2}
          label="Wide window pagination"
        />
        <p class="text-caption text-mute">
          Page <code>{widePage}</code> of 30
        </p>
      </div>
    </div>

    <!-- ─── MINIMAL (no first/last) ───────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Minimal (No First/Last)</h5>
      <p class="text-small text-mute">
        Set <code>showFirstLast=false</code> to hide the jump-to-first and jump-to-last
        buttons on desktop. Only prev/next arrows and page numbers remain.
      </p>

      <div
        class="surface-sunk py-md px-sm tablet:px-md flex flex-col tablet:items-center gap-md overflow-x-auto"
      >
        <Pagination
          bind:currentPage={minimalPage}
          totalPages={15}
          showFirstLast={false}
          label="Minimal pagination"
        />
        <p class="text-caption text-mute">
          Page <code>{minimalPage}</code> of 15
        </p>
      </div>
    </div>

    <!-- ─── SMALL PAGE COUNT ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Small Page Count</h5>
      <p class="text-small text-mute">
        When <code>totalPages</code> is small enough, all pages are shown without
        ellipsis.
      </p>

      <div
        class="surface-sunk py-md px-sm small-desktop:px-md flex flex-col small-desktop:items-center gap-md overflow-x-auto"
      >
        <Pagination
          bind:currentPage={smallPage}
          totalPages={5}
          label="Small pagination"
        />
        <p class="text-caption text-mute">
          Page <code>{smallPage}</code> of 5
        </p>
      </div>
    </div>

    <!-- ─── CODE ──────────────────────────────────────────────────────── -->
    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import Pagination from './ui/Pagination.svelte';
  let page = $state(1);
&lt;/script&gt;

&lt;!-- Basic --&gt;
&lt;Pagination bind:currentPage=&#123;page&#125; totalPages=&#123;20&#125; /&gt;

&lt;!-- With callback --&gt;
&lt;Pagination
  bind:currentPage=&#123;page&#125;
  totalPages=&#123;50&#125;
  onchange=&#123;(p) =&gt; fetchData(p)&#125;
/&gt;

&lt;!-- Wider window --&gt;
&lt;Pagination bind:currentPage=&#123;page&#125; totalPages=&#123;30&#125; siblings=&#123;2&#125; /&gt;

&lt;!-- No first/last buttons --&gt;
&lt;Pagination bind:currentPage=&#123;page&#125; totalPages=&#123;15&#125; showFirstLast=&#123;false&#125; /&gt;

&lt;!-- No prev/next on desktop (still visible on mobile) --&gt;
&lt;Pagination bind:currentPage=&#123;page&#125; totalPages=&#123;10&#125; showPrevNext=&#123;false&#125; /&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Props: <code>currentPage</code> (bindable, 1-indexed),
      <code>totalPages</code> (required),
      <code>onchange</code> (callback),
      <code>siblings</code> (default 1),
      <code>showFirstLast</code> (default true),
      <code>showPrevNext</code> (default true),
      <code>label</code> (aria-label, default 'Pagination'),
      <code>class</code>.
    </p>
  </div>

  <!-- ===================================================================
       LOAD MORE
       =================================================================== -->
  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      The <code>LoadMore</code> component provides observer-driven infinite
      pagination. By default an <code>IntersectionObserver</code> auto-triggers
      loading when the sentinel enters the viewport. A manual "Load more" button
      is always rendered as an intentional fallback alongside auto-load. Set
      <code>observer=false</code> for button-only mode.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        The observer <code>$effect</code> tracks all reactive dependencies (<code
          >sentinel</code
        >, <code>observer</code>, <code>hasMore</code>,
        <code>loading</code>, <code>onloadmore</code>, <code>rootMargin</code>)
        and disconnects the previous observer on any change. While
        <code>loading=true</code>, the observer is not attached, preventing
        duplicate calls. When <code>hasMore</code> becomes false, the entire
        component unmounts. The loading spinner uses the system
        <code>LoadingSpin</code> icon for consistent physics-aware animation.
      </p>
    </details>

    <!-- ─── INFINITE SCROLL (observer) ────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Infinite Scroll (Observer)</h5>
      <p class="text-small text-mute">
        Items auto-load when you scroll near the bottom. The
        <code>rootMargin</code> prop triggers loading 100px before the sentinel is
        visible. The button remains available as a manual fallback.
      </p>

      <div
        class="surface-sunk p-md flex flex-col gap-sm overflow-y-auto demo-scroll-box"
      >
        {#each autoItems as item}
          <div class="surface-raised p-md text-body">
            Item {item}
          </div>
        {/each}

        <LoadMore
          loading={autoLoading}
          hasMore={autoHasMore}
          onloadmore={loadMoreAuto}
          rootMargin={100}
        />

        {#if !autoHasMore}
          <p class="text-mute text-center p-lg">All {MAX_ITEMS} items loaded</p>
        {/if}
      </div>

      <p class="text-caption text-mute">
        {autoItems.length} / {MAX_ITEMS} items loaded
      </p>
    </div>

    <!-- ─── MANUAL LOAD MORE (no observer) ────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Manual Load More (Button Only)</h5>
      <p class="text-small text-mute">
        With <code>observer=false</code>, only the manual button is rendered. No
        <code>IntersectionObserver</code> is created.
      </p>

      <div
        class="surface-sunk p-md flex flex-col gap-sm overflow-y-auto demo-scroll-box"
      >
        {#each manualItems as item}
          <div class="surface-raised p-md text-body">
            Item {item}
          </div>
        {/each}

        <LoadMore
          loading={manualLoading}
          hasMore={manualHasMore}
          onloadmore={loadMoreManual}
          observer={false}
        />

        {#if !manualHasMore}
          <p class="text-mute text-center p-lg">All {MAX_ITEMS} items loaded</p>
        {/if}
      </div>

      <p class="text-caption text-mute">
        {manualItems.length} / {MAX_ITEMS} items loaded
      </p>
    </div>

    <!-- ─── CODE ──────────────────────────────────────────────────────── -->
    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import LoadMore from './ui/LoadMore.svelte';

  let items = $state([...initialBatch]);
  let loading = $state(false);
  let hasMore = $derived(items.length &lt; total);

  function fetchMore() &#123;
    loading = true;
    const next = await fetchNextBatch();
    items = [...items, ...next];
    loading = false;
  &#125;
&lt;/script&gt;

&lt;!-- Infinite scroll (auto-load by default, manual button as fallback) --&gt;
&lt;LoadMore &#123;loading&#125; &#123;hasMore&#125; onloadmore=&#123;fetchMore&#125; /&gt;

&lt;!-- With early trigger (200px before visible) --&gt;
&lt;LoadMore &#123;loading&#125; &#123;hasMore&#125; onloadmore=&#123;fetchMore&#125; rootMargin=&#123;200&#125; /&gt;

&lt;!-- Button only (no observer) --&gt;
&lt;LoadMore &#123;loading&#125; &#123;hasMore&#125; onloadmore=&#123;fetchMore&#125; observer=&#123;false&#125; /&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Props: <code>loading</code> (default false),
      <code>hasMore</code> (default true),
      <code>onloadmore</code> (required callback),
      <code>rootMargin</code> (px offset, default 0),
      <code>observer</code> (default true),
      <code>label</code> (default 'Load more'),
      <code>class</code>.
    </p>
  </div>
</section>

<style lang="scss">
  .demo-scroll-box {
    max-height: 320px; // void-ignore: fixed demo container height cap
  }
</style>
