/**
 * @void-energy/tailwind — CLI entry.
 *
 * Thin wrapper over the shared generator + loader. Two subcommands:
 *
 *   void-energy build                       One-shot build. Exits 0 on success.
 *   void-energy build --watch               Chokidar-backed watch mode.
 *
 * Flags:
 *   --config <path>    Explicit path to void.config.{ts,js,mjs}.
 *   --out <dir>        Override outDir from the config file.
 *   --cwd <dir>        Project root (default: process.cwd()).
 *
 * Writes `<outDir>/void.generated.css` and `<outDir>/void.manifest.json`.
 * Output shape is byte-identical to the Vite plugin's virtual modules for
 * the same config — both call the shared generator core.
 *
 * The CLI is mapped to `bin: void-energy` in package.json; see
 * bin/void-energy.js for the shebang entry.
 */

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { loadConfig } from './loader.ts';
import { generate, type GeneratorBuiltins } from './generator.ts';

export interface CliArgs {
  command: 'build' | 'help' | 'version';
  watch: boolean;
  cwd: string;
  config?: string;
  out?: string;
}

export function parseArgs(argv: readonly string[]): CliArgs {
  const args = argv.slice(2);
  const out: CliArgs = {
    command: 'help',
    watch: false,
    cwd: process.cwd(),
  };
  if (
    args.length === 0 ||
    args[0] === 'help' ||
    args[0] === '--help' ||
    args[0] === '-h'
  ) {
    return out;
  }
  if (args[0] === '--version' || args[0] === '-v') {
    out.command = 'version';
    return out;
  }
  if (args[0] === 'build') {
    out.command = 'build';
  } else {
    throw new Error(`void-energy: unknown command "${args[0]}"`);
  }
  for (let i = 1; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--watch' || flag === '-w') {
      out.watch = true;
      continue;
    }
    if (flag === '--config') {
      const v = args[++i];
      if (!v) throw new Error('void-energy: --config requires a path');
      out.config = v;
      continue;
    }
    if (flag === '--out') {
      const v = args[++i];
      if (!v) throw new Error('void-energy: --out requires a path');
      out.out = v;
      continue;
    }
    if (flag === '--cwd') {
      const v = args[++i];
      if (!v) throw new Error('void-energy: --cwd requires a path');
      out.cwd = path.resolve(v);
      continue;
    }
    throw new Error(`void-energy: unknown flag "${flag}"`);
  }
  return out;
}

function loadBuiltins(): GeneratorBuiltins {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const candidate = path.resolve(here, '../dist/builtins.json');
  if (!fs.existsSync(candidate)) {
    return { semanticDark: {}, semanticLight: {}, atmospheres: {} };
  }
  const raw = JSON.parse(
    fs.readFileSync(candidate, 'utf8'),
  ) as GeneratorBuiltins;
  return {
    semanticDark: raw.semanticDark,
    semanticLight: raw.semanticLight,
    atmospheres: raw.atmospheres,
  };
}

export async function runBuild(args: CliArgs): Promise<void> {
  const loaded = await loadConfig(args.cwd, { configPath: args.config });
  const builtins = loadBuiltins();
  const { css, manifest } = generate(loaded.config, builtins);
  const outDir = args.out
    ? path.resolve(args.cwd, args.out)
    : loaded.outDirAbsolute;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'void.generated.css'), css, 'utf8');
  fs.writeFileSync(
    path.join(outDir, 'void.manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8',
  );
  // eslint-disable-next-line no-console
  console.log(
    `[void-energy] wrote void.generated.css + void.manifest.json to ${outDir}`,
  );
}

export function helpText(): string {
  return [
    'Usage: void-energy <command> [flags]',
    '',
    'Commands:',
    '  build                     Generate void.generated.css + void.manifest.json.',
    '  build --watch             Same, plus chokidar-backed rebuilds on config change.',
    '',
    'Flags:',
    '  --config <path>           Explicit path to void.config.{ts,js,mjs}.',
    '  --out <dir>               Override outDir from the config file.',
    '  --cwd <dir>               Project root (default: process.cwd()).',
    '  -h, --help                Show this help.',
    '  -v, --version             Show package version.',
  ].join('\n');
}

async function readVersion(): Promise<string> {
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const pkgPath = path.resolve(here, '../package.json');
    const raw = fs.readFileSync(pkgPath, 'utf8');
    return (JSON.parse(raw) as { version?: string }).version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

export async function main(argv: readonly string[]): Promise<number> {
  let args: CliArgs;
  try {
    args = parseArgs(argv);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error((err as Error).message);
    // eslint-disable-next-line no-console
    console.error(helpText());
    return 1;
  }

  if (args.command === 'help') {
    // eslint-disable-next-line no-console
    console.log(helpText());
    return 0;
  }
  if (args.command === 'version') {
    // eslint-disable-next-line no-console
    console.log(await readVersion());
    return 0;
  }

  try {
    await runBuild(args);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[void-energy] ${(err as Error).message}`);
    return 1;
  }

  if (!args.watch) return 0;

  // Watch mode — chokidar is the only non-stdlib runtime dep. Loaded lazily
  // so `build` (non-watch) doesn't pay the cost.
  const { default: chokidar } = (await import(
    /* @vite-ignore */ 'chokidar'
  )) as unknown as { default: { watch: (p: string) => ChokidarWatcher } };

  const loaded = await loadConfig(args.cwd, { configPath: args.config });
  const watcher = chokidar.watch(loaded.configPath);
  watcher.on('change', async () => {
    try {
      await runBuild(args);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`[void-energy] ${(err as Error).message}`);
    }
  });
  // eslint-disable-next-line no-console
  console.log(`[void-energy] watching ${loaded.configPath}`);
  // Keep the process alive until the user interrupts. chokidar holds fs
  // handles that prevent natural exit, but an explicit `await new Promise`
  // makes the intent obvious.
  await new Promise<void>(() => {});
  return 0;
}

interface ChokidarWatcher {
  on(event: 'change', listener: (file: string) => void): void;
}
