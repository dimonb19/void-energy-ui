/**
 * Build script for @dgrslabs/void-energy-kinetic-text.
 *
 * Steps:
 * 1. Clean dist/
 * 2. Compile TypeScript → ESM + declarations via tsc (excludes index.ts and .svelte)
 * 3. Compile SCSS → CSS via sass
 * 4. Copy .svelte source files to dist/ (consumers compile them)
 * 5. Write dist/index.js and dist/index.d.ts (hand-crafted barrel that re-exports
 *    from compiled submodules + raw .svelte component)
 */

import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const dist = resolve(root, 'dist');

function run(cmd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

// 1. Clean
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

// 2. TypeScript → ESM + declarations (index.ts excluded — written manually below)
run('npx tsc --project tsconfig.build.json');

// 3. SCSS → CSS
mkdirSync(resolve(dist, 'styles'), { recursive: true });
run('npx sass src/styles/kinetic-text.scss dist/styles/kinetic-text.css --no-source-map --style=compressed');

// 4. Copy Svelte source files
mkdirSync(resolve(dist, 'svelte'), { recursive: true });
cpSync(
  resolve(root, 'src/svelte/KineticText.svelte'),
  resolve(dist, 'svelte/KineticText.svelte'),
);

// 5. Write barrel index.js
writeFileSync(
  resolve(dist, 'index.js'),
  `// Generated barrel — re-exports public API
export { default as KineticText } from './svelte/KineticText.svelte';
export { createVoidEnergyTextStyleSnapshot } from './adapters/void-energy-host.js';
export {} from './types.js';
`,
);

// 6. Write barrel index.d.ts
writeFileSync(
  resolve(dist, 'index.d.ts'),
  `import { SvelteComponent } from 'svelte';
import type { KineticTextProps } from './types.js';

/** Kinetic text component — character-level reveal animations with physics-aware rendering. */
declare const KineticText: typeof SvelteComponent<KineticTextProps>;
export { KineticText };

export { createVoidEnergyTextStyleSnapshot } from './adapters/void-energy-host.js';

export type {
  CueTrigger,
  ModePreset,
  PhysicsPreset,
  ReducedMotionMode,
  RevealMode,
  RevealStyle,
  StaggerPattern,
  KineticCue,
  KineticTextEffect,
  KineticTextProps,
  TextRange,
  TextStyleSnapshot,
  TextStyleSnapshotOverrides,
} from './types.js';
`,
);

console.log('\nBuild complete → dist/');
