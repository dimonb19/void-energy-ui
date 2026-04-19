/**
 * Provider-agnostic TTS integration for Kinetic Text.
 *
 * This sub-export is pure utility code — no provider SDKs, no network
 * calls. Use it alongside any adapter from `./providers/` (or your own
 * adapter that returns `TTSResult`) to drive character-accurate reveal
 * from spoken audio.
 *
 * See the parent package README and `plans/phase-2-tts-kinetic-sync.md`
 * for architecture and consumer wiring examples.
 */

export type { TTSResult, WordTimestamp, TTSProvider } from './types';
export { wordTimesToRevealMarks } from './marks';
export { syncAudioToKT, type SyncOptions } from './sync';
export {
  stripEffectTokens,
  resolveEffectCues,
  type InlineEffectToken,
} from './cues';
export { estimateCharSpeed } from './fallback';
export {
  SPEED_TO_WORD_MS,
  wordSpansOf,
  wordStartTimes,
  buildKineticCues,
  resolveActionTimes,
  type TimedCue,
  type TimedAction,
} from './timeline';
export { attachAudioActions } from './dispatch';
