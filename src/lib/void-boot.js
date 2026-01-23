// Core bootloader logic.
// Pure JS. No external dependencies. No TypeScript types in the runtime code.

/**
 * Resolves the active theme ID from localStorage or OS preference.
 * Pure function with no side effects - just returns the resolved ID.
 *
 * @param {string} storageKey - localStorage key for saved theme
 * @param {Object} defaults - Default theme IDs { ATMOSPHERE, LIGHT_ATMOSPHERE }
 * @returns {string} The resolved theme ID
 */
export function resolveTheme(storageKey, defaults) {
  try {
    var saved = localStorage.getItem(storageKey);
    if (saved) return saved;
  } catch (e) {
    // localStorage unavailable (private browsing, etc.)
  }
  // First visit or no saved preference: detect OS color scheme
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? defaults.ATMOSPHERE : defaults.LIGHT_ATMOSPHERE;
}

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
    var keys = Object.keys(theme.palette);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      root.style.setProperty('--' + key, theme.palette[key]);
    }
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
    var densities = { high: 0.75, standard: 1, low: 1.25 };
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
 *
 * Note: Uses ES5 syntax (var) for render-blocking script compatibility.
 */
export function hydrate(registry, storageKeys, attrs, defaults) {
  try {
    var root = document.documentElement;
    var localConfig = localStorage.getItem(storageKeys.USER_CONFIG);

    // Resolve active atmosphere ID using shared logic.
    var activeId = resolveTheme(storageKeys.ATMOSPHERE, defaults);

    // Persist the resolved theme if not already saved.
    try {
      if (!localStorage.getItem(storageKeys.ATMOSPHERE)) {
        localStorage.setItem(storageKeys.ATMOSPHERE, activeId);
      }
    } catch (e) {
      // localStorage unavailable
    }

    // Resolve theme data (registry, then cache).
    var themeData = registry[activeId];

    if (!themeData) {
      try {
        var cache = JSON.parse(
          localStorage.getItem('void_theme_cache') || '{}',
        );
        themeData = cache[activeId];
      } catch (e) {
        console.warn('Void: Cache Error - clearing corrupted cache', e);
        try {
          localStorage.removeItem('void_theme_cache');
        } catch (ignored) {}
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
