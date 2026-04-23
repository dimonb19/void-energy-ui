/*
 * DESIGN.md CLI — export, import, validate VE atmospheres as DESIGN.md.
 *
 * Usage:
 *   npm run design-md -- export                  Print DESIGN.md for default atmosphere
 *   npm run design-md -- export --atmosphere <id> [--out <file>]
 *   npm run design-md -- validate <file>         Exit 0 if valid, non-zero otherwise
 *   npm run design-md -- import <file>           Print resolved payload as JSON
 *   npm run design-md -- list                    List available atmosphere ids
 *
 * The export path reads VOID_TOKENS directly, so every registered atmosphere
 * is available regardless of whether it has a generator manifest entry.
 */

import fs from 'node:fs';
import path from 'node:path';

import { VOID_TOKENS } from '../src/config/design-tokens';
import {
  parseDesignMd,
  serializeAtmosphereToDesignMd,
} from '../src/lib/design-md';

type Command = 'export' | 'import' | 'validate' | 'list' | 'help';

interface CliArgs {
  command: Command;
  atmosphere?: string;
  out?: string;
  file?: string;
}

function helpText(): string {
  return [
    'Usage: npm run design-md -- <command> [flags]',
    '',
    'Commands:',
    '  export                    Emit a DESIGN.md for the default atmosphere.',
    '  export --atmosphere <id>  Emit a DESIGN.md for a specific atmosphere.',
    '  import <file>             Parse a DESIGN.md and print the resolved payload.',
    '  validate <file>           Exit 0 if the file parses, non-zero otherwise.',
    '  list                      Print every registered atmosphere id.',
    '',
    'Flags:',
    '  --atmosphere <id>         Target atmosphere (export only).',
    '  --out <path>              Write to file instead of stdout (export only).',
    '  -h, --help                Show this help.',
  ].join('\n');
}

function parseArgs(argv: readonly string[]): CliArgs {
  const args = argv.slice(2);
  if (
    args.length === 0 ||
    args[0] === '-h' ||
    args[0] === '--help' ||
    args[0] === 'help'
  ) {
    return { command: 'help' };
  }

  const command = args[0] as Command;
  if (
    command !== 'export' &&
    command !== 'import' &&
    command !== 'validate' &&
    command !== 'list'
  ) {
    throw new Error(`design-md: unknown command "${command}"`);
  }

  const out: CliArgs = { command };
  for (let i = 1; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--atmosphere') {
      const v = args[++i];
      if (!v) throw new Error('design-md: --atmosphere requires an id');
      out.atmosphere = v;
      continue;
    }
    if (flag === '--out') {
      const v = args[++i];
      if (!v) throw new Error('design-md: --out requires a path');
      out.out = v;
      continue;
    }
    if (!flag.startsWith('-') && !out.file) {
      out.file = flag;
      continue;
    }
    throw new Error(`design-md: unknown flag "${flag}"`);
  }

  if ((command === 'import' || command === 'validate') && !out.file) {
    throw new Error(`design-md: "${command}" requires a file path`);
  }

  return out;
}

function listAtmospheres(): number {
  const ids = Object.keys(VOID_TOKENS.themes).sort();
  for (const id of ids) {
    const theme = VOID_TOKENS.themes[id as keyof typeof VOID_TOKENS.themes];
    process.stdout.write(
      `${id.padEnd(12)} ${theme.mode.padEnd(6)} ${theme.physics}\n`,
    );
  }
  return 0;
}

function exportAtmosphere(args: CliArgs): number {
  const defaultId = Object.keys(VOID_TOKENS.themes)[0];
  const id = args.atmosphere ?? defaultId;
  const theme = VOID_TOKENS.themes[id as keyof typeof VOID_TOKENS.themes];
  if (!theme) {
    process.stderr.write(
      `design-md: no atmosphere "${id}" (try "list" to see options)\n`,
    );
    return 1;
  }

  const md = serializeAtmosphereToDesignMd(theme, { id });

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md, 'utf8');
    process.stdout.write(`[design-md] wrote ${outPath}\n`);
  } else {
    process.stdout.write(md);
  }
  return 0;
}

function validateFile(args: CliArgs): number {
  const filePath = path.resolve(process.cwd(), args.file!);
  if (!fs.existsSync(filePath)) {
    process.stderr.write(`design-md: file not found: ${filePath}\n`);
    return 1;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const result = parseDesignMd(content, filePath);
  if (result.ok) {
    process.stdout.write(`ok ${result.data.id}\n`);
    return 0;
  }
  process.stderr.write(`invalid ${result.error.message}\n`);
  for (const issue of result.error.issues ?? []) {
    process.stderr.write(`  - ${issue}\n`);
  }
  return 1;
}

function importFile(args: CliArgs): number {
  const filePath = path.resolve(process.cwd(), args.file!);
  if (!fs.existsSync(filePath)) {
    process.stderr.write(`design-md: file not found: ${filePath}\n`);
    return 1;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const result = parseDesignMd(content, filePath);
  if (!result.ok) {
    process.stderr.write(`invalid ${result.error.message}\n`);
    for (const issue of result.error.issues ?? []) {
      process.stderr.write(`  - ${issue}\n`);
    }
    return 1;
  }
  process.stdout.write(`${JSON.stringify(result.data, null, 2)}\n`);
  return 0;
}

function main(argv: readonly string[]): number {
  let args: CliArgs;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    process.stderr.write(`${helpText()}\n`);
    return 1;
  }

  switch (args.command) {
    case 'help':
      process.stdout.write(`${helpText()}\n`);
      return 0;
    case 'list':
      return listAtmospheres();
    case 'export':
      return exportAtmosphere(args);
    case 'import':
      return importFile(args);
    case 'validate':
      return validateFile(args);
  }
}

process.exit(main(process.argv));
