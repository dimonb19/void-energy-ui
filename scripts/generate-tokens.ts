/**
 * 🤖 VOID TOKEN GENERATOR (Fixed)
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
  // 1. Pass strings through raw (e.g. "linear", "cubic-bezier(...)")
  if (typeof value === 'string') return value;

  // 2. Handle Zero (Unitless is safe for 0, but 0s/0px is safer for calcs)
  if (value === 0) {
    if (key.includes('speed')) return '0s';
    if (key.includes('blur') || key.includes('Width')) return '0px';
    return '0';
  }

  // 3. Handle Time (ms -> s)
  if (key.includes('speed')) {
    return `${value / 1000}s`; 
  }

  // 4. Handle Dimensions (px)
  if (key.includes('blur') || key.includes('Width')) {
    return `${value}px`;
  }

  // 5. Default Number (opacity, scale, etc)
  return `${value}`;
}

function generateSCSS(tokens: typeof VOID_TOKENS) {
  const timestamp = new Date().toISOString();
  let scss = `// 🤖 AUTO-GENERATED FILE\n// GENERATED AT: ${timestamp}\n\n`;

  // 1. PHYSICS MAPS
  scss += `$generated-physics: (\n`;
  
  Object.entries(tokens.physics).forEach(([mode, rawConfig]) => {
    const config = rawConfig as Record<string, string | number>;
    
    scss += `  '${mode}': (\n`;
    
    Object.entries(config).forEach(([prop, val]) => {
      // camelCase -> kebab-case (speedBase -> speed-base)
      const kebabProp = prop.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
      
      const cssValue = toCssValue(prop, val);

      // Key Mapping
      let finalKey = kebabProp;
      if (prop === 'blur') finalKey = 'physics-blur';
      if (prop === 'borderWidth') finalKey = 'physics-border-width';

      // WRITE LINE: Ensure comma is present!
      scss += `    '${finalKey}': ${cssValue},\n`;
    });
    
    scss += `  ),\n`;
  });
  scss += `);\n\n`;

  // 2. THEMES
  scss += `$themes: (\n`;
  Object.entries(tokens.themes).forEach(([themeName, config]) => {
    scss += `  '${themeName}': (\n`;
    scss += `    'type': '${config.type}',\n`;
    scss += `    'physics': '${config.physics}',\n`;
    scss += `    'palette': (\n`;
    
    // Inject Fonts
    scss += `      'font-heading': "var(--user-font-heading, var(--font-atmos-heading))",\n`;
    scss += `      'font-body': "var(--user-font-body, var(--font-atmos-body))",\n`;
    
    // Inject Palette
    Object.entries(config.palette).forEach(([key, value]) => {
      // Quote strings for safety in SCSS maps
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

    const scssContent = generateSCSS(VOID_TOKENS);
    fs.writeFileSync(PATHS.scss, scssContent);
    console.log(`   └─ 🎨 Styles: src/styles/config/_generated-themes.scss`);

    const registry: Record<string, { physics: string; mode: string }> = {};
    Object.entries(VOID_TOKENS.themes).forEach(([key, config]) => {
      registry[key] = { physics: config.physics, mode: config.type };
    });
    fs.writeFileSync(PATHS.registryJson, JSON.stringify(registry, null, 2));
    console.log(`   └─ ⚙️  Registry: src/config/void-registry.json`);

    fs.writeFileSync(PATHS.physicsJson, JSON.stringify(VOID_TOKENS.physics, null, 2));
    console.log(`   └─ ⚡  Physics: src/config/void-physics.json`);

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();