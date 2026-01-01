/**
 * 🤖 VOID TOKEN GENERATOR (Upgraded)
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
  tailwindJson: path.resolve(__dirname, '../src/config/void-tailwind-theme.json'), // NEW
};

/**
 * Helper: Converts raw token numbers to CSS units safely
 */
function toCssValue(key: string, value: string | number): string {
  if (typeof value === 'string') return value;
  if (value === 0) {
    if (key.includes('speed')) return '0s';
    if (key.includes('blur') || key.includes('Width')) return '0px';
    return '0';
  }
  if (key.includes('speed')) return `${value / 1000}s`;
  if (key.includes('blur') || key.includes('Width')) return `${value}px`;
  return `${value}`;
}

/**
 * Generates the JSON object that tailwind.config.mjs will consume
 */
function generateTailwindConfig(tokens: typeof VOID_TOKENS) {
    // 1. SPACING (Mapped to --space-*)
    const spacing: Record<string, string> = { "0": "0", "px": "1px" };
    Object.keys(tokens.density.scale).forEach(key => {
        spacing[key] = `var(--space-${key})`;
    });

    // 2. COLORS (Semantic Mapping)
    // We map your "Energy" names to cleaner Tailwind classes (e.g., text-primary)
    const colors = {
        transparent: 'transparent',
        current: 'currentColor',
        inherit: 'inherit',
        // Canvas
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        sink: 'var(--bg-sink)',
        spotlight: 'var(--bg-spotlight)',
        // Energy
        primary: 'var(--energy-primary)',
        secondary: 'var(--energy-secondary)',
        highlight: 'var(--border-highlight)',
        shadow: 'var(--border-shadow)',
        // Signal
        main: 'var(--text-main)',
        dim: 'var(--text-dim)',
        mute: 'var(--text-mute)',
        // Semantics
        premium: 'var(--color-premium)',
        system: 'var(--color-system)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
    };

    // 3. RADIUS (Mapped to --radius-*)
    // Hardcoded map based on your variables.scss logic, but dynamic values
    const borderRadius = {
        none: '0',
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        full: 'var(--radius-full)',
    };

    // 4. TIMING (Mapped to --speed-*)
    const transitionDuration = {
        fast: 'var(--speed-fast)',
        base: 'var(--speed-base)',
        0: '0ms',
    };
    
    return {
        spacing,
        colors,
        borderRadius,
        transitionDuration
    };
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
      registry[key] = { physics: config.physics, mode: config.type };
    });
    fs.writeFileSync(PATHS.registryJson, JSON.stringify(registry, null, 2));
    console.log(`   └─ ⚙️  Registry: src/config/void-registry.json`);

    // C. Generate Physics (Motion)
    fs.writeFileSync(PATHS.physicsJson, JSON.stringify(VOID_TOKENS.physics, null, 2));
    console.log(`   └─ ⚡  Physics: src/config/void-physics.json`);

    // D. Generate Tailwind Theme (Bridge) -> NEW!
    const tailwindTheme = generateTailwindConfig(VOID_TOKENS);
    fs.writeFileSync(PATHS.tailwindJson, JSON.stringify(tailwindTheme, null, 2));
    console.log(`   └─ 🌊 Tailwind: src/config/void-tailwind-theme.json`);

    console.log('✅ Token Pipeline Complete.\n');
  } catch (error) {
    console.error('❌ Token Generation Failed:', error);
    process.exit(1);
  }
}

main();