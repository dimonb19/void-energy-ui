# Integrations

How to wire `@void-energy/tailwind` into each major framework. The three moving parts are always:

1. **CSS import** — add `@import '@void-energy/tailwind/theme.css'` after `@import 'tailwindcss'`.
2. **FOUC injection** — inline the `FOUC_SCRIPT` in `<head>` before any stylesheet loads.
3. **Runtime calls** — import from `@void-energy/tailwind/runtime` for atmosphere/physics/density switching.

If you also use the **Consumer Config Layer** (`void.config.ts`) to replace or extend built-in atmospheres, there's one more step:

- **Vite projects**: add the `voidEnergy()` plugin (auto-emits `virtual:void-energy/generated.css` + `virtual:void-energy/manifest.json`).
- **Non-Vite projects**: run `npx void-energy build` (or `build --watch`) alongside your dev server. The CLI writes `void.generated.css` + `void.manifest.json` to `outDir` (default `src/styles`). Import the CSS; `import manifest from './src/styles/void.manifest.json'` and pass to `init({ manifest })`.

See [CONFIG.md](./CONFIG.md) for the schema and [ATMOSPHERES.md](./ATMOSPHERES.md) for the three provenance tiers (builtin / config / runtime).

### Two optional extras

Void Energy L0 is designed to sit **underneath** your existing component library, not replace it. Two opt-in imports cover the most common adoption shapes:

- **Ecosystem bridges** (`@void-energy/tailwind/bridges/shadcn.css`, `.../radix-themes.css`, `.../mantine.css`) — alias a 3rd-party component library's CSS variable contract onto Void Energy tokens, so every component in that library repaints on atmosphere change without any code changes. See [Ecosystem bridges](#ecosystem-bridges).
- **Components bundle** (`@void-energy/tailwind/components.css`) — a precompiled ~18 KB gzipped CSS file with VE physics applied to native HTML (`.btn`, styled `<input>`, styled `<dialog>`, ...). For consumers who don't want to bring a component library at all. See [Components bundle](#components-bundle-optional).

Both are pure CSS — no runtime, no build step, no wrappers. Import or don't.

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

Astro runs on Vite under the hood, so both setup shapes drop in cleanly.

### Minimal — just the built-in atmospheres

`src/layouts/BaseLayout.astro`:

```astro
---
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

### With the Consumer Config Layer — replace built-ins, ship your own fonts

Add the Vite plugin in `astro.config.mjs`:

```ts
import { defineConfig } from 'astro/config';
import { voidEnergy } from '@void-energy/tailwind/vite';

export default defineConfig({
  vite: { plugins: [voidEnergy()] },
});
```

Add the generated virtual module to `globals.css`:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import 'virtual:void-energy/generated.css';
```

Wire the manifest into the runtime from a client script (e.g. `src/boot.ts`, included via `<script>` in your layout):

```ts
import { init } from '@void-energy/tailwind/runtime';
import manifest from 'virtual:void-energy/manifest.json';
init({ manifest });
```

See [CONFIG.md](./CONFIG.md) for the `void.config.ts` schema.

### SSR — render with the user's persisted atmosphere baked in

The FOUC script writes `data-*` on `<html>` before paint, but it runs *client-side* — the HTML the server emits still carries no atmosphere, so search-engine crawlers, social-card scrapers, and slow first paints all see the default. The SSR cookie bridge fixes this: middleware reads the user's atmosphere from a cookie, the layout writes it onto `<html>` during server render, and the client hydrates into the same state with no flash.

**Requires `output: 'server'` or `output: 'hybrid'` in `astro.config.mjs`.** Pure `output: 'static'` runs middleware at build time, not per request, so per-user personalization is impossible — keep the FOUC-only setup above for static sites.

`astro.config.mjs`:

```ts
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'server', // or 'hybrid'
});
```

`src/middleware.ts` — parse the cookie on every request:

```ts
import { defineMiddleware } from 'astro:middleware';
import { readAtmosphereCookie } from '@void-energy/tailwind/ssr';

export const onRequest = defineMiddleware((context, next) => {
  context.locals.atmosphere = readAtmosphereCookie(
    context.request.headers.get('cookie'),
  );
  return next();
});
```

`src/env.d.ts` — type `Astro.locals` so the layout reads it without casts:

```ts
/// <reference types="astro/client" />
import type { AtmosphereCookieState } from '@void-energy/tailwind/ssr';

declare namespace App {
  interface Locals {
    atmosphere: AtmosphereCookieState;
  }
}
```

`src/layouts/BaseLayout.astro` — bind the four `data-*` attrs individually. Astro omits attributes whose value is `undefined`, so unset keys do not emit empty `data-physics=""` strings; the FOUC script fills the gap on the client.

```astro
---
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import '../styles/globals.css';

const { atmosphere, physics, mode, density } = Astro.locals.atmosphere;
---
<!doctype html>
<html
  lang="en"
  data-atmosphere={atmosphere}
  data-physics={physics}
  data-mode={mode}
  data-density={density}
>
  <head>
    <script is:inline set:html={FOUC_SCRIPT}></script>
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Keep the FOUC script alongside SSR.** Three cases the cookie bridge alone does not cover:

1. **First-time visitors.** No cookie exists yet. The server emits no `data-*`; the FOUC script paints the default `frost`/`glass`/`dark`/`default` before stylesheets load.
2. **Legacy users with localStorage but no cookie.** Anyone who used the app before the cookie bridge shipped has only `localStorage` state. Server emits no `data-*`; FOUC restores from localStorage; the next setter call (`setAtmosphere`, `setPhysics`, ...) writes both cookie and localStorage, and subsequent SSR renders see the user's state.
3. **Runtime-registered custom atmospheres.** `registerAtmosphere()` lives in localStorage only — never in the cookie (size + selector-injection concerns). The server reads the *name* from the cookie if set, but cannot inject the custom token block. The FOUC script's `ve-custom-atmospheres` rehydration pass restores the `<style>` tag before paint; the runtime then takes over.

Cookie + FOUC + localStorage are complementary: cookie gives the server the name, FOUC fills any gap and rehydrates custom themes, localStorage remains the client's source of truth. The runtime's dual-write (every `setAtmosphere`/`setPhysics`/`setMode`/`setDensity` writes both cookie and localStorage) keeps them aligned automatically.

> **`renderRootAttributes` alternative.** If you prefer a single string injection — e.g. when wrapping `<html>` from a fragment helper — `renderRootAttributes(state)` returns `data-atmosphere="..." data-physics="..."` with unset keys omitted, ready to drop into a JSX/Astro raw-attribute slot. The four-binding form above is more idiomatic for Astro and is recommended.

> **Atmospheres registered via `void.config.ts` work transparently.** The cookie carries the atmosphere *name* (e.g. `midnight`); the server emits `data-atmosphere="midnight"`; the matching token block ships in `void.generated.css` so the page paints correctly without any client JS. Runtime atmospheres registered via `registerAtmosphere()` need the FOUC rehydration as described above.

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
    <html lang="en" suppressHydrationWarning>
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

> **`suppressHydrationWarning` is load-bearing.** The FOUC script writes `data-*` attributes on `<html>` before React hydrates. Without the prop, React flags the attribute mismatch. This only needs to be set on the root `<html>` element, not anywhere else.

> **Runtime imports are client-only.** Import `setAtmosphere`, `setPhysics`, etc. from inside `'use client'` components. The runtime is SSR-safe (no-ops in Node), so importing from a server component is harmless but useless.

### SSR — render with the user's persisted atmosphere baked in

The FOUC script writes `data-*` on `<html>` before paint, but it runs *client-side* — the HTML Next emits still carries no atmosphere, so search-engine crawlers, social-card scrapers, and slow first paints all see the default. The SSR cookie bridge fixes this: the root layout reads the user's atmosphere from a cookie (server-side) and binds the `data-*` attrs directly on `<html>` during render, so the client hydrates into the right state with no flash.

`app/layout.tsx` — `async` server component awaiting `cookies()`:

```tsx
import { cookies } from 'next/headers';
import { readAtmosphereCookie } from '@void-energy/tailwind/ssr';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import manifest from '../src/styles/void.manifest.json';
import './globals.css';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const { atmosphere, physics, mode, density } = readAtmosphereCookie(
    cookieStore.toString(),
  );
  return (
    <html
      lang="en"
      data-atmosphere={atmosphere}
      data-physics={physics}
      data-mode={mode}
      data-density={density}
      suppressHydrationWarning
    >
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

React omits `data-foo={undefined}`, so when no cookie is set the four `data-*` props collapse cleanly and the FOUC script fills the gap on the client. When the cookie is set, the server-rendered HTML carries the right `data-*` attrs from the start.

> **`cookies()` is async in Next 15+, sync in Next 14 and earlier.** This recipe shows the Next 15 form. On Next 14, drop the `await` and the surrounding `async` — `const cookieStore = cookies();`.

> **Accessing `cookies()` opts the layout into dynamic rendering.** This is the same trade-off Next's auth recipes take and is required for per-user personalization. Pages that don't need atmosphere personalization can still be statically generated by reading the cookie inside route segments rather than the root layout.

> **`suppressHydrationWarning` is load-bearing — both for the FOUC script and for SSR.** The FOUC script writes `data-*` before React hydrates; the runtime's dual-write keeps cookie + localStorage in sync after any setter call, which can produce minor attribute differences between server-render and client-paint when state changes mid-session. Without `suppressHydrationWarning` on `<html>`, React flags every such change as a mismatch.

**Keep the FOUC script alongside SSR.** Three cases the cookie bridge alone does not cover:

1. **First-time visitors.** No cookie exists yet. The server emits `<html lang="en">` with no atmosphere attrs; the FOUC script paints the default `frost`/`glass`/`dark`/`default` before stylesheets load.
2. **Legacy users with localStorage but no cookie.** Anyone who used the app before the cookie bridge shipped has only `localStorage` state. Server emits no `data-*`; FOUC restores from localStorage; the next setter call writes both cookie and localStorage, and subsequent SSR renders see the user's state.
3. **Runtime-registered custom atmospheres.** `registerAtmosphere()` lives in localStorage only — never in the cookie. The server reads the *name* from the cookie if set, but cannot inject the custom token block. The FOUC script's `ve-custom-atmospheres` rehydration restores the `<style>` tag before paint; the runtime then takes over.

The runtime's dual-write (every `setAtmosphere`/`setPhysics`/`setMode`/`setDensity` writes both cookie and localStorage) keeps cookie + localStorage aligned automatically. Once the user has interacted with the app once, every subsequent SSR render sees the right state.

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
        setAtmosphere('graphite');
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

---

## Nuxt 3 / 4

### `nuxt.config.ts` — inject the FOUC script

```ts
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

### Runtime — initialize on client

Create a client-only plugin so the runtime only boots in the browser:

```ts
// plugins/void-energy.client.ts
import { init } from '@void-energy/tailwind/runtime';

export default defineNuxtPlugin(() => {
  init();
});
```

Switching atmospheres works anywhere on the client — e.g. in a composable:

```ts
// composables/useAtmosphere.ts
import { setAtmosphere } from '@void-energy/tailwind/runtime';

export const useAtmosphere = () => ({ setAtmosphere });
```

If you use the Consumer Config Layer, import the manifest and pass it to `init()`:

```ts
import { init } from '@void-energy/tailwind/runtime';
import manifest from '~/styles/void.manifest.json';

export default defineNuxtPlugin(() => {
  init({ manifest });
});
```

---

## SvelteKit

SvelteKit's `app.html` is a static template — it can't `import { FOUC_SCRIPT }` directly. Instead, leave a `%ve-fouc%` placeholder and have `hooks.server.ts` substitute the real `FOUC_SCRIPT` string per render. This keeps a single source of truth for the FOUC contract (matching the Astro and Nuxt recipes above) and avoids the silent drift that catches consumers using runtime atmospheres, custom mode resolution, or the physics→mode constraints.

### `src/app.html`

```html
<!doctype html>
<html lang="en">
  <head>
    %sveltekit.head%
    <script>%ve-fouc%</script>
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

### `src/hooks.server.ts` — inject the real FOUC script

```ts
import type { Handle } from '@sveltejs/kit';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%ve-fouc%', FOUC_SCRIPT),
  });
};
```

This recipe scales: the SSR cookie-bridge section below extends the same hook to also inject `<html>` `data-*` attributes alongside the FOUC script.

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

### SSR — render with the user's persisted atmosphere baked in

The FOUC script above paints the right atmosphere before stylesheets load, but the HTML SvelteKit emits still has no `data-*` attributes — search-engine crawlers, social-card scrapers, and slow first paints all see the default. The SSR cookie bridge fixes this: the same `handle` hook reads the user's atmosphere from a cookie and rewrites `<html>` during server render so the client hydrates into the right state with no flash.

`src/hooks.server.ts` — extend the hook from above to also read the cookie and inject the `<html>` attributes:

```ts
import type { Handle } from '@sveltejs/kit';
import { FOUC_SCRIPT } from '@void-energy/tailwind/head';
import {
  readAtmosphereCookie,
  renderRootAttributes,
} from '@void-energy/tailwind/ssr';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.atmosphere = readAtmosphereCookie(
    event.request.headers.get('cookie'),
  );
  const attrs = renderRootAttributes(event.locals.atmosphere);
  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%ve-attrs%', attrs).replace('%ve-fouc%', FOUC_SCRIPT),
  });
};
```

`src/app.d.ts` — type `App.Locals` so `event.locals.atmosphere` is fully typed downstream:

```ts
import type { AtmosphereCookieState } from '@void-energy/tailwind/ssr';

declare global {
  namespace App {
    interface Locals {
      atmosphere: AtmosphereCookieState;
    }
  }
}

export {};
```

`src/app.html` — add the `%ve-attrs%` placeholder to the existing `<html>` tag. The `%ve-fouc%` placeholder from the basic recipe stays exactly as it was:

```html
<!doctype html>
<html lang="en" %ve-attrs%>
  <head>
    %sveltekit.head%
    <script>%ve-fouc%</script>
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
```

When no cookie is set, `renderRootAttributes` returns `''`, so the `<html lang="en" >` SvelteKit emits has only an extra space before `>` — valid HTML, and the FOUC script fills the four `data-*` attributes before paint. When the cookie is set, the server-rendered HTML carries the right `data-*` attrs from the start, and the FOUC script's `localStorage.getItem(...) || 'frost'` fallback never triggers because the `<html>` tag is already painted correctly by then.

**Why the FOUC script still ships alongside SSR.** Three cases the cookie bridge alone does not cover:

1. **First-time visitors.** No cookie exists yet. The server emits `<html lang="en">` with no atmosphere attrs; the FOUC script paints the default `frost`/`glass`/`dark`/`default` before stylesheets load.
2. **Legacy users with localStorage but no cookie.** Anyone who used the app before the cookie bridge shipped has only `localStorage` state. Server emits no `data-*`; FOUC restores from localStorage; the next setter call writes both cookie and localStorage, and subsequent SSR renders see the user's state.
3. **Runtime-registered custom atmospheres.** `registerAtmosphere()` lives in localStorage only — never in the cookie. The server reads the *name* from the cookie if set, but cannot inject the custom token block. The FOUC script's `ve-custom-atmospheres` rehydration restores the `<style>` tag before paint; the runtime then takes over.

The runtime's dual-write (every `setAtmosphere`/`setPhysics`/`setMode`/`setDensity` writes both cookie and localStorage) keeps cookie + localStorage aligned automatically, so once the user has interacted with the app once, every subsequent SSR render sees the right state.

> **Exposing atmosphere to the layout via `$page.data`.** If you want to read the atmosphere from inside `+layout.svelte` or any route component (rather than only on `<html>`), add a `+layout.server.ts` that returns `{ atmosphere: event.locals.atmosphere }`. The state then flows through SvelteKit's standard data loading and `$page.data.atmosphere` is available client-side.

> **Svelte 5 alternative — `<svelte:html>`.** If you're on Svelte 5 and exposing atmosphere via layout server load (above), you can skip `transformPageChunk` entirely and write `<svelte:html data-atmosphere={data.atmosphere?.atmosphere} data-physics={data.atmosphere?.physics} ... />` from `+layout.svelte`. The `transformPageChunk` form is recommended as the primary recipe because it does the cookie read and HTML rewrite in one place, works with any Svelte version, and avoids piping state through layout data when the only consumer is `<html>`.

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
// ['acme', 'frost', 'graphite', 'terminal', 'meridian']

// Only show the X button on runtime-added themes.
getAtmosphereBySource('runtime'); // [{ name: 'acme', source: 'runtime', … }]

setAtmosphere('acme');
```

The custom atmosphere persists across reloads via localStorage and is re-injected by the FOUC script before first paint. See [ATMOSPHERES.md](./ATMOSPHERES.md#registering-custom-atmospheres) for the full contract.

---

## Ecosystem bridges

Void Energy's tokens are framework-agnostic, but the React ecosystem's component libraries each define their own CSS variable contract. A **bridge** is a one-line CSS import that aliases one of those contracts onto VE tokens — after the import, every component in that library re-themes automatically when `setAtmosphere` runs. No component changes, no wrappers, no forks.

The L0 package ships three pre-built bridges. Each is a pure alias layer: zero new surfaces, no new utility classes, no runtime code. Remove the import and the bridge is gone.

| Bridge | For | File |
|---|---|---|
| `shadcn` | [shadcn/ui](https://ui.shadcn.com) — copies components into your project; reads `--primary`, `--background`, `--card`, ... | `@void-energy/tailwind/bridges/shadcn.css` |
| `radix-themes` | [Radix Themes](https://www.radix-ui.com/themes) — 12-step scale via `--accent-{1..12}`, `--gray-{1..12}` | `@void-energy/tailwind/bridges/radix-themes.css` |
| `mantine` | [Mantine](https://mantine.dev) — `--mantine-color-{name}-{0..9}`, surface/text tokens | `@void-energy/tailwind/bridges/mantine.css` |

### shadcn/ui

```css
/* app.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import '@void-energy/tailwind/bridges/shadcn.css';
```

That's it. Keep using shadcn components unchanged — `<Button>`, `<Card>`, `<Input>`, `<Dialog>`, etc. When you call `setAtmosphere('terminal')`, both your VE surfaces and every shadcn component repaint in one cascade.

**Known edges:**

- Works with shadcn's classic hex palette. If you opted into the newer OKLCH theme, either switch back to hex or extend the bridge yourself.
- `--radius` bridges to `--radius-base`, which collapses to 0 in retro physics — shadcn components also go square-cornered in retro. Almost always desired; document for your team.
- shadcn's `<Dialog>` / `<Sheet>` ship with a `bg-black/80` backdrop that clashes with glass atmospheres. Override in your global CSS if it bothers you.

### Radix Themes

```css
/* app.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import '@radix-ui/themes/styles.css';
@import '@void-energy/tailwind/bridges/radix-themes.css';
```

The bridge must come **after** `@radix-ui/themes/styles.css` — its selectors override Radix's default accent palette.

The 12-step accent scale (`--accent-1` … `--accent-12`) is synthesized from `--energy-primary` at runtime via `color-mix()`. The 12-step `--gray-*` scale is derived from VE's surface + text tokens. Requires a browser with `color-mix()` support (Chrome 111+, Firefox 113+, Safari 16.2+).

Per-component accent overrides (`[data-accent-color="crimson"]`) are not bridged — they keep Radix's built-in palette. If you need a VE atmosphere to drive them, scope the bridge inside your own selector.

### Mantine

```css
/* app.css */
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import '@mantine/core/styles.css';
@import '@void-energy/tailwind/bridges/mantine.css';
```

Set the Mantine primary color to `'void'` in your provider:

```tsx
<MantineProvider theme={{ primaryColor: 'void' }}>
```

The bridge defines `--mantine-color-void-{0..9}` synthesized from `--energy-primary`, plus `--mantine-color-body`, `--mantine-color-text`, `--mantine-color-default`, and the `--mantine-radius-*` scale.

**Dark mode sync.** Mantine reads `[data-mantine-color-scheme]` from `<html>`. VE writes `[data-mode]`. In your app entry, mirror VE's value:

```ts
import { init } from '@void-energy/tailwind/runtime';
init();
new MutationObserver(() => {
  const mode = document.documentElement.getAttribute('data-mode') ?? 'dark';
  document.documentElement.setAttribute('data-mantine-color-scheme', mode);
}).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
```

### Writing a bridge for another library

If your component library reads a CSS variable contract we don't ship a bridge for (Chakra, Ant Design, Park UI, ...), write a 30-line CSS file that aliases its variables to VE tokens. The shadcn bridge at [src/bridges/shadcn.css](./src/bridges/shadcn.css) is a good template — copy it, swap the variable names, done. No PR needed on our end; the bridge lives in your consumer CSS.

---

## Components bundle (optional)

For consumers who want zero-config styled native HTML — `<button>`, `<input>`, `<dialog>` — without installing a component library at all, the L0 package ships a precompiled components bundle:

```css
@import 'tailwindcss';
@import '@void-energy/tailwind/theme.css';
@import '@void-energy/tailwind/components.css';
```

Now bare HTML picks up Void Energy physics:

```html
<button class="btn">Submit</button>
<button class="btn btn-cta">Launch</button>
<input type="text" placeholder="Email" />
<dialog>...</dialog>
```

**What's in the bundle.** 17 component layers, compiled to ~18 KB gzipped: buttons, inputs, fields, toggle, dialogs, toasts, tooltips, dropdown, containers, navigation, chips, badges, anchors, effects, tabs, pagination, stat-card.

**What's not in the bundle.** Anything that needs JS co-authorship to be meaningful — interactive icons (the L1 animated SVG components), kinetic typography, drag-and-drop, command palette, combobox, page sidebar, pull-to-refresh, charts. Those remain L1-only.

**SSOT.** The bundle is compiled from `src/styles/components/**` on the L1 side. Edit there, run `npm run build:tokens`, commit both sources and the regenerated `dist/components.css`. There is no separate L0 styling file to maintain — the compile is one-way.

**Using both.** The components bundle and an ecosystem bridge are orthogonal. A consumer can import both; `.btn` (VE) and `<Button>` (shadcn) coexist without overlap. Pick one per UI primitive, or mix — VE's `.btn` for primary actions, shadcn for complex composites like `<Popover>` or `<DropdownMenu>`.

---

## Tailwind v4 `@source` directive

Tailwind v4 auto-scans `node_modules` imports, so you don't normally need to tell it where to find class references. But if you opt into explicit source declarations (for performance or clarity), add the L0 package to your scan list:

```css
@import 'tailwindcss';
@source '@void-energy/tailwind/dist/**/*.css';
@import '@void-energy/tailwind/theme.css';
```

This is only necessary if you've otherwise disabled auto-scanning. Most projects can skip this.
