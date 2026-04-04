<script lang="ts">
  import { toast } from '@stores/toast.svelte';
  import Tile from '../ui/Tile.svelte';
  import Selector from '../ui/Selector.svelte';

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
    { value: 'completed', label: 'Completed' },
    { value: 'replay', label: 'Replay' },
  ];

  let selectedMark = $state<string>('resume');
  const activeMark = $derived(
    selectedMark === ''
      ? undefined
      : (selectedMark as 'resume' | 'completed' | 'replay'),
  );

  const gateExamples: { title: string; author: string; gate: TileGate[] }[] = [
    {
      title: 'The Potentials Protocol',
      author: 'Void Labs',
      gate: [{ type: 'nft-collection', name: 'Potentials' }],
    },
    {
      title: 'Punk Chronicles',
      author: 'Larva Labs',
      gate: [
        { type: 'nft-id', collection: 'CryptoPunks', ids: ['7523', '3100'] },
      ],
    },
    {
      title: 'Staked Horizons',
      author: 'Solana Foundation',
      gate: [{ type: 'fungible', token: 'SOL', amount: 100 }],
    },
    {
      title: 'The Convergence',
      author: 'Void Labs',
      gate: [
        { type: 'nft-collection', name: 'Potentials' },
        { type: 'fungible', token: 'SOL', amount: 5 },
      ],
    },
  ];
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
      <code>gate</code>
      prop adds a lock badge with premium styling and a tooltip describing the token
      requirement. A <code>loading</code> skeleton state is built in.
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
          Resume uses a pennant/bookmark <code>clip-path</code>; Completed and
          Replay use a flat-top pill with rounded bottom. Colors are semantic
          tokens (<code>--energy-primary</code>,
          <code>--energy-secondary</code>).
        </p>
        <p>
          <strong>Gated tiles</strong> display a lock icon badge at top-right
          and use <code>--color-premium</code> for title text and border
          highlights. The <code>gate</code> prop accepts an array of
          <code>TileGate</code> objects describing the requirements (NFT
          collection, specific NFT IDs, or fungible token balance). Multiple
          gates are joined with "or" in the tooltip. Works independently of
          <code>mark</code>.
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
      />

      <!-- Loading skeleton -->
      <Tile loading />
    </div>

    <!-- ─── GATED TILES ─────────────────────────────────────────────── -->
    <h4>Token-Gated Tiles</h4>
    <p class="text-dim">
      The <code>gate</code> prop describes what gates the content. Hover or focus
      the lock icon to see the requirement tooltip. Three gate types are supported:
      NFT collection, specific NFT IDs, and fungible token balance. Multiple gates
      on a single tile are joined with "or" in the tooltip.
    </p>

    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="surface-sunk p-lg flex flex-wrap gap-lg justify-center"
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
      {#each gateExamples as example, i}
        <Tile
          title={example.title}
          href="#"
          author={{ name: example.author, href: '#' }}
          genres={['Sci-Fi', 'Adventure']}
          image="https://picsum.photos/seed/gate-{i}/400/600"
          gate={example.gate}
        />
      {/each}
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
/&gt;

&lt;!-- NFT collection gate --&gt;
&lt;Tile
  title="The Potentials Protocol"
  href="/story/789"
  author=&#123;&#123; name: 'Void Labs' &#125;&#125;
  gate=&#123;[&#123; type: 'nft-collection', name: 'Potentials' &#125;]&#125;
/&gt;

&lt;!-- Specific NFT IDs --&gt;
&lt;Tile
  title="Punk Chronicles"
  href="/story/101"
  author=&#123;&#123; name: 'Larva Labs' &#125;&#125;
  gate=&#123;[&#123; type: 'nft-id', collection: 'CryptoPunks', ids: ['7523', '3100'] &#125;]&#125;
/&gt;

&lt;!-- Fungible token gate --&gt;
&lt;Tile
  title="Staked Horizons"
  href="/story/202"
  author=&#123;&#123; name: 'Solana Foundation' &#125;&#125;
  gate=&#123;[&#123; type: 'fungible', token: 'SOL', amount: 100 &#125;]&#125;
/&gt;

&lt;!-- Multi-gate (either requirement unlocks) --&gt;
&lt;Tile
  title="The Convergence"
  href="/story/303"
  author=&#123;&#123; name: 'Void Labs' &#125;&#125;
  gate=&#123;[
    &#123; type: 'nft-collection', name: 'Potentials' &#125;,
    &#123; type: 'fungible', token: 'SOL', amount: 5 &#125;,
  ]&#125;
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
      <code>mark</code> ('resume' | 'completed' | 'replay'),
      <code>gate</code> (TileGate[]),
      <code>loading</code> (boolean),
      <code>class</code>.
    </p>
  </div>
</section>
