/**
 * 🤖 VOID TOKEN GENERATOR
 * --------------------------------------------------------------------------
 * Usage: npm run build:tokens
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOID_TOKENS } from '../src/config/design-tokens';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PATHS = {
  scss: path.resolve(__dirname, '../src/styles/config/_generated-themes.scss'),
  registryJson: path.resolve(__dirname, '../src/config/void-registry.json'),
  physicsJson: path.resolve(__dirname, '../src/config/void-physics.json'),
};

/**
 * Helper: Converts raw token numbers to CSS units safely
 */
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

  // 1. Z-LAYERS MAP
  scss += `$z-layers: (\n`;
  Object.entries(tokens.layers).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // 2. BREAKPOINTS MAP
  scss += `$breakpoints: (\n`;
  Object.entries(tokens.responsive).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;
  
  // 3. PHYSICS MAPS
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

  // 5. CONTAINER MAX-WIDTHS MAP
  scss += `$container-widths: (\n`;
  Object.entries(tokens.container).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // 6. STRUCTURAL CONSTANTS MAP
  scss += `$structural-constants: (\n`;
  Object.entries(tokens.structural).forEach(([key, val]) => {
    scss += `  '${key}': ${val},\n`;
  });
  scss += `);\n\n`;

  // 4. THEMES
  scss += `$themes: (\n`;
  Object.entries(tokens.themes).forEach(([themeName, config]) => {
    scss += `  '${themeName}': (\n`;
    scss += `    'type': '${config.mode}',\n`;
    scss += `    'physics': '${config.physics}',\n`;
    scss += `    'palette': (\n`;
    // Inject Fonts
    scss += `      'font-heading': "var(--user-font-heading, var(--font-atmos-heading))",\n`;
    scss += `      'font-body': "var(--user-font-body, var(--font-atmos-body))",\n`;
    // Inject Palette
    Object.entries(config.palette).forEach(([key, value]) => {
      scss += `      '${key}': "${value}",\n`;
    });
    scss += `    ),\n`;
    scss += `  ),\n`;
  });
  scss += `);\n`;

  return scss;
}

async function main() {
  try {
    console.log('\n🔮 Void Engine: Materializing Tokens...');
    const scssDir = path.dirname(PATHS.scss);
    if (!fs.existsSync(scssDir)) fs.mkdirSync(scssDir, { recursive: true });

    // A. Generate SCSS
    const scssContent = generateSCSS(VOID_TOKENS);
    fs.writeFileSync(PATHS.scss, scssContent);
    console.log(`   └─ 🎨 Styles: src/styles/config/_generated-themes.scss`);

    // B. Generate Registry (Logic)
    const registry: Record<string, { physics: string; mode: string }> = {};
    Object.entries(VOID_TOKENS.themes).forEach(([key, config]) => {
      registry[key] = { physics: config.physics, mode: config.mode };
    });
    fs.writeFileSync(PATHS.registryJson, JSON.stringify(registry, null, 2));
    console.log(`   └─ ⚙️  Registry: src/config/void-registry.json`);

    // C. Generate Physics (Motion)
    fs.writeFileSync(PATHS.physicsJson, JSON.stringify(VOID_TOKENS.physics, null, 2));
    console.log(`   └─ ⚡  Physics: src/config/void-physics.json`);

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();