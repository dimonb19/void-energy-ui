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
cpSync(
  resolve(root, 'src/svelte/SnowLayer.svelte'),
  resolve(dist, 'svelte/SnowLayer.svelte'),
);
cpSync(
  resolve(root, 'src/svelte/RainLayer.svelte'),
  resolve(dist, 'svelte/RainLayer.svelte'),
);
cpSync(
  resolve(root, 'src/svelte/FogLayer.svelte'),
  resolve(dist, 'svelte/FogLayer.svelte'),
);
cpSync(
  resolve(root, 'src/svelte/BloodLayer.svelte'),
  resolve(dist, 'svelte/BloodLayer.svelte'),
);

// 5. Barrel index.js
writeFileSync(
  resolve(dist, 'index.js'),
  `// Generated barrel - re-exports public API
export { default as SnowLayer } from './svelte/SnowLayer.svelte';
export { default as RainLayer } from './svelte/RainLayer.svelte';
export { default as FogLayer } from './svelte/FogLayer.svelte';
export { default as BloodLayer } from './svelte/BloodLayer.svelte';
export {} from './types.js';
`,
);

// 6. Barrel index.d.ts
writeFileSync(
  resolve(dist, 'index.d.ts'),
  `import { SvelteComponent } from 'svelte';
import type { SnowLayerProps, RainLayerProps, FogLayerProps, BloodLayerProps } from './types.js';

/** Snow ambient layer - drifting CSS particle snowfall, physics-aware. */
declare const SnowLayer: typeof SvelteComponent<SnowLayerProps>;
/** Rain ambient layer - angled CSS streak rainfall, physics-aware. */
declare const RainLayer: typeof SvelteComponent<RainLayerProps>;
/** Fog ambient layer - drifting volumetric mist blobs, physics-aware. */
declare const FogLayer: typeof SvelteComponent<FogLayerProps>;
/** Blood ambient layer - heartbeat vignette + falling drips, physics-aware. */
declare const BloodLayer: typeof SvelteComponent<BloodLayerProps>;
export { SnowLayer, RainLayer, FogLayer, BloodLayer };

export type {
  AmbientLayerProps,
  SnowLayerProps,
  RainLayerProps,
  FogLayerProps,
  BloodLayerProps,
  FlakeDensity,
  RainDensity,
  FogDrift,
  ReducedMotionMode,
} from './types.js';
`,
);

console.log('\nBuild complete -> dist/');
