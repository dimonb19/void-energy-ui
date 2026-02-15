<!--
  MEDIA SLIDER COMPONENT
  A horizontal control bar with mute toggle, range slider, and replay button.

  USAGE
  -------------------------------------------------------------------------
  <MediaSlider bind:value={volume} bind:muted />
  <MediaSlider bind:value={volume} bind:muted icon="music" onreplay={replay} />
  <MediaSlider bind:value={volume} bind:muted replay={false} />
  -------------------------------------------------------------------------

  PROPS:
  - value: Slider value 0-100 (bindable)
  - muted: Mute state (bindable)
  - icon: Which icon to use for mute toggle ('voice' | 'music')
  - replay: Show replay button (default: true)
  - onreplay: Callback when replay is clicked
  - disabled: Disables all controls
  - class: Additional CSS classes on the wrapper

  BEHAVIOR:
  - Voice/Music icon toggles mute state
  - Slider controls volume/position (dimmed when muted)
  - Restart button triggers replay callback with animation

  @see /_fields.scss for .media-slider styles
-->
<script lang="ts">
  import Voice from '@components/icons/Voice.svelte';
  import Music from '@components/icons/Music.svelte';
  import Restart from '@components/icons/Restart.svelte';
  import IconBtn from './IconBtn.svelte';

  interface MediaSliderProps {
    value: number;
    muted: boolean;
    icon?: 'voice' | 'music';
    replay?: boolean;
    onreplay?: () => void;
    disabled?: boolean;
    class?: string;
  }

  let {
    value = $bindable(50),
    muted = $bindable(false),
    icon = 'voice',
    replay = true,
    onreplay,
    disabled = false,
    class: className = '',
  }: MediaSliderProps = $props();

  function toggleMute() {
    if (disabled) return;
    muted = !muted;
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
    bind:value
    disabled={disabled || muted}
  />

  {#if replay}
    <IconBtn
      icon={Restart}
      {disabled}
      onclick={handleReplay}
      aria-label="Replay"
    />
  {/if}
</div>
