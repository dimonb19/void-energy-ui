/**
 * 🕵️ Void scanner for magic pixel usage.
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

// State tracker.
let violationCount = 0;

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

function checkFile(filePath: string, fileName: string) {
  // Skip ignored files.
  if (IGNORE_FILES.some(f => fileName.includes(f))) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip comments and void-ignore.
    if (line.trim().startsWith('//') || line.includes('// void-ignore')) return;

    let match;
    while ((match = PIXEL_REGEX.exec(line)) !== null) {
      const fullValue = match[0];
      const pixelValue = `${match[1]}px`;

      if (!ALLOWED_PIXELS.includes(pixelValue)) {
        violationCount++; 
        
        const relativePath = path.relative(SRC_DIR, filePath);
        console.warn(
          `⚠️  [Magic Number] ${relativePath}:${index + 1} \n` +
          `    Found: "${pixelValue}" -> Use var(--space-md) or var(--radius-lg)`
        );
      }
    }
  });
}

console.log('\n🔮 Void Scanner: Searching for Physics Violations...\n');
scanDirectory(SRC_DIR);

// Final verdict.
if (violationCount === 0) {
  console.log('✨ No Physics Violations Found! The Void is stable.');
  process.exit(0); // Success
} else {
  console.error(`\n💥 Scan failed: ${violationCount} violations found.`);
  process.exit(1); // Failure (Will stop a build pipeline)
}
