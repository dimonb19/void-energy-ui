// src/stores/theme.svelte.ts

/* ==========================================================================
   THEME STORE (Global State: Atmosphere, Font, Scale)
   ========================================================================== */

const KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  FONT: 'void_user_font',
  SCALE: 'void_text_scale',
};

function createThemeStore() {
  // INTERNAL STATE (Runes)
  // We initialize with 'undefined' first to allow hydration logic to set the real defaults
  let _atmosphere = $state('void');
  let _font = $state('default');
  let _scale = $state(1.0);

  // HYDRATION (Client-Side Only)
  if (typeof window !== 'undefined') {
    // 1. Sync State with what the Bootloader Script already set on the DOM/Storage
    const storedAtmos = localStorage.getItem(KEYS.ATMOSPHERE);
    if (storedAtmos) _atmosphere = storedAtmos;

    const storedFont = localStorage.getItem(KEYS.FONT);
    if (storedFont) _font = storedFont;

    const storedScale = localStorage.getItem(KEYS.SCALE);
    if (storedScale) _scale = parseFloat(storedScale);
  }

  return {
    // --- 1. ATMOSPHERE ---
    get atmosphere() {
      return _atmosphere;
    },
    set atmosphere(value: string) {
      _atmosphere = value;
      if (typeof window !== 'undefined') {
        document.documentElement.setAttribute('data-atmosphere', value);
        localStorage.setItem(KEYS.ATMOSPHERE, value);
      }
    },

    // --- 2. FONT OVERRIDE ---
    get font() {
      return _font;
    },
    set font(value: string) {
      _font = value;
      if (typeof window !== 'undefined') {
        if (value === 'default') {
          document.documentElement.style.removeProperty('--user-font-body');
          localStorage.removeItem(KEYS.FONT);
        } else {
          document.documentElement.style.setProperty('--user-font-body', value);
          localStorage.setItem(KEYS.FONT, value);
        }
      }
    },

    // --- 3. TEXT SCALE ---
    get scale() {
      return _scale;
    },
    set scale(value: number) {
      _scale = value;
      if (typeof window !== 'undefined') {
        document.documentElement.style.setProperty(
          '--text-scale',
          value.toString(),
        );
        localStorage.setItem(KEYS.SCALE, value.toString());
      }
    },
  };
}

export const theme = createThemeStore();
