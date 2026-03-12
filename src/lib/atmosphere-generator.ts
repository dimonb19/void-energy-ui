import {
  VOID_TOKENS,
  FONTS,
  SEMANTIC_DARK,
  SEMANTIC_LIGHT,
} from '@config/design-tokens';
import { STORAGE_KEYS } from '@config/constants';
import { err, ok } from '@lib/result';

// ── Constants ────────────────────────────────────────────────────────────────

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL_ID = 'claude-sonnet-4-6';
const API_VERSION = '2023-06-01';
const MAX_TOKENS = 2048;

/** The 10 core palette tokens Claude generates (semantic variants are auto-filled). */
const CORE_PALETTE_KEYS = [
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

// ── API Key Storage ──────────────────────────────────────────────────────────

export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.CLAUDE_API_KEY);
  } catch {
    return null;
  }
}

export function setStoredApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLAUDE_API_KEY, key);
  } catch {
    // Storage unavailable
  }
}

export function clearStoredApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CLAUDE_API_KEY);
  } catch {
    // Storage unavailable
  }
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

      // Include color-premium override if theme overrides the default
      const defaultPremium =
        theme.mode === 'light'
          ? SEMANTIC_LIGHT['color-premium']
          : SEMANTIC_DARK['color-premium'];
      if (theme.palette['color-premium'] !== defaultPremium) {
        corePalette['color-premium'] = theme.palette['color-premium'];
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

## Output Format
Respond with ONLY a JSON object. No explanation, no markdown fences, no text outside the JSON.
${outputSchema}

## Constraints
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
- label should be a short, capitalized display name (e.g., "Neon Reef", "Autumn Library").
- tagline should be "Concept / Mood" format (e.g., "Underwater / Bioluminescent").

## Available Font Keys
${fontCatalog.map((f) => `- "${f.key}": ${f.name}`).join('\n')}

## Reference Themes (12 built-in examples)
${JSON.stringify(themeExamples, null, 2)}`;
}

// ── User Message Construction ────────────────────────────────────────────────

/** Build the user message, appending hard constraints when prefs are set. */
export function buildUserMessage(
  vibe: string,
  physics?: PhysicsPreference,
  mode?: ModePreference,
): string {
  let message = `Create an atmosphere for: "${vibe}"`;

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

  // Overlay Claude's core palette (overrides semantic defaults if Claude
  // provided a color-premium, for example)
  for (const key of CORE_PALETTE_KEYS) {
    fullPalette[key] = parsed.palette[key];
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

// ── API Call ──────────────────────────────────────────────────────────────────

/**
 * Generate an atmosphere from a vibe description using the Claude API.
 * Returns a validated, ready-to-register theme definition.
 */
export async function generateAtmosphere(
  options: GenerateOptions,
): Promise<VoidResult<GeneratedAtmosphere, BoundaryError>> {
  const { apiKey: rawKey, vibe, physics, mode, signal } = options;
  const apiKey = rawKey.trim();

  const systemPrompt = buildSystemPrompt();
  const userMessage = buildUserMessage(vibe, physics, mode);

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
