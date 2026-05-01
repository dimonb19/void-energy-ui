<!--
  MEDIA SLIDER COMPONENT
  A horizontal control bar following the standard video-player layout:
  transport (play/pause + replay) on the left, volume slider in the
  middle, mute toggle on the right.

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

  LAYOUT:
  ┌─ .media-slider (flex justify-between gap-md) ──────────────────────────┐
  │  Left cluster (transport)         Right cluster (volume)               │
  │  [Pause/Play] [Replay]            [—— volume slider ——] [Mute]         │
  └────────────────────────────────────────────────────────────────────────┘

  Mirrors Plyr / Vidstack / Video.js / Netflix: transport on the left, a
  compact volume cluster (slider + mute icon) on the right. The slider is
  intentionally compact (~96px) so the timeline scrubber above dominates
  the visual hierarchy — width disparity is what reads as "timeline vs.
  volume" without further visual cues. For video, stack a <MediaScrubber>
  above this component.

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
  class="media-slider flex items-center justify-between gap-md {className}"
  data-muted={muted}
>
  <div class="flex items-center gap-xs">
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

  <div class="flex items-center gap-xs">
    <input
      type="range"
      min="0"
      max="100"
      aria-label="Volume"
      bind:value={volume}
      oninput={() => onchange?.(volume)}
      disabled={disabled || muted}
    />

    <IconBtn
      icon={icon === 'music' ? Music : Voice}
      iconProps={{ 'data-muted': muted }}
      onclick={toggleMute}
      {disabled}
      aria-label={muted ? 'Unmute' : 'Mute'}
      aria-pressed={muted}
    />
  </div>
</div>
