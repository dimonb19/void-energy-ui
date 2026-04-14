/**
 * @void-energy/tailwind — Vite plugin.
 *
 * Auto-discovers `void.config.{ts,mts,js,mjs,cjs}` at the project root,
 * loads + validates it via the shared loader, and calls the shared generator
 * to produce the same `{css, manifest}` pair the CLI writes. Exposes them as
 * two virtual modules:
 *
 *   `virtual:void-energy/generated.css`   — @font-face + :root assignments +
 *                                           config atmosphere blocks.
 *   `virtual:void-energy/manifest.json`   — JSON manifest consumed by the
 *                                           runtime's `init({ manifest })`.
 *
 * HMR: the config file is added to the module graph and both virtual modules
 * are invalidated on change.
 *
 * SSR: the plugin instance carries a `manifest` getter so server-side render
 * paths (Next.js, Astro, Nuxt) can read the current manifest without a round
 * trip through Vite's virtual module graph.
 *
 * Node-only. Never imported by browser code.
 */

import path from 'node:path';
import fs from 'node:fs';
import { loadConfig, findConfig } from './loader.ts';
import { generate, type GeneratorBuiltins } from './generator.ts';
import type { VoidConfig } from './config.ts';
import type { GeneratedManifest } from './generator.ts';

export interface VoidEnergyPluginOptions {
  /**
   * Explicit path to `void.config.{ts,js,mjs}`. Absolute or relative to the
   * project root. When unset, the plugin auto-discovers from the project
   * root Vite supplies via `configResolved.root`.
   */
  config?: string;

  /**
   * Override the default GeneratorBuiltins source. Intended for tests.
   * When unset, the plugin loads `dist/builtins.json` co-located with this
   * module at consumer install time.
   */
  builtins?: GeneratorBuiltins;
}

export interface VoidEnergyPlugin {
  name: string;
  enforce?: 'pre' | 'post';
  configResolved(resolved: { root: string }): void | Promise<void>;
  resolveId(id: string): string | null;
  load(id: string): string | null;
  configureServer(server: ViteDevServerShape): void;
  /** SSR hook — the currently-loaded manifest, or null before configResolved. */
  readonly manifest: GeneratedManifest | null;
}

// Minimal structural typing for Vite's dev-server surface so we don't carry a
// hard dep on `vite` types. The plugin only uses these methods.
interface ViteDevServerShape {
  watcher: {
    add(path: string): void;
    on(
      event: 'change' | 'add' | 'unlink',
      listener: (file: string) => void,
    ): void;
  };
  moduleGraph: {
    getModuleById(id: string): { id: string } | undefined;
    invalidateModule(mod: { id: string }): void;
  };
  ws: {
    send(payload: { type: 'full-reload' }): void;
  };
}

const VIRTUAL_CSS = 'virtual:void-energy/generated.css';
const VIRTUAL_MANIFEST = 'virtual:void-energy/manifest.json';
const RESOLVED_CSS = '\0' + VIRTUAL_CSS;
const RESOLVED_MANIFEST = '\0' + VIRTUAL_MANIFEST;

const EMPTY_CSS =
  '/* void.generated.css — no void.config.{ts,js,mjs} found; emitted empty. */\n';
const EMPTY_MANIFEST: GeneratedManifest = {
  schemaVersion: 1,
  defaults: {},
  atmospheres: {},
};

function defaultBuiltinsPath(): string {
  // dist/vite.js lives alongside dist/builtins.json once published; this file
  // is the source-of-truth .ts so we resolve the path at runtime from its
  // shipped sibling. The hand-authored parallel in dist/vite.js resolves to
  // the same sibling.
  return path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../dist/builtins.json',
  );
}

function loadBuiltins(override?: GeneratorBuiltins): GeneratorBuiltins {
  if (override) return override;
  const p = defaultBuiltinsPath();
  if (!fs.existsSync(p)) {
    // Fallback — minimal viable data. Tests and non-extends consumers still work.
    return { semanticDark: {}, semanticLight: {}, atmospheres: {} };
  }
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as GeneratorBuiltins & {
    _comment?: string;
  };
  return {
    semanticDark: raw.semanticDark,
    semanticLight: raw.semanticLight,
    atmospheres: raw.atmospheres,
  };
}

export function voidEnergy(
  options: VoidEnergyPluginOptions = {},
): VoidEnergyPlugin {
  let projectRoot = process.cwd();
  let cachedConfig: VoidConfig | null = null;
  let cachedConfigPath: string | null = null;
  let cachedCss: string = EMPTY_CSS;
  let cachedManifest: GeneratedManifest = EMPTY_MANIFEST;
  const builtins = loadBuiltins(options.builtins);

  async function rebuild(): Promise<void> {
    try {
      const loaded = await loadConfig(projectRoot, {
        configPath: options.config,
      });
      cachedConfig = loaded.config;
      cachedConfigPath = loaded.configPath;
      const result = generate(cachedConfig, builtins);
      cachedCss = result.css;
      cachedManifest = result.manifest;
    } catch (err) {
      // No config file is not an error — the minimal install path. Any other
      // throw (validation failure, cycle detected, etc.) is surfaced so the
      // developer sees it at Vite boot time.
      if (
        err instanceof Error &&
        /no config file found/.test(err.message) &&
        !options.config
      ) {
        cachedConfig = null;
        cachedConfigPath = null;
        cachedCss = EMPTY_CSS;
        cachedManifest = EMPTY_MANIFEST;
        return;
      }
      throw err;
    }
  }

  const plugin: VoidEnergyPlugin = {
    name: '@void-energy/tailwind',
    enforce: 'pre',

    async configResolved(resolved) {
      projectRoot = resolved.root;
      await rebuild();
    },

    resolveId(id) {
      if (id === VIRTUAL_CSS) return RESOLVED_CSS;
      if (id === VIRTUAL_MANIFEST) return RESOLVED_MANIFEST;
      return null;
    },

    load(id) {
      if (id === RESOLVED_CSS) return cachedCss;
      if (id === RESOLVED_MANIFEST) return JSON.stringify(cachedManifest);
      return null;
    },

    configureServer(server) {
      // Auto-discover the config path if not already known so the watcher can
      // attach even when configResolved fired before the file existed.
      if (!cachedConfigPath) {
        cachedConfigPath =
          (options.config && path.resolve(projectRoot, options.config)) ||
          findConfig(projectRoot);
      }
      if (cachedConfigPath) {
        server.watcher.add(cachedConfigPath);
      }

      const onChange = async (file: string): Promise<void> => {
        if (!cachedConfigPath) return;
        if (path.resolve(file) !== path.resolve(cachedConfigPath)) return;
        await rebuild();
        const cssMod = server.moduleGraph.getModuleById(RESOLVED_CSS);
        if (cssMod) server.moduleGraph.invalidateModule(cssMod);
        const manifestMod = server.moduleGraph.getModuleById(RESOLVED_MANIFEST);
        if (manifestMod) server.moduleGraph.invalidateModule(manifestMod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', onChange);
      server.watcher.on('add', onChange);
    },

    get manifest() {
      return cachedManifest.atmospheres ? cachedManifest : null;
    },
  };

  return plugin;
}

export default voidEnergy;
