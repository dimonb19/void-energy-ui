<script lang="ts">
  import Selector from '../ui/Selector.svelte';

  // Custom icons
  import ArrowBack from '@components/icons/ArrowBack.svelte';
  import Burger from '@components/icons/Burger.svelte';
  import Approve from '@components/icons/Approve.svelte';
  import Copy from '@components/icons/Copy.svelte';
  import Delete from '@components/icons/Delete.svelte';
  import DoorIn from '@components/icons/DoorIn.svelte';
  import DoorOut from '@components/icons/DoorOut.svelte';
  import Dream from '@components/icons/Dream.svelte';
  import Edit from '@components/icons/Edit.svelte';
  import Eye from '@components/icons/Eye.svelte';
  import Fullscreen from '@components/icons/Fullscreen.svelte';
  import Music from '@components/icons/Music.svelte';
  import Caret from '@components/icons/Caret.svelte';
  import Play from '@components/icons/Play.svelte';
  import Profile from '@components/icons/Profile.svelte';
  import Quit from '@components/icons/Quit.svelte';
  import Refresh from '@components/icons/Refresh.svelte';
  import Undo from '@components/icons/Undo.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import Search from '@components/icons/Search.svelte';
  import Sort from '@components/icons/Sort.svelte';
  import SpinLoader from '@components/icons/SpinLoader.svelte';
  import Switch from '@components/icons/Switch.svelte';
  import Voice from '@components/icons/Voice.svelte';

  // Lucide icons (static library examples)
  import {
    ArrowDown,
    Check,
    Feather,
    Heart,
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
    { value: '2xl', label: 'Double Extra Large' },
    { value: '3xl', label: 'Triple Extra Large' },
    { value: '4xl', label: 'Quadra Extra Large' },
  ]);

  // Toggle state (click to switch)
  let burgerActive = $state(false);
  let copyActive = $state(false);
  let eyeActive = $state(false);
  let fullscreenActive = $state(false);
  let musicActive = $state(false);
  let voiceActive = $state(false);

  // Hover state (pointer enter/leave)
  let approveFocus = $state(false);
  let deleteFocus = $state(false);
  let doorInFocus = $state(false);
  let doorOutFocus = $state(false);
  let editFocus = $state(false);
  let fullscreenFocus = $state(false);
  let caretFocus = $state(false);
  let playFocus = $state(false);
  let quitFocus = $state(false);
  let refreshFocus = $state(false);
  let undoFocus = $state(false);
  let restartFocus = $state(false);
  let searchFocus = $state(false);
  let searchZoomInFocus = $state(false);
  let searchZoomOutFocus = $state(false);
  let sortFocus = $state(false);
  let switchFocus = $state(false);
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>03 // ICONS</h2>
  <div class="surface-glass p-lg flex flex-col gap-lg">
    <p class="text-dim">
      Two-tier icon system: hand-crafted animated icons for interactive UI
      elements, and <strong>Lucide</strong> for generic static icons. All icons
      inherit <code>currentColor</code> from their parent and scale via
      <code>data-size</code>.
    </p>

    <!-- ─── TOGGLE ICONS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Toggle</h5>
      <p class="text-small text-mute">
        Click to switch between two persistent states. Uses
        <code>data-state</code>, <code>data-muted</code>, or
        <code>data-fullscreen</code>.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onclick={() => (burgerActive = !burgerActive)}
          >
            <Burger
              data-state={burgerActive ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Burger</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button class="btn-void" onclick={() => (eyeActive = !eyeActive)}>
            <Eye data-size={iconSize} data-muted={eyeActive} />
          </button>
          <span class="text-caption text-mute">Eye</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button class="btn-void" onclick={() => (musicActive = !musicActive)}>
            <Music data-size={iconSize} data-muted={musicActive} />
          </button>
          <span class="text-caption text-mute">Music</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button class="btn-void" onclick={() => (voiceActive = !voiceActive)}>
            <Voice data-size={iconSize} data-muted={voiceActive} />
          </button>
          <span class="text-caption text-mute">Voice</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onclick={() => (fullscreenActive = !fullscreenActive)}
            onpointerenter={() => (fullscreenFocus = true)}
            onpointerleave={() => (fullscreenFocus = false)}
          >
            <Fullscreen
              data-state={fullscreenFocus ? 'active' : ''}
              data-size={iconSize}
              data-fullscreen={fullscreenActive}
            />
          </button>
          <span class="text-caption text-mute">Fullscreen</span>
        </div>
      </div>
    </div>

    <!-- ─── HOVER ICONS ──────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
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
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (searchFocus = true)}
            onpointerleave={() => (searchFocus = false)}
          >
            <Search
              data-state={searchFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Search</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (searchZoomInFocus = true)}
            onpointerleave={() => (searchZoomInFocus = false)}
          >
            <Search
              data-state={searchZoomInFocus ? 'active' : ''}
              data-size={iconSize}
              data-zoom="in"
            />
          </button>
          <span class="text-caption text-mute">Zoom-in</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (searchZoomOutFocus = true)}
            onpointerleave={() => (searchZoomOutFocus = false)}
          >
            <Search
              data-state={searchZoomOutFocus ? 'active' : ''}
              data-size={iconSize}
              data-zoom="out"
            />
          </button>
          <span class="text-caption text-mute">Zoom-out</span>
        </div>
      </div>

      <!-- Playback -->
      <p class="text-small text-dim">
        <strong>Playback</strong> — media and control flow.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (playFocus = true)}
            onpointerleave={() => (playFocus = false)}
          >
            <Play data-state={playFocus ? 'active' : ''} data-size={iconSize} />
          </button>
          <span class="text-caption text-mute">Play</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (restartFocus = true)}
            onpointerleave={() => (restartFocus = false)}
          >
            <Restart
              data-state={restartFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Restart</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (refreshFocus = true)}
            onpointerleave={() => (refreshFocus = false)}
          >
            <Refresh
              data-state={refreshFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Refresh</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (undoFocus = true)}
            onpointerleave={() => (undoFocus = false)}
          >
            <Undo data-state={undoFocus ? 'active' : ''} data-size={iconSize} />
          </button>
          <span class="text-caption text-mute">Undo</span>
        </div>
      </div>

      <!-- Navigation -->
      <p class="text-small text-dim">
        <strong>Navigation</strong> — entry, exit, and state switching.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (doorInFocus = true)}
            onpointerleave={() => (doorInFocus = false)}
          >
            <DoorIn
              data-state={doorInFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">DoorIn</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (doorOutFocus = true)}
            onpointerleave={() => (doorOutFocus = false)}
          >
            <DoorOut
              data-state={doorOutFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">DoorOut</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (quitFocus = true)}
            onpointerleave={() => (quitFocus = false)}
          >
            <Quit data-state={quitFocus ? 'active' : ''} data-size={iconSize} />
          </button>
          <span class="text-caption text-mute">Quit</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (switchFocus = true)}
            onpointerleave={() => (switchFocus = false)}
          >
            <Switch
              data-state={switchFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Switch</span>
        </div>
      </div>

      <!-- Actions -->
      <p class="text-small text-dim">
        <strong>Actions</strong> — content operations and data manipulation.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (editFocus = true)}
            onpointerleave={() => (editFocus = false)}
          >
            <Edit data-state={editFocus ? 'active' : ''} data-size={iconSize} />
          </button>
          <span class="text-caption text-mute">Edit</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onclick={() => {
              copyActive = true;
              setTimeout(() => {
                copyActive = false;
              }, 1000);
            }}
          >
            <Copy
              data-state={copyActive ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Copy</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (deleteFocus = true)}
            onpointerleave={() => (deleteFocus = false)}
          >
            <Delete
              data-state={deleteFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Delete</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (approveFocus = true)}
            onpointerleave={() => (approveFocus = false)}
          >
            <Approve
              data-state={approveFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Approve</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (sortFocus = true)}
            onpointerleave={() => (sortFocus = false)}
          >
            <Sort data-state={sortFocus ? 'active' : ''} data-size={iconSize} />
          </button>
          <span class="text-caption text-mute">Sort</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <button
            class="btn-void"
            onpointerenter={() => (caretFocus = true)}
            onpointerleave={() => (caretFocus = false)}
          >
            <Caret
              data-state={caretFocus ? 'active' : ''}
              data-size={iconSize}
            />
          </button>
          <span class="text-caption text-mute">Caret</span>
        </div>
      </div>
    </div>

    <!-- ─── STATIC ICONS ─────────────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Static</h5>
      <p class="text-small text-mute">
        Display-only icons with no interactive state. Accept only
        <code>data-size</code>. SpinLoader is physics-aware: smooth rotation in
        glass/flat, stepped in retro.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
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

        <div class="flex flex-col items-center gap-xs">
          <SpinLoader data-size={iconSize} />
          <span class="text-caption text-mute">SpinLoader</span>
        </div>
      </div>
    </div>

    <!-- ─── LUCIDE INTEGRATION ───────────────────────────────────────── -->
    <div class="flex flex-col gap-xs">
      <h5>Lucide (Static Library)</h5>
      <p class="text-small text-mute">
        For generic static icons, use
        <a
          href="https://lucide.dev/icons"
          target="_blank"
          rel="noopener noreferrer">Lucide</a
        >
        directly. Always pass
        <code>class="icon"</code>
        for base styling and <code>data-size</code> for sizing.
      </p>
      <div class="surface-sunk p-md flex flex-wrap justify-center gap-md">
        <div class="flex flex-col items-center gap-xs">
          <ArrowDown class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">ArrowDown</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Check class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Check</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Feather class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Feather</span>
        </div>

        <div class="flex flex-col items-center gap-xs">
          <Heart class="icon" data-size={iconSize} />
          <span class="text-caption text-mute">Heart</span>
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
      <p class="text-small text-mute">
        <code>import &#123; IconName &#125; from '@lucide/svelte';</code><br />
        <code>&lt;IconName class="icon" data-size="md" /&gt;</code>
      </p>
    </div>

    <!-- ─── SIZE SELECTOR ────────────────────────────────────────────── -->
    <Selector
      bind:value={iconSize}
      options={sizeList}
      id="icon-size"
      label="Icons Size"
    />
  </div>
</section>
