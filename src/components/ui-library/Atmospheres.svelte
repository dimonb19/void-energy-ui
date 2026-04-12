<script lang="ts">
  import { tooltip } from '@actions/tooltip';
  import { toast } from '@stores/toast.svelte';
  import { modal } from '@lib/modal-manager.svelte';
  import { FONTS } from '@config/design-tokens';
  import { voidEngine } from '@adapters/void-engine.svelte';
  import { dematerialize, materialize } from '@lib/transitions.svelte';
  import ActionBtn from '../ui/ActionBtn.svelte';
  import Sparkle from '../icons/Sparkle.svelte';
  import Undo from '../icons/Undo.svelte';

  // ── Built-in atmospheres table data ────────────────────────────────────
  const builtInAtmospheres = [
    {
      id: 'slate',
      physics: 'flat',
      mode: 'dark',
      tagline: 'Professional / Clean',
      concept: 'Calm dark workspace — neutral surfaces, blue accent',
    },
    {
      id: 'frost',
      physics: 'glass',
      mode: 'dark',
      tagline: 'Arctic / Glass',
      concept: 'Ice station observatory — clean and cold',
    },
    {
      id: 'meridian',
      physics: 'flat',
      mode: 'light',
      tagline: 'Fintech / Brand',
      concept: 'Quiet light interface — teal authority, indigo accent',
    },
    {
      id: 'terminal',
      physics: 'retro',
      mode: 'dark',
      tagline: 'Hacker / Retro',
      concept: '1980s amber phosphor CRT monitor',
    },
  ];

  // ── Custom atmosphere demos ────────────────────────────────────────────

  // 1. Cyberpunk (dark glass)
  let cyberpunkRegistered = $derived(
    voidEngine.availableAtmospheres.includes('cyberpunk'),
  );

  function registerCyberpunk() {
    voidEngine.registerTheme('cyberpunk', {
      mode: 'dark',
      physics: 'glass',
      tagline: 'High Tech / Low Life',
      palette: {
        'font-atmos-heading': FONTS.mystic.family,
        'font-atmos-body': FONTS.tech.family,
        'bg-canvas': '#05010a',
        'bg-spotlight': '#1a0526',
        'bg-surface': 'rgba(20, 5, 30, 0.6)',
        'bg-sunk': 'rgba(10, 0, 15, 0.8)',
        'energy-primary': '#ff0077',
        'energy-secondary': '#00e5ff',
        'border-color': 'rgba(255, 0, 119, 0.3)',
        'text-dim': 'rgba(255, 230, 240, 0.85)',
      },
    });
    toast.undo('Cyberpunk atmosphere registered', () =>
      voidEngine.unregisterTheme('cyberpunk'),
    );
  }

  function applyCyberpunk() {
    voidEngine.setAtmosphere('cyberpunk');
  }

  // 2. Dusk (dark flat — twilight rose)
  let duskRegistered = $derived(
    voidEngine.availableAtmospheres.includes('dusk'),
  );

  function registerDusk() {
    voidEngine.registerTheme('dusk', {
      mode: 'dark',
      physics: 'flat',
      tagline: 'Twilight / Editorial',
      palette: {
        'font-atmos-heading': FONTS.elegant.family,
        'font-atmos-body': FONTS.book.family,
        'bg-canvas': '#16121a',
        'bg-spotlight': '#241b2c',
        'bg-surface': '#1e1726',
        'bg-sunk': '#0e0a14',
        'energy-primary': '#d97a8c',
        'energy-secondary': '#5b9a92',
        'border-color': 'rgba(217, 122, 140, 0.22)',
        'text-main': '#f3ebef',
        'text-dim': '#a99aa3',
        'text-mute': '#6b5e66',
      },
    });
    toast.undo('Dusk atmosphere registered', () =>
      voidEngine.unregisterTheme('dusk'),
    );
  }

  function applyDusk() {
    voidEngine.setAtmosphere('dusk');
  }

  // 3. Linen (light flat — warm cream paper)
  let linenRegistered = $derived(
    voidEngine.availableAtmospheres.includes('linen'),
  );

  function registerLinen() {
    voidEngine.registerTheme('linen', {
      mode: 'light',
      physics: 'flat',
      tagline: 'Stationery / Print',
      palette: {
        'font-atmos-heading': FONTS.book.family,
        'font-atmos-body': FONTS.book.family,
        'bg-canvas': '#f5efe6',
        'bg-spotlight': '#fbf6ee',
        'bg-surface': '#ffffff',
        'bg-sunk': '#ebe3d4',
        'energy-primary': '#5a7a52',
        'energy-secondary': '#3a5470',
        'border-color': 'rgba(90, 122, 82, 0.28)',
        'text-main': '#2a2520',
        'text-dim': '#5a5048',
        'text-mute': '#8a7f73',
      },
    });
    toast.undo('Linen atmosphere registered', () =>
      voidEngine.unregisterTheme('linen'),
    );
  }

  function applyLinen() {
    voidEngine.setAtmosphere('linen');
  }

  // ── Temporary theme demo ───────────────────────────────────────────────
  let tempHandle: number | null = $state(null);
  let alreadyTerminal = $derived(voidEngine.atmosphere === 'terminal');

  // Sync local handle with engine state — if our Terminal push was cleared
  // externally (Themes modal, custom override, etc.), reset local state
  // so the button reflects reality.
  $effect(() => {
    if (tempHandle === null) return;
    const info = voidEngine.temporaryThemeInfo;
    if (!info || info.id !== 'terminal') {
      tempHandle = null;
    }
  });

  function pushTempTheme() {
    if (tempHandle !== null) return;
    tempHandle = voidEngine.pushTemporaryTheme('terminal', 'Terminal Preview');
    if (tempHandle !== null) {
      toast.show('Temporary theme pushed (Terminal)', 'info', 4000, {
        label: 'View',
        onclick: () => modal.themes(),
      });
    } else {
      toast.show(
        "Theme locked — enable 'Allow theme overrides' in settings",
        'warning',
      );
    }
  }

  function releaseTempTheme() {
    if (tempHandle === null) return;
    voidEngine.releaseTemporaryTheme(tempHandle);
    tempHandle = null;
    toast.show('Temporary theme released — restored previous', 'success');
  }
</script>

<section id="atmospheres" class="flex flex-col gap-md">
  <h2>03 // ATMOSPHERES</h2>

  <div class="surface-raised p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Atmospheres define the visual identity of the interface &mdash; palette,
      typography, and mood. Void Energy ships 4 built-in atmospheres covering
      all 3 physics presets and both color modes. You can also register custom
      atmospheres at runtime with partial palettes (missing values are filled
      from defaults via Safety Merge), apply temporary themes that restore on
      dismissal, and scope themes to individual components.
    </p>

    <details>
      <summary>Technical Details</summary>
      <div class="p-md flex flex-col gap-sm">
        <p>
          The atmosphere engine is managed by the <code>VoidEngine</code>
          singleton (<code
            >import &#123; voidEngine &#125; from '@adapters/void-engine.svelte'</code
          >). Each atmosphere definition specifies a <code>mode</code> (light |
          dark), <code>physics</code> preset (glass | flat | retro), an optional
          <code>tagline</code>, and a <code>palette</code> object that maps semantic
          token names to CSS values.
        </p>
        <p>
          <b>Physics constraints are auto-enforced:</b> Glass and Retro require dark
          mode (glows need darkness, CRT phosphor needs a black substrate). Flat
          works in both modes. If an atmosphere violates this constraint, the engine
          auto-corrects.
        </p>
        <p>
          <b>Safety Merge:</b> When registering a custom atmosphere, you only need
          to provide the palette values you want to override. All missing values
          are filled from the default atmosphere's palette, ensuring your custom
          theme is always complete.
        </p>
        <p>
          <b>Persistence:</b>
          <code>setAtmosphere()</code> persists the user's choice to
          localStorage. <code>applyTemporaryTheme()</code> pushes onto a LIFO stack
          without persisting &mdash; ideal for previews, story modes, or scoped contexts.
        </p>
      </div>
    </details>

    <details>
      <summary>View Code</summary>
      <pre><code
          >// Switch to a built-in atmosphere (persists)
voidEngine.setAtmosphere('terminal');

// Register a custom atmosphere at runtime
voidEngine.registerTheme('brand', &#123;
  mode: 'dark',
  physics: 'glass',
  tagline: 'Our Brand',
  palette: &#123;
    'bg-canvas':      '#060816',
    'bg-surface':     'rgba(20, 24, 44, 0.72)',
    'energy-primary': '#6ee7ff',
    'text-main':      '#f8fafc',
  &#125;
&#125;);
voidEngine.setAtmosphere('brand');

// Temporary theme (non-persistent, stack-based)
voidEngine.applyTemporaryTheme('terminal', 'Terminal Preview');
voidEngine.restoreUserTheme(); // pops the stack

// Scoped temporary theme (returns handle for cleanup)
const handle = voidEngine.pushTemporaryTheme('frost', 'Ice Mode');
voidEngine.releaseTemporaryTheme(handle); // release specific handle</code
        ></pre>
    </details>

    <!-- ── 1. BUILT-IN ATMOSPHERES ──────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Built-in Atmospheres</h5>
      <p class="text-small text-mute">
        4 presets covering all 3 physics presets and both color modes. Click any
        row to switch the active atmosphere.
      </p>

      <div class="surface-sunk p-md overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Physics</th>
              <th>Mode</th>
              <th>Tagline</th>
              <th>Concept</th>
            </tr>
          </thead>
          <tbody>
            {#each builtInAtmospheres as atmos}
              <tr
                class="cursor-pointer"
                data-state={voidEngine.atmosphere === atmos.id
                  ? 'active'
                  : undefined}
                onclick={() => voidEngine.setAtmosphere(atmos.id)}
              >
                <td><code>{atmos.id}</code></td>
                <td>{atmos.physics}</td>
                <td>{atmos.mode}</td>
                <td class="text-dim">{atmos.tagline}</td>
                <td class="text-dim text-caption">{atmos.concept}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <p class="text-caption text-mute px-xs">
        Active atmosphere: <code>{voidEngine.atmosphere}</code>. Defined in
        <code>src/config/design-tokens.ts</code>. Switching calls
        <code>voidEngine.setAtmosphere(id)</code> which persists the choice.
      </p>
    </div>

    <!-- ── 2. CUSTOM ATMOSPHERE REGISTRATION ────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Custom Atmosphere Registration</h5>
      <p class="text-small text-mute">
        Register a new atmosphere at runtime with
        <code>voidEngine.registerTheme()</code>. Provide only the palette values
        you want to override &mdash; Safety Merge fills the rest from defaults.
        The three examples below cover every physics+mode combination: dark
        glass, dark flat, and light flat.
      </p>

      <!-- Cyberpunk (dark glass) -->
      <div class="surface-sunk p-md flex flex-col gap-md">
        <h5>
          Cyberpunk <span class="text-mute text-small">&mdash; dark glass</span>
        </h5>
        <p class="text-caption text-dim">
          Neon-soaked glass with custom typography. Demonstrates the full glass
          pipeline: translucent surfaces, glow effects, and blur.
        </p>
        <details>
          <summary>View Palette Code</summary>
          <pre class="text-caption overflow-x-auto"><code
              >{`voidEngine.registerTheme('cyberpunk', {
  mode: 'dark',
  physics: 'glass',
  tagline: 'High Tech / Low Life',
  palette: {
    'font-atmos-heading': "'Exo 2', sans-serif",
    'font-atmos-body':    "'Hanken Grotesk', sans-serif",
    'bg-canvas':          '#05010a',
    'bg-spotlight':       '#1a0526',
    'bg-surface':         'rgba(20, 5, 30, 0.6)',
    'bg-sunk':            'rgba(10, 0, 15, 0.8)',
    'energy-primary':     '#ff0077',
    'energy-secondary':   '#00e5ff',
    'border-color':       'rgba(255, 0, 119, 0.3)',
    'text-dim':           'rgba(255, 230, 240, 0.85)',
  }
});`}</code
            ></pre>
        </details>

        <div class="flex flex-row gap-md flex-wrap">
          <ActionBtn
            icon={Sparkle}
            text={cyberpunkRegistered ? 'Registered' : 'Register Cyberpunk'}
            onclick={registerCyberpunk}
            disabled={cyberpunkRegistered}
          />

          {#if cyberpunkRegistered}
            <span in:materialize out:dematerialize>
              <button
                class="btn btn-premium"
                onclick={applyCyberpunk}
                disabled={voidEngine.atmosphere === 'cyberpunk'}
              >
                {voidEngine.atmosphere === 'cyberpunk'
                  ? 'Cyberpunk Active'
                  : 'Apply Cyberpunk'}
              </button>
            </span>
          {/if}
        </div>
      </div>

      <!-- Dusk (dark flat — twilight rose) -->
      <div class="surface-sunk p-md flex flex-col gap-md">
        <h5>
          Dusk <span class="text-mute text-small">&mdash; dark flat</span>
        </h5>
        <p class="text-caption text-dim">
          A twilight editorial atmosphere. Demonstrates the dark + flat
          combination &mdash; opaque surfaces, no blur, dusty rose primary
          against a warm-grey canvas.
        </p>
        <details>
          <summary>View Palette Code</summary>
          <pre class="text-caption overflow-x-auto"><code
              >{`voidEngine.registerTheme('dusk', {
  mode: 'dark',
  physics: 'flat',
  tagline: 'Twilight / Editorial',
  palette: {
    'font-atmos-heading': "'Cormorant Garamond', serif",
    'font-atmos-body':    "'Lora', serif",
    'bg-canvas':          '#16121a',
    'bg-spotlight':       '#241b2c',
    'bg-surface':         '#1e1726',
    'bg-sunk':            '#0e0a14',
    'energy-primary':     '#d97a8c',
    'energy-secondary':   '#5b9a92',
    'border-color':       'rgba(217, 122, 140, 0.22)',
    'text-main':          '#f3ebef',
    'text-dim':           '#a99aa3',
    'text-mute':          '#6b5e66',
  }
});`}</code
            ></pre>
        </details>

        <div class="flex flex-row gap-md flex-wrap">
          <ActionBtn
            icon={Sparkle}
            text={duskRegistered ? 'Registered' : 'Register Dusk'}
            onclick={registerDusk}
            disabled={duskRegistered}
          />

          {#if duskRegistered}
            <span in:materialize out:dematerialize>
              <button
                class="btn btn-premium"
                onclick={applyDusk}
                disabled={voidEngine.atmosphere === 'dusk'}
              >
                {voidEngine.atmosphere === 'dusk'
                  ? 'Dusk Active'
                  : 'Apply Dusk'}
              </button>
            </span>
          {/if}
        </div>
      </div>

      <!-- Linen (light flat — warm cream paper) -->
      <div class="surface-sunk p-md flex flex-col gap-md">
        <h5>
          Linen <span class="text-mute text-small">&mdash; light flat</span>
        </h5>
        <p class="text-caption text-dim">
          A warm stationery atmosphere. Cream canvas, sage primary, slate-blue
          accent &mdash; the kind of palette a print magazine or independent
          publisher might use.
        </p>
        <details>
          <summary>View Palette Code</summary>
          <pre class="text-caption overflow-x-auto"><code
              >{`voidEngine.registerTheme('linen', {
  mode: 'light',
  physics: 'flat',
  tagline: 'Stationery / Print',
  palette: {
    'font-atmos-heading': "'Lora', serif",
    'font-atmos-body':    "'Lora', serif",
    'bg-canvas':          '#f5efe6',
    'bg-spotlight':       '#fbf6ee',
    'bg-surface':         '#ffffff',
    'bg-sunk':            '#ebe3d4',
    'energy-primary':     '#5a7a52',
    'energy-secondary':   '#3a5470',
    'border-color':       'rgba(90, 122, 82, 0.28)',
    'text-main':          '#2a2520',
    'text-dim':           '#5a5048',
    'text-mute':          '#8a7f73',
  }
});`}</code
            ></pre>
        </details>

        <div class="flex flex-row gap-md flex-wrap">
          <ActionBtn
            icon={Sparkle}
            text={linenRegistered ? 'Registered' : 'Register Linen'}
            onclick={registerLinen}
            disabled={linenRegistered}
          />

          {#if linenRegistered}
            <span in:materialize out:dematerialize>
              <button
                class="btn btn-premium"
                onclick={applyLinen}
                disabled={voidEngine.atmosphere === 'linen'}
              >
                {voidEngine.atmosphere === 'linen'
                  ? 'Linen Active'
                  : 'Apply Linen'}
              </button>
            </span>
          {/if}
        </div>
      </div>

      <p class="text-caption text-mute px-xs">
        Registered themes are persisted to localStorage and survive page
        reloads. Use <code>registerEphemeralTheme()</code> for themes that should
        not persist (e.g., component-scoped previews).
      </p>
    </div>

    <!-- ── 3. TEMPORARY THEMES ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Temporary Theme Stack</h5>
      <p class="text-small text-mute">
        Temporary themes are non-persistent and stack-based (LIFO). Use
        <code>applyTemporaryTheme()</code> for simple previews, or
        <code>pushTemporaryTheme()</code> /
        <code>releaseTemporaryTheme()</code> for scoped usage with explicit handles.
        Releasing a handle restores the previous theme. The user's saved atmosphere
        is never overwritten.
      </p>

      <div class="surface-sunk p-md flex flex-col gap-md">
        <div class="flex flex-row gap-md flex-wrap">
          <ActionBtn
            icon={Sparkle}
            text={alreadyTerminal
              ? 'Terminal is already active'
              : 'Push Terminal (Temporary)'}
            onclick={pushTempTheme}
            disabled={tempHandle !== null || alreadyTerminal}
          />
          <ActionBtn
            icon={Undo}
            text="Release & Restore"
            class="btn-error"
            onclick={releaseTempTheme}
            disabled={tempHandle === null}
          />
        </div>

        <div class="flex flex-col gap-xs">
          <p class="text-caption text-mute">
            Stack status:
            {#if voidEngine.hasTemporaryTheme}
              <span class="text-premium">
                temporary theme active ({voidEngine.temporaryThemeInfo?.label ??
                  'unnamed'})
              </span>
            {:else}
              <span class="text-success"
                >no temporary theme — using saved preference</span
              >
            {/if}
          </p>
        </div>
      </div>

      <details>
        <summary>Scoped Usage Pattern</summary>
        <pre class="p-md"><code
            >// In a component's $effect — push on mount, release on cleanup
$effect(() =&gt; &#123;
  const handle = voidEngine.pushTemporaryTheme('frost', 'Ice Mode');
  return () =&gt; &#123;
    if (handle !== null) voidEngine.releaseTemporaryTheme(handle);
  &#125;;
&#125;);

// Or use AtmosphereScope component for declarative scoping
&lt;AtmosphereScope atmosphere="terminal" label="Terminal Scene"&gt;
  &lt;!-- children render with terminal palette --&gt;
&lt;/AtmosphereScope&gt;</code
          ></pre>
      </details>
    </div>

    <!-- ── 4. PALETTE CONTRACT ──────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Palette Contract</h5>
      <p class="text-small text-mute">
        Colors are semantic, not absolute. Every palette is organized into a
        5-layer system &mdash; from the deepest canvas to the highest text
        signal. Each layer has a fixed role. Atmospheres change the values; the
        architecture never moves.
      </p>

      <div class="surface-sunk p-lg flex flex-col gap-md">
        <div class="flex flex-col gap-sm">
          <h5>Layer 1: Canvas (Foundation)</h5>
          <p class="text-caption text-mute">
            The absolute floor. Recessed areas are carved into it; ambient light
            radiates from above.
          </p>
          <div class="flex flex-row gap-sm flex-wrap">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-canvas)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-canvas border-solid border-border"
              ></span>
              <code class="text-caption">bg-canvas</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-sunk)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-sunk border-solid border-border"
              ></span>
              <code class="text-caption">bg-sunk</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-spotlight)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-spotlight border-solid border-border"
              ></span>
              <code class="text-caption">bg-spotlight</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h5>Layer 2: Surface (Float)</h5>
          <p class="text-caption text-mute">
            Floating elements &mdash; cards, modals, headers. Rendered above the
            canvas with depth.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--bg-surface)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-surface border-solid border-border"
              ></span>
              <code class="text-caption">bg-surface</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h5>Layer 3: Energy (Interaction)</h5>
          <p class="text-caption text-mute">
            Brand and interaction colors. Drives buttons, focus states, and
            emphasis.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--energy-primary)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-primary border-solid border-border"
              ></span>
              <code class="text-caption">energy-primary</code>
            </div>
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--energy-secondary)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-secondary border-solid border-border"
              ></span>
              <code class="text-caption">energy-secondary</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h5>Layer 4: Structure (Borders)</h5>
          <p class="text-caption text-mute">
            Unified border system.
            <code>var(--physics-border-width)</code> adapts per physics preset: 1px
            in Glass and Flat, 2px in Retro.
          </p>
          <div class="flex flex-row gap-sm">
            <div
              class="flex flex-col items-center gap-xs"
              use:tooltip={'var(--border-color)'}
            >
              <span
                class="block w-3xl h-xl rounded bg-border border-solid border-border"
              ></span>
              <code class="text-caption">border-color</code>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-sm">
          <h5>Layer 5: Signal (Text Hierarchy)</h5>
          <p class="text-caption text-mute">
            Three levels of emphasis for information hierarchy.
          </p>
          <div class="flex flex-row gap-lg items-baseline">
            <span class="text-main font-bold">Main</span>
            <span class="text-dim">Dim</span>
            <span class="text-mute">Mute</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Semantic Colors -->
    <div class="flex flex-col gap-sm">
      <h5>Semantic Colors</h5>
      <p class="text-small text-mute">
        Four signal colors provide consistent meaning across all atmospheres.
        Each generates light, dark, and subtle variants automatically via OKLCH.
      </p>
      <div class="grid grid-cols-2 tablet:grid-cols-4 gap-sm">
        <div
          class="flex flex-col items-center gap-xs p-sm rounded bg-success-subtle"
        >
          <span class="block w-lg h-lg rounded-full bg-success"></span>
          <b class="text-success">Success</b>
          <p class="text-caption text-center">Positive outcome</p>
        </div>
        <div
          class="flex flex-col items-center gap-xs p-sm rounded bg-error-subtle"
        >
          <span class="block w-lg h-lg rounded-full bg-error"></span>
          <b class="text-error">Error</b>
          <p class="text-caption text-center">Destructive, failure</p>
        </div>
        <div
          class="flex flex-col items-center gap-xs p-sm rounded bg-premium-subtle"
        >
          <span class="block w-lg h-lg rounded-full bg-premium"></span>
          <b class="text-premium">Premium</b>
          <p class="text-caption text-center">Attention, cost</p>
        </div>
        <div
          class="flex flex-col items-center gap-xs p-sm rounded bg-system-subtle"
        >
          <span class="block w-lg h-lg rounded-full bg-system"></span>
          <b class="text-system">System</b>
          <p class="text-caption text-center">Informational</p>
        </div>
      </div>
    </div>

    <!-- ── 5. QUICK REFERENCE ───────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Quick Reference</h5>

      <div class="surface-sunk p-md overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Method</th>
              <th>Persists</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>setAtmosphere(id)</code></td>
              <td>Yes</td>
              <td>User's permanent theme choice</td>
            </tr>
            <tr>
              <td><code>registerTheme(id, def)</code></td>
              <td>Yes</td>
              <td>Register custom atmosphere (cached in localStorage)</td>
            </tr>
            <tr>
              <td><code>unregisterTheme(id)</code></td>
              <td>Yes</td>
              <td
                >Remove a custom atmosphere (clears cache, falls back if active)</td
              >
            </tr>
            <tr>
              <td><code>registerEphemeralTheme(id, def)</code></td>
              <td>No</td>
              <td>Register scope-owned theme (no persistence)</td>
            </tr>
            <tr>
              <td><code>applyTemporaryTheme(id, label)</code></td>
              <td>No</td>
              <td>One-shot preview (respects adaptAtmosphere pref)</td>
            </tr>
            <tr>
              <td><code>pushTemporaryTheme(id, label)</code></td>
              <td>No</td>
              <td>Scoped preview — returns handle for cleanup</td>
            </tr>
            <tr>
              <td><code>releaseTemporaryTheme(handle)</code></td>
              <td>No</td>
              <td>Release specific scoped handle (idempotent)</td>
            </tr>
            <tr>
              <td><code>restoreUserTheme()</code></td>
              <td>No</td>
              <td>Pop topmost temporary theme (LIFO)</td>
            </tr>
            <tr>
              <td><code>loadExternalTheme(url)</code></td>
              <td>Yes</td>
              <td>Fetch + validate + register remote theme JSON</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="text-caption text-mute px-xs">
      Atmosphere definitions live in
      <code>src/config/atmospheres.ts</code>. The engine runtime is
      <code>src/adapters/void-engine.svelte.ts</code>. All 4 built-in
      atmospheres are registered at boot; custom themes are registered via
      <code>registerTheme()</code> or loaded from a remote URL with
      <code>loadExternalTheme()</code>.
    </p>
  </div>
</section>
