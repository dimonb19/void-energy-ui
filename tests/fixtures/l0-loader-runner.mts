/**
 * Subprocess runner for L0 loader integration tests.
 *
 * Invoked via `tsx` from tests/l0-loader.test.ts with a project root as argv.
 * Running the loader in a subprocess sidesteps the esbuild-vs-jsdom collision
 * that kills tsx when called inside the Vitest jsdom environment: the loader
 * is Node-only code, and the real deployment target is Node (Vite plugin,
 * CLI) — so a Node subprocess is the authentic test environment.
 *
 * Contract: argv[2] = projectRoot. Writes a single JSON line to stdout:
 *   { "ok": LoadedConfig } on success
 *   { "error": string }    on any thrown Error (including validation errors)
 */

import { loadConfig } from '../../packages/void-energy-tailwind/src/loader.ts';

const projectRoot = process.argv[2];
if (!projectRoot) {
  process.stdout.write(
    JSON.stringify({ error: 'runner: missing projectRoot argv' }),
  );
  process.exit(1);
}

try {
  const result = await loadConfig(projectRoot);
  process.stdout.write(JSON.stringify({ ok: result }));
} catch (e) {
  process.stdout.write(
    JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
  );
}
