/*
 * Atmosphere markdown CLI — export, import, validate VE atmospheres.
 *
 * This CLI describes a SINGLE atmosphere (lossless VE-internal round-trip).
 * It also hosts the `spec-export` subcommand that emits the external
 * DESIGN.md (spec-compliant snapshot of the Frost atmosphere).
 *
 * Usage:
 *   npm run atmosphere-md -- export                    Print atmosphere.md for the default atmosphere
 *   npm run atmosphere-md -- export --atmosphere <id>  Print atmosphere.md for a specific atmosphere
 *   npm run atmosphere-md -- export --out <file>       Write to file instead of stdout
 *   npm run atmosphere-md -- validate <file>           Exit 0 if valid, non-zero otherwise
 *   npm run atmosphere-md -- import <file>             Print resolved payload as JSON
 *   npm run atmosphere-md -- list                      List available atmosphere ids
 *
 *   npm run atmosphere-md -- spec-export               Print the external DESIGN.md (Frost, spec-compliant)
 *   npm run atmosphere-md -- spec-export --out <file>  Write the external DESIGN.md to file
 *
 * The export path reads VOID_TOKENS directly, so every registered atmosphere
 * is available regardless of whether it has a generator manifest entry.
 */

import fs from 'node:fs';
import path from 'node:path';

import { VOID_TOKENS } from '../src/config/design-tokens';
import {
  parseAtmosphereMd,
  serializeAtmosphereMd,
} from '../src/lib/atmosphere-md';
import { serializeFrostSpecDocument } from '../src/lib/spec-design-md';

type Command =
  | 'export'
  | 'import'
  | 'validate'
  | 'list'
  | 'spec-export'
  | 'spec-verify'
  | 'help';

interface CliArgs {
  command: Command;
  atmosphere?: string;
  out?: string;
  file?: string;
}

function helpText(): string {
  return [
    'Usage: npm run atmosphere-md -- <command> [flags]',
    '',
    'Single-atmosphere commands (VE-internal round-trip):',
    '  export                    Emit an atmosphere.md for the default atmosphere.',
    '  export --atmosphere <id>  Emit an atmosphere.md for a specific atmosphere.',
    '  import <file>             Parse an atmosphere.md and print the resolved payload.',
    '  validate <file>           Exit 0 if the file parses, non-zero otherwise.',
    '  list                      Print every registered atmosphere id.',
    '',
    'Design-system commands (external, spec-compliant):',
    '  spec-export               Emit the external DESIGN.md (Frost snapshot, Google-spec flavored).',
    '  spec-verify               Exit 0 if the root DESIGN.md is byte-identical to spec-export output.',
    '',
    'Flags:',
    '  --atmosphere <id>         Target atmosphere (export only).',
    '  --out <path>              Write to file instead of stdout (export / spec-export only).',
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
    command !== 'list' &&
    command !== 'spec-export' &&
    command !== 'spec-verify'
  ) {
    throw new Error(`atmosphere-md: unknown command "${command}"`);
  }

  const out: CliArgs = { command };
  for (let i = 1; i < args.length; i++) {
    const flag = args[i];
    if (flag === '--atmosphere') {
      const v = args[++i];
      if (!v) throw new Error('atmosphere-md: --atmosphere requires an id');
      out.atmosphere = v;
      continue;
    }
    if (flag === '--out') {
      const v = args[++i];
      if (!v) throw new Error('atmosphere-md: --out requires a path');
      out.out = v;
      continue;
    }
    if (!flag.startsWith('-') && !out.file) {
      out.file = flag;
      continue;
    }
    throw new Error(`atmosphere-md: unknown flag "${flag}"`);
  }

  if ((command === 'import' || command === 'validate') && !out.file) {
    throw new Error(`atmosphere-md: "${command}" requires a file path`);
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
      `atmosphere-md: no atmosphere "${id}" (try "list" to see options)\n`,
    );
    return 1;
  }

  const md = serializeAtmosphereMd(theme, { id });

  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md, 'utf8');
    process.stdout.write(`[atmosphere-md] wrote ${outPath}\n`);
  } else {
    process.stdout.write(md);
  }
  return 0;
}

function validateFile(args: CliArgs): number {
  const filePath = path.resolve(process.cwd(), args.file!);
  if (!fs.existsSync(filePath)) {
    process.stderr.write(`atmosphere-md: file not found: ${filePath}\n`);
    return 1;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const result = parseAtmosphereMd(content, filePath);
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
    process.stderr.write(`atmosphere-md: file not found: ${filePath}\n`);
    return 1;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const result = parseAtmosphereMd(content, filePath);
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

function specExport(args: CliArgs): number {
  const md = serializeFrostSpecDocument();
  if (args.out) {
    const outPath = path.resolve(process.cwd(), args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md, 'utf8');
    process.stdout.write(`[atmosphere-md] wrote ${outPath}\n`);
  } else {
    process.stdout.write(md);
  }
  return 0;
}

function specVerify(): number {
  const designMdPath = path.resolve(process.cwd(), 'DESIGN.md');
  if (!fs.existsSync(designMdPath)) {
    process.stderr.write(
      `atmosphere-md: DESIGN.md not found at ${designMdPath}\n` +
        'Regenerate with: npm run atmosphere-md -- spec-export --out DESIGN.md\n',
    );
    return 1;
  }

  const onDisk = fs.readFileSync(designMdPath, 'utf8');
  const expected = serializeFrostSpecDocument();

  if (onDisk === expected) {
    process.stdout.write('ok DESIGN.md matches spec-export output\n');
    return 0;
  }

  process.stderr.write(
    'atmosphere-md: DESIGN.md is out of sync with spec-export output.\n' +
      'Regenerate with: npm run atmosphere-md -- spec-export --out DESIGN.md\n',
  );

  // Emit a small line-level diff so CI logs pinpoint the drift.
  const onDiskLines = onDisk.split('\n');
  const expectedLines = expected.split('\n');
  const max = Math.max(onDiskLines.length, expectedLines.length);
  let reported = 0;
  for (let i = 0; i < max && reported < 10; i++) {
    if (onDiskLines[i] !== expectedLines[i]) {
      process.stderr.write(`  L${i + 1}:\n`);
      process.stderr.write(`    on-disk:  ${onDiskLines[i] ?? '<EOF>'}\n`);
      process.stderr.write(`    expected: ${expectedLines[i] ?? '<EOF>'}\n`);
      reported++;
    }
  }
  return 1;
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
    case 'spec-export':
      return specExport(args);
    case 'spec-verify':
      return specVerify();
  }
}

process.exit(main(process.argv));
