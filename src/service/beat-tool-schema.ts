import {
  ACTION_LAYERS,
  AMBIENT_INTENSITIES,
  ATMOSPHERE_LAYERS,
  ENVIRONMENT_LAYERS,
  KINETIC_EFFECTS,
  PSYCHOLOGY_LAYERS,
  REVEAL_STYLES,
  SPEED_PRESETS,
  STYLE_KINDS,
} from '@lib/story-beat-types';

/**
 * JSONSchema for the `emit_story_beat` tool. Mirrors `StoryBeatSchema` in
 * `story-beat-schema.ts`. Anthropic's tool-use guarantees the model emits a
 * JSON object matching this shape; the server still re-validates with Zod so
 * field-level coherence rules are enforced in one place.
 *
 * Enum arrays are derived from the same literal tuples as the Zod schema and
 * prompt builder. Keep that single source for the contract intact.
 */
export const STORY_BEAT_TOOL_INPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'title', 'text', 'ambient', 'kinetic'],
  properties: {
    id: {
      type: 'string',
      description: 'Stable kebab-case id (a-z, 0-9, hyphen). 1–48 chars.',
    },
    title: {
      type: 'string',
      description: 'Short vibe title. 1–64 chars.',
    },
    tagline: {
      type: 'string',
      description:
        '2–6 word vibe description, mood-focused. Displayed under the title.',
    },
    text: {
      type: 'string',
      description:
        '3–5 sentences. 150–550 chars. Present tense, sensory, specific. No Markdown. Dialogue is allowed but rare — when it serves the vibe, wrap the spoken phrase in a `speech` style span. Never type quote marks in `text`; the `speech` style adds curly quotes automatically.',
    },
    ambient: {
      type: 'object',
      additionalProperties: false,
      required: ['environment', 'actions'],
      properties: {
        environment: {
          type: 'array',
          description:
            'Exactly ONE baseline environment tint — the sticky lighting the scene sits in.',
          minItems: 1,
          maxItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['layer', 'intensity'],
            properties: {
              layer: { type: 'string', enum: [...ENVIRONMENT_LAYERS] },
              intensity: { type: 'string', enum: [...AMBIENT_INTENSITIES] },
            },
          },
        },
        atmosphere: {
          type: 'array',
          description:
            'AT MOST ONE environmental layer. Pick atmosphere OR psychology — never both.',
          maxItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['layer', 'intensity'],
            properties: {
              layer: { type: 'string', enum: [...ATMOSPHERE_LAYERS] },
              intensity: { type: 'string', enum: [...AMBIENT_INTENSITIES] },
            },
          },
        },
        psychology: {
          type: 'array',
          description:
            'AT MOST ONE psychological tone. Pick atmosphere OR psychology — never both.',
          maxItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['layer', 'intensity'],
            properties: {
              layer: { type: 'string', enum: [...PSYCHOLOGY_LAYERS] },
              intensity: { type: 'string', enum: [...AMBIENT_INTENSITIES] },
            },
          },
        },
        actions: {
          type: 'array',
          description:
            "EXACTLY ONE ambient action burst — the climax moment. Scene-wide effects are loud; one is plenty. MUST fire at the same atWord as a kinetic oneShot so text + scene land together as one bigger moment. Pick the beat's single most dramatic word for this.",
          minItems: 1,
          maxItems: 1,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['atWord', 'variant', 'intensity'],
            properties: {
              atWord: {
                type: 'integer',
                minimum: 0,
                description: '0-indexed word position in `text`.',
              },
              variant: { type: 'string', enum: [...ACTION_LAYERS] },
              intensity: { type: 'string', enum: [...AMBIENT_INTENSITIES] },
            },
          },
        },
      },
    },
    kinetic: {
      type: 'object',
      additionalProperties: false,
      required: ['revealStyle', 'oneShots'],
      properties: {
        revealStyle: { type: 'string', enum: [...REVEAL_STYLES] },
        continuous: { type: 'string', enum: [...KINETIC_EFFECTS] },
        speed: { type: 'string', enum: [...SPEED_PRESETS] },
        oneShots: {
          type: 'array',
          description:
            'ONE to THREE one-shot kinetic effects. At LEAST one must fire at the climax (same atWord as the single ambient action — text + scene landing together). The other 0–2 entries are quieter supplementary shots earlier in the text. Each effect must dramatize the meaning of its anchor word (shatter on "glass", freeze on "still").',
          minItems: 1,
          maxItems: 3,
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['atWord', 'effect'],
            properties: {
              atWord: {
                type: 'integer',
                minimum: 0,
                description: '0-indexed word position in `text`.',
              },
              effect: { type: 'string', enum: [...KINETIC_EFFECTS] },
            },
          },
        },
      },
    },
    styles: {
      type: 'array',
      description:
        'ZERO to THREE inline style spans. A styled beat is ONE showcase — ALL ranges in this array MUST share the same `kind` (e.g. two `speech` ranges for a beat with two dialogue moments is fine; mixing `speech` + `emphasis` is not). OMIT ENTIRELY on most beats — plain prose is the default. Emit spans only when the text naturally invites a SINGLE treatment: a voice speaks → `speech`; a sign or screen reads → `code`; one word carries the whole weight → `emphasis`. Rotate across beats: if the last beat used `speech`, let this one be plain or try a different kind. Kind details: `speech` = italic + auto curly quotes (do NOT type quotes in `text`); `aside` = muted color only; `emphasis` = bold, at most ONE range per beat; `underline` = stark callout, at most TWO ranges per beat and never more than 2 words each; `code` = recessed inline chip (mono + subtle background), prefer single-word.',
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['fromWord', 'toWord', 'kind'],
        properties: {
          fromWord: {
            type: 'integer',
            minimum: 0,
            description:
              '0-indexed first word of the styled range (inclusive).',
          },
          toWord: {
            type: 'integer',
            minimum: 0,
            description:
              '0-indexed last word of the styled range (inclusive). Must be ≥ fromWord.',
          },
          kind: { type: 'string', enum: [...STYLE_KINDS] },
        },
      },
    },
  },
} as const;
