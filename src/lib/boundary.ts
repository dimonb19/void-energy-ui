import { z } from 'zod';
import { err, ok, type Result } from '@lib/result';

export type BoundaryErrorCode =
  | 'invalid_json'
  | 'invalid_shape'
  | 'network'
  | 'http_error';

export interface BoundaryError {
  code: BoundaryErrorCode;
  source: string;
  message: string;
  issues?: string[];
  status?: number;
}

const VoidPhysicsSchema = z.enum(['glass', 'flat', 'retro']);
const VoidModeSchema = z.enum(['light', 'dark']);
const VoidDensitySchema = z.enum(['high', 'standard', 'low']);
const VoidUserRoleNameSchema = z.enum(['Admin', 'Creator', 'Player', 'Guest']);

const ThemeFontSchema = z
  .object({
    name: z.string().min(1),
    url: z.string().min(1),
  })
  .strict();

const VoidPaletteSchema = z
  .object({
    'bg-canvas': z.string().min(1),
    'bg-surface': z.string().min(1),
    'bg-sunk': z.string().min(1),
    'bg-spotlight': z.string().min(1),
    'energy-primary': z.string().min(1),
    'energy-secondary': z.string().min(1),
    'border-color': z.string().min(1),
    'text-main': z.string().min(1),
    'text-dim': z.string().min(1),
    'text-mute': z.string().min(1),
    'color-premium': z.string().min(1),
    'color-system': z.string().min(1),
    'color-success': z.string().min(1),
    'color-error': z.string().min(1),
    'color-premium-light': z.string().min(1),
    'color-premium-dark': z.string().min(1),
    'color-premium-subtle': z.string().min(1),
    'color-system-light': z.string().min(1),
    'color-system-dark': z.string().min(1),
    'color-system-subtle': z.string().min(1),
    'color-success-light': z.string().min(1),
    'color-success-dark': z.string().min(1),
    'color-success-subtle': z.string().min(1),
    'color-error-light': z.string().min(1),
    'color-error-dark': z.string().min(1),
    'color-error-subtle': z.string().min(1),
    'font-atmos-heading': z.string().min(1),
    'font-atmos-body': z.string().min(1),
  })
  .strict();

const PartialVoidPaletteSchema = VoidPaletteSchema.partial().refine(
  (palette) => Object.keys(palette).length > 0,
  {
    message: 'Palette must include at least one token override.',
  },
);

const StoredThemeDefinitionSchema = z
  .object({
    id: z.string().min(1).optional(),
    label: z.string().min(1).optional(),
    tagline: z.string().min(1).optional(),
    mode: VoidModeSchema,
    physics: VoidPhysicsSchema,
    palette: VoidPaletteSchema,
    fonts: z.array(ThemeFontSchema).optional(),
  })
  .strict();

const StoredThemeCacheSchema = z.record(
  z.string(),
  StoredThemeDefinitionSchema,
);

const ExternalThemePayloadSchema = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1).optional(),
    tagline: z.string().min(1).optional(),
    mode: VoidModeSchema.optional(),
    physics: VoidPhysicsSchema.optional(),
    palette: PartialVoidPaletteSchema,
    fonts: z.array(ThemeFontSchema).optional(),
  })
  .strict();

const StoredUserConfigSchema = z
  .object({
    fontHeading: z.string().min(1).nullable().optional(),
    fontBody: z.string().min(1).nullable().optional(),
    scale: z.number().finite().positive().optional(),
    density: VoidDensitySchema.optional(),
    adaptAtmosphere: z.boolean().optional(),
    fixedNav: z.boolean().optional(),
  })
  .strict();

const VoidUserSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    avatar: z.string().min(1).nullable(),
    role_name: VoidUserRoleNameSchema,
    approved_tester: z.boolean(),
  })
  .strict();

function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
    return `${path}${issue.message}`;
  });
}

function invalidShape(
  source: string,
  message: string,
  error: z.ZodError,
): Result<never, BoundaryError> {
  return err({
    code: 'invalid_shape',
    source,
    message,
    issues: formatZodIssues(error),
  });
}

export function formatBoundaryError(error: BoundaryError): string {
  const suffix =
    error.issues && error.issues.length > 0
      ? ` (${error.issues.join('; ')})`
      : '';
  return `${error.source}: ${error.message}${suffix}`;
}

export function parseStoredUserConfig(
  raw: string,
  source = 'Stored user config',
): Result<Partial<UserConfig>, BoundaryError> {
  try {
    const parsed = JSON.parse(raw);
    const result = StoredUserConfigSchema.safeParse(parsed);
    if (!result.success) {
      return invalidShape(
        source,
        'Invalid persisted user config.',
        result.error,
      );
    }
    return ok(result.data as Partial<UserConfig>);
  } catch {
    return err({
      code: 'invalid_json',
      source,
      message: 'Stored user config is not valid JSON.',
    });
  }
}

export function parseStoredThemeCache(
  raw: string,
  source = 'Stored theme cache',
): Result<Record<string, VoidThemeDefinition>, BoundaryError> {
  try {
    const parsed = JSON.parse(raw);
    const result = StoredThemeCacheSchema.safeParse(parsed);
    if (!result.success) {
      return invalidShape(
        source,
        'Invalid persisted theme cache.',
        result.error,
      );
    }
    return ok(result.data as Record<string, VoidThemeDefinition>);
  } catch {
    return err({
      code: 'invalid_json',
      source,
      message: 'Stored theme cache is not valid JSON.',
    });
  }
}

export function parseExternalThemePayload(
  input: unknown,
  source = 'External theme payload',
): Result<{ id: string; definition: PartialThemeDefinition }, BoundaryError> {
  const result = ExternalThemePayloadSchema.safeParse(input);
  if (!result.success) {
    return invalidShape(
      source,
      'External theme payload is invalid.',
      result.error,
    );
  }

  const { id, ...definition } = result.data;
  return ok({
    id,
    definition: definition as PartialThemeDefinition,
  });
}

export function parseStoredUser(
  raw: string,
  source = 'Stored user',
): Result<VoidUser, BoundaryError> {
  try {
    const parsed = JSON.parse(raw);
    const result = VoidUserSchema.safeParse(parsed);
    if (!result.success) {
      return invalidShape(
        source,
        'Stored user payload is invalid.',
        result.error,
      );
    }
    return ok(result.data as VoidUser);
  } catch {
    return err({
      code: 'invalid_json',
      source,
      message: 'Stored user payload is not valid JSON.',
    });
  }
}

export function parseIncomingUser(
  input: unknown,
  source = 'Incoming user',
): Result<VoidUser, BoundaryError> {
  const result = VoidUserSchema.safeParse(input);
  if (!result.success) {
    return invalidShape(
      source,
      'Incoming user payload is invalid.',
      result.error,
    );
  }
  return ok(result.data as VoidUser);
}
