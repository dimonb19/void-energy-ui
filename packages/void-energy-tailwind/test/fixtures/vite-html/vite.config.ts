import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { voidEnergy } from '@void-energy/tailwind/vite';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';

export default defineConfig({
  plugins: [
    tailwindcss(),
    voidEnergy(),
    {
      name: 've-fouc',
      transformIndexHtml(html) {
        return html.replace(
          '</head>',
          `<script>${FOUC_SCRIPT}</script></head>`,
        );
      },
    },
  ],
});
