import {
  ACTION_LAYERS,
  AMBIENT_INTENSITIES,
  ATMOSPHERE_LAYERS,
  ENVIRONMENT_LAYERS,
  KINETIC_EFFECTS,
  PSYCHOLOGY_LAYERS,
  REVEAL_STYLES,
  SPEED_PRESETS,
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
        '1–2 sentences. 40–220 chars. Present tense, sensory, specific. No Markdown, no dialogue.',
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
            'TWO or THREE ambient action bursts, spread across the text. Each tied to a sensory or dramatic word. Prefer pairing the peak with a kinetic oneShot at the SAME atWord — overlapping reads as one bigger landed moment.',
          minItems: 2,
          maxItems: 3,
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
            'TWO or THREE one-shot kinetic effects, spread across the text. Each effect must dramatize the meaning of its anchor word (shatter on "glass", freeze on "still"). Prefer pairing the peak with an ambient action at the SAME atWord — overlapping reads as one bigger landed moment.',
          minItems: 2,
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
  },
} as const;
