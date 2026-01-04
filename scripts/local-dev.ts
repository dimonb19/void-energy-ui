/**
 * 🛠️ LOCAL DEV WRAPPER
 * Role: Orchestrates the Void Engine + Astro Dev Server
 * Reason: Keeps astro.config.mjs clean
 */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';

// Configuration
const TOKENS_FILE = 'src/config/design-tokens.ts';
const GENERATOR_SCRIPT = 'scripts/generate-tokens.ts';

// Helper: Run the Token Generator
function materializeTokens() {
  try {
    // Run the existing generator script
    spawnSync('npx', ['tsx', GENERATOR_SCRIPT], { stdio: 'inherit', shell: true });
  } catch (error) {
    console.error('❌ Void Engine Failure:', error);
  }
}

// 1. Initial Build (Run once before starting server)
console.log('\n🔮 Void Engine: Initializing...');
materializeTokens();

// 2. Start Astro Dev Server (The main process)
// We inherit stdio so there is Astro's colorful output
const astroProcess = spawn('npx', ['astro', 'dev'], { 
  stdio: 'inherit', 
  shell: true 
});

// 3. Watcher Logic (The "Sidecar")
let debounceTimer: NodeJS.Timeout;
const watcher = fs.watch(TOKENS_FILE, (eventType) => {
  if (eventType === 'change') {
    // Debounce to prevent double-firing on some OSs
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('\n🔮 Void Engine: Detected Shift. Re-materializing...');
      materializeTokens();
    }, 100);
  }
});

// 4. Cleanup on Exit
process.on('SIGINT', () => {
  watcher.close();
  astroProcess.kill();
  process.exit(0);
});