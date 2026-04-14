# Integrations

How to wire `@void-energy/tailwind` into each major framework. The three moving parts are always:

1. **CSS import** — add `@import '@void-energy/tailwind/theme.css'` after `@import 'tailwindcss'`.
2. **FOUC injection** — inline the `FOUC_SCRIPT` in `<head>` before any stylesheet loads.
3. **Runtime calls** — import from `@void-energy/tailwind/runtime` for atmosphere/physics/density switching.

If you also use the **Consumer Config Layer** (`void.config.ts`) to replace or extend built-in atmospheres, there's one more step:

- **Vite projects**: add the `voidEnergy()` plugin (auto-emits `virtual:void-energy/generated.css` + `virtual:void-energy/manifest.json`).
- **Non-Vite projects**: run `npx void-energy build` (or `build --watch`) alongside your dev server. The CLI writes `void.generated.css` + `void.manifest.json` to `outDir` (default `src/styles`). Import the CSS; `import manifest from './src/styles/void.manifest.json'` and pass to `init({ manifest })`.

See [CONFIG.md](./CONFIG.md) for the schema and [ATMOSPHERES.md](./ATMOSPHERES.md) for the three provenance tiers (builtin / config / runtime).

---

## Vite plugin (recommended for Vite-based apps)

The plugin auto-discovers `void.config.{ts,mts,js,mjs,cjs}` at the project root and emits two virtual modules. HMR is wired automatically — edit the config, the app reloads.

`vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { voidEnergy } from '@void-energy/tailwind/vite';

export default defineConfig({
  plugins: [tailwindcss(), voidEnergy()],
});
```

`app.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import 'virtual:void-energy/generated.css';
```

App entry:

```ts
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';
init({ manifest });
```

**Options:**
- `voidEnergy({ config: './configs/void.prod.ts' })` — explicit config path.
- `plugin.manifest` — SSR-side getter returning the currently-loaded manifest. Useful for Astro's `getStaticPaths` / Nuxt's `useAsyncData` paths that need the manifest at build time without a round trip through the virtual module graph.

---

## Astro

Astro runs on Vite under the hood; the plugin drops in cleanly.

`astro.config.mjs`:

```ts
import { defineConfig } from 'astro/config';
import { voidEnergy } from '@void-energy/tailwind/vite';

export default defineConfig({
  vite: { plugins: [voidEnergy()] },
});
```

FOUC script — inline inside your base layout before any stylesheet:

```astro
---
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
---
<!doctype html>
<html>
  <head>
    <script is:inline set:html={FOUC_SCRIPT}></script>
    <link rel="stylesheet" href="/src/app.css" />
  </head>
  <body><slot /></body>
</html>
```

---

## Next.js (App Router) — CLI watch via `concurrently`

Next.js uses Turbopack or Webpack depending on the version, neither of which runs Vite plugins. The CLI path is the reliable option: run `void-energy build --watch` alongside `next dev` and import the physical output file.

`package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"void-energy build --watch\" \"next dev\"",
    "build": "void-energy build && next build"
  },
  "devDependencies": {
    "@void-energy/tailwind": "...",
    "concurrently": "^9"
  }
}
```

`app/globals.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import '../src/styles/void.generated.css';
```

`app/layout.tsx`:

```tsx
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import manifest from '../src/styles/void.manifest.json';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          id="ve-fouc"
          dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }}
        />
      </head>
      <body>
        <ClientBoot manifest={manifest} />
        {children}
      </body>
    </html>
  );
}
```

`app/client-boot.tsx` (a client component):

```tsx
'use client';
import { useEffect } from 'react';
import { init } from '@void-energy/tailwind/runtime';

export function ClientBoot({ manifest }: { manifest: unknown }) {
  useEffect(() => {
    init({ manifest: manifest as Parameters<typeof init>[0]['manifest'] });
  }, [manifest]);
  return null;
}
```

> **Turbopack note:** The `void.generated.css` + `void.manifest.json` files ship as physical disk I/O from the CLI. HMR works by Turbopack picking up the file writes — the reload cost is a single dev-server refresh per config edit.

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

### Runtime usage in Next.js

Only from client components (`'use client'`):

```tsx
'use client';
import { setAtmosphere } from '@void-energy/tailwind/runtime';
```

The runtime is SSR-safe (no-ops in Node) so importing from a server component is harmless, but there's nothing for it to do there. The `suppressHydrationWarning` on `<html>` in the layout above is load-bearing: the FOUC script writes `data-*` attributes before React hydrates, and React would otherwise complain about the mismatch.

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

## Reactivity — React, Vue, and everything else

The runtime exposes `subscribe(listener)` and `getState()` so non-Svelte frameworks can re-render when atmosphere / physics / mode / density change. Each logical transaction fires the listener exactly once: `setAtmosphere('meridian')` triggers one notification, not three (the internal `setPhysics` + `setMode` calls are batched).

### React (`useSyncExternalStore`)

```tsx
import { useSyncExternalStore } from 'react';
import { subscribe, getState } from '@void-energy/tailwind/runtime';

export function useVoidState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function AtmosphereBadge() {
  const { atmosphere, physics } = useVoidState();
  return <span>{atmosphere} · {physics}</span>;
}
```

`useSyncExternalStore` is the correct primitive here — it handles SSR (the third arg returns the initial state during server render) and avoids the stale-closure issues of a naive `useEffect` + `useState` pair.

### Vue 3

```ts
import { ref, onUnmounted } from 'vue';
import { subscribe, getState, type VoidState } from '@void-energy/tailwind/runtime';

export function useVoidState() {
  const state = ref<VoidState>(getState());
  const off = subscribe((s) => (state.value = s));
  onUnmounted(off);
  return state;
}
```

### Vanilla / anything else

```ts
import { subscribe, getState } from '@void-energy/tailwind/runtime';

const badge = document.querySelector('#atmosphere-badge');
const render = ({ atmosphere }) => (badge.textContent = atmosphere ?? '');
render(getState());
subscribe(render);
```

### Registering a custom atmosphere at runtime

```ts
import {
  registerAtmosphere,
  setAtmosphere,
  getAtmospheres,
  getAtmosphereBySource,
} from '@void-energy/tailwind/runtime';

registerAtmosphere('acme', {
  physics: 'flat',
  mode: 'dark',
  tokens: { /* full token set — see ATMOSPHERES.md */ },
});

// Enumerate for a theme picker — array of { name, source, physics, mode, label? }.
getAtmospheres().map((a) => a.name);
// ['acme', 'frost', 'slate', 'terminal', 'meridian']

// Only show the X button on runtime-added themes.
getAtmosphereBySource('runtime'); // [{ name: 'acme', source: 'runtime', … }]

setAtmosphere('acme');
```

The custom atmosphere persists across reloads via localStorage and is re-injected by the FOUC script before first paint. See [ATMOSPHERES.md](./ATMOSPHERES.md#registering-custom-atmospheres) for the full contract.

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
