<script lang="ts">
  import { RotateCcw, Plus } from '@lucide/svelte';
  import Restart from '@components/icons/Restart.svelte';
  import ActionBtn from '@components/ui/ActionBtn.svelte';
  import { morph } from '@actions/morph';
  import { navlink } from '@actions/navlink';
  import {
    emerge,
    dissolve,
    materialize,
    dematerialize,
    implode,
    live,
  } from '@lib/transitions.svelte';

  // Morph demo
  let morphExpanded = $state(false);

  // Transition demos
  let showEmerge = $state(false);
  let showMaterialize = $state(false);
  let implodeItems = $state(['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon']);
  let implodeNextId = $state(6);

  function shuffleImplodeItems() {
    const shuffled = [...implodeItems];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    implodeItems = shuffled;
  }

  function addImplodeItem() {
    implodeItems = [...implodeItems, `Item ${implodeNextId++}`];
  }

  function resetImplodeItems() {
    implodeItems = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon'];
    implodeNextId = 6;
  }
</script>

<section id="motion-primitives" class="flex flex-col gap-md">
  <h2>17 // MOTION PRIMITIVES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Low-level building blocks for interactive motion. Svelte actions (<code
        >use:morph</code
      >, <code>use:navlink</code>) attach behavior to any element imperatively.
      Svelte transitions (<code>emerge/dissolve</code>,
      <code>materialize/dematerialize</code>, <code>implode</code>,
      <code>live</code>) drive enter/exit animations on elements in the document
      flow or in overlay layers. These are the primitives that Modal, Toast,
      Dropdown, and Chip components use internally.
    </p>

    <!-- ─── SVELTE ACTIONS ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Svelte Actions</h5>
      <p class="text-small text-mute">
        Reusable directives that add behavior to any element via
        <code>use:action</code>. These are the building blocks behind several
        composite components.
      </p>

      <!-- Morph -->
      <div class="flex flex-col gap-xs">
        <h6>use:morph</h6>
        <p class="text-small text-mute">
          Content-driven resize animation. Watches a container via
          <code>ResizeObserver</code> and smoothly animates
          <code>width</code> and/or <code>height</code> changes using FLIP transitions.
          Click the button below to toggle content length.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (morphExpanded = !morphExpanded)}>
            {morphExpanded ? 'Collapse' : 'Expand'}
          </button>
          <div class="surface-raised p-md" use:morph={{ width: false }}>
            {#if morphExpanded}
              <p class="text-small">
                The void engine processes your request through multiple layers
                of semantic analysis, pattern matching, and contextual synthesis
                before materializing the final response. Each layer refines the
                signal, discarding noise and amplifying intent until the output
                crystallizes into form.
              </p>
            {:else}
              <p class="text-small">Compact content.</p>
            {/if}
          </div>
        </div>
        <p class="text-caption text-mute px-xs">
          Options: <code>height</code>, <code>width</code> (booleans),
          <code>threshold</code> (minimum px change to animate). Reads
          <code>--speed-base</code> and <code>--ease-spring-gentle</code>
          from CSS tokens. Retro physics: instant. Reduced motion: instant.
        </p>
      </div>

      <!-- Navlink -->
      <div class="flex flex-col gap-xs">
        <h6>use:navlink</h6>
        <p class="text-small text-mute">
          Sets <code>data-status="loading"</code> and
          <code>aria-busy="true"</code> on click for MPA navigation links. The DOM
          is replaced on page load, clearing the state naturally. Click the link
          below &mdash; the loading state appears until the browser navigates.
        </p>
        <div class="surface-sunk p-md flex justify-center">
          <a href="/components" class="link" use:navlink>
            Reload this page (with loading state)
          </a>
        </div>
        <p class="text-caption text-mute px-xs">
          No options. Skips modified clicks (Ctrl/Cmd, Shift, middle button).
          Pair with SCSS <code>@include when-state('loading')</code> for visual feedback.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import &#123; morph &#125; from '@actions/morph';
  import &#123; navlink &#125; from '@actions/navlink';
&lt;/script&gt;

&lt;!-- Morph: smooth height animation on content change --&gt;
&lt;div use:morph=&#123;&#123; width: false &#125;&#125;&gt;
  &#123;#if expanded&#125;
    &lt;p&gt;Long content...&lt;/p&gt;
  &#123;:else&#125;
    &lt;p&gt;Short content.&lt;/p&gt;
  &#123;/if&#125;
&lt;/div&gt;

&lt;!-- Navlink: loading state on navigation --&gt;
&lt;a href="/page" use:navlink&gt;Go to page&lt;/a&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ─── SVELTE TRANSITIONS ──────────────────────────────────────── -->
    <div class="flex flex-col gap-md">
      <h5>Svelte Transitions</h5>
      <p class="text-small text-mute">
        Physics-aware motion primitives for Svelte&rsquo;s <code>in:</code>,
        <code>out:</code>, and <code>animate:</code> directives. Each transition
        reads the active physics preset (glass/flat/retro) and adapts timing, easing,
        and filters automatically.
      </p>

      <!-- emerge / dissolve -->
      <div class="flex flex-col gap-xs">
        <h6>in:emerge &amp; out:dissolve</h6>
        <p class="text-small text-mute">
          Layout-aware entry/exit pair. Animates height, padding, and margin
          alongside blur, scale, and Y-translate &mdash; surrounding content
          reflows smoothly. Use for elements in normal document flow.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (showEmerge = !showEmerge)}>
            {showEmerge ? 'Remove' : 'Show'} element
          </button>
          <p class="text-small text-mute">Content above</p>
          {#if showEmerge}
            <div class="surface-raised p-md" in:emerge out:dissolve>
              <p class="text-small">
                This block grows into the layout on entry and collapses out on
                exit. Notice how the content below shifts smoothly.
              </p>
            </div>
          {/if}
          <p class="text-small text-mute">Content below</p>
        </div>
        <p class="text-caption text-mute px-xs">
          Glass: blur + scale + Y + height growth/collapse. Flat: same without
          blur. Retro: instant (0ms). Options: <code>delay</code>,
          <code>duration</code>, <code>y</code> (translate distance, default 15px).
        </p>
      </div>

      <!-- materialize / dematerialize -->
      <div class="flex flex-col gap-xs">
        <h6>in:materialize &amp; out:dematerialize</h6>
        <p class="text-small text-mute">
          Visual-only entry/exit pair for positioned or overlaid elements
          (modals, tooltips, toasts). No layout animation &mdash; just opacity,
          blur, scale, and Y-translate.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <button onclick={() => (showMaterialize = !showMaterialize)}>
            {showMaterialize ? 'Dematerialize' : 'Materialize'}
          </button>
          <div class="relative h-4xl">
            {#if showMaterialize}
              <div
                class="surface-raised p-md absolute inset-x-0 top-0"
                in:materialize
                out:dematerialize
              >
                <p class="text-small">
                  This element fades in with scale and blur &mdash; no layout
                  shift. Used for modals, tooltips, and toast notifications.
                </p>
              </div>
            {/if}
          </div>
        </div>
        <p class="text-caption text-mute px-xs">
          Glass: blur fade + scale + Y. Flat: sharp fade + scale (no blur).
          Retro: instant opacity in, stepped grayscale dissolve out. Same
          <code>delay</code>, <code>duration</code>, <code>y</code> options.
        </p>
      </div>

      <!-- implode + live -->
      <div class="flex flex-col gap-xs">
        <h6>out:implode &amp; animate:live</h6>
        <p class="text-small text-mute">
          <code>out:implode</code> collapses a removed element horizontally
          (width, padding, margin &rarr; zero) with blur dissolution.
          <code>animate:live</code> is a FLIP reflow animation that smoothly
          slides remaining items into their new positions. Used together, they
          create seamless list removal &mdash; the exiting item collapses while
          siblings glide to fill the gap. Click a chip to remove it; use Shuffle
          and Add to see <code>animate:live</code> reflow.
        </p>
        <div class="surface-sunk p-md flex flex-col gap-md">
          <div class="flex gap-md">
            <button class="btn-system" onclick={shuffleImplodeItems}>
              Shuffle
            </button>
            <ActionBtn
              class="btn-success"
              icon={Plus}
              text="Add"
              size="sm"
              onclick={addImplodeItem}
            />
            <ActionBtn
              icon={Restart}
              text="Reset"
              size="sm"
              onclick={resetImplodeItems}
            />
          </div>
          <div class="flex flex-wrap gap-sm" use:morph>
            {#each implodeItems as item (item)}
              <button
                class="chip"
                animate:live
                onclick={() =>
                  (implodeItems = implodeItems.filter((i) => i !== item))}
                out:implode
              >
                {item}
              </button>
            {/each}
          </div>
          {#if implodeItems.length === 0}
            <p class="text-mute text-center text-small">All removed</p>
          {/if}
        </div>
        <p class="text-caption text-mute px-xs">
          <code>implode</code> uses <code>speedFast</code> timing with blur
          (glass/flat) or grayscale (retro). <code>live</code> wraps
          Svelte&rsquo;s <code>flip</code> with physics-aware defaults (<code
            >speedBase</code
          >
          timing, stepped easing in retro). Both require stable keys on the
          <code>&#123;#each&#125;</code> block.
        </p>
      </div>

      <details>
        <summary>View Code</summary>
        <pre><code
            >&lt;script&gt;
  import &#123; emerge, dissolve, materialize, dematerialize, implode, live &#125; from '@lib/transitions.svelte';
&lt;/script&gt;

&lt;!-- Layout-aware entry/exit (normal flow) --&gt;
&#123;#if visible&#125;
  &lt;div in:emerge out:dissolve&gt;
    Content grows in, collapses out.
  &lt;/div&gt;
&#123;/if&#125;

&lt;!-- Visual-only entry/exit (positioned/overlay) --&gt;
&#123;#if visible&#125;
  &lt;div class="absolute" in:materialize out:dematerialize&gt;
    Fades in with blur + scale, floats up on exit.
  &lt;/div&gt;
&#123;/if&#125;

&lt;!-- Implode + live: collapse removed item, reflow siblings --&gt;
&#123;#each items as item (item)&#125;
  &lt;button animate:live out:implode onclick=&#123;() =&gt; remove(item)&#125;&gt;
    &#123;item&#125;
  &lt;/button&gt;
&#123;/each&#125;</code
          ></pre>
      </details>
    </div>
  </div>
</section>
