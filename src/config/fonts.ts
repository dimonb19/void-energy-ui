/**
 * =====================================================================
 *  VOID ENERGY — FONT REGISTRY
 * =====================================================================
 *
 *  HOW TO ADD A CUSTOM FONT
 *  ------------------------
 *  1. Place your .woff2 files in /public/fonts/
 *     (Use https://transfonter.org or similar to convert from .ttf/.otf)
 *
 *  2. Add an entry below:
 *
 *       brand: {
 *         family: "'Your Font Name', sans-serif",
 *         files: {
 *           400: 'YourFont-Regular.woff2',
 *           700: 'YourFont-Bold.woff2',
 *         },
 *       },
 *
 *     - The key ('brand') is your internal reference name
 *     - The family string must match the font's real name in quotes
 *     - Include at least weights 400 (regular) and 700 (bold)
 *     - Optional weights: 300 (light), 500 (medium), 600 (semibold)
 *
 *  3. Run: npm run build:tokens
 *     This regenerates @font-face rules and preload registries.
 *
 *  4. Use in a theme palette:
 *       'font-atmos-heading': FONTS.brand.family,
 *       'font-atmos-body': FONTS.brand.family,
 *
 *  HOW TO REMOVE A FONT
 *  --------------------
 *  1. Delete the entry from FONTS below
 *  2. Remove any theme references to it (search for FONTS.keyName)
 *  3. Optionally delete the .woff2 files from /public/fonts/
 *  4. Run: npm run build:tokens
 *
 *  PRELOADING
 *  ----------
 *  By default, weights 400 + 700 are preloaded for the active theme
 *  (covers ~90% of initial viewport text). Non-critical weights load
 *  on-demand via @font-face with font-display: swap.
 *  Override per-font with the optional preloadWeights array.
 *  Variable fonts collapse to a single preload tag — the same .woff2
 *  file serves every weight, so duplicate preloads are deduped.
 *
 * =====================================================================
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FontDefinition {
  family: string;
  files: Record<number, string>;
  /** Override DEFAULT_PRELOAD_WEIGHTS if this font needs different preload behavior */
  preloadWeights?: number[];
  /**
   * If set, the file is a variable font with a `wght` axis. The generator emits
   * a single `@font-face` block with `font-weight: <min> <max>` range syntax,
   * making the full fvar range reachable from CSS (font-variation-settings,
   * fluid weight transitions). Use the file's actual fvar range — not the
   * subset declared in `files`.
   */
  variable?: { min: number; max: number };
}

// ---------------------------------------------------------------------------
// Preload configuration
// ---------------------------------------------------------------------------

/**
 * Default font weights to preload via <link rel="preload">.
 *
 * 400 (regular) + 700 (bold) covers ~90% of initial viewport text.
 * Non-critical weights (300, 500, 600) load on-demand via @font-face with font-display: swap.
 */
export const DEFAULT_PRELOAD_WEIGHTS = [400, 700] as const;

// ---------------------------------------------------------------------------
// Font definitions
// ---------------------------------------------------------------------------

export const FONTS: Record<string, FontDefinition> = {
  tech: {
    family: "'Hanken Grotesk', sans-serif",
    files: { 400: 'HankenGrotesk.woff2' },
    variable: { min: 100, max: 900 },
  },
  clean: {
    family: "'Inter', sans-serif",
    files: { 400: 'Inter.woff2' },
    variable: { min: 100, max: 900 },
  },
  code: {
    family: "'Courier Prime', monospace",
    files: {
      400: 'CourierPrime-Regular.woff2',
      700: 'CourierPrime-Bold.woff2',
    },
  },
  horror: {
    family: "'Merriweather', serif",
    files: { 400: 'Merriweather.woff2' },
    variable: { min: 300, max: 900 },
  },
  nature: {
    family: "'Lora', serif",
    files: { 400: 'Lora.woff2' },
    variable: { min: 400, max: 700 },
  },
  hand: {
    family: "'Caveat', cursive",
    files: { 400: 'Caveat.woff2' },
    variable: { min: 400, max: 700 },
  },
  book: {
    family: "'PT Serif Caption', serif",
    files: {
      400: 'PTSerifCaption-Regular.woff2',
      700: 'PTSerif-Bold.woff2',
    },
  },
  arcane: {
    family: "'Cinzel', serif",
    files: { 400: 'Cinzel.woff2' },
    variable: { min: 400, max: 900 },
  },
  mystic: {
    family: "'Exo 2', sans-serif",
    files: { 400: 'Exo2.woff2' },
    variable: { min: 100, max: 900 },
  },
  lab: {
    family: "'Open Sans', sans-serif",
    files: { 400: 'OpenSans.woff2' },
    variable: { min: 300, max: 800 },
  },
  fun: {
    family: "'Comic Neue', sans-serif",
    files: {
      400: 'ComicNeue-Regular.woff2',
      700: 'ComicNeue-Bold.woff2',
    },
  },
  geometric: {
    family: "'Poppins', sans-serif",
    files: {
      400: 'Poppins-Regular.woff2',
      500: 'Poppins-Medium.woff2',
      600: 'Poppins-SemiBold.woff2',
      700: 'Poppins-Bold.woff2',
    },
  },
  display: {
    family: "'Playfair Display', serif",
    files: { 400: 'PlayfairDisplay.woff2' },
    variable: { min: 400, max: 900 },
  },
  sharp: {
    family: "'Space Grotesk', sans-serif",
    files: { 400: 'SpaceGrotesk.woff2' },
    variable: { min: 300, max: 700 },
  },
  devmono: {
    family: "'JetBrains Mono', monospace",
    files: { 400: 'JetBrainsMono.woff2' },
    variable: { min: 400, max: 800 },
  },
  elegant: {
    family: "'Raleway', sans-serif",
    files: { 400: 'Raleway.woff2' },
    variable: { min: 100, max: 900 },
  },
};

// ---------------------------------------------------------------------------
// Font utilities (used by build-time generation)
// ---------------------------------------------------------------------------

/**
 * Reverse lookup: font-family string -> font key.
 * Used by generate-tokens.ts to find which font files to preload for a theme.
 */
export const FONT_FAMILY_TO_KEY: Record<string, keyof typeof FONTS> =
  Object.fromEntries(
    Object.entries(FONTS).map(([key, def]) => [
      def.family,
      key as keyof typeof FONTS,
    ]),
  ) as Record<string, keyof typeof FONTS>;

/**
 * Get preload files for a theme based on its font families.
 * Returns an array of font file paths to preload.
 */
export function getThemePreloadFonts(palette: {
  'font-atmos-heading': string;
  'font-atmos-body': string;
}): string[] {
  const headingFamily = palette['font-atmos-heading'];
  const bodyFamily = palette['font-atmos-body'];

  const files: string[] = [];
  const seenFamilies = new Set<string>();

  for (const family of [headingFamily, bodyFamily]) {
    if (seenFamilies.has(family)) continue;
    seenFamilies.add(family);

    const fontKey = FONT_FAMILY_TO_KEY[family];
    if (!fontKey) continue;

    const fontDef = FONTS[fontKey];
    const preloadWeights = fontDef.preloadWeights ?? DEFAULT_PRELOAD_WEIGHTS;
    for (const weight of preloadWeights) {
      const file = fontDef.files[weight];
      if (file) {
        files.push(`/fonts/${file}`);
      }
    }
  }

  return files;
}

/**
 * Get user-selectable font name from font key.
 * Extracts the display name from the font-family string.
 */
export function getFontDisplayName(fontKey: keyof typeof FONTS): string {
  const family = FONTS[fontKey].family;
  const match = family.match(/^'([^']+)'/);
  return match ? match[1] : fontKey;
}
