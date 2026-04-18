import { z } from 'zod';
import { err, ok } from '@lib/result';
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
  type StoryBeat,
} from './story-beat-types';

const HEAVY_ATMOSPHERE_SET = new Set<string>(HEAVY_ATMOSPHERE_LAYERS);
const HEAVY_PSYCHOLOGY_SET = new Set<string>(HEAVY_PSYCHOLOGY_LAYERS);

function enumFromReadonly<T extends string>(values: readonly T[]) {
  return z.enum(values as unknown as readonly [T, ...T[]]);
}

const IntensitySchema = enumFromReadonly(AMBIENT_INTENSITIES);

const AtmosphereActivationSchema = z
  .object({
    layer: enumFromReadonly(ATMOSPHERE_LAYERS),
    intensity: IntensitySchema,
  })
  .strict();

const PsychologyActivationSchema = z
  .object({
    layer: enumFromReadonly(PSYCHOLOGY_LAYERS),
    intensity: IntensitySchema,
  })
  .strict();

const EnvironmentActivationSchema = z
  .object({
    layer: enumFromReadonly(ENVIRONMENT_LAYERS),
    intensity: IntensitySchema,
  })
  .strict();

const StoryOneShotSchema = z
  .object({
    atWord: z.number().int().min(0).max(200),
    effect: enumFromReadonly(KINETIC_EFFECTS),
  })
  .strict();

const StoryActionSchema = z
  .object({
    atWord: z.number().int().min(0).max(200),
    variant: enumFromReadonly(ACTION_LAYERS),
    intensity: IntensitySchema,
  })
  .strict();

const StoryKineticSchema = z
  .object({
    revealStyle: enumFromReadonly(REVEAL_STYLES),
    continuous: enumFromReadonly(KINETIC_EFFECTS).optional(),
    speed: enumFromReadonly(SPEED_PRESETS).optional(),
    oneShots: z.array(StoryOneShotSchema).max(1).optional(),
  })
  .strict();

const StoryAmbientSchema = z
  .object({
    // Environment is a sticky baseline tint — at most one per beat.
    environment: z.array(EnvironmentActivationSchema).max(1).optional(),
    // Atmosphere XOR psychology — never both. One clear signal beats a pile-on.
    atmosphere: z.array(AtmosphereActivationSchema).max(1).optional(),
    psychology: z.array(PsychologyActivationSchema).max(1).optional(),
    actions: z.array(StoryActionSchema).max(1).optional(),
  })
  .strict()
  .refine((a) => !(a.atmosphere?.length && a.psychology?.length), {
    message:
      'Pick atmosphere OR psychology, not both — one ambient signal per beat.',
    path: ['atmosphere'],
  });

export const StoryBeatSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(48)
      .regex(/^[a-z0-9-]+$/, {
        message: 'Beat id must be kebab-case (a-z, 0-9, hyphen).',
      }),
    title: z.string().min(1).max(64),
    tagline: z.string().min(1).max(64).optional(),
    text: z.string().min(8).max(600),
    ambient: StoryAmbientSchema,
    kinetic: StoryKineticSchema,
  })
  .strict()
  .refine(
    (b) => {
      // GPU budget gate: HEAVY ambient layers (heat/underwater/fog/dizzy/haze)
      // warp the whole backdrop via SVG filters or huge blurs. Stacking a
      // continuous kinetic effect on top forces per-frame re-composition of
      // that filter pipeline and kills low-end GPUs (e.g. M1 Air). Pick one.
      if (!b.kinetic.continuous) return true;
      const heavyAtmos = b.ambient.atmosphere?.some((a) =>
        HEAVY_ATMOSPHERE_SET.has(a.layer),
      );
      const heavyPsy = b.ambient.psychology?.some((p) =>
        HEAVY_PSYCHOLOGY_SET.has(p.layer),
      );
      return !(heavyAtmos || heavyPsy);
    },
    {
      message:
        'GPU-heavy ambient layers (heat, underwater, fog, dizzy, haze) cannot be combined with kinetic.continuous — pick one.',
      path: ['kinetic', 'continuous'],
    },
  );

function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

/**
 * Validate an unknown payload (typically from an LLM tool-use response) as a
 * `StoryBeat`. Returns a `VoidResult` shaped to match the `parse*` helpers in
 * `boundary.ts`, so the transport layer can treat all schema failures the same.
 */
export function parseStoryBeat(
  input: unknown,
  source = 'StoryBeat payload',
): VoidResult<StoryBeat, BoundaryError> {
  const result = StoryBeatSchema.safeParse(input);
  if (!result.success) {
    return err({
      code: 'invalid_shape',
      source,
      message: 'Story beat payload is invalid.',
      issues: formatIssues(result.error),
    });
  }

  return ok(result.data as StoryBeat);
}
