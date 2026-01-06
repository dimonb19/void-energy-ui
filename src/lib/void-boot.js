// 核心 BOOTLOADER LOGIC
// Pure JS. No external dependencies. No TypeScript types in the runtime code.

/**
 * Applies the Atmosphere, Physics, and Mode to the DOM.
 * @param {HTMLElement} root - The document root
 * @param {Object} theme - The theme definition object
 * @param {Object} constants - DOM Attribute keys
 */
export function applyTheme(root, theme, constants) {
  // 1. The Triad Attributes
  root.setAttribute(constants.ATMOSPHERE, theme.id);
  root.setAttribute(constants.PHYSICS, theme.physics);
  root.setAttribute(constants.MODE, theme.mode);

  // 2. Dynamic Palette Injection
  // If the theme has a custom palette (runtime theme), paint the vars.
  if (theme.palette) {
    Object.entries(theme.palette).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }
}

/**
 * Applies User Preferences (Scale, Density, Fonts).
 * @param {HTMLElement} root
 * @param {Object} config - User config object
 */
export function applyPreferences(root, config) {
  if (!config) return;

  // Scale
  if (config.scale) {
    root.style.setProperty('--text-scale', config.scale);
  }

  // Density Map (Hardcoded to ensure this runs zero-dependency)
  if (config.density) {
    const densities = { high: 0.75, standard: 1, low: 1.25 };
    root.style.setProperty('--density', densities[config.density] || 1);
  }

  // Font Heading
  if (config.fontHeading) {
    root.style.setProperty('--user-font-heading', config.fontHeading);
  } else {
    // If null/empty, we MUST remove the override so the Theme Layer takes over
    root.style.removeProperty('--user-font-heading');
  }

  // Font Body
  if (config.fontBody) {
    root.style.setProperty('--user-font-body', config.fontBody);
  } else {
    root.style.removeProperty('--user-font-body');
  }
}

/**
 * The Main Hydration Function.
 * Returns the active theme ID so the Engine knows what happened.
 */
export function hydrate(registry, storageKeys, attrs, defaults) {
  try {
    const root = document.documentElement;
    const localAtmosphere = localStorage.getItem(storageKeys.ATMOSPHERE);
    const localConfig = localStorage.getItem(storageKeys.USER_CONFIG);

    // 1. Resolve Active ID
    let activeId = localAtmosphere || defaults.ATMOSPHERE;

    // 2. Resolve Theme Data (Hybrid Lookup)
    let themeData = registry[activeId];

    // Fallback: Check Backpack (Cache)
    if (!themeData) {
      try {
        const cache = JSON.parse(
          localStorage.getItem('void_theme_cache') || '{}',
        );
        themeData = cache[activeId];
      } catch (e) {
        console.warn('Void: Cache Error', e);
      }
    }

    // Safety Net
    if (!themeData) {
      activeId = defaults.ATMOSPHERE;
      themeData = registry[defaults.ATMOSPHERE];
    }

    // Attach ID for the apply function
    themeData.id = activeId;

    // 3. EXECUTE
    applyTheme(root, themeData, attrs);

    if (localConfig) {
      applyPreferences(root, JSON.parse(localConfig));
    }

    return activeId;
  } catch (e) {
    console.warn('Void: Hydration Failed', e);
    // Absolute Fail-Safe
    document.documentElement.setAttribute(
      attrs.ATMOSPHERE,
      defaults.ATMOSPHERE,
    );
    return defaults.ATMOSPHERE;
  }
}
