<!--
  MEDIA SCRUBBER COMPONENT
  Timeline scrubber for <video> / <audio>. Pair above a MediaSlider to
  build a complete two-row custom control bar.

  USAGE
  -------------------------------------------------------------------------
  <Video src="/clip.mp4" controls={false} bind:element={videoEl} />
  <MediaScrubber element={videoEl} />
  <MediaSlider bind:volume bind:muted bind:paused playback replay />
  -------------------------------------------------------------------------

  PROPS:
  - element:     HTMLMediaElement ref. When provided, the scrubber auto-syncs
                 currentTime / duration via timeupdate / durationchange listeners
                 and seeks on user input.
  - currentTime: Bindable position in seconds (read or drive imperatively)
  - duration:    Bindable total duration in seconds (read-only mirror)
  - showTime:    Show "00:42 / 03:15" label to the right (default: true)
  - disabled:    Disables seeking
  - class:       Consumer classes on the wrapper

  STATE (data-state on wrapper):
  - seeking:     User is dragging the scrubber

  LAYOUT:
  Native <input type="range"> grows to fill available width. When showTime
  is true, a tabular-nums time label sits to the right with a fixed-width
  character box so it doesn't jitter as digits change.

  CONVENTION:
  Mirrors Plyr / Vidstack / Video.js: a wide, full-width seek bar above the
  transport row. The width disparity vs. the volume slider below is what
  signals "timeline" vs. "volume" without further visual cues.

  @see /_fields.scss for .media-scrubber styles
-->
<script lang="ts">
  interface MediaScrubberProps {
    element?: HTMLMediaElement;
    currentTime?: number;
    duration?: number;
    showTime?: boolean;
    disabled?: boolean;
    class?: string;
  }

  let {
    element,
    currentTime = $bindable(0),
    duration = $bindable(0),
    showTime = true,
    disabled = false,
    class: className = '',
  }: MediaScrubberProps = $props();

  let seeking = $state(false);

  // Wire to media element. When the consumer passes an element ref, we own
  // the timeupdate / durationchange listeners and the seek-on-input behavior.
  $effect(() => {
    if (!element) return;

    const onTimeUpdate = () => {
      if (!seeking) currentTime = element!.currentTime;
    };
    const onDurationChange = () => {
      duration = Number.isFinite(element!.duration) ? element!.duration : 0;
    };

    // Seed from current state in case events have already fired pre-attach.
    if (Number.isFinite(element.duration)) duration = element.duration;
    currentTime = element.currentTime;

    element.addEventListener('timeupdate', onTimeUpdate);
    element.addEventListener('durationchange', onDurationChange);
    element.addEventListener('loadedmetadata', onDurationChange);

    return () => {
      element!.removeEventListener('timeupdate', onTimeUpdate);
      element!.removeEventListener('durationchange', onDurationChange);
      element!.removeEventListener('loadedmetadata', onDurationChange);
    };
  });

  function handleInput(e: Event) {
    seeking = true;
    const next = Number((e.target as HTMLInputElement).value);
    currentTime = next;
    if (element) element.currentTime = next;
  }

  function handleChange() {
    // 'change' fires on pointer release / keyboard commit — end of seek.
    seeking = false;
  }

  function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    const total = Math.floor(seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const ss = s.toString().padStart(2, '0');
    if (h > 0) {
      const mm = m.toString().padStart(2, '0');
      return `${h}:${mm}:${ss}`;
    }
    return `${m}:${ss}`;
  }

  const currentLabel = $derived(formatTime(currentTime));
  const durationLabel = $derived(formatTime(duration));
  const ariaValueText = $derived(`${currentLabel} of ${durationLabel}`);
</script>

<div
  class="media-scrubber flex items-center gap-sm {className}"
  data-state={seeking ? 'seeking' : ''}
  data-disabled={disabled || undefined}
>
  <input
    type="range"
    min="0"
    max={duration || 0}
    step="0.01"
    value={currentTime}
    aria-label="Seek"
    aria-valuetext={ariaValueText}
    {disabled}
    oninput={handleInput}
    onchange={handleChange}
  />

  {#if showTime}
    <span class="media-scrubber-time text-caption text-mute" aria-hidden="true">
      {currentLabel} / {durationLabel}
    </span>
  {/if}
</div>
