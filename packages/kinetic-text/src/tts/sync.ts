import type { KineticTextControls } from '../types';

export interface SyncOptions {
  audio: HTMLAudioElement;
  controls: KineticTextControls;
  /**
   * Maximum tolerated drift (ms) between the audio clock and the KT
   * timeline's elapsed time before a corrective `seek()` is issued.
   * Checked on `timeupdate` events (~4Hz). Default 250.
   *
   * Corrective seeks are expensive (they rebuild glyph state), so this
   * should be generous. Wall-clock drift between two paused-in-step
   * clocks is typically <10ms; a 250ms threshold only triggers on
   * real desynchronization (tab throttling, audio buffering).
   */
  driftThreshold?: number;
}

/**
 * Bind an `<audio>` element's playback events to `KineticTextControls`
 * so the reveal timeline stays in sync with spoken audio.
 *
 * The audio element is the **master clock**. On attach the timeline is
 * forced into a known state (paused at the audio's current position)
 * so consumers don't need to also pass `paused` — attaching the sync
 * is sufficient to gate reveal on audio.
 *
 * - `play`      → seek to `audio.currentTime`, resume
 * - `pause`     → pause (ignored if the clip `ended`)
 * - `seeked`    → seek to `audio.currentTime`; resume if audio is playing
 * - `ended`     → skipToEnd (if not already complete)
 * - `timeupdate`→ drift check; `seek()` only if |audio - kt| > threshold
 *
 * Returns a cleanup function that detaches all listeners. Call it from
 * an `$effect` cleanup (or when switching audio sources).
 */
export function syncAudioToKT(options: SyncOptions): () => void {
  const { audio, controls, driftThreshold = 250 } = options;

  // Defensive initialization — align the timeline to the audio position
  // and hold it there until audio starts playing. This is what fixes the
  // "text reveals instantly while audio is silent" bug: without it, the
  // timeline runs on wall-clock time from its own mount moment, not from
  // audio playback.
  const initialMs = Math.max(0, audio.currentTime * 1000);
  controls.seek(initialMs);
  // Inherit the audio element's playback rate so the reveal advances at the
  // same speed as narration. Without this, a 2× audio leaves the timeline at
  // 1× and we'd visibly catch up via drift-correcting seeks every 250ms.
  controls.setRate(audio.playbackRate);
  if (!controls.isPaused && !controls.isComplete) {
    controls.pause();
  }

  const onPlay = () => {
    if (controls.isComplete) return;
    // Realign to the audio's current position before resuming. The audio
    // element may have buffered a few ms forward since the last pause;
    // resuming without realignment preserves that drift.
    controls.seek(audio.currentTime * 1000);
    if (controls.isPaused) controls.resume();
  };

  const onPause = () => {
    // `pause` fires right before `ended`; don't pause a completed reveal.
    if (audio.ended) return;
    if (!controls.isPaused && !controls.isComplete) controls.pause();
  };

  const onSeeked = () => {
    controls.seek(audio.currentTime * 1000);
    // If the user scrubbed while audio was playing, resume to keep
    // driving the timeline. If scrubbed while paused, stay paused.
    if (!audio.paused && !audio.ended && controls.isPaused) {
      controls.resume();
    }
  };

  const onEnded = () => {
    if (!controls.isComplete) controls.skipToEnd();
  };

  const onTimeUpdate = () => {
    if (controls.isComplete || controls.isPaused || audio.paused) return;
    const audioMs = audio.currentTime * 1000;
    const drift = Math.abs(audioMs - controls.elapsed);
    // Use `nudge` instead of `seek` — drift correction during synced
    // playback shouldn't wipe glyphs and re-fire cues. `seek` is reserved
    // for the user-driven `seeked` event below where the wipe is wanted.
    if (drift > driftThreshold) controls.nudge(audioMs);
  };

  const onRateChange = () => {
    controls.setRate(audio.playbackRate);
  };

  audio.addEventListener('play', onPlay);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('seeked', onSeeked);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('ratechange', onRateChange);

  return () => {
    audio.removeEventListener('play', onPlay);
    audio.removeEventListener('pause', onPause);
    audio.removeEventListener('seeked', onSeeked);
    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('timeupdate', onTimeUpdate);
    audio.removeEventListener('ratechange', onRateChange);
  };
}
