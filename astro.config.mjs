// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
// import { execSync } from 'node:child_process';

// 🤖 CUSTOM PLUGIN: VOID ENERGY WATCHER
// This connects the Design Tokens directly to the Dev Server.
// const voidEnergyWatcher = () => {
//   return {
//     name: 'void-energy-watcher',
//     // 1. Run immediately when the server starts
//     buildStart() {
//       try {
//         // Use stdio: 'ignore' to keep the console clean, or 'inherit' to see output
//         execSync('npm run build:tokens', { stdio: 'inherit' });
//       } catch (e) {
//         console.error('❌ Void Engine Token Build Failed:', e);
//       }
//     },
//     // 2. Watch for changes in the Design Tokens file
//     handleHotUpdate({ file, server }) {
//       if (file.endsWith('design-tokens.ts')) {
//         console.log('\n🔮 Void Engine: Detected Physics Shift. Re-materializing...');
//         try {
//           // Re-compile the SCSS/JSON
//           execSync('npm run build:tokens', { stdio: 'inherit' });

//           // Force a full reload to ensure CSS variables update everywhere
//           server.ws.send({ type: 'full-reload' });

//           // Return empty array to stop default HMR (we handled it manually)
//           return [];
//         } catch (e) {
//           console.error(e);
//         }
//       }
//     },
//   };
// };

// https://astro.build/config
export default defineConfig({
  integrations: [
    svelte(),
    // This integration automatically loads Tailwind AND Autoprefixer.
    // It also ensures Sass compiles BEFORE Tailwind runs.
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    // plugins: [voidEnergyWatcher()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
});
