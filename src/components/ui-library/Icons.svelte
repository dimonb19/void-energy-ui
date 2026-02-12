<script lang="ts">
  import Selector from '../ui/Selector.svelte';

  import Arrow from '../icons/Arrow.svelte';
  import BackArrow from '../icons/BackArrow.svelte';
  import Book from '../icons/Book.svelte';
  import Burger from '../icons/Burger.svelte';
  import Checkmark from '../icons/Checkmark.svelte';
  import Copy from '../icons/Copy.svelte';
  import Delete from '../icons/Delete.svelte';
  import DoorIn from '../icons/DoorIn.svelte';
  import DoorOut from '../icons/DoorOut.svelte';
  import Dream from '../icons/Dream.svelte';
  import Edit from '../icons/Edit.svelte';
  import Eye from '../icons/Eye.svelte';
  import Filter from '../icons/Filter.svelte';
  import Fullscreen from '../icons/Fullscreen.svelte';
  import Gear from '../icons/Gear.svelte';
  import Grid from '../icons/Grid.svelte';
  import Home from '../icons/Home.svelte';
  import Info from '../icons/Info.svelte';
  import Lock from '../icons/Lock.svelte';
  import Moon from '../icons/Moon.svelte';
  import Music from '../icons/Music.svelte';
  import Picker from '../icons/Picker.svelte';
  import Play from '../icons/Play.svelte';
  import Profile from '../icons/Profile.svelte';
  import Quit from '../icons/Quit.svelte';
  import Reset from '../icons/Reset.svelte';
  import Restart from '../icons/Restart.svelte';
  import Search from '../icons/Search.svelte';
  import Sorting from '../icons/Sorting.svelte';
  import SpinLoader from '../icons/SpinLoader.svelte';
  import Star from '../icons/Star.svelte';
  import Sun from '../icons/Sun.svelte';
  import Switch from '../icons/Switch.svelte';
  import Voice from '../icons/Voice.svelte';
  import Warning from '../icons/Warning.svelte';
  import XMark from '../icons/XMark.svelte';

  // Local sate for icons
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

  // Interactive icons state
  let burgerActive = $state(false);
  let copyActive = $state(false);
  let eyeActive = $state(false);
  let fullscreenActive = $state(false);
  let musicActive = $state(false);
  let voiceActive = $state(false);

  let deleteFocus = $state(false);
  let doorInFocus = $state(false);
  let doorOutFocus = $state(false);
  let editFocus = $state(false);
  let fullscreenFocus = $state(false);
  let pickerFocus = $state(false);
  let playFocus = $state(false);
  let quitFocus = $state(false);
  let resetFocus = $state(false);
  let restartFocus = $state(false);
  let searchFocus = $state(false);
  let searchZoomInFocus = $state(false);
  let searchZoomOutFocus = $state(false);
  let sortingFocus = $state(false);
  let switchFocus = $state(false);
</script>

<section class="flex flex-col gap-md mt-md">
  <h2>01 // ICONS</h2>
  <div class="surface-glass p-lg flex flex-col gap-md">
    <div class="flex flex-col gap-xs items-center">
      <h5>Interactive Icons</h5>
      <div
        class="w-full surface-sunk p-md flex flex-wrap justify-center gap-sm"
      >
        <button class="btn-void" onclick={() => (burgerActive = !burgerActive)}>
          <Burger
            data-state={burgerActive ? 'active' : ''}
            data-size={iconSize}
          />
        </button>
        <button
          class="btn-void"
          onclick={() => {
            let timeout: any;
            clearTimeout(timeout);
            copyActive = true;
            timeout = setTimeout(() => {
              copyActive = false;
            }, 1000);
          }}
        >
          <Copy data-state={copyActive ? 'active' : ''} data-size={iconSize} />
        </button>
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
        <button
          class="btn-void"
          onpointerenter={() => (playFocus = true)}
          onpointerleave={() => (playFocus = false)}
        >
          <Play data-state={playFocus ? 'active' : ''} data-size={iconSize} />
        </button>
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
        <button
          class="btn-void"
          onpointerenter={() => (pickerFocus = true)}
          onpointerleave={() => (pickerFocus = false)}
        >
          <Picker
            data-state={pickerFocus ? 'active' : ''}
            data-size={iconSize}
          />
        </button>
        <button class="btn-void" onclick={() => (eyeActive = !eyeActive)}>
          <Eye data-size={iconSize} data-muted={eyeActive} />
        </button>
        <button class="btn-void" onclick={() => (musicActive = !musicActive)}>
          <Music data-size={iconSize} data-muted={musicActive} />
        </button>
        <button class="btn-void" onclick={() => (voiceActive = !voiceActive)}>
          <Voice data-size={iconSize} data-muted={voiceActive} />
        </button>
        <button
          class="btn-void"
          onpointerenter={() => (editFocus = true)}
          onpointerleave={() => (editFocus = false)}
        >
          <Edit data-state={editFocus ? 'active' : ''} data-size={iconSize} />
        </button>
        <button
          class="btn-void"
          onpointerenter={() => (quitFocus = true)}
          onpointerleave={() => (quitFocus = false)}
        >
          <Quit data-state={quitFocus ? 'active' : ''} data-size={iconSize} />
        </button>
        <button
          class="btn-void"
          onpointerenter={() => (resetFocus = true)}
          onpointerleave={() => (resetFocus = false)}
        >
          <Reset data-state={resetFocus ? 'active' : ''} data-size={iconSize} />
        </button>
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
        <button
          class="btn-void"
          onpointerenter={() => (sortingFocus = true)}
          onpointerleave={() => (sortingFocus = false)}
        >
          <Sorting
            data-state={sortingFocus ? 'active' : ''}
            data-size={iconSize}
          />
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-xs items-center">
      <h5>Static Icons</h5>
      <div
        class="w-full surface-sunk p-md flex flex-wrap justify-center gap-sm"
      >
        <Arrow data-size={iconSize} />
        <BackArrow data-size={iconSize} />
        <Book data-size={iconSize} />
        <Checkmark data-size={iconSize} />
        <Dream data-size={iconSize} />
        <Filter data-size={iconSize} />
        <Gear data-size={iconSize} />
        <Grid data-size={iconSize} />
        <Home data-size={iconSize} />
        <Info data-size={iconSize} />
        <Lock data-size={iconSize} />
        <Moon data-size={iconSize} />
        <Profile data-size={iconSize} />
        <SpinLoader data-size={iconSize} />
        <Star data-size={iconSize} />
        <Sun data-size={iconSize} />
        <Switch data-size={iconSize} />
        <Warning data-size={iconSize} />
        <XMark data-size={iconSize} />
      </div>
    </div>

    <Selector
      bind:value={iconSize}
      options={sizeList}
      id="icon-size"
      label="Icons Size"
    />
  </div>
</section>
