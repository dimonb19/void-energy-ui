/**
 * Estimate a uniform `charSpeed` (ms per character) for a piece of text
 * given the total audio duration. Used when the TTS provider cannot
 * return word timestamps (OpenAI TTS, browser SpeechSynthesis).
 *
 * The result is passed directly to `<KineticText>`'s existing `charSpeed`
 * prop — no `revealMarks` involved. Reveal proceeds at a linear cadence
 * that roughly matches the audio. Drift on long passages is real but
 * acceptable for ambient narration where precise sync is not required.
 *
 * Pure — no side effects.
 */
export function estimateCharSpeed(
  audioDurationMs: number,
  text: string,
): number {
  if (audioDurationMs <= 0) return 0;
  // Count real characters, not whitespace — whitespace adds no perceived
  // typing duration and would artificially slow the reveal.
  let printable = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    // Any non-space codepoint counts. Includes punctuation on purpose —
    // punctuation contributes to the visual density of the reveal.
    if (c > 0x20) printable++;
  }
  if (printable === 0) return 0;
  return audioDurationMs / printable;
}
