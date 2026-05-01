/**
 * 🕵️ Void scanner for common raw pixel-value misses in SCSS/Svelte.
 * Usage: npm run scan
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');

// Allowlist of pixel exceptions.
const ALLOWED_PIXELS = ['0px', '1px', '2px', '3px', '-1px', '-2px', '-3px'];

// Directories to skip entirely (core definitions).
const IGNORE_DIRS = ['abstracts'];

// Ignore list.
const IGNORE_FILES = [
  '_reset.scss',            // base/ - Defines the density vars
  '_typography.scss',       // base/ - Defines the font scales
  '_generated-themes.scss', // config/ - Auto-generated tokens
  'global.scss',            // The "Manual" (docs)
  'void-dna.json',          // Raw JSON data
  'scan-physics.ts'         // This script itself
];

// Strict px matcher.
const PIXEL_REGEX = /:.*?\b(\d+)px\b/g;
const VOID_IGNORE_DIRECTIVE_REGEX = /^\s*\/\/\s*void-ignore\b/;

// Raw <button>/<a> tags carrying a literal `btn-cta` class but missing
// `use:laserAim`. ActionBtn / ThemesBtn auto-attach the action and use
// dynamic `class={className}` bindings, so they don't match this static
// pattern. Escaped doc examples (&lt;button…&gt;) start with `&lt;` and
// are skipped automatically. `.astro` files aren't scanned (Astro can't
// use Svelte directives — those CTAs fall back to the default hover).
// `(?!-)` after `btn-cta` guards against future class names like
// `btn-cta-loud` matching via the regex word boundary.
const CTA_TAG_REGEX =
  /<(button|a)\b[^>]*class\s*=\s*(?:"[^"]*\bbtn-cta\b(?!-)[^"]*"|'[^']*\bbtn-cta\b(?!-)[^']*')[^>]*>/g;

// State tracker.
let hitCount = 0;

function isVoidIgnoreDirectiveLine(line: string) {
  return VOID_IGNORE_DIRECTIVE_REGEX.test(line);
}

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip ignored directories (core definitions).
      if (IGNORE_DIRS.includes(file)) return;
      scanDirectory(fullPath);
    } else if (file.endsWith('.scss') || file.endsWith('.svelte')) {
      checkFile(fullPath, file);
    }
  });
}

function checkLaserAim(filePath: string, content: string) {
  // Only Svelte files can use the action. `.scss` files don't have markup;
  // `.astro` isn't scanned at all.
  if (!filePath.endsWith('.svelte')) return;

  let match;
  while ((match = CTA_TAG_REGEX.exec(content)) !== null) {
    const tag = match[0];
    if (tag.includes('use:laserAim')) continue;

    const lineNumber = content.slice(0, match.index).split('\n').length;
    const relativePath = path.relative(SRC_DIR, filePath);
    hitCount++;
    console.warn(
      `⚠️  [Missing laser-aim] ${relativePath}:${lineNumber}\n` +
      `    Found: <${match[1]} class="...btn-cta..."> without use:laserAim\n` +
      `    Fix: bind use:laserAim (import from '@actions/laser-aim')\n` +
      `    Why: without it, the CTA's hover state fills the comet's transparent gap, hiding the cursor-tracking effect.`
    );
  }
}

function checkFile(filePath: string, fileName: string) {
  // Skip ignored files.
  if (IGNORE_FILES.some(f => fileName.includes(f))) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  checkLaserAim(filePath, content);

  lines.forEach((line, index) => {
    // Skip comments and void-ignore (current line or preceding directive line).
    const prevLine = index > 0 ? lines[index - 1] : '';
    if (
      line.trim().startsWith('//') ||
      line.includes('// void-ignore') ||
      isVoidIgnoreDirectiveLine(prevLine)
    ) {
      return;
    }

    let match;
    while ((match = PIXEL_REGEX.exec(line)) !== null) {
      const fullValue = match[0];
      const pixelValue = `${match[1]}px`;

      if (!ALLOWED_PIXELS.includes(pixelValue)) {
          hitCount++;
        
        const relativePath = path.relative(SRC_DIR, filePath);
        console.warn(
          `⚠️  [Magic Number] ${relativePath}:${index + 1} \n` +
          `    Found: "${pixelValue}" -> Use var(--space-md) or var(--radius-lg)`
        );
      }
    }
  });
}

console.log('\n🔮 Void Scanner: Searching for advisory raw-value hits...\n');
scanDirectory(SRC_DIR);

// Final verdict.
if (hitCount === 0) {
  console.log('✨ No advisory raw-value hits found in scanned SCSS/Svelte files.');
  process.exit(0); // Success
} else {
  console.error(
    `\n💥 Advisory scan found ${hitCount} raw-value hit(s) in scanned SCSS/Svelte files.`,
  );
  process.exit(1); // Failure (Will stop a build pipeline)
}
