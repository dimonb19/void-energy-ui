/**
 * 🤖 Void token generator.
 * Usage: npm run build:tokens
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  VOID_TOKENS,
  VOID_TYPOGRAPHY,
  FONTS,
  FONT_FAMILY_TO_KEY,
  DEFAULT_PRELOAD_WEIGHTS,
  type FontDefinition,
} from '../src/config/design-tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATHS = {
  scss: path.resolve(__dirname, '../src/styles/config/_generated-themes.scss'),
  fontsScss: path.resolve(__dirname, '../src/styles/config/_fonts.scss'),
  fontRegistry: path.resolve(__dirname, '../src/config/font-registry.ts'),
  registryJson: path.resolve(__dirname, '../src/config/void-registry.json'),
  physicsJson: path.resolve(__dirname, '../src/config/void-physics.json'),
};

// Convert raw token numbers to CSS units.
function toCssValue(key: string, value: string | number): string {
  if (typeof value === 'string') return value;
  if (value === 0) {
    if (key.includes('speed') || key.includes('delay')) return '0s';
    if (key.includes('blur') || key.includes('Width') || key.includes('radius')) return '0px';
    return '0';
  }
  if (key.includes('speed')) return `${value / 1000}s`;
  if (key.includes('delay')) return `${value}ms`;
  if (key.includes('blur') || key.includes('Width') || key.includes('radius')) return `${value}px`;
  return `${value}`;
}

function generateSCSS(tokens: typeof VOID_TOKENS) {
  const timestamp = new Date().toISOString();
  let scss = `// 🤖 AUTO-GENERATED FILE\n// GENERATED AT: ${timestamp}\n\n`;

  // Typography: Font scale map.
  scss += `$font-scale: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.fontSize},\n`;
  });
  scss += `);\n\n`;

  // Typography: Tablet overrides map (for H1-H4).
  scss += `$tablet-overrides: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    if ('tabletOverride' in config) {
      scss += `  '${level}': ${(config as any).tabletOverride},\n`;
    }
  });
  scss += `);\n\n`;

  // Typography: Line heights map.
  scss += `$line-heights: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.lineHeight},\n`;
  });
  scss += `);\n\n`;

  // Typography: Letter spacings map.
  scss += `$letter-spacings: (\n`;
  Object.entries(VOID_TYPOGRAPHY.scales).forEach(([level, config]) => {
    scss += `  '${level}': ${config.letterSpacing},\n`;
  });
  scss += `);\n\n`;

  // Typography: Font weights map (mapped to levels).
  scss += `$font-weights: (\n`;
  scss += `  'h1': ${VOID_TYPOGRAPHY.weights.bold},\n`;
  scss += `  'h2': ${VOID_TYPOGRAPHY.weights.bold},\n`;
  scss += `  'h3': ${VOID_TYPOGRAPHY.weights.semibold},\n`;
  scss += `  'h4': ${VOID_TYPOGRAPHY.weights.semibold},\n`;
  scss += `  'h5': ${VOID_TYPOGRAPHY.weights.medium},\n`;
  scss += `  'body': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'small': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'caption': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'input': ${VOID_TYPOGRAPHY.weights.regular},\n`;
  scss += `  'cta': ${VOID_TYPOGRAPHY.weights.extrabold},\n`;
  scss += `);\n\n`;

  // Z-layers map.
  scss += `$z-layers: (\n`;
  Object.entries(tokens.layers).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Breakpoints map.
  scss += `$breakpoints: (\n`;
  Object.entries(tokens.responsive).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;
  
  // Physics maps.
  scss += `$generated-physics: (\n`;
  Object.entries(tokens.physics).forEach(([mode, rawConfig]) => {
    const config = rawConfig as Record<string, string | number>;
    scss += `  '${mode}': (\n`;
    Object.entries(config).forEach(([prop, val]) => {
      const kebabProp = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
      const cssValue = toCssValue(prop, val);
      let finalKey = kebabProp;
      if (prop === 'blur') finalKey = 'physics-blur';
      if (prop === 'borderWidth') finalKey = 'physics-border-width';
      scss += `    '${finalKey}': ${cssValue},\n`;
    });
    scss += `  ),\n`;
  });
  scss += `);\n\n`;

  // Container widths map.
  scss += `$container-widths: (\n`;
  Object.entries(tokens.container).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Structural constants map.
  scss += `$structural-constants: (\n`;
  Object.entries(tokens.structural).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // Themes map.
  scss += `$themes: (\n`;
  Object.entries(tokens.themes).forEach(([themeName, config]) => {
    scss += `  '${themeName}': (\n`;
    scss += `    'type': '${config.mode}',\n`;
    scss += `    'physics': '${config.physics}',\n`;
    scss += `    'palette': (\n`;
    // Inject fonts.
    scss += `      'font-heading': "var(--user-font-heading, var(--font-atmos-heading))",\n`;
    scss += `      'font-body': "var(--user-font-body, var(--font-atmos-body))",\n`;
    // Inject palette.
    Object.entries(config.palette).forEach(([key, value]) => {
      scss += `      '${key}': "${value}",\n`;
    });
    scss += `    ),\n`;
    scss += `  ),\n`;
  });
  scss += `);\n`;

  return scss;
}

/**
 * Generate @font-face declarations from FONTS definition.
 */
function generateFontsScss(): string {
  const timestamp = new Date().toISOString();
  let scss = `/* 🤖 AUTO-GENERATED FILE - DO NOT EDIT */\n`;
  scss += `/* Generated from design-tokens.ts at: ${timestamp} */\n`;
  scss += `/* Font-face registry for atmosphere fonts. */\n\n`;

  for (const [fontKey, fontDef] of Object.entries(FONTS)) {
    // Extract display name from family string
    const displayName = fontDef.family.match(/^'([^']+)'/)?.[1] || fontKey;
    scss += `/* FAMILY: ${displayName} */\n`;

    // Sort weights for consistent output
    const weights = Object.keys(fontDef.files)
      .map(Number)
      .sort((a, b) => a - b);

    for (const weight of weights) {
      const filename = fontDef.files[weight];

      scss += `@font-face {\n`;
      scss += `  font-family: '${displayName}';\n`;
      scss += `  src: url('/fonts/${filename}') format('woff2');\n`;
      scss += `  font-weight: ${weight};\n`;
      scss += `  font-style: normal;\n`;
      scss += `  font-display: swap;\n`;
      scss += `}\n`;
    }
    scss += `\n`;
  }

  return scss;
}

/**
 * Generate font-registry.ts from theme definitions.
 */
function generateFontRegistry(): string {
  const timestamp = new Date().toISOString();

  // Build FONT_REGISTRY: theme → preload files
  const fontRegistry: Record<string, string[]> = {};
  for (const [themeId, theme] of Object.entries(VOID_TOKENS.themes)) {
    const headingFamily = theme.palette['font-atmos-heading'];
    const bodyFamily = theme.palette['font-atmos-body'];

    const files: string[] = [];
    const seenFamilies = new Set<string>();

    for (const family of [headingFamily, bodyFamily]) {
      if (seenFamilies.has(family)) continue;
      seenFamilies.add(family);

      const fontKey = FONT_FAMILY_TO_KEY[family];
      if (!fontKey) {
        throw new Error(
          `❌ Build Error: No font definition found for family "${family}" in theme "${themeId}". ` +
          `Add this font to the FONTS object in design-tokens.ts.`
        );
      }

      const fontDef = FONTS[fontKey];
      const preloadWeights = fontDef.preloadWeights ?? [...DEFAULT_PRELOAD_WEIGHTS];
      for (const weight of preloadWeights) {
        const file = fontDef.files[weight];
        if (file) {
          files.push(`/fonts/${file}`);
        }
      }
    }
    fontRegistry[themeId] = files;
  }

  // Build USER_FONT_MAP: display name → preload files
  const userFontMap: Record<string, string[]> = {};
  for (const [fontKey, fontDef] of Object.entries(FONTS)) {
    const displayName = fontDef.family.match(/^'([^']+)'/)?.[1] || fontKey;
    const preloadWeights = fontDef.preloadWeights ?? [...DEFAULT_PRELOAD_WEIGHTS];
    const files = preloadWeights.map((weight) => `/fonts/${fontDef.files[weight]}`);
    userFontMap[displayName] = files;
  }

  let ts = `/**\n`;
  ts += ` * 🤖 AUTO-GENERATED FILE - DO NOT EDIT\n`;
  ts += ` * Generated from design-tokens.ts at: ${timestamp}\n`;
  ts += ` *\n`;
  ts += ` * Font Registry for Dynamic Preloading\n`;
  ts += ` * Used by ThemeScript.astro to preload only the active theme's fonts.\n`;
  ts += ` */\n\n`;

  ts += `export const FONT_REGISTRY: Record<string, string[]> = ${JSON.stringify(fontRegistry, null, 2)};\n\n`;

  ts += `/**\n`;
  ts += ` * Maps user-selectable font families to their WOFF2 files.\n`;
  ts += ` * Used by ThemeScript.astro to preload user font overrides.\n`;
  ts += ` */\n`;
  ts += `export const USER_FONT_MAP: Record<string, string[]> = ${JSON.stringify(userFontMap, null, 2)};\n`;

  return ts;
}

async function main() {
  try {
    console.log('\n🔮 Void Engine: Materializing Tokens...');

    // Ensure directories exist.
    const scssDir = path.dirname(PATHS.scss);
    const fontsScssDir = path.dirname(PATHS.fontsScss);
    if (!fs.existsSync(scssDir)) fs.mkdirSync(scssDir, { recursive: true });
    if (!fs.existsSync(fontsScssDir)) fs.mkdirSync(fontsScssDir, { recursive: true });

    // Generate theme SCSS.
    const scssContent = generateSCSS(VOID_TOKENS);
    fs.writeFileSync(PATHS.scss, scssContent);
    console.log(`   └─ 🎨 Themes: src/styles/config/_generated-themes.scss`);

    // Generate @font-face SCSS.
    const fontsScssContent = generateFontsScss();
    fs.writeFileSync(PATHS.fontsScss, fontsScssContent);
    console.log(`   └─ 🔤 Fonts: src/styles/config/_fonts.scss`);

    // Generate font-registry.ts.
    const fontRegistryContent = generateFontRegistry();
    fs.writeFileSync(PATHS.fontRegistry, fontRegistryContent);
    console.log(`   └─ 📦 Font Registry: src/config/font-registry.ts`);

    // Generate theme registry JSON.
    const registry: Record<string, { physics: string; mode: string; tagline?: string }> = {};
    Object.entries(VOID_TOKENS.themes).forEach(([key, config]) => {
      registry[key] = {
        physics: config.physics,
        mode: config.mode,
        tagline: config.tagline,
      };
    });
    fs.writeFileSync(PATHS.registryJson, JSON.stringify(registry, null, 2));
    console.log(`   └─ ⚙️  Registry: src/config/void-registry.json`);

    // Generate physics JSON.
    fs.writeFileSync(PATHS.physicsJson, JSON.stringify(VOID_TOKENS.physics, null, 2));
    console.log(`   └─ ⚡ Physics: src/config/void-physics.json`);

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();
