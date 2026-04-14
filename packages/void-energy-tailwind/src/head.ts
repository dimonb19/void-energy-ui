/**
 * @void-energy/tailwind — FOUC prevention head script.
 *
 * Exports a string-literal IIFE that reads the four VE storage keys from
 * localStorage and writes the corresponding data-* attributes on <html>
 * before first paint. Ship it via a framework-specific inline-script
 * injection in <head>:
 *
 *   Next.js   <Script id="ve-fouc" strategy="beforeInteractive">{FOUC_SCRIPT}</Script>
 *   Nuxt      useHead({ script: [{ children: FOUC_SCRIPT, hid: 've-fouc' }] })
 *   Astro     <script is:inline set:html={FOUC_SCRIPT}></script>
 *   Plain     <script>{FOUC_SCRIPT}</script>
 *
 * STORAGE_KEYS is re-exported from runtime so the keys can never drift
 * between the two surfaces.
 */

export { STORAGE_KEYS } from './runtime';
import { STORAGE_KEYS } from './runtime';

/**
 * Inline blocking script that runs synchronously in <head>, before stylesheets
 * render, and pins the four data-* attributes on <html> from localStorage.
 *
 * Why `data-density="default"` is set unconditionally when nothing is stored:
 * tokens.css declares :root { --density: 1 } as the default, but density.css
 * scopes the same declaration to [data-density="default"]. Setting the
 * attribute eliminates a cascade ambiguity when any element further down the
 * tree carries a more specific density attribute.
 */
export const FOUC_SCRIPT = `
(function(){
  try {
    var s = localStorage;
    var r = document.documentElement;
    r.setAttribute('data-atmosphere', s.getItem('${STORAGE_KEYS.atmosphere}') || 'frost');
    r.setAttribute('data-physics',    s.getItem('${STORAGE_KEYS.physics}')    || 'glass');
    r.setAttribute('data-mode',       s.getItem('${STORAGE_KEYS.mode}')       || 'dark');
    r.setAttribute('data-density',    s.getItem('${STORAGE_KEYS.density}')    || 'default');
  } catch(e) {}
})();
`.trim();
