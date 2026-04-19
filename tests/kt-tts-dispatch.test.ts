import { describe, expect, it } from 'vitest';
import { attachAudioActions } from '../packages/kinetic-text/src/tts/dispatch';

/**
 * Minimal HTMLAudioElement stand-in. The dispatcher only touches
 * `currentTime`, `addEventListener`, and `removeEventListener`; we stub
 * those and drive the dispatcher via `tick()`/`seek()` helpers.
 */
class FakeAudio extends EventTarget {
  currentTime = 0;

  /** Advance the clock (seconds) and emit a `timeupdate`. */
  tick(seconds: number) {
    this.currentTime += seconds;
    this.dispatchEvent(new Event('timeupdate'));
  }

  /** Set the clock absolutely (seconds) and emit a `seeked`. */
  seek(seconds: number) {
    this.currentTime = seconds;
    this.dispatchEvent(new Event('seeked'));
  }
}

function makeAudio() {
  return new FakeAudio() as unknown as HTMLAudioElement;
}

describe('attachAudioActions', () => {
  it('fires actions in order as the audio clock crosses each atMs', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 100, payload: 'a' },
        { atMs: 300, payload: 'b' },
        { atMs: 700, payload: 'c' },
      ],
      (p) => fired.push(p),
    );

    (audio as unknown as FakeAudio).tick(0.05); // 50ms — none yet
    expect(fired).toEqual([]);
    (audio as unknown as FakeAudio).tick(0.1); // 150ms — 'a' fires
    expect(fired).toEqual(['a']);
    (audio as unknown as FakeAudio).tick(0.2); // 350ms — 'b' fires
    expect(fired).toEqual(['a', 'b']);
    (audio as unknown as FakeAudio).tick(0.5); // 850ms — 'c' fires
    expect(fired).toEqual(['a', 'b', 'c']);
    detach();
  });

  it('fires multiple actions in a single timeupdate when several atMs are crossed', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 100, payload: 'a' },
        { atMs: 200, payload: 'b' },
        { atMs: 300, payload: 'c' },
      ],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).tick(0.35); // jumps to 350ms
    expect(fired).toEqual(['a', 'b', 'c']);
    detach();
  });

  it('does not re-fire an action that already fired', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [{ atMs: 100, payload: 'once' }],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).tick(0.2); // 200ms
    (audio as unknown as FakeAudio).tick(0.2); // 400ms
    (audio as unknown as FakeAudio).tick(0.2); // 600ms
    expect(fired).toEqual(['once']);
    detach();
  });

  it('skips actions the audio has already passed at attach time', () => {
    const audio = makeAudio();
    (audio as unknown as FakeAudio).currentTime = 0.5; // 500ms before we attach
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 100, payload: 'early' },
        { atMs: 400, payload: 'also-early' },
        { atMs: 700, payload: 'later' },
      ],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).tick(0.3); // 800ms — only 'later' fires
    expect(fired).toEqual(['later']);
    detach();
  });

  it('re-arms actions when the user scrubs backward', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 100, payload: 'a' },
        { atMs: 500, payload: 'b' },
      ],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).tick(0.6); // 600ms — both fire
    expect(fired).toEqual(['a', 'b']);
    (audio as unknown as FakeAudio).seek(0); // scrub back to start
    (audio as unknown as FakeAudio).tick(0.6); // 600ms again — both re-fire
    expect(fired).toEqual(['a', 'b', 'a', 'b']);
    detach();
  });

  it('skips actions the user scrubbed over without firing them', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 100, payload: 'a' },
        { atMs: 500, payload: 'b' },
        { atMs: 1000, payload: 'c' },
      ],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).seek(0.75); // scrub to 750ms — no events fire on seek
    expect(fired).toEqual([]);
    (audio as unknown as FakeAudio).tick(0.3); // 1050ms — only 'c' fires
    expect(fired).toEqual(['c']);
    detach();
  });

  it('sorts out-of-order inputs before dispatching', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [
        { atMs: 500, payload: 'b' },
        { atMs: 100, payload: 'a' },
      ],
      (p) => fired.push(p),
    );
    (audio as unknown as FakeAudio).tick(0.6); // 600ms
    expect(fired).toEqual(['a', 'b']);
    detach();
  });

  it('returns a no-op detach when the schedule is empty', () => {
    const audio = makeAudio();
    const detach = attachAudioActions(audio, [], () => {});
    expect(() => detach()).not.toThrow();
  });

  it('detach removes listeners so further ticks do not fire', () => {
    const audio = makeAudio();
    const fired: string[] = [];
    const detach = attachAudioActions(
      audio,
      [{ atMs: 100, payload: 'a' }],
      (p) => fired.push(p),
    );
    detach();
    (audio as unknown as FakeAudio).tick(0.2); // 200ms after detach
    expect(fired).toEqual([]);
  });
});
