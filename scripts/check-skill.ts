// scripts/check-skill.ts — regenerability + line-count + determinism gates for the
// seven L2 distribution artifacts emitted by scripts/build-skill.ts.
//
// Per plans/phase-1-decisions.md#d11:
//   Rule 1 — build-skill.ts must be deterministic (no LLM calls). Verified by
//            grepping for the determinism comment as the file's first two lines.
//   Rule 2 — SKILL.md body cliff: wc -l ≤ 200 (target ~100). Same cliff applies
//            to .cursor/rules/void-energy.mdc per D10.
//
// Process:
//   1. Run build-skill.ts in-memory; compare each emitted string to the file on
//      disk. Any drift = fail.
//   2. Verify line counts on the two compressed surfaces.
//   3. Verify the determinism comment on lines 1-2 of build-skill.ts.
//   4. Verify the Codex copy is byte-identical to the canonical SKILL.md.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildOutputs, targetPaths, type BuildOutputs } from './build-skill';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SKILL_LINE_CAP = 200;
const CURSOR_LINE_CAP = 200;
const DETERMINISM_COMMENT_LINE_1 = '// DETERMINISTIC TEMPLATING ONLY. NO LLM CALLS.';
const DETERMINISM_COMMENT_LINE_2 = '// See plans/phase-1-decisions.md#d11.';

const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function readFile(p: string): string {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (err) {
    fail(`could not read ${path.relative(ROOT, p)}: ${(err as Error).message}`);
    return '';
  }
}

function countLines(text: string): number {
  if (!text) return 0;
  // Match `wc -l` semantics: count trailing newlines.
  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
}

// --------------------------------------------------------------------------
// 1. Regenerability — re-run the build in-memory, diff against disk
// --------------------------------------------------------------------------

const expected = buildOutputs();
const targets = targetPaths(ROOT);

for (const key of Object.keys(expected) as (keyof BuildOutputs)[]) {
  const target = targets[key];
  const actual = readFile(target);
  if (actual !== expected[key]) {
    const rel = path.relative(ROOT, target);
    fail(
      `${rel} is out of sync with build-skill.ts. Run \`npm run build:skill\` and commit the result.`,
    );
  }
}

// --------------------------------------------------------------------------
// 2. Line-count gates (D11 Rule 2)
// --------------------------------------------------------------------------

const skillMdLines = countLines(expected.skillMd);
if (skillMdLines > SKILL_LINE_CAP) {
  fail(
    `skills/void-skill/SKILL.md is ${skillMdLines} lines (cap ${SKILL_LINE_CAP}). Move overflow into references/ and re-emit.`,
  );
}

const cursorLines = countLines(expected.cursorMdc);
if (cursorLines > CURSOR_LINE_CAP) {
  fail(
    `.cursor/rules/void-energy.mdc is ${cursorLines} lines (cap ${CURSOR_LINE_CAP}). Compress or move overflow.`,
  );
}

// --------------------------------------------------------------------------
// 3. Determinism comment must be intact on lines 1-2 of build-skill.ts
// --------------------------------------------------------------------------

const buildScript = readFile(path.join(__dirname, 'build-skill.ts'));
const buildLines = buildScript.split('\n');
if (buildLines[0]?.trim() !== DETERMINISM_COMMENT_LINE_1) {
  fail(
    `scripts/build-skill.ts line 1 must be exactly "${DETERMINISM_COMMENT_LINE_1}" (found "${buildLines[0]}")`,
  );
}
if (buildLines[1]?.trim() !== DETERMINISM_COMMENT_LINE_2) {
  fail(
    `scripts/build-skill.ts line 2 must be exactly "${DETERMINISM_COMMENT_LINE_2}" (found "${buildLines[1]}")`,
  );
}

// Sanity check: nothing in build-skill.ts should hit the network or invoke a model.
const forbiddenPatterns: { name: string; regex: RegExp }[] = [
  { name: 'fetch(', regex: /\bfetch\s*\(/ },
  { name: 'http.request', regex: /\bhttps?\.request\b/ },
  { name: '@anthropic-ai/sdk', regex: /@anthropic-ai\/sdk/ },
  { name: 'openai', regex: /['"]openai['"]/ },
  { name: 'execSync (cli to llm)', regex: /child_process/ },
];
for (const { name, regex } of forbiddenPatterns) {
  if (regex.test(buildScript)) {
    fail(`scripts/build-skill.ts contains a forbidden pattern: ${name}. The build must be deterministic templating only.`);
  }
}

// --------------------------------------------------------------------------
// 4. Codex copy is byte-identical to canonical SKILL.md
// --------------------------------------------------------------------------

if (expected.skillMd !== expected.codexSkillMd) {
  fail(
    `.agents/skills/void-skill/SKILL.md must be byte-identical to skills/void-skill/SKILL.md (D10 requirement).`,
  );
}

// --------------------------------------------------------------------------
// Done
// --------------------------------------------------------------------------

if (errors.length > 0) {
  console.error('Skill build-pipeline check failed.\n');
  errors.forEach((error, index) => {
    console.error(`${index + 1}. ${error}\n`);
  });
  process.exit(1);
}

console.log(
  `Skill build pipeline OK — 7 artifacts in sync, SKILL.md ${skillMdLines}/${SKILL_LINE_CAP} lines, .cursor/rules/void-energy.mdc ${cursorLines}/${CURSOR_LINE_CAP} lines, determinism comment intact, Codex copy byte-identical.`,
);
