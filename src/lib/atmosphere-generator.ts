import {
  VOID_TOKENS,
  FONTS,
  SEMANTIC_DARK,
  SEMANTIC_LIGHT,
} from '@config/design-tokens';
import { err, ok } from '@lib/result';

// ── Constants ────────────────────────────────────────────────────────────────

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL_ID = 'claude-sonnet-4-6';
const API_VERSION = '2023-06-01';
const MAX_TOKENS = 2048;

/** The 10 core palette tokens Claude generates (semantic variants are auto-filled). */
export const CORE_PALETTE_KEYS = [
  'bg-canvas',
  'bg-spotlight',
  'bg-surface',
  'bg-sunk',
  'energy-primary',
  'energy-secondary',
  'border-color',
  'text-main',
  'text-dim',
  'text-mute',
] as const;

interface ClaudeResponse {
  mode: 'dark' | 'light';
  physics: 'glass' | 'flat' | 'retro';
  tagline: string;
  label: string;
  fontHeadingKey: string;
  fontBodyKey: string;
  palette: Record<string, string>;
}

// ── Prompt Engineering ───────────────────────────────────────────────────────

/** Reverse lookup: font-family → font key. */
const familyToKey = new Map(
  Object.entries(FONTS).map(([key, def]) => [def.family, key]),
);

/** Font catalog with display names for the prompt. */
const fontCatalog = Object.entries(FONTS).map(([key, def]) => {
  const name = def.family.match(/^'([^']+)'/)?.[1] ?? key;
  return { key, name };
});

/**
 * Builds the system prompt dynamically from VOID_TOKENS and FONTS.
 * No hardcoded theme data — everything is derived from the source of truth.
 */
function buildSystemPrompt(): string {
  // Serialize themes as compact few-shot examples (core palette only)
  const themeExamples = Object.entries(VOID_TOKENS.themes).map(
    ([id, theme]) => {
      const corePalette: Record<string, string> = {};
      for (const key of CORE_PALETTE_KEYS) {
        corePalette[key] = theme.palette[key];
      }

      // Include color-premium/color-system overrides if theme overrides the default
      const semanticBase =
        theme.mode === 'light' ? SEMANTIC_LIGHT : SEMANTIC_DARK;
      for (const key of ['color-premium', 'color-system'] as const) {
        if (theme.palette[key] !== semanticBase[key]) {
          corePalette[key] = theme.palette[key];
        }
      }

      const headingKey =
        familyToKey.get(theme.palette['font-atmos-heading']) ?? 'tech';
      const bodyKey =
        familyToKey.get(theme.palette['font-atmos-body']) ?? 'clean';

      return {
        id,
        mode: theme.mode,
        physics: theme.physics,
        tagline: theme.tagline,
        fontHeadingKey: headingKey,
        fontBodyKey: bodyKey,
        palette: corePalette,
      };
    },
  );

  const outputSchema = JSON.stringify(
    {
      mode: 'dark | light',
      physics: 'glass | flat | retro',
      tagline: 'Short Mood / Descriptor',
      label: 'Human-Readable Display Name',
      fontHeadingKey: '<font-key>',
      fontBodyKey: '<font-key>',
      palette: {
        'bg-canvas': '#hex',
        'bg-spotlight': '#hex',
        'bg-surface': '<rgba for glass, #hex for flat>',
        'bg-sunk': '<rgba or #hex>',
        'energy-primary': '#hex',
        'energy-secondary': '#hex',
        'border-color': 'rgba(...)',
        'text-main': '#hex',
        'text-dim': '#hex',
        'text-mute': '#hex',
      },
    },
    null,
    2,
  );

  return `You are a theme designer for the Void Energy UI design system. Given a creative concept or "vibe", produce a complete color palette, physics preset, mode, font pairing, label, and tagline.

## Creative Direction
The user message will indicate the generation mode: **guided** or **exploratory**.

### Guided mode (initial generation)
The user just typed their concept for the first time. Your job is to deliver the BEST, most authentic interpretation — the one that nails the vibe on the first try. Pick the physics preset, color mode, color palette, and fonts that most naturally and precisely match the concept. "Underwater bioluminescence" → glass + dark with deep ocean blues and cyan glow is the obvious right answer. "Old library" → flat + dark with warm wood tones and a serif font. Trust your instincts and commit to the strongest interpretation. Do NOT randomize or hedge — be decisive.

### Exploratory mode (retry / "Try Another")
The user has already seen a result and wants something DIFFERENT. The user message will include randomized seeds (physics, mode, tonal direction). Embrace these seeds fully and find an interpretation of the concept that makes them shine. Surprise the user with unexpected but valid angles. "Ocean" doesn't have to be blue — maybe it's a sunset over the Pacific (warm coral + amber in flat + light). Be creative and adventurous.

### Color
The concept MUST drive the color family — "wood" should feel woody, "ocean" should feel oceanic. In exploratory mode, the tonal direction seed controls the mood (warm/cool, vivid/muted). In guided mode, pick the tonal direction that best serves the concept.

### Fonts
Match the emotional register, not the topic keyword. A solemn concept gets a serif. A technical one gets a monospace. A playful one gets a rounded sans.

## Output Format
Respond with ONLY a JSON object. No explanation, no markdown fences, no text outside the JSON.
${outputSchema}

## Hard Constraints
- glass physics REQUIRES mode: dark. Glows need darkness.
- retro physics REQUIRES mode: dark. CRT phosphor effect.
- flat physics works with both light and dark.
- For glass physics: bg-surface MUST be rgba with opacity 0.3-0.6. bg-sunk can be rgba.
- For flat + dark: bg-surface MUST be solid opaque hex. No rgba.
- For flat + light: bg-surface MUST be solid opaque hex. No rgba.
- text-main > text-dim > text-mute in descending contrast against bg-surface.
- Dark themes: text-main is brightest, text-mute is most faded.
- Light themes: text-main is darkest, text-mute is lightest.
- energy-secondary must NOT equal or visually resemble any text token.
- border-color is typically energy-primary or energy-secondary at 15-50% opacity as rgba.
- WCAG contrast minimums: text-main 4.5:1, text-dim 4.5:1, text-mute 3:1, energy-primary 3:1 (all against bg-surface).
- ALWAYS check for semantic color collisions after picking your energy colors:
  - Energy in gold/orange/amber → you MUST add "color-premium" with a non-gold color (cyan, sapphire, teal, etc.)
  - Energy in purple/violet → you MUST add "color-system" with a non-purple color (sky blue, teal, coral, etc.)
  - Energy in green → no override needed (success/error overlap is accepted)
  - Energy in red → no override needed (success/error overlap is accepted)
- label should be a short, capitalized display name (e.g., "Neon Reef", "Autumn Library").
- tagline should be "Concept / Mood" format (e.g., "Underwater / Bioluminescent").

## Available Font Keys
${fontCatalog.map((f) => `- "${f.key}": ${f.name}`).join('\n')}

## Reference Themes (12 built-in examples — for format reference, NOT creative constraint)
These show the valid output structure and range. Do NOT treat them as the only valid design space.
${JSON.stringify(themeExamples, null, 2)}`;
}

// ── User Message Construction ────────────────────────────────────────────────

/** Tonal directions to vary mood while keeping colors concept-authentic. */
const TONE_SEEDS = [
  'warm + vivid',
  'warm + muted',
  'warm + pastel',
  'cool + vivid',
  'cool + muted',
  'cool + pastel',
  'neutral + high-contrast',
  'neutral + desaturated',
  'neon + saturated',
  'earthy + organic',
  'jewel-toned + rich',
  'monochromatic + minimal',
] as const;

/** Valid physics+mode combos. */
const PHYSICS_MODE_COMBOS = [
  { physics: 'glass', mode: 'dark' },
  { physics: 'flat', mode: 'dark' },
  { physics: 'flat', mode: 'light' },
  { physics: 'retro', mode: 'dark' },
] as const;

/** Pick a random element from an array. */
function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Build the user message.
 * - Guided (retry=false): AI picks the best physics/mode/tone for the concept.
 * - Exploratory (retry=true): Randomized seeds for maximum variety.
 */
export function buildUserMessage(
  vibe: string,
  physics?: PhysicsPreference,
  mode?: ModePreference,
  retry = false,
): string {
  let message: string;

  if (retry) {
    // Exploratory: randomize everything for variety
    const pool = PHYSICS_MODE_COMBOS.filter(
      (c) => (!physics || c.physics === physics) && (!mode || c.mode === mode),
    );
    const starting = pickRandom(pool.length > 0 ? pool : PHYSICS_MODE_COMBOS);
    const toneSeed = pickRandom(TONE_SEEDS);

    message = `**Mode: EXPLORATORY** — the user has already seen a result and wants something DIFFERENT.

Create an atmosphere for: "${vibe}"

Randomized seeds for THIS generation (these ensure variety — embrace them):
- Physics: ${starting.physics}
- Mode: ${starting.mode}
- Tonal direction: ${toneSeed}
The concept "${vibe}" drives the color family — pick colors that authentically evoke it. The tonal direction controls the mood: how warm/cool, vivid/muted, saturated/pastel those concept-appropriate colors should be.`;
  } else {
    // Guided: AI picks the ideal interpretation
    message = `**Mode: GUIDED** — this is the user's first generation for this concept. Deliver the best, most authentic interpretation.

Create an atmosphere for: "${vibe}"

Pick the physics preset, color mode, tonal palette, and fonts that most naturally and precisely match this concept. Commit to the strongest interpretation — do not randomize or hedge.`;
  }

  const constraints: string[] = [];
  if (physics) constraints.push(`physics MUST be exactly "${physics}"`);
  if (mode) constraints.push(`mode MUST be exactly "${mode}"`);

  if (constraints.length > 0) {
    message += `\n\nIMPORTANT — The user has explicitly selected these preferences. You MUST follow them exactly:\n- ${constraints.join('\n- ')}\nDo NOT deviate from these values under any circumstances.`;
  }

  return message;
}

// ── Response Parsing & Validation ────────────────────────────────────────────

/**
 * Extract JSON from Claude's response text.
 * Handles both raw JSON and markdown-fenced JSON.
 */
function extractJson(text: string): string | null {
  // Try markdown fence first
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Try raw JSON object
  const objectMatch = text.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];

  return null;
}

/** Validate a CSS color value using the browser's CSS engine. */
function isValidCssColor(value: string): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return true; // SSR fallback
  return CSS.supports('color', value);
}

/** Resolve a font key to its CSS family string, with role-appropriate fallback. */
function resolveFontKey(
  key: string,
  role: 'heading' | 'body' = 'heading',
): string {
  const font = FONTS[key as keyof typeof FONTS];
  if (font) return font.family;
  return role === 'body' ? FONTS.clean.family : FONTS.tech.family;
}

/** Generate a clean kebab-case ID from a label, with numeric suffix only on collision. */
function generateThemeId(
  label: string,
  existingIds: ReadonlySet<string>,
): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 30) || 'generated';

  if (!existingIds.has(base)) return base;

  let n = 2;
  while (existingIds.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/**
 * Parse and validate Claude's response into a GeneratedAtmosphere.
 * Auto-fills semantic color variants from SEMANTIC_DARK/SEMANTIC_LIGHT.
 */
function parseResponse(
  text: string,
  vibe: string,
  existingIds: ReadonlySet<string>,
  requestedPhysics?: PhysicsPreference,
  requestedMode?: ModePreference,
): VoidResult<GeneratedAtmosphere, BoundaryError> {
  const jsonStr = extractJson(text);
  if (!jsonStr) {
    return err({
      code: 'invalid_json',
      source: 'AtmosphereGenerator.parseResponse',
      message: 'No valid JSON found in response.',
    });
  }

  let parsed: ClaudeResponse;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    return err({
      code: 'invalid_json',
      source: 'AtmosphereGenerator.parseResponse',
      message: 'Failed to parse response JSON.',
    });
  }

  // Validate structure
  const issues: string[] = [];

  if (!parsed.mode || !['dark', 'light'].includes(parsed.mode)) {
    issues.push('Invalid or missing "mode"');
  }
  if (!parsed.physics || !['glass', 'flat', 'retro'].includes(parsed.physics)) {
    issues.push('Invalid or missing "physics"');
  }
  if (!parsed.palette || typeof parsed.palette !== 'object') {
    issues.push('Missing "palette" object');
  }

  if (issues.length > 0) {
    return err({
      code: 'invalid_shape',
      source: 'AtmosphereGenerator.parseResponse',
      message: 'Response structure invalid.',
      issues,
    });
  }

  // Validate user-requested preferences match exactly
  if (requestedPhysics && parsed.physics !== requestedPhysics) {
    return err({
      code: 'preference_mismatch',
      source: 'AtmosphereGenerator.parseResponse',
      message: `AI returned "${parsed.physics}" physics but you requested "${requestedPhysics}". Try again.`,
    });
  }
  if (requestedMode && parsed.mode !== requestedMode) {
    return err({
      code: 'preference_mismatch',
      source: 'AtmosphereGenerator.parseResponse',
      message: `AI returned "${parsed.mode}" mode but you requested "${requestedMode}". Try again.`,
    });
  }

  // Validate all 10 core palette keys exist and are valid CSS colors
  for (const key of CORE_PALETTE_KEYS) {
    const value = parsed.palette[key];
    if (!value) {
      issues.push(`Missing palette token: ${key}`);
    } else if (!isValidCssColor(value)) {
      issues.push(`Invalid CSS color for ${key}: ${value}`);
    }
  }

  if (issues.length > 0) {
    return err({
      code: 'invalid_shape',
      source: 'AtmosphereGenerator.parseResponse',
      message: 'Palette validation failed.',
      issues,
    });
  }

  // Auto-fill semantic color variants
  const semanticSpread =
    parsed.mode === 'light' ? { ...SEMANTIC_LIGHT } : { ...SEMANTIC_DARK };

  // Build the full palette: semantic base + core tokens from Claude
  const fullPalette: Record<string, string> = {
    ...semanticSpread,
    'font-atmos-heading': resolveFontKey(parsed.fontHeadingKey, 'heading'),
    'font-atmos-body': resolveFontKey(parsed.fontBodyKey, 'body'),
  };

  // Overlay Claude's core palette
  for (const key of CORE_PALETTE_KEYS) {
    fullPalette[key] = parsed.palette[key];
  }

  // Pass through semantic color overrides if Claude provided them
  for (const key of ['color-premium', 'color-system'] as const) {
    if (parsed.palette[key] && isValidCssColor(parsed.palette[key])) {
      fullPalette[key] = parsed.palette[key];
    }
  }

  const label = parsed.label || vibe;
  const tagline = parsed.tagline || vibe;
  const id = generateThemeId(label, existingIds);

  return ok({
    id,
    label,
    tagline,
    definition: {
      mode: parsed.mode,
      physics: parsed.physics,
      label,
      tagline,
      palette: fullPalette,
    },
  });
}

// ── Manual Atmosphere Builder ─────────────────────────────────────────────────

interface ManualAtmosphereInput {
  label: string;
  tagline: string;
  physics: PhysicsPreference;
  mode: ModePreference;
  palette: Record<string, string>;
  fontHeadingKey: string;
  fontBodyKey: string;
  existingIds: ReadonlySet<string>;
}

/**
 * Build a GeneratedAtmosphere from manual user input.
 * Validates core palette, auto-fills semantic variants, resolves fonts.
 */
export function buildManualAtmosphere(
  input: ManualAtmosphereInput,
): VoidResult<GeneratedAtmosphere, BoundaryError> {
  const issues: string[] = [];

  // Validate all 10 core palette keys exist and are valid CSS colors
  for (const key of CORE_PALETTE_KEYS) {
    const value = input.palette[key];
    if (!value) {
      issues.push(`Missing palette token: ${key}`);
    } else if (!isValidCssColor(value)) {
      issues.push(`Invalid CSS color for ${key}: ${value}`);
    }
  }

  if (issues.length > 0) {
    return err({
      code: 'invalid_shape',
      source: 'ManualAtmosphere.build',
      message: 'Palette validation failed.',
      issues,
    });
  }

  // Auto-fill semantic color variants
  const semanticSpread =
    input.mode === 'light' ? { ...SEMANTIC_LIGHT } : { ...SEMANTIC_DARK };

  const fullPalette: Record<string, string> = {
    ...semanticSpread,
    'font-atmos-heading': resolveFontKey(input.fontHeadingKey, 'heading'),
    'font-atmos-body': resolveFontKey(input.fontBodyKey, 'body'),
  };

  // Overlay user's core palette
  for (const key of CORE_PALETTE_KEYS) {
    fullPalette[key] = input.palette[key];
  }

  const label = input.label || 'Custom Atmosphere';
  const tagline = input.tagline || 'Handcrafted';
  const id = generateThemeId(label, input.existingIds);

  return ok({
    id,
    label,
    tagline,
    definition: {
      mode: input.mode,
      physics: input.physics,
      label,
      tagline,
      palette: fullPalette,
    },
  });
}

// ── API Call ──────────────────────────────────────────────────────────────────

/**
 * Generate an atmosphere from a vibe description using the Claude API.
 * Returns a validated, ready-to-register theme definition.
 */
export async function generateAtmosphere(
  options: GenerateOptions,
): Promise<VoidResult<GeneratedAtmosphere, BoundaryError>> {
  const { vibe, physics, mode, retry, signal } = options;
  const apiKey = import.meta.env.PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    return err({
      code: 'network',
      source: 'AtmosphereGenerator.generate',
      message: 'API key not configured.',
    });
  }

  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(vibe, physics, mode, retry);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': API_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      }),
    });
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      return err({
        code: 'network',
        source: 'AtmosphereGenerator.generate',
        message: 'Generation cancelled.',
      });
    }
    return err({
      code: 'network',
      source: 'AtmosphereGenerator.generate',
      message: 'Network error — check your connection.',
    });
  }

  if (!response.ok) {
    const status = response.status;
    let message: string;

    switch (status) {
      case 401:
        message = 'Invalid API key.';
        break;
      case 429:
        message = 'Rate limited — try again in a moment.';
        break;
      case 529:
        message = 'Claude is busy — try again shortly.';
        break;
      default:
        message = `API error (${status}).`;
    }

    return err({
      code: 'http_error',
      source: 'AtmosphereGenerator.generate',
      message,
      status,
    });
  }

  let body: { content?: Array<{ type: string; text?: string }> };
  try {
    body = await response.json();
  } catch {
    return err({
      code: 'invalid_json',
      source: 'AtmosphereGenerator.generate',
      message: 'Failed to parse API response.',
    });
  }

  const textBlock = body.content?.find((b) => b.type === 'text');
  if (!textBlock?.text) {
    return err({
      code: 'invalid_shape',
      source: 'AtmosphereGenerator.generate',
      message: 'API response contained no text.',
    });
  }

  return parseResponse(
    textBlock.text,
    vibe,
    options.existingIds ?? new Set(),
    physics,
    mode,
  );
}
