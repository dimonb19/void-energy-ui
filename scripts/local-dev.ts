/**
 * 🛠️ Local dev wrapper for token generation + Astro dev server.
 * Keeps astro.config.mjs clean.
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Configuration.
const TOKENS_FILE = 'src/config/design-tokens.ts';
const GENERATOR_SCRIPT = 'scripts/generate-tokens.ts';

// Run the token generator.
function materializeTokens() {
  try {
    spawnSync('npx', ['tsx', GENERATOR_SCRIPT], { stdio: 'inherit', shell: true });
  } catch (error) {
    console.error('❌ Void Engine Failure:', error);
  }
}

console.log('\n🔮 Void Engine: Initializing...');
materializeTokens();

// Start Astro dev server.
const astroProcess = spawn('npx', ['astro', 'dev'], { 
  stdio: 'inherit', 
  shell: true 
});

// Watch design-tokens changes.
let debounceTimer: NodeJS.Timeout;
const watcher = fs.watch(TOKENS_FILE, (eventType) => {
  if (eventType === 'change') {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n🔮 Void Engine: Detected Shift. Re-materializing...');
      materializeTokens();
    }, 100);
  }
});

// Cleanup on exit.
process.on('SIGINT', () => {
  watcher.close();
  astroProcess.kill();
  process.exit(0);
});
