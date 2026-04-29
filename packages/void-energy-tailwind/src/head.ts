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
 *
 * Mode resolution: localStorage retains 'auto' as the user's preference, but
 * the data-mode attribute must be a concrete 'light' or 'dark'. The script
 * resolves 'auto' against matchMedia and then applies physics→mode
 * constraints (glass + retro require dark) so the painted state always
 * matches one of the four valid physics × mode combinations the system
 * assumes. Without this, a stored 'auto' would land as data-mode="auto" and
 * decorative resolvers like AdaptiveImage would mis-key.
 *
 * Custom atmosphere re-injection: if the consumer has registered any custom
 * atmospheres via runtime.registerAtmosphere, their definitions live in the
 * `ve-custom-atmospheres` storage key as JSON. The script re-emits the
 * matching <style id="ve-custom-atmospheres"> tag before first paint so a
 * persisted custom atmosphere does not flash through the built-in palette on
 * reload. Names are validated against /^[a-zA-Z0-9_-]+$/ to prevent selector
 * injection from hostile storage content.
 */
export const FOUC_SCRIPT = `
(function(){
  try {
    var s = localStorage;
    var r = document.documentElement;
    var physics = s.getItem('${STORAGE_KEYS.physics}') || 'glass';
    var modeRaw = s.getItem('${STORAGE_KEYS.mode}') || 'dark';
    var mode = modeRaw;
    if (mode === 'auto') {
      mode = (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }
    if (mode !== 'light' && mode !== 'dark') mode = 'dark';
    if (physics === 'glass' || physics === 'retro') mode = 'dark';
    r.setAttribute('data-atmosphere', s.getItem('${STORAGE_KEYS.atmosphere}') || 'frost');
    r.setAttribute('data-physics',    physics);
    r.setAttribute('data-mode',       mode);
    r.setAttribute('data-density',    s.getItem('${STORAGE_KEYS.density}') || 'default');
    var raw = s.getItem('${STORAGE_KEYS.customAtmospheres}');
    if (raw) {
      var defs = JSON.parse(raw);
      var css = '';
      var pat = /^[a-zA-Z0-9_-]+$/;
      for (var n in defs) {
        if (!Object.prototype.hasOwnProperty.call(defs, n)) continue;
        if (!pat.test(n)) continue;
        var d = defs[n];
        if (!d || !d.tokens) continue;
        css += "[data-atmosphere='" + n + "']{";
        for (var k in d.tokens) {
          if (!Object.prototype.hasOwnProperty.call(d.tokens, k)) continue;
          css += k + ':' + d.tokens[k] + ';';
        }
        css += '}';
      }
      if (css) {
        var el = document.createElement('style');
        el.id = 've-custom-atmospheres';
        el.textContent = css;
        (document.head || document.documentElement).appendChild(el);
      }
    }
  } catch(e) {}
})();
`.trim();
