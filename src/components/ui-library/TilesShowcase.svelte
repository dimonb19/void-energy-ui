<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import Tile from '../ui/Tile.svelte';
  import Selector from '../ui/Selector.svelte';
  import Toggle from '../ui/Toggle.svelte';

  function interceptClick(e: MouseEvent) {
    const anchor = (e.target as HTMLElement).closest('a');
    if (anchor?.getAttribute('href') === '#') {
      e.preventDefault();
      toast.show('Demo link — no navigation', 'info');
    }
  }

  const markOptions = [
    { value: '', label: 'No mark' },
    { value: 'resume', label: 'Resume' },
    { value: 'complete', label: 'Complete' },
    { value: 'replay', label: 'Replay' },
  ];

  let selectedMark = $state<string>('resume');
  const activeMark = $derived(
    selectedMark === ''
      ? undefined
      : (selectedMark as 'resume' | 'complete' | 'replay'),
  );

  let gated = $state(false);
</script>

<section id="tiles" class="flex flex-col gap-md">
  <h2>10 // TILES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Landscape content cards with a cover image, title, author, and genre
      labels. The entire tile is clickable via a stretched-link pattern while
      the author link remains independently accessible. State marks (<code
        >resume</code
      >, <code>complete</code>, <code>replay</code>) indicate progress, and the
      <code>gated</code>
      prop adds a lock badge with premium styling. A <code>loading</code> skeleton
      state is built in.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-md">
        <p>
          Tiles use the <strong>stretched link</strong> pattern: the title
          <code>&lt;a&gt;</code> has a <code>::after</code> pseudo-element
          covering the full card, making the entire tile clickable. The author
          link sits above via <code>z-index</code> and remains independently clickable.
        </p>
        <p>
          <strong>Aspect ratio:</strong> 3:2 landscape. Image occupies ~40% width
          (left), content ~60% (right). Responsive widths: viewport-based on mobile
          (with peek of next tile), unit-based on tablet+.
        </p>
        <p>
          <strong>State marks</strong> hang from the top-center of the tile.
          Resume uses a pennant/bookmark <code>clip-path</code>; Complete and
          Replay use a flat-top pill with rounded bottom. Colors are semantic
          tokens (<code>--energy-primary</code>,
          <code>--energy-secondary</code>).
        </p>
        <p>
          <strong>Gated tiles</strong> display a lock icon badge at top-right
          and use <code>--color-premium</code> for title text and border
          highlights. The <code>gated</code> prop works independently of
          <code>mark</code> &mdash; both can be active simultaneously.
        </p>
      </div>
    </details>

    <div class="flex flex-row flex-wrap gap-md items-end">
      <Selector
        options={markOptions}
        bind:value={selectedMark}
        label="Mark state"
        selectClass="w-auto"
      />
      <Toggle bind:checked={gated} label="Gated" />
    </div>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="surface-sunk p-lg grid grid-cols-1 small-desktop:grid-cols-2 gap-lg justify-items-center"
      onclick={interceptClick}
      onkeydown={(e) => {
        if (e.key === 'Enter') {
          const anchor = (e.target as HTMLElement).closest('a');
          if (anchor?.getAttribute('href') === '#') {
            e.preventDefault();
            toast.show('Demo link — no navigation', 'info');
          }
        }
      }}
    >
      <Tile
        title="Machine Rebellion"
        href="#"
        author={{
          name: 'Ada Sterling',
          avatar: 'https://i.pravatar.cc/48?u=ada',
          href: '#',
        }}
        genres={['Psychological', 'Sci-Fi']}
        image="https://picsum.photos/seed/tile-demo/400/600"
        mark={activeMark}
        {gated}
      />

      <!-- Loading skeleton -->
      <Tile loading />
    </div>

    <!-- ─── CODE ──────────────────────────────────────────────────────── -->
    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;script&gt;
  import Tile from './ui/Tile.svelte';
&lt;/script&gt;

&lt;!-- Standard tile with mark --&gt;
&lt;Tile
  title="Machine Rebellion"
  href="/story/123"
  author=&#123;&#123; name: 'Ada Sterling', avatar: '/avatars/ada.jpg', href: '/user/456' &#125;&#125;
  genres=&#123;['Psychological', 'Sci-Fi']&#125;
  image="/covers/machine-rebellion.jpg"
  mark="resume"
  gated
/&gt;

&lt;!-- Loading skeleton --&gt;
&lt;Tile loading /&gt;</code
        ></pre>
    </details>

    <p class="text-caption text-mute px-xs">
      Props: <code>title</code>, <code>href</code>,
      <code>author</code> (&#123; name, avatar?, href? &#125;),
      <code>genres</code> (string[]),
      <code>image</code> (cover URL),
      <code>mark</code> ('resume' | 'complete' | 'replay'),
      <code>gated</code> (boolean),
      <code>loading</code> (boolean),
      <code>class</code>.
    </p>
  </div>
</section>
