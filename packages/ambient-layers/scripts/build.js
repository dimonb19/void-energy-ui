/**
 * Build script for @dgrslabs/void-energy-ambient-layers.
 *
 * Mirrors packages/kinetic-text/scripts/build.js:
 * 1. Clean dist/
 * 2. Compile TypeScript -> ESM + declarations via tsc (excludes index.ts and .svelte)
 * 3. Compile SCSS -> CSS via sass
 * 4. Copy .svelte source files to dist/ (consumers compile them)
 * 5. Write dist/index.js + dist/index.d.ts (hand-crafted barrel)
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

// 2. TypeScript -> ESM + declarations
run('npx tsc --project tsconfig.build.json');

// 3. SCSS -> CSS
mkdirSync(resolve(dist, 'styles'), { recursive: true });
run(
  'npx sass src/styles/ambient-layers.scss dist/styles/ambient-layers.css --no-source-map --style=compressed',
);
writeFileSync(
  resolve(dist, 'styles/styles.d.ts'),
  `// Side-effect CSS import\nexport {};\n`,
);

// 4. Copy Svelte source files
mkdirSync(resolve(dist, 'svelte'), { recursive: true });
for (const name of [
  'AtmosphereLayer',
  'PsychologyLayer',
  'ActionLayer',
  'EnvironmentLayer',
]) {
  cpSync(
    resolve(root, `src/svelte/${name}.svelte`),
    resolve(dist, `svelte/${name}.svelte`),
  );
}

// 5. Barrel index.js
writeFileSync(
  resolve(dist, 'index.js'),
  `// Generated barrel - re-exports public API
export { default as AtmosphereLayer } from './svelte/AtmosphereLayer.svelte';
export { default as PsychologyLayer } from './svelte/PsychologyLayer.svelte';
export { default as ActionLayer } from './svelte/ActionLayer.svelte';
export { default as EnvironmentLayer } from './svelte/EnvironmentLayer.svelte';
export {} from './types.js';
`,
);

// 6. Barrel index.d.ts
writeFileSync(
  resolve(dist, 'index.d.ts'),
  `import { SvelteComponent } from 'svelte';
import type {
  AtmosphereLayerProps,
  PsychologyLayerProps,
  ActionLayerProps,
  EnvironmentLayerProps,
} from './types.js';

/** Atmosphere category layer - weather/sensory variants (rain, snow, ash, fog, underwater, heat). */
declare const AtmosphereLayer: typeof SvelteComponent<AtmosphereLayerProps>;
/** Psychology category layer - edge-framed mental variants (danger, tension, dizzy, focus, flashback, dreaming). */
declare const PsychologyLayer: typeof SvelteComponent<PsychologyLayerProps>;
/** Action category layer - one-shot transient variants (impact, speed, glitch, flash, reveal). */
declare const ActionLayer: typeof SvelteComponent<ActionLayerProps>;
/** Environment category layer - sticky baseline tint variants (night, neon, dawn, dusk, sickly, toxic, underground, candlelit). */
declare const EnvironmentLayer: typeof SvelteComponent<EnvironmentLayerProps>;
export { AtmosphereLayer, PsychologyLayer, ActionLayer, EnvironmentLayer };

export type {
  AmbientCategory,
  AmbientLayerId,
  AmbientIntensity,
  ActionLevel,
  ReducedMotionMode,
  AtmosphereLayer as AtmosphereLayerId,
  PsychologyLayer as PsychologyLayerId,
  ActionLayer as ActionLayerId,
  EnvironmentLayer as EnvironmentLayerId,
  AtmosphereLayerProps,
  PsychologyLayerProps,
  ActionLayerProps,
  EnvironmentLayerProps,
} from './types.js';
`,
);

console.log('\nBuild complete -> dist/');
