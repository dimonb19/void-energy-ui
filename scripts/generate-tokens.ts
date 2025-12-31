/**
 * 🤖 VOID TOKEN GENERATOR
 * --------------------------------------------------------------------------
 * Reads:  src/config/design-tokens.ts
 * Writes: src/styles/config/_generated-themes.scss (For SCSS/CSS)
 * Writes: src/config/void-registry.json (For Runtime Engine)
 * --------------------------------------------------------------------------
 * Usage: npm run build:tokens
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Import your Single Source of Truth
// Note: We omit the extension for cleaner import resolution in tsx
import { VOID_TOKENS } from '../src/config/design-tokens';

// Helper to resolve paths relative to this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATHS = {
  scss: path.resolve(__dirname, '../src/styles/config/_generated-themes.scss'),
  json: path.resolve(__dirname, '../src/config/void-registry.json'),
};

/**
 * 1. GENERATE SCSS CONTENT
 * Converts JS Objects into Sass Maps
 */
function generateSCSS(tokens: typeof VOID_TOKENS) {
  const timestamp = new Date().toISOString();

  let scss = `// 🤖 AUTO-GENERATED - DO NOT EDIT MANUALLY
// Source: src/config/design-tokens.ts
// Generated: ${timestamp}

@use 'sass:map';

// ==========================================================================
// 1. DENSITY MAPS
// ==========================================================================
`;

  // Generate Single Reference Map
  scss += `$spacing-scale: (\n`;
  Object.entries(tokens.density.scale).forEach(([prop, val]) => {
    scss += `  '${prop}': ${val},\n`; // Removed quotes around value for clean numbers/units
  });
  scss += `);\n\n`;

  scss += `// ==========================================================================\n`;
  scss += `// 2. THEME DEFINITIONS\n`;
  scss += `// ==========================================================================\n`;
  scss += `$themes: (\n`;

  // Generate Theme Maps
  Object.entries(tokens.themes).forEach(([themeName, config]) => {
    scss += `  '${themeName}': (\n`;
    scss += `    'type': '${config.type}',\n`;
    scss += `    'physics': '${config.physics}',\n`;

    // Palette
    scss += `    'palette': (\n`;

    scss += `      'font-heading': "var(--user-font-heading, var(--font-atmos-heading))",\n`;
    scss += `      'font-body': "var(--user-font-body, var(--font-atmos-body))",\n`;

    // Auto-inject default font mappings if they exist in the palette,
    // or we can rely on the variables.scss defaults.
    // Here we map the palette directly.
    Object.entries(config.palette).forEach(([key, value]) => {
      // Handle semantic font mappings explicitly if needed, or just dump the palette
      scss += `      '${key}': "${value}",\n`;
    });

    scss += `    ),\n`;
    scss += `  ),\n`;
  });

  scss += `);\n`;

  return scss;
}

/**
 * 2. GENERATE JSON REGISTRY
 * Minimal data needed for the runtime engine (void-engine.ts)
 */
function generateRegistry(tokens: typeof VOID_TOKENS) {
  const registry: Record<string, { physics: string; mode: string }> = {};

  Object.entries(tokens.themes).forEach(([key, config]) => {
    registry[key] = {
      physics: config.physics,
      mode: config.type, // Map 'type' (light/dark) to 'mode'
    };
  });

  return JSON.stringify(registry, null, 2);
}

// ==========================================================================
// EXECUTION
// ==========================================================================
async function main() {
  try {
    console.log('🔮 Void Engine: Materializing Tokens...');

    // 1. Ensure directories exist
    const scssDir = path.dirname(PATHS.scss);
    if (!fs.existsSync(scssDir)) fs.mkdirSync(scssDir, { recursive: true });

    // 2. Write SCSS
    const scssContent = generateSCSS(VOID_TOKENS);
    fs.writeFileSync(PATHS.scss, scssContent);
    console.log(
      `   └─ 🎨 SCSS Written: src/styles/config/_generated-themes.scss`,
    );

    // 3. Write JSON
    const jsonContent = generateRegistry(VOID_TOKENS);
    fs.writeFileSync(PATHS.json, jsonContent);
    console.log(`   └─ ⚙️  JSON Written: src/config/void-registry.json`);

    console.log('✅ Token Pipeline Complete.');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();
