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
export {
  synthesize as elevenLabsSynthesize,
  type ElevenLabsOptions,
} from './elevenlabs';
export { synthesize as openaiSynthesize, type OpenAIOptions } from './openai';
export { synthesize as azureSynthesize, type AzureOptions } from './azure';
export { synthesize as googleSynthesize, type GoogleOptions } from './google';
export {
  synthesize as deepgramSynthesize,
  type DeepgramOptions,
} from './deepgram';
export { synthesize as kokoroSynthesize, type KokoroOptions } from './kokoro';
export { synthesize as xaiSynthesize, type XaiOptions } from './xai';
