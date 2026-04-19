import { describe, expect, it, vi } from 'vitest';
import { syncAudioToKT } from '../packages/kinetic-text/src/tts/sync';
import type { KineticTextControls } from '../packages/kinetic-text/src/types';

/**
 * Audio stand-in backed by EventTarget. Exposes the subset of
 * HTMLAudioElement the sync uses (`currentTime`, `paused`, `ended`,
 * `playbackRate`, plus event dispatch).
 */
class FakeAudio extends EventTarget {
  currentTime = 0;
  paused = true;
  ended = false;
  playbackRate = 1;

  play() {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
  }
  pause() {
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
  seek(toSeconds: number) {
    this.currentTime = toSeconds;
    this.dispatchEvent(new Event('seeked'));
  }
  tick(seconds: number) {
    this.currentTime += seconds;
    this.dispatchEvent(new Event('timeupdate'));
  }
  end() {
    this.ended = true;
    this.paused = true;
    this.dispatchEvent(new Event('ended'));
  }
  setRate(rate: number) {
    this.playbackRate = rate;
    this.dispatchEvent(new Event('ratechange'));
  }
}

function makeControls(): KineticTextControls & {
  _elapsed: number;
  _paused: boolean;
  _complete: boolean;
  _rate: number;
} {
  let _elapsed = 0;
  let _paused = true;
  let _complete = false;
  let _rate = 1;
  return {
    pause: vi.fn(() => {
      _paused = true;
    }),
    resume: vi.fn(() => {
      _paused = false;
    }),
    seek: vi.fn((ms: number) => {
      _elapsed = ms;
    }),
    nudge: vi.fn((ms: number) => {
      _elapsed = ms;
    }),
    skipToEnd: vi.fn(() => {
      _complete = true;
      _paused = true;
    }),
    setRate: vi.fn((r: number) => {
      _rate = r;
    }),
    get progress() {
      return 0;
    },
    get elapsed() {
      return _elapsed;
    },
    get isPaused() {
      return _paused;
    },
    get isComplete() {
      return _complete;
    },
    get rate() {
      return _rate;
    },
    _elapsed,
    _paused,
    _complete,
    _rate,
  };
}

function makeAudio() {
  return new FakeAudio() as unknown as HTMLAudioElement & FakeAudio;
}

describe('syncAudioToKT', () => {
  it('pauses and zeros the timeline on attach', () => {
    const audio = makeAudio();
    const controls = makeControls();
    // Simulate the KT timeline as running when we attach (mimics a fresh mount
    // that starts unpaused before the consumer wires sync).
    controls.resume();
    const detach = syncAudioToKT({ audio, controls });
    expect(controls.seek).toHaveBeenCalledWith(0);
    expect(controls.pause).toHaveBeenCalled();
    detach();
  });

  it('inherits the audio playbackRate on attach', () => {
    const audio = makeAudio();
    audio.playbackRate = 1.5;
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    expect(controls.setRate).toHaveBeenCalledWith(1.5);
    detach();
  });

  it('propagates ratechange events to the timeline', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.setRate(2);
    expect(controls.setRate).toHaveBeenLastCalledWith(2);
    detach();
  });

  it('resumes the timeline when audio plays', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.play();
    expect(controls.resume).toHaveBeenCalled();
    detach();
  });

  it('pauses the timeline when audio pauses mid-play', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.play(); // fires resume
    const priorPauses = (controls.pause as ReturnType<typeof vi.fn>).mock.calls
      .length;
    audio.pause();
    expect((controls.pause as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      priorPauses + 1,
    );
    detach();
  });

  it('does not pause after the audio ends (pause fires before ended)', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.play();
    const priorPauses = (controls.pause as ReturnType<typeof vi.fn>).mock.calls
      .length;
    audio.ended = true; // browser sets ended=true before emitting 'pause'
    audio.pause();
    // Pause short-circuits on audio.ended, so no additional pause call.
    expect((controls.pause as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      priorPauses,
    );
    detach();
  });

  it('uses nudge for drift during playback — not seek', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.play();
    const priorNudges = (controls.nudge as ReturnType<typeof vi.fn>).mock.calls
      .length;
    audio.tick(0.5); // 500ms — drift > 250ms threshold
    expect(controls.nudge).toHaveBeenLastCalledWith(500);
    expect((controls.nudge as ReturnType<typeof vi.fn>).mock.calls.length).toBe(
      priorNudges + 1,
    );
    detach();
  });

  it('ignores drift within threshold', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls, driftThreshold: 300 });
    audio.play();
    audio.tick(0.2); // 200ms — inside 300ms threshold
    expect(controls.nudge).not.toHaveBeenCalled();
    detach();
  });

  it('uses seek (not nudge) on user scrub', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.seek(3.5); // 3500ms
    expect(controls.seek).toHaveBeenCalledWith(3500);
    detach();
  });

  it('skipsToEnd when audio ends', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    audio.end();
    expect(controls.skipToEnd).toHaveBeenCalled();
    detach();
  });

  it('detach removes all listeners', () => {
    const audio = makeAudio();
    const controls = makeControls();
    const detach = syncAudioToKT({ audio, controls });
    detach();
    const priorCallCount = (controls.resume as ReturnType<typeof vi.fn>).mock
      .calls.length;
    audio.play();
    audio.tick(1);
    audio.setRate(2);
    audio.end();
    expect(
      (controls.resume as ReturnType<typeof vi.fn>).mock.calls.length,
    ).toBe(priorCallCount);
  });
});
