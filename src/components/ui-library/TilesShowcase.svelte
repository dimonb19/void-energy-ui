<script lang="ts">
  import Tile from '../ui/Tile.svelte';
  import Selector from '../ui/Selector.svelte';

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
</script>

<section id="tiles" class="flex flex-col gap-md">
  <h2>TILES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Landscape story cards for the CoNexus interactive storytelling platform.
      Each tile shows a cover image, title, author with profile picture, and
      genre labels. State marks indicate player progress.
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
      </div>
    </details>

    <Selector
      options={markOptions}
      bind:value={selectedMark}
      label="Mark state"
      selectClass="w-auto"
    />

    <div class="surface-sunk p-lg grid grid-cols-1 tablet:grid-cols-2 gap-lg">
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
        class="tile-fluid"
      />

      <Tile loading class="tile-fluid" />
    </div>
  </div>
</section>
