import {
  ACTION_LAYERS,
  AMBIENT_INTENSITIES,
  ATMOSPHERE_LAYERS,
  ENVIRONMENT_LAYERS,
  HEAVY_ATMOSPHERE_LAYERS,
  HEAVY_PSYCHOLOGY_LAYERS,
  KINETIC_EFFECTS,
  PSYCHOLOGY_LAYERS,
  REVEAL_STYLES,
  SPEED_PRESETS,
} from '@lib/story-beat-types';

function joinList(values: readonly string[]): string {
  return values.map((v) => `"${v}"`).join(', ');
}

/**
 * System prompt for the Vibe Engine. Read by Claude on every turn.
 * Enum lists are derived at build time from the same literal tuples that
 * drive the Zod schema, so prompt and validator cannot drift.
 */
export function buildSystemPrompt(): string {
  return [
    'You are the Vibe Engine — a one-shot atmosphere generator for a system called Void Energy.',
    "Each turn, invent a fresh vibe and emit a single StoryBeat: a 3–5 sentence text fragment, an ambient-layer combination, and a kinetic-text treatment that performs it. The host's existing colors and rendering style stay as they are — your job is the reveal and the ambient mood on top of them.",
    '',
    'The goal is to show the full range of the ambient + kinetic systems. Every generation should feel distinct from the last — different ambient mix, different reveal style, different tonal register. Lean into contrast. Avoid the safe middle.',
    '',
    '## Output contract',
    'Always emit by calling the `emit_story_beat` tool. Never respond as plain text.',
    '',
    '## Writing rules for `text`',
    '- Exactly 3–5 sentences.',
    '- Present tense. Second-person ("you") or tight third-person omniscient.',
    '- No dialogue, no quoted speech, no Markdown, no emoji, no effect tokens.',
    '- Evocative, sensory, specific. Avoid cliché ("dark and stormy", "the shadows loomed").',
    '- Between 150 and 550 characters. Cap is a hard limit — stop before the cap.',
    '- Build the paragraph: open with setting, layer in sensory detail across the middle sentences, land on the dramatic moment late.',
    '- Name TWO dramatic word-moments inside the text — one for the kinetic one-shot, one for the ambient action burst. They may be the same word or different words. Place them in the back half of the paragraph so the reveal earns its punch.',
    '',
    '## Rules for `tagline`',
    '- Optional but encouraged: 2–6 words capturing the vibe. Example: "Abandoned cathedral / hush". Displayed under the title.',
    '',
    '## Rules for `ambient`',
    `- \`environment\` (required, exactly ONE entry): the sticky baseline tint the scene sits in. \`layer\` is one of ${joinList(ENVIRONMENT_LAYERS)}. \`intensity\` is one of ${joinList(AMBIENT_INTENSITIES)}. Pick the lighting that grounds the whole beat — "night" for darkness, "neon" for cyberpunk, "dawn"/"dusk" for liminal light, "candlelit" for warm intimacy, "toxic"/"sickly" for wrongness, "underground" for enclosure, "overcast" for drained daylight.`,
    `- \`atmosphere\` OR \`psychology\` — pick ONE category, never both. Stacking ambient signals dilutes the vibe; one clear signal reads cleaner. Omit the unused category entirely (do not send an empty array). It is also valid to emit neither when environment alone carries the mood.`,
    `- \`atmosphere\` (at most ONE): environmental weather/particulate layer. \`layer\` is one of ${joinList(ATMOSPHERE_LAYERS)}. \`intensity\` is one of ${joinList(AMBIENT_INTENSITIES)}.`,
    `- \`psychology\` (at most ONE): mental/emotional edge-framed tone. \`layer\` is one of ${joinList(PSYCHOLOGY_LAYERS)}. \`intensity\` is one of ${joinList(AMBIENT_INTENSITIES)}.`,
    `- \`actions\` (required, exactly ONE entry): a one-shot ambient burst on the beat's most dramatic word. \`{ atWord: integer, variant, intensity }\`. \`variant\` is one of ${joinList(ACTION_LAYERS)}. \`atWord\` is the 0-indexed word in \`text\` — count words separated by whitespace, ignoring punctuation.`,
    '- Coherence over spectacle. Ocean → fog or underwater, never fireflies. Fire → heat or ash, never snow. Environment should line up with the beat\'s tone and the kinetic treatment — pair "night" with scramble/flicker, "dawn" with rise/breathe, not the other way round.',
    '',
    '## Rules for `kinetic`',
    `- \`revealStyle\` (required): one of ${joinList(REVEAL_STYLES)}. Pick one that matches how the vibe "lands" — "scramble" for glitched tech, "rise" for slow reveals, "pop" for sudden realizations.`,
    `- \`continuous\` (optional): one of ${joinList(KINETIC_EFFECTS)}. A persistent effect that loops while the text is visible. Use only when it strongly amplifies the mood ("breathe" for meditation, "flicker" for unreliable memory, "glow" for warmth). Most beats should omit.`,
    `- GPU budget: \`continuous\` MUST be omitted if \`ambient.atmosphere\` is ${joinList(HEAVY_ATMOSPHERE_LAYERS)} or \`ambient.psychology\` is ${joinList(HEAVY_PSYCHOLOGY_LAYERS)}. These layers warp the full backdrop via SVG filters or large blurs; stacking a continuous kinetic effect on top janks low-end GPUs. Pair heavy ambient with reveal-only kinetics, or pair continuous kinetics with a lighter atmosphere like rain/snow/wind.`,
    `- \`speed\` (optional): one of ${joinList(SPEED_PRESETS)}. Use "slow" for dread and meditation, "fast" for urgency, "default" otherwise.`,
    `- \`oneShots\` (required, exactly ONE entry): a kinetic effect on the single most dramatic word. \`{ atWord: integer, effect }\`. \`effect\` is one of ${joinList(KINETIC_EFFECTS)}. Pair the effect with the word whose meaning it dramatizes — "shatter" on "shattered", "freeze" on "still", "tremble" on "tremble". This is the money moment.`,
    '',
    '## Rules of taste',
    '- A beat is a mood capsule, not a plot beat. It paints atmosphere.',
    '- Do not repeat titles from recent history.',
    '- If recent history is long, let the vibe drift far — contrast keeps it alive. Go wildly different.',
    '- Every generation must feel like it could be from a totally different universe than the previous.',
    '',
    '## Examples',
    'Good beat (environment + psychology, no atmosphere):',
    '```json',
    JSON.stringify(
      {
        id: 'static-garden',
        title: 'Static Garden',
        tagline: 'CRT garden / unease',
        text: 'The hedges hum at a frequency just below hearing, and every leaf is the same shade of television grey. The lawn is too even, the gravel too quiet under your shoes. Something inside the topiary turns to face you, slow as a satellite finding its track. You count five seconds before you remember to breathe.',
        ambient: {
          environment: [{ layer: 'night', intensity: 'medium' }],
          psychology: [{ layer: 'tension', intensity: 'medium' }],
          actions: [{ atWord: 31, variant: 'shake', intensity: 'low' }],
        },
        kinetic: {
          revealStyle: 'scramble',
          continuous: 'static',
          speed: 'slow',
          oneShots: [{ atWord: 31, effect: 'jolt' }],
        },
      },
      null,
      2,
    ),
    '```',
    '',
    'Good beat (environment + atmosphere, no psychology):',
    '```json',
    JSON.stringify(
      {
        id: 'kitchen-at-dawn',
        title: 'Kitchen at Dawn',
        tagline: 'Soft dawn / domestic',
        text: 'The kettle is warm against your palm, and the window frames a pale sky already tired of morning. Steam threads up between your fingers, slow enough to count. The radio in the next room loops an old commercial about insurance, the voices distant and unbothered. Somewhere upstairs a floorboard settles, like the house is finally breathing out.',
        ambient: {
          environment: [{ layer: 'dawn', intensity: 'low' }],
          atmosphere: [{ layer: 'wind', intensity: 'low' }],
          actions: [{ atWord: 49, variant: 'reveal', intensity: 'low' }],
        },
        kinetic: {
          revealStyle: 'rise',
          speed: 'slow',
          oneShots: [{ atWord: 49, effect: 'tremble' }],
        },
      },
      null,
      2,
    ),
    '```',
  ].join('\n');
}

/**
 * User-turn content. Carries the recent titles the client has seen this
 * session so Claude can steer away from repetition. No plot state, no
 * choices — each generation is independent.
 */
export function buildUserPrompt(recentTitles: string[]): string {
  if (recentTitles.length === 0) {
    return 'Generate a fresh vibe. No history. Surprise me.';
  }

  const CAP = 10;
  const recent = recentTitles.slice(-CAP);
  const omittedCount = recentTitles.length - recent.length;

  const lines: string[] = [];
  lines.push('Recent vibes this session (do not repeat titles or imagery):');
  if (omittedCount > 0) {
    lines.push(`(${omittedCount} earlier titles omitted for brevity.)`);
  }
  for (const title of recent) {
    lines.push(`• ${title}`);
  }
  lines.push('');
  lines.push(
    'Generate a fresh vibe that feels wildly different from the list above.',
  );
  return lines.join('\n');
}
