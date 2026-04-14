# Integrations

How to wire `@void-energy/tailwind` into each major framework. The three moving parts are always:

1. **CSS import** — add `@import '@void-energy/tailwind/theme.css'` after `@import 'tailwindcss'`.
2. **FOUC injection** — inline the `FOUC_SCRIPT` in `<head>` before any stylesheet loads.
3. **Runtime calls** — import from `@void-energy/tailwind/runtime` for atmosphere/physics/density switching.

---

## Plain HTML (no framework)

```html
<!doctype html>
<html lang="en">
  <head>
    <script>
      (function () {
        try {
          var s = localStorage, r = document.documentElement;
          r.setAttribute('data-atmosphere', s.getItem('ve-atmosphere') || 'frost');
          r.setAttribute('data-physics',    s.getItem('ve-physics')    || 'glass');
          r.setAttribute('data-mode',       s.getItem('ve-mode')       || 'dark');
          r.setAttribute('data-density',    s.getItem('ve-density')    || 'default');
        } catch (e) {}
      })();
    </script>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <!-- your content -->
    <script type="module">
      import { setAtmosphere } from 'https://esm.sh/@void-energy/tailwind/runtime';
      document.querySelector('#switch-dark')?.addEventListener('click', () => {
        setAtmosphere('slate');
      });
    </script>
  </body>
</html>
```

`styles.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

---

## Vite + React

### Inject FOUC via `transformIndexHtml` plugin

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
```

### Or inline directly in `index.html`

Simpler but has to be kept in sync with the package's `FOUC_SCRIPT` string if you upgrade:

```html
<script>
  (function(){try{var s=localStorage,r=document.documentElement;
  r.setAttribute('data-atmosphere',s.getItem('ve-atmosphere')||'frost');
  r.setAttribute('data-physics',s.getItem('ve-physics')||'glass');
  r.setAttribute('data-mode',s.getItem('ve-mode')||'dark');
  r.setAttribute('data-density',s.getItem('ve-density')||'default');}catch(e){}})();
</script>
```

### App setup

`src/styles.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

`src/main.tsx`:

```tsx
import { setAtmosphere } from '@void-energy/tailwind/runtime';
import './styles.css';

export function App() {
  return (
    <button onClick={() => setAtmosphere('terminal')}>
      Go retro
    </button>
  );
}
```

See `/tmp/ve-l0-smoke/` in the monorepo's SMOKE-REPORT.md for a working example.

---

## Next.js (App Router)

### FOUC injection in root layout

```tsx
// app/layout.tsx
import Script from 'next/script';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="ve-fouc"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

`suppressHydrationWarning` is load-bearing: the FOUC script writes `data-*` attributes on `<html>` before React hydrates, and React would otherwise complain about the client-server attribute mismatch.

`app/globals.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

### Runtime usage

Only from client components (`'use client'`):

```tsx
'use client';
import { setAtmosphere } from '@void-energy/tailwind/runtime';
```

The runtime is SSR-safe (no-ops in Node) so importing from a server component is harmless, but there's nothing for it to do there.

---

## Nuxt 3 / 4

### `app.vue` or `nuxt.config.ts`

```ts
// nuxt.config.ts
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';

export default defineNuxtConfig({
  app: {
    head: {
      script: [{ children: FOUC_SCRIPT, hid: 've-fouc', tagPosition: 'head' }],
    },
  },
});
```

### CSS

```css
/* assets/css/main.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

---

## Astro

```astro
---
// src/layouts/BaseLayout.astro
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import '../styles/globals.css';
---
<!doctype html>
<html lang="en">
  <head>
    <script is:inline set:html={FOUC_SCRIPT}></script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

`src/styles/globals.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

---

## SvelteKit

### `src/app.html`

```html
<!doctype html>
<html lang="en">
  <head>
    %sveltekit.head%
    <script>
      (function () {
        try {
          var s = localStorage, r = document.documentElement;
          r.setAttribute('data-atmosphere', s.getItem('ve-atmosphere') || 'frost');
          r.setAttribute('data-physics',    s.getItem('ve-physics')    || 'glass');
          r.setAttribute('data-mode',       s.getItem('ve-mode')       || 'dark');
          r.setAttribute('data-density',    s.getItem('ve-density')    || 'default');
        } catch (e) {}
      })();
    </script>
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

SvelteKit's `app.html` is a static template, so the FOUC script has to be inline-literal here (not imported). Keep it in sync with `@void-energy/tailwind/head#FOUC_SCRIPT` on upgrades.

### CSS + runtime

```css
/* src/app.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
```

```svelte
<!-- any component -->
<script lang="ts">
  import { setAtmosphere } from '@void-energy/tailwind/runtime';
</script>

<button onclick={() => setAtmosphere('meridian')}>Meridian</button>
```

---

## shadcn/ui bridge

shadcn components ship with their own CSS variable contract (`--primary`, `--background`, `--foreground`, `--muted`, `--card`, etc.). To make them adopt VE atmospheres, bridge the shadcn variable names to VE tokens in your consumer CSS **after** the theme import:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';

:root {
  /* shadcn → VE bridge. These propagate atmosphere changes into shadcn. */
  --background: var(--bg-canvas);
  --foreground: var(--text-main);
  --card: var(--bg-surface);
  --card-foreground: var(--text-main);
  --popover: var(--bg-surface);
  --popover-foreground: var(--text-main);
  --primary: var(--energy-primary);
  --primary-foreground: var(--text-main);
  --secondary: var(--energy-secondary);
  --secondary-foreground: var(--text-main);
  --muted: var(--bg-sunk);
  --muted-foreground: var(--text-dim);
  --accent: var(--color-premium);
  --accent-foreground: var(--text-main);
  --destructive: var(--color-error);
  --destructive-foreground: var(--text-main);
  --border: var(--border-color);
  --input: var(--border-color);
  --ring: var(--energy-primary);
  --radius: var(--radius-md);
}
```

Now `<Button>`, `<Card>`, `<Input>` etc. from shadcn will re-paint when `setAtmosphere` runs. The bridge is idempotent — VE doesn't care that shadcn reads its tokens, and shadcn doesn't know it's being fed VE values.

**Known edges:**

- shadcn's OKLCH color variables (if you opted into the newer shadcn theme) will not work with VE's hex + rgba values. Either stick to shadcn's hex variant, or convert VE palette to OKLCH in the bridge (rarely worth it).
- shadcn's `--radius` is a single value, but VE's `--radius-base` goes to 0 in retro physics. Bridging `--radius: var(--radius-base)` makes shadcn components also go square-cornered in retro, which is usually what you want.
- The shadcn `<Dialog>` and `<Sheet>` use a semi-transparent backdrop (`bg-black/80`) that clashes with glass atmospheres. Override the backdrop in your global CSS if it bothers you.

---

## Tailwind v4 `@source` directive

Tailwind v4 auto-scans `node_modules` imports, so you don't normally need to tell it where to find class references. But if you opt into explicit source declarations (for performance or clarity), add the L0 package to your scan list:

```css
@import 'tailwindcss';
@source '@void-energy/tailwind/dist/**/*.css';
@import '@void-energy/tailwind/theme.css';
```

This is only necessary if you've otherwise disabled auto-scanning. Most projects can skip this.
