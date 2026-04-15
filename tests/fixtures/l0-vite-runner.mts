/**
 * Subprocess runner for L0 Vite plugin integration tests.
 *
 * Invoked via `tsx` from tests/l0-vite.test.ts with a project root + an
 * action keyword. Same rationale as l0-loader-runner.mts: the plugin calls
 * the same tsx-backed loader, which doesn't survive Vitest's jsdom env.
 *
 * Contracts:
 *   action = "boot"        Boot the plugin against `projectRoot`, then load
 *                          both virtual modules. Output JSON:
 *                            { ok: { css, manifest } } | { error }
 *   action = "watch-once"  Boot, mutate the config file with the third argv
 *                          entry, fire the watcher's 'change' handler, then
 *                          load both virtual modules a second time. Output:
 *                            { ok: { before: {css}, after: {css}, wsEvents } }
 */

import fs from 'node:fs';
import { voidEnergy } from '../../packages/void-energy-tailwind/src/vite.ts';

const projectRoot = process.argv[2];
const action = process.argv[3] ?? 'boot';
const mutateContent = process.argv[4];

if (!projectRoot) {
  process.stdout.write(
    JSON.stringify({ error: 'runner: missing projectRoot argv' }),
  );
  process.exit(1);
}

interface FakeServer {
  watcher: {
    add: (p: string) => void;
    on: (
      event: string,
      listener: (file: string) => void | Promise<void>,
    ) => void;
  };
  moduleGraph: {
    getModuleById: (id: string) => { id: string } | undefined;
    invalidateModule: (mod: { id: string }) => void;
  };
  ws: { send: (payload: { type: string }) => void };
}

try {
  const plugin = voidEnergy();
  await plugin.configResolved({ root: projectRoot });

  if (action === 'boot') {
    const css = plugin.load('\0virtual:void-energy/generated.css');
    const manifestStr = plugin.load('\0virtual:void-energy/manifest.json');
    const manifest = manifestStr ? JSON.parse(manifestStr) : null;
    process.stdout.write(JSON.stringify({ ok: { css, manifest } }));
    process.exit(0);
  }

  if (action === 'watch-once') {
    const handlers = new Map<string, (file: string) => void | Promise<void>>();
    const wsEvents: { type: string }[] = [];
    let cfgPath: string | null = null;
    const server: FakeServer = {
      watcher: {
        add: (p) => {
          cfgPath = p;
        },
        on: (event, listener) => handlers.set(event, listener),
      },
      moduleGraph: {
        getModuleById: (id) => ({ id }),
        invalidateModule: () => {},
      },
      ws: { send: (payload) => wsEvents.push(payload) },
    };
    plugin.configureServer(server as never);
    const before = plugin.load('\0virtual:void-energy/generated.css');

    if (!cfgPath)
      throw new Error('runner: configureServer did not register a path');
    if (mutateContent) fs.writeFileSync(cfgPath, mutateContent);

    const change = handlers.get('change');
    if (!change) throw new Error('runner: no change handler');
    await change(cfgPath);

    const after = plugin.load('\0virtual:void-energy/generated.css');
    process.stdout.write(JSON.stringify({ ok: { before, after, wsEvents } }));
    process.exit(0);
  }

  process.stdout.write(JSON.stringify({ error: `unknown action "${action}"` }));
  process.exit(1);
} catch (e) {
  process.stdout.write(
    JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
  );
  process.exit(0);
}
