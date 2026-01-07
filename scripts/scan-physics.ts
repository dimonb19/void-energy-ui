/**
 * 🕵️ VOID SCANNER
 * Scans for "Illegal Physics" but respects the System Constitution.
 * Usage: npm run scan
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.resolve(__dirname, '../src');

// 1. SAFE LIST (Exceptions)
const ALLOWED_PIXELS = ['0px', '1px', '2px', '3px', '-1px', '-2px', '-3px'];

// 2. THE CONSTITUTION (Ignore these files entirely)
const IGNORE_FILES = [
  '_reset.scss',           // Defines the density vars
  '_typography.scss',      // Defines the font scales
  '_physics-presets.scss', // Defines the border radii
  '_animations.scss',      // Defines the motion laws (requires raw px)
  '_generated-themes.scss',// Auto-generated tokens
  'global.scss',           // The "Manual" (docs)
  'void-dna.json',         // Raw JSON data
  'scan-physics.ts'        // This script itself
];

// 3. REGEX (Strict)
const PIXEL_REGEX = /:.*?\b(\d+)px\b/g;

// 4. STATE TRACKER
let violationCount = 0;

function scanDirectory(dir: string) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.scss') || file.endsWith('.svelte')) {
      checkFile(fullPath, file);
    }
  });
}

function checkFile(filePath: string, fileName: string) {
  // 🛡️ SKIP CONSTITUTION FILES
  if (IGNORE_FILES.some(f => fileName.includes(f))) return;

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 🛡️ SKIP COMMENTS & IGNORES
    if (line.trim().startsWith('//') || line.includes('// void-ignore')) return;

    let match;
    while ((match = PIXEL_REGEX.exec(line)) !== null) {
      const fullValue = match[0];
      const pixelValue = `${match[1]}px`;

      if (!ALLOWED_PIXELS.includes(pixelValue)) {
        // 🚨 RECORD VIOLATION
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

// 5. FINAL VERDICT
if (violationCount === 0) {
  console.log('✨ No Physics Violations Found! The Void is stable.');
  process.exit(0); // Success
} else {
  console.error(`\n💥 Scan failed: ${violationCount} violations found.`);
  process.exit(1); // Failure (Will stop a build pipeline)
}