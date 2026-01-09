// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
// import { execSync } from 'node:child_process';

// 🤖 Optional design-token watcher (disabled).
// const voidEnergyWatcher = () => {
//   return {
//     name: 'void-energy-watcher',
//     // buildStart: compile tokens on dev start.
//     buildStart() {
//       try {
//         execSync('npm run build:tokens', { stdio: 'inherit' });
//       } catch (e) {
//         console.error('❌ Void Engine Token Build Failed:', e);
//       }
//     },
//     // handleHotUpdate: rebuild on design-tokens changes and reload.
//     handleHotUpdate({ file, server }) {
//       if (file.endsWith('design-tokens.ts')) {
//         console.log('\n🔮 Void Engine: Detected Physics Shift. Re-materializing...');
//         try {
//           execSync('npm run build:tokens', { stdio: 'inherit' });

//           server.ws.send({ type: 'full-reload' });

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
    // Loads Tailwind and Autoprefixer; ensures Sass runs first.
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
