<script lang="ts">
  import Selector from '../ui/Selector.svelte';
  import IconBtn from '../ui/IconBtn.svelte';

  // Custom icons
  import ArrowBack from '@components/icons/ArrowBack.svelte';
  import Burger from '@components/icons/Burger.svelte';
  import Contract from '@components/icons/Contract.svelte';
  import Copy from '@components/icons/Copy.svelte';
  import Remove from '@components/icons/Remove.svelte';
  import DoorIn from '@components/icons/DoorIn.svelte';
  import DoorOut from '@components/icons/DoorOut.svelte';
  import Dream from '@components/icons/Dream.svelte';
  import Edit from '@components/icons/Edit.svelte';
  import Eye from '@components/icons/Eye.svelte';
  import Fullscreen from '@components/icons/Fullscreen.svelte';
  import Music from '@components/icons/Music.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';
  import Caret from '@components/icons/Caret.svelte';
  import Profile from '@components/icons/Profile.svelte';
  import Quit from '@components/icons/Quit.svelte';
  import Refresh from '@components/icons/Refresh.svelte';
  import Undo from '@components/icons/Undo.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import Search from '@components/icons/Search.svelte';
  import Sort from '@components/icons/Sort.svelte';
  import Sparkle from '@components/icons/Sparkle.svelte';
  import LoadingSpin from '@components/icons/LoadingSpin.svelte';
  import Switch from '@components/icons/Switch.svelte';
  import Voice from '@components/icons/Voice.svelte';
  import LoadingQuill from '@components/icons/LoadingQuill.svelte';

  // Lucide icons (static library examples)
  import {
    ArrowDown,
    Check,
    Heart,
    House,
    Info,
    LayoutGrid,
    Moon,
    Shield,
    Star,
    Sun,
    TriangleAlert,
    X,
  } from '@lucide/svelte';

  // Local state for icons
  let iconSize = $state('4xl');
  let sizeList = $state([
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: '2XL' },
    { value: '3xl', label: '3XL' },
    { value: '4xl', label: '4XL' },
  ]);

  let iconColor = $state('text-main');
  let colorList = $state([
    { value: 'text-main', label: 'Main' },
    { value: 'text-dim', label: 'Dim' },
    { value: 'text-mute', label: 'Mute' },
    { value: 'text-premium', label: 'Premium' },
    { value: 'text-system', label: 'System' },
    { value: 'text-success', label: 'Success' },
    { value: 'text-error', label: 'Error' },
  ]);

  // Toggle state (click to switch)
  let burgerActive = $state(false);
  let copyActive = $state(false);
  let eyeActive = $state(false);
  let fullscreenActive = $state(false);
  let musicActive = $state(false);
  let voiceActive = $state(false);
</script>

<section id="icons" class="flex flex-col gap-md">
  <h2>05 // ICONS</h2>
  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Two-tier icon system: hand-crafted animated icons for interactive
      elements, and <strong>Lucide</strong> (1500+ open-source icons) for everything
      else. Icons automatically inherit their parent's color and scale to any size
      &mdash; toggle, hover, and click states are all built in.
    </p>

    <details>
      <summary>Technical Details</summary>
      <p class="p-md">
        All icons inherit <code>currentColor</code> from their parent and scale
        via <code>data-size</code>. Use <b>custom icons</b> when the icon needs
        to animate in response to state changes; use <b>Lucide</b> for static
        display. Custom icons live in
        <code>src/components/icons/</code> and use the
        <code>icon-[name]</code> class namespace.
      </p>
    </details>

    <!-- ─── SIZE & COLOR CONTROLS ────────────────────────────────────── -->
    <div class="flex flex-col gap-md small-desktop:flex-row">
      <Selector
        bind:value={iconColor}
        options={colorList}
        id="icon-color"
        label="Color"
        class="flex-1"
      />
      <Selector
        bind:value={iconSize}
        options={sizeList}
        id="icon-size"
        label="Size"
        class="flex-1"
      />
    </div>

    <p class="text-caption text-mute px-xs">
      All icons below respond to these controls. Icons inherit
      <code>currentColor</code> from their parent and scale via
      <code>data-size</code>.
    </p>

    <!-- ─── TOGGLE ICONS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Toggle</h5>
      <p class="text-small text-mute">
        Click to switch between two persistent states. Uses
        <code>data-state</code>, <code>data-muted</code>, or
        <code>data-fullscreen</code>.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Burger}
            size={iconSize}
            iconProps={{ 'data-state': burgerActive ? 'active' : '' }}
            onclick={() => (burgerActive = !burgerActive)}
            aria-label="Toggle menu"
          />
          <span class="text-caption text-mute">Burger</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Eye}
            size={iconSize}
            iconProps={{ id: 'eye-demo', 'data-muted': eyeActive }}
            onclick={() => (eyeActive = !eyeActive)}
            aria-label="Toggle visibility"
          />
          <span class="text-caption text-mute">Eye</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Music}
            size={iconSize}
            iconProps={{ id: 'music-demo', 'data-muted': musicActive }}
            onclick={() => (musicActive = !musicActive)}
            aria-label="Toggle music"
          />
          <span class="text-caption text-mute">Music</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Voice}
            size={iconSize}
            iconProps={{ id: 'voice-demo', 'data-muted': voiceActive }}
            onclick={() => (voiceActive = !voiceActive)}
            aria-label="Toggle voice"
          />
          <span class="text-caption text-mute">Voice</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Fullscreen}
            size={iconSize}
            iconProps={{ 'data-fullscreen': fullscreenActive }}
            onclick={() => (fullscreenActive = !fullscreenActive)}
            aria-label="Toggle fullscreen"
          />
          <span class="text-caption text-mute">Fullscreen</span>
        </div>
      </div>
    </div>

    <!-- ─── HOVER ICONS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Hover</h5>
      <p class="text-small text-mute">
        Animate on pointer enter via <code>data-state="active"</code>. Grouped
        by usage context.
      </p>

      <!-- Search -->
      <p class="text-small text-dim">
        <strong>Search</strong> — supports
        <code>data-zoom</code> variants for zoom-in and zoom-out.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Search} size={iconSize} aria-label="Search" />
          <span class="text-caption text-mute">Search</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Search}
            size={iconSize}
            iconProps={{ 'data-zoom': 'in' }}
            aria-label="Zoom in"
          />
          <span class="text-caption text-mute">Zoom-in</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Search}
            size={iconSize}
            iconProps={{ 'data-zoom': 'out' }}
            aria-label="Zoom out"
          />
          <span class="text-caption text-mute">Zoom-out</span>
        </div>
      </div>

      <!-- Playback -->
      <p class="text-small text-dim">
        <strong>Playback</strong> — media and control flow.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={PlayPause} size={iconSize} aria-label="Play" />
          <span class="text-caption text-mute">PlayPause</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={PlayPause}
            size={iconSize}
            iconProps={{ 'data-paused': true }}
            aria-label="Pause"
          />
          <span class="text-caption text-mute"
            >PlayPause <span class="text-xs">(paused)</span></span
          >
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Restart} size={iconSize} aria-label="Restart" />
          <span class="text-caption text-mute">Restart</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Refresh} size={iconSize} aria-label="Refresh" />
          <span class="text-caption text-mute">Refresh</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Undo} size={iconSize} aria-label="Undo" />
          <span class="text-caption text-mute">Undo</span>
        </div>
      </div>

      <!-- Navigation -->
      <p class="text-small text-dim">
        <strong>Navigation</strong> — entry, exit, and state switching.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={DoorIn}
            size={iconSize}
            iconProps={{ id: 'door-in-demo' }}
            aria-label="Sign in"
          />
          <span class="text-caption text-mute">DoorIn</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={DoorOut}
            size={iconSize}
            iconProps={{ id: 'door-out-demo' }}
            aria-label="Sign out"
          />
          <span class="text-caption text-mute">DoorOut</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Quit}
            size={iconSize}
            iconProps={{ id: 'quit-demo' }}
            aria-label="Quit"
          />
          <span class="text-caption text-mute">Quit</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Switch}
            size={iconSize}
            iconProps={{ id: 'switch-demo' }}
            aria-label="Switch"
          />
          <span class="text-caption text-mute">Switch</span>
        </div>
      </div>

      <!-- Actions -->
      <p class="text-small text-dim">
        <strong>Actions</strong> — content operations and data manipulation.
        Most use hover animations; Copy uses a click-triggered state toggle (<code
          >data-state="active"</code
        >) with auto-reset.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Edit} size={iconSize} aria-label="Edit" />
          <span class="text-caption text-mute">Edit</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn
            icon={Copy}
            size={iconSize}
            iconProps={{ 'data-state': copyActive ? 'active' : '' }}
            onclick={() => {
              copyActive = true;
              setTimeout(() => {
                copyActive = false;
              }, 1000);
            }}
            aria-label="Copy"
          />
          <span class="text-caption text-mute">Copy</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Remove} size={iconSize} aria-label="Remove" />
          <span class="text-caption text-mute">Remove</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Contract} size={iconSize} aria-label="Contract" />
          <span class="text-caption text-mute">Contract</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Sort} size={iconSize} aria-label="Sort" />
          <span class="text-caption text-mute">Sort</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Caret} size={iconSize} aria-label="Expand" />
          <span class="text-caption text-mute">Caret</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <IconBtn icon={Sparkle} size={iconSize} aria-label="Sparkle" />
          <span class="text-caption text-mute">Sparkle</span>
        </div>
      </div>
    </div>

    <!-- ─── LOADING ICONS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Loading</h5>
      <p class="text-small text-mute">
        Physics-aware loading indicators: smooth animation in glass/flat,
        stepped in retro. Each serves a distinct semantic purpose.
      </p>

      <!-- LoadingSpin -->
      <p class="text-small text-dim">
        <strong>LoadingSpin</strong> — data fetching, backend requests, and asynchronous
        operations. The universal spinner for any non-AI loading state.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <LoadingSpin data-size={iconSize} />
          <span class="text-caption text-mute">LoadingSpin</span>
        </div>
      </div>

      <!-- LoadingQuill -->
      <p class="text-small text-dim">
        <strong>LoadingQuill</strong> — AI content generation, story game launching,
        and creative AI processes. The animated quill signals that an AI is actively
        authoring content.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <LoadingQuill data-size={iconSize} />
          <span class="text-caption text-mute">LoadingQuill</span>
        </div>
      </div>
    </div>

    <!-- ─── STATIC ICONS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Static</h5>
      <p class="text-small text-mute">
        Display-only icons with no interactive state. Accept only
        <code>data-size</code>.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <ArrowBack data-size={iconSize} />
          <span class="text-caption text-mute">ArrowBack</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Dream data-size={iconSize} />
          <span class="text-caption text-mute">Dream</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Profile data-size={iconSize} />
          <span class="text-caption text-mute">Profile</span>
        </div>
      </div>
    </div>

    <!-- ─── LUCIDE INTEGRATION ───────────────────────────────────────── -->
    <div class="flex flex-col gap-sm">
      <h5>Lucide (Static Library)</h5>
      <p class="text-small text-mute">
        For generic static icons, use
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer">Lucide</a
        >
        — an open-source library with 1500+ icons. Below are a few examples; browse
        the full set at
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer">lucide.dev/icons</a
        >. Always pass
        <code>class="icon"</code>
        for base styling and <code>data-size</code> for sizing.
      </p>
      <div
        class="surface-sunk p-md flex flex-wrap justify-center gap-md {iconColor}"
      >
        <div class="flex flex-col items-center gap-xs">
          <ArrowDown class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">ArrowDown</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Check class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Check</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Heart class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Heart</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <House class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">House</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Info class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Info</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <LayoutGrid class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">LayoutGrid</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Moon class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Moon</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Shield class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Shield</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Star class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Star</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Sun class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Sun</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <TriangleAlert class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">TriangleAlert</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <X class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">X</span>
        </div>
      </div>
    </div>

    <details>
      <summary>View Code</summary>
      <pre><code
          >&lt;!-- Lucide static icon --&gt;
&lt;script&gt;
  import &#123; Heart, Check &#125; from '@lucide/svelte';
&lt;/script&gt;
&lt;Heart class="icon" data-size="lg" /&gt;
&lt;Check class="icon text-success" data-size="md" /&gt;

&lt;!-- Interactive icon via IconBtn (hover animates) --&gt;
&lt;script&gt;
  import IconBtn from './ui/IconBtn.svelte';
  import PlayPause from './icons/PlayPause.svelte';
&lt;/script&gt;
&lt;IconBtn icon=&#123;PlayPause&#125; aria-label="Play" /&gt;

&lt;!-- Toggle icon with state --&gt;
&lt;IconBtn
  icon=&#123;Eye&#125;
  iconProps=&#123;&#123; 'data-muted': isMuted &#125;&#125;
  onclick=&#123;() =&gt; (isMuted = !isMuted)&#125;
  aria-label="Toggle visibility"
/&gt;</code
        ></pre>
    </details>
  </div>
</section>
