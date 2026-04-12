// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
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

// ── Output Mode & Adapter ────────────────────────────────────────────────────
// output: 'server' — all pages and API routes render on demand (SSR) by default.
//   This is the simplest mode when the app ships server endpoints like
//   /api/generate-atmosphere (see AI-PIPELINES.md).
//
// The alternative is output: 'static' — pages prerender at build time by default,
//   but individual pages/endpoints can opt into on-demand rendering with
//   `export const prerender = false`. Use this if most of your site is static
//   and only a few routes need server execution.
//
// adapter: vercel() — deployment target for server-rendered routes.
//   Swap for @astrojs/node, @astrojs/cloudflare, etc. for other hosts.
//   Only needed when any route runs on demand (either 'server' mode or
//   'static' mode with prerender=false routes).
// ─────────────────────────────────────────────────────────────────────────────
export default defineConfig({
  output: 'server',
  adapter: vercel(),
  integrations: [svelte()],
  vite: {
    plugins: [tailwindcss()],
    // plugins: [voidEnergyWatcher()],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
      },
    },
  },
  devToolbar: {
    enabled: false,
  },
});
