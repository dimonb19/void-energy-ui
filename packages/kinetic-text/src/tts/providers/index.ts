/**
 * TTS provider adapters. One file per provider, each exporting a
 * `synthesize(text, options) → TTSResult` function that normalizes the
 * provider's API response into the universal `TTSResult` shape.
 *
 * Switching providers at the consumer layer = swapping one import.
 */

export {
  synthesize as inworldSynthesize,
  type InWorldOptions,
} from './inworld';
