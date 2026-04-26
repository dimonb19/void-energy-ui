/**
 * Build script for @void-energy/ambient-layers.
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

// 4. Copy Svelte source files (consumers compile them)
mkdirSync(resolve(dist, 'svelte'), { recursive: true });
for (const name of [
  'AtmosphereLayer',
  'PsychologyLayer',
  'ActionLayer',
  'EnvironmentLayer',
  'AmbientHost',
]) {
  cpSync(
    resolve(root, `src/svelte/${name}.svelte`),
    resolve(dist, `svelte/${name}.svelte`),
  );
}

// 4b. Copy runes source files (.svelte.ts — consumers compile them too)
cpSync(
  resolve(root, 'src/svelte/ambient.svelte.ts'),
  resolve(dist, 'svelte/ambient.svelte.ts'),
);

// 5. Barrel index.js
writeFileSync(
  resolve(dist, 'index.js'),
  `// Generated barrel - re-exports public API
export { default as AtmosphereLayer } from './svelte/AtmosphereLayer.svelte';
export { default as PsychologyLayer } from './svelte/PsychologyLayer.svelte';
export { default as ActionLayer } from './svelte/ActionLayer.svelte';
export { default as EnvironmentLayer } from './svelte/EnvironmentLayer.svelte';
export { default as AmbientHost } from './svelte/AmbientHost.svelte';
export { ambient, Ambient } from './svelte/ambient.svelte.ts';
export {} from './types.js';
`,
);

// 6. Barrel index.d.ts
writeFileSync(
  resolve(dist, 'index.d.ts'),
  `import type {
  AmbientIntensity,
  AtmosphereLayer as AtmosphereLayerId,
  PsychologyLayer as PsychologyLayerId,
  EnvironmentLayer as EnvironmentLayerId,
  ActionLayer as ActionLayerId,
} from './types.js';

// Re-export the .svelte modules directly so Svelte language-tools wraps them in
// an isomorphic component type (class + function signatures). Consumers in Astro
// / Svelte 5 projects then get correct JSX prop inference. A hand-declared
// \`Component<Props>\` barrel breaks Astro's JSX check because TS picks the first
// function parameter (\`internals: ComponentInternals\`) as the JSX props.
export { default as AtmosphereLayer } from './svelte/AtmosphereLayer.svelte';
export { default as PsychologyLayer } from './svelte/PsychologyLayer.svelte';
export { default as ActionLayer } from './svelte/ActionLayer.svelte';
export { default as EnvironmentLayer } from './svelte/EnvironmentLayer.svelte';
export { default as AmbientHost } from './svelte/AmbientHost.svelte';

export type PersistentCategory = 'atmosphere' | 'psychology' | 'environment';

export interface AtmosphereEntry {
  handle: number;
  variant: AtmosphereLayerId;
  intensity: AmbientIntensity;
  // 0 = pinned at intensity (default). undefined = decay using the variant's
  // built-in duration.
  durationMs?: number;
  // Set by \`release(handle, ms)\` — layer animates current → 0 over this
  // many ms flat, then self-cleans via AmbientHost's onEnd.
  fadeMs?: number;
}
export interface PsychologyEntry {
  handle: number;
  variant: PsychologyLayerId;
  intensity: AmbientIntensity;
  durationMs?: number;
  fadeMs?: number;
}
export interface EnvironmentEntry {
  handle: number;
  variant: EnvironmentLayerId;
  intensity: AmbientIntensity;
  fadeMs?: number;
}
export interface ActionEntry {
  id: number;
  variant: ActionLayerId;
  intensity: AmbientIntensity;
}

/**
 * Reactive singleton: drives <AmbientHost /> from anywhere in the app.
 * Use push/release handles for persistent layers, fire() for one-shot actions.
 */
export declare class Ambient {
  atmosphere: AtmosphereEntry[];
  psychology: PsychologyEntry[];
  environment: EnvironmentEntry[];
  actions: ActionEntry[];

  push(category: 'atmosphere', variant: AtmosphereLayerId, intensity?: AmbientIntensity, decay?: boolean): number;
  push(category: 'psychology', variant: PsychologyLayerId, intensity?: AmbientIntensity, decay?: boolean): number;
  push(category: 'environment', variant: EnvironmentLayerId, intensity?: AmbientIntensity): number;
  update(
    handle: number,
    variant: AtmosphereLayerId | PsychologyLayerId | EnvironmentLayerId,
    intensity?: AmbientIntensity,
  ): boolean;
  decay(handle: number, durationMs?: number): boolean;
  release(handle: number, totalMs?: number): boolean;
  _releaseImmediate(handle: number): boolean;
  fire(variant: ActionLayerId, intensity?: AmbientIntensity): void;
  clear(category?: PersistentCategory | 'action' | 'all'): void;
}

export declare const ambient: Ambient;

export type {
  AmbientCategory,
  AmbientLayerId,
  AmbientIntensity,
  AmbientLevel,
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
