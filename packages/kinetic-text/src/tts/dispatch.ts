/**
 * Audio-driven dispatcher for timed actions.
 *
 * Fires `onFire(payload)` when `audio.currentTime` crosses each action's
 * `atMs` threshold, instead of pre-scheduling wall-clock `setTimeout`s.
 * Three reasons to prefer this over a `setTimeout` path when audio exists:
 *
 *   1. **Rate-aware.** At `audio.playbackRate = 2`, `currentTime` advances
 *      twice as fast in wall clock, so actions fire at the correct point
 *      in the narration — no extra math, no re-scheduling on rate change.
 *   2. **Pause/resume safe.** Actions only fire while audio is actually
 *      playing; pausing audio pauses the action stream too.
 *   3. **Scrub-safe.** On `seeked`, the pointer realigns to the new audio
 *      position so actions that already fired don't re-fire, and actions
 *      the user scrubbed back over are re-armed.
 *
 * Actions must be sorted by `atMs` ascending — use `resolveActionTimes` to
 * produce them. Each action fires at most once per forward crossing (with a
 * scrub backward, crossings that re-enter the range re-fire on the next
 * forward pass).
 *
 * Returns a detach function. Call it in an effect cleanup.
 */
export function attachAudioActions<T>(
  audio: HTMLAudioElement,
  scheduled: ReadonlyArray<{ atMs: number; payload: T }>,
  onFire: (payload: T) => void,
): () => void {
  if (scheduled.length === 0) return () => {};

  // Copy-and-sort defensively. resolveActionTimes already sorts, but a
  // caller might construct the array by hand — a single out-of-order item
  // would cause that action to be skipped forever.
  const sorted = [...scheduled].sort((a, b) => a.atMs - b.atMs);
  let nextIndex = 0;

  function realignFromAudio() {
    const audioMs = audio.currentTime * 1000;
    const found = sorted.findIndex((s) => s.atMs > audioMs);
    nextIndex = found === -1 ? sorted.length : found;
  }

  function fireDue() {
    const audioMs = audio.currentTime * 1000;
    while (nextIndex < sorted.length && audioMs >= sorted[nextIndex].atMs) {
      onFire(sorted[nextIndex].payload);
      nextIndex++;
    }
  }

  // Align in case the audio was already past some actions when we attached
  // (e.g. user scrubbed forward before pressing play, or the dispatcher
  // attached mid-playback on replay).
  realignFromAudio();

  audio.addEventListener('timeupdate', fireDue);
  audio.addEventListener('seeked', realignFromAudio);

  return () => {
    audio.removeEventListener('timeupdate', fireDue);
    audio.removeEventListener('seeked', realignFromAudio);
  };
}
