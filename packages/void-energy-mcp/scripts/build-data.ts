/*
 * Build-time data snapshot for @void-energy/mcp.
 *
 * Reads atmosphere definitions from L1 core (../../src/config/atmospheres.ts)
 * and the spec-design-md serializer (../../src/lib/spec-design-md.ts), and
 * writes JSON + markdown into dist/data/. Runtime never reaches into ../../src
 * — see packages/void-energy-mcp/CLAUDE.md (build-time vs runtime split).
 *
 * Outputs:
 *   dist/data/atmospheres.json   { id → AtmosphereSnapshot }
 *   dist/data/design-md/frost.md  Frost spec-export (only atmosphere with
 *                                 spec-compliant DESIGN.md per CLAUDE.md §9).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');

const DIST_DATA = path.join(PKG_ROOT, 'dist', 'data');
const DIST_DESIGN_MD = path.join(DIST_DATA, 'design-md');

async function main() {
  fs.mkdirSync(DIST_DESIGN_MD, { recursive: true });

  const atmospheresMod = await import(
    pathToFileURL(path.join(REPO_ROOT, 'src/config/atmospheres.ts')).href
  );
  const specMod = await import(
    pathToFileURL(path.join(REPO_ROOT, 'src/lib/spec-design-md.ts')).href
  );

  const ATMOSPHERES = atmospheresMod.ATMOSPHERES as Record<
    string,
    {
      mode: 'dark' | 'light';
      physics: 'glass' | 'flat' | 'retro';
      tagline: string;
      palette: Record<string, string>;
    }
  >;

  const snapshot: Record<
    string,
    {
      id: string;
      label: string;
      mode: 'dark' | 'light';
      physics: 'glass' | 'flat' | 'retro';
      tagline: string;
      palette: Record<string, string>;
    }
  > = {};

  for (const [id, def] of Object.entries(ATMOSPHERES)) {
    snapshot[id] = {
      id,
      label: def.tagline,
      mode: def.mode,
      physics: def.physics,
      tagline: def.tagline,
      palette: { ...def.palette },
    };
  }

  fs.writeFileSync(
    path.join(DIST_DATA, 'atmospheres.json'),
    JSON.stringify(snapshot, null, 2) + '\n',
    'utf8',
  );

  const frostMd = (specMod.serializeFrostSpecDocument as () => string)();
  fs.writeFileSync(
    path.join(DIST_DESIGN_MD, 'frost.md'),
    frostMd,
    'utf8',
  );

  process.stdout.write(
    `[void-energy-mcp] wrote ${Object.keys(snapshot).length} atmospheres + frost.md to dist/data/\n`,
  );
}

main().catch((e: unknown) => {
  process.stderr.write(`[void-energy-mcp] build-data failed: ${String(e)}\n`);
  process.exit(1);
});
