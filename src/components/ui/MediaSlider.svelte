<!--
  MEDIA SLIDER COMPONENT
  A horizontal control bar with mute toggle, volume slider, optional
  playback (pause/play) toggle, and optional replay button.

  USAGE
  -------------------------------------------------------------------------
  <MediaSlider bind:volume bind:muted />
  <MediaSlider bind:volume bind:muted icon="music" />
  <MediaSlider bind:volume bind:muted playback bind:paused />
  <MediaSlider bind:volume bind:muted playback replay onreplay={restart} />
  -------------------------------------------------------------------------

  PROPS:
  - volume: Volume level 0-100 (bindable)
  - muted: Mute state (bindable)
  - icon: Which icon to use for mute toggle ('voice' | 'music')
  - playback: Show pause/play toggle (default: false)
  - paused: Pause state (bindable)
  - replay: Show replay button (default: false)
  - onchange: Callback when volume changes — (volume: number) => void
  - onmute: Callback when mute toggles — (muted: boolean) => void
  - onpause: Callback when pause toggles — (paused: boolean) => void
  - onreplay: Callback when replay is clicked
  - disabled: Disables all controls
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Voice/Music icon toggles mute state
  - Slider controls volume (dimmed when muted)
  - Pause/Play icon toggles paused state
  - Restart button triggers replay callback with animation

  @see /_fields.scss for .media-slider styles
-->
<script lang="ts">
  import Voice from '@components/icons/Voice.svelte';
  import Music from '@components/icons/Music.svelte';
  import PlayPause from '@components/icons/PlayPause.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import IconBtn from './IconBtn.svelte';

  interface MediaSliderProps {
    volume: number;
    muted: boolean;
    icon?: 'voice' | 'music';
    playback?: boolean;
    paused?: boolean;
    replay?: boolean;
    onchange?: (volume: number) => void;
    onmute?: (muted: boolean) => void;
    onpause?: (paused: boolean) => void;
    onreplay?: () => void;
    disabled?: boolean;
    class?: string;
  }

  let {
    volume = $bindable(50),
    muted = $bindable(false),
    icon = 'voice',
    playback = false,
    paused = $bindable(false),
    replay = false,
    onchange,
    onmute,
    onpause,
    onreplay,
    disabled = false,
    class: className = '',
  }: MediaSliderProps = $props();

  function toggleMute() {
    if (disabled) return;
    muted = !muted;
    onmute?.(muted);
  }

  function togglePause() {
    if (disabled) return;
    paused = !paused;
    onpause?.(paused);
  }

  function handleReplay() {
    onreplay?.();
  }
</script>

<div
  class="media-slider flex items-center gap-xs {className}"
  data-muted={muted}
>
  <IconBtn
    icon={icon === 'music' ? Music : Voice}
    iconProps={{ 'data-muted': muted }}
    onclick={toggleMute}
    {disabled}
    aria-label={muted ? 'Unmute' : 'Mute'}
    aria-pressed={muted}
  />

  <input
    type="range"
    min="0"
    max="100"
    bind:value={volume}
    oninput={() => onchange?.(volume)}
    disabled={disabled || muted}
  />

  {#if playback}
    <IconBtn
      icon={PlayPause}
      iconProps={{ 'data-paused': paused }}
      onclick={togglePause}
      {disabled}
      aria-label={paused ? 'Resume' : 'Pause'}
      aria-pressed={paused}
    />
  {/if}

  {#if replay}
    <IconBtn
      icon={Restart}
      {disabled}
      onclick={handleReplay}
      aria-label="Replay"
    />
  {/if}
</div>
