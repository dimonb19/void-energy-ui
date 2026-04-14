# Fixture A — Vite + plain HTML + Orbitron (Session 9 integration proof)

End-to-end demonstration of the Consumer Config Layer running through a real
Vite build:

- `void.config.ts` declares one config atmosphere (`midnight`) plus Orbitron
  loaded from a Google Fonts CDN URL.
- `vite.config.ts` registers the `voidEnergy()` plugin, which auto-emits the
  two virtual modules (`virtual:void-energy/generated.css`,
  `virtual:void-energy/manifest.json`).
- `index.html` imports Tailwind, the L0 preset, and the virtual CSS.
- `main.js` calls `init({ manifest })`, exercises `setAtmosphere` and
  `registerAtmosphere`, and renders a dumb theme picker that renders the X
  button only when `source === 'runtime'` — the visible proof of the three
  provenance tiers (D-L0.7).

## Running

From this directory:

```bash
npm install
npm run dev
```

Open the URL Vite prints. You should see:

1. Three buttons (`Frost` built-in, `Midnight` config, `User theme` runtime)
   — only `User theme` has an X next to it.
2. A heading rendered in the Orbitron font (CDN-loaded via `@font-face`).
3. Clicking each button switches the atmosphere; Orbitron stays the same
   across all three (proving `fontAssignments` wins the cascade over the
   atmosphere's `--font-heading` declaration — assignment is emitted after
   atmosphere blocks in void.generated.css).

This fixture is not part of `npm test`. It's a manual smoke check.

## Preload recipe (documented only — not auto-emitted by v1)

If you want the font to start downloading as early as possible, add a
preload tag to `<head>` before the stylesheet link:

```html
<link
  rel="preload"
  as="font"
  type="font/woff2"
  href="https://fonts.gstatic.com/s/orbitron/..."
  crossorigin="anonymous"
/>
```

L0 does not auto-emit this — framework-specific, belongs upstream (Next.js
does it via `next/font/google`, Astro has its own recipe).
