// Core bootloader logic.
// Pure JS. No external dependencies. No TypeScript types in the runtime code.

/**
 * Applies the Atmosphere, Physics, and Mode to the DOM.
 * @param {HTMLElement} root - The document root
 * @param {Object} theme - The theme definition object
 * @param {Object} constants - DOM Attribute keys
 */
export function applyTheme(root, theme, constants) {
  // Apply triad attributes first for CSS to react immediately.
  root.setAttribute(constants.ATMOSPHERE, theme.id);
  root.setAttribute(constants.PHYSICS, theme.physics);
  root.setAttribute(constants.MODE, theme.mode);

  // Inject palette overrides for runtime themes.
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

  // Text scale modifier.
  if (config.scale) {
    root.style.setProperty('--text-scale', config.scale);
  }

  // Density mapping is inline to keep bootloader zero-dependency.
  if (config.density) {
    const densities = { high: 0.75, standard: 1, low: 1.25 };
    root.style.setProperty('--density', densities[config.density] || 1);
  }

  // Heading font override (remove to fall back to theme).
  if (config.fontHeading) {
    root.style.setProperty('--user-font-heading', config.fontHeading);
  } else {
    root.style.removeProperty('--user-font-heading');
  }

  // Body font override (remove to fall back to theme).
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

    // Resolve active atmosphere ID.
    let activeId = localAtmosphere || defaults.ATMOSPHERE;

    // Resolve theme data (registry, then cache).
    let themeData = registry[activeId];

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

    // Safety net if no theme is resolved.
    if (!themeData) {
      activeId = defaults.ATMOSPHERE;
      themeData = registry[defaults.ATMOSPHERE];
    }

    // Attach ID for the apply function.
    themeData.id = activeId;

    applyTheme(root, themeData, attrs);

    if (localConfig) {
      applyPreferences(root, JSON.parse(localConfig));
    }

    return activeId;
  } catch (e) {
    console.warn('Void: Hydration Failed', e);
    // Absolute fail-safe.
    document.documentElement.setAttribute(
      attrs.ATMOSPHERE,
      defaults.ATMOSPHERE,
    );
    return defaults.ATMOSPHERE;
  }
}
