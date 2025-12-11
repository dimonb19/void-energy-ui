/* ==========================================================================
   THEME STORE (Global State: Atmosphere, Physics, Mode)
   ========================================================================== */

// 1. THE CONFIGURATION MAP (The Logic Layer)
// This maps every Atmosphere Name to its Physics and Mode.
// In the future, you could import this from a JSON file shared with SCSS.
const THEME_CONFIG: Record<
  string,
  { physics: string; mode: 'light' | 'dark' }
> = {
  // --- CORE THEMES ---
  void: { physics: 'glass', mode: 'dark' },
  onyx: { physics: 'glass', mode: 'dark' },
  overgrowth: { physics: 'glass', mode: 'dark' },
  ember: { physics: 'glass', mode: 'dark' },
  glacier: { physics: 'glass', mode: 'dark' },
  nebula: { physics: 'glass', mode: 'dark' },
  crimson: { physics: 'glass', mode: 'dark' },
  velvet: { physics: 'glass', mode: 'dark' },
  solar: { physics: 'glass', mode: 'dark' },

  // --- EXCEPTIONS ---
  terminal: { physics: 'retro', mode: 'dark' },
  paper: { physics: 'flat', mode: 'light' },
  laboratory: { physics: 'flat', mode: 'light' },
};

const KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  FONT: 'void_user_font',
  SCALE: 'void_text_scale',
};

function createThemeStore() {
  // INTERNAL STATE
  let _atmosphere = $state('void');
  let _font = $state('default');
  let _scale = $state(1.0);

  // HELPER: Apply all attributes to the DOM
  function applyAttributes(atmos: string) {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    const config = THEME_CONFIG[atmos] || THEME_CONFIG['void']; // Fallback

    // 1. Set Main Atmosphere (Color)
    root.setAttribute('data-atmosphere', atmos);

    // 2. Set Physics (Behavior: Glass/Flat/Retro)
    root.setAttribute('data-physics', config.physics);

    // 3. Set Mode (Contrast: Light/Dark)
    root.setAttribute('data-mode', config.mode);
  }

  // HYDRATION (Client-Side Only)
  if (typeof window !== 'undefined') {
    const storedAtmos = localStorage.getItem(KEYS.ATMOSPHERE);
    if (storedAtmos) {
      _atmosphere = storedAtmos;
      // Ensure attributes are correct on load (in case they drifted)
      applyAttributes(_atmosphere);
    }

    const storedFont = localStorage.getItem(KEYS.FONT);
    if (storedFont) _font = storedFont;

    const storedScale = localStorage.getItem(KEYS.SCALE);
    if (storedScale) _scale = parseFloat(storedScale);
  }

  return {
    // --- 1. ATMOSPHERE (Now auto-updates Physics & Mode) ---
    get atmosphere() {
      return _atmosphere;
    },
    set atmosphere(value: string) {
      // Validate input, fallback to void if unknown
      const safeValue = THEME_CONFIG[value] ? value : 'void';

      _atmosphere = safeValue;

      if (typeof window !== 'undefined') {
        applyAttributes(safeValue);
        localStorage.setItem(KEYS.ATMOSPHERE, safeValue);
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

    // --- 4. UTILITY: Get current config (Useful for UI toggles) ---
    get currentConfig() {
      return THEME_CONFIG[_atmosphere] || THEME_CONFIG['void'];
    },
  };
}

export const theme = createThemeStore();
