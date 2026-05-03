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

var PALETTE_KEYS = [
  'bg-canvas',
  'bg-surface',
  'bg-sunk',
  'bg-spotlight',
  'energy-primary',
  'energy-secondary',
  'border-color',
  'text-main',
  'text-dim',
  'text-mute',
  'color-premium',
  'color-system',
  'color-success',
  'color-error',
  'color-premium-light',
  'color-premium-dark',
  'color-premium-subtle',
  'color-system-light',
  'color-system-dark',
  'color-system-subtle',
  'color-success-light',
  'color-success-dark',
  'color-success-subtle',
  'color-error-light',
  'color-error-dark',
  'color-error-subtle',
  'font-atmos-heading',
  'font-atmos-body',
];

var USER_ROLES = {
  Admin: true,
  Creator: true,
  Player: true,
  Guest: true,
};

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function hasText(value) {
  return typeof value === 'string' && value.length > 0;
}

function parseJSON(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function isMode(value) {
  return value === 'light' || value === 'dark';
}

function isPhysics(value) {
  return value === 'glass' || value === 'flat' || value === 'retro';
}

function sanitizePalette(input, requireAll) {
  if (!isPlainObject(input)) return null;

  var palette = {};

  for (var i = 0; i < PALETTE_KEYS.length; i++) {
    var key = PALETTE_KEYS[i];
    if (!hasText(input[key])) {
      if (requireAll) return null;
      continue;
    }
    palette[key] = input[key];
  }

  return Object.keys(palette).length > 0 ? palette : null;
}

function sanitizeThemeDefinition(input) {
  if (!isPlainObject(input)) return null;
  if (!isMode(input.mode) || !isPhysics(input.physics)) return null;

  var palette = sanitizePalette(input.palette, true);
  if (!palette) return null;

  var sanitized = {
    mode: input.mode,
    physics: input.physics,
    palette: palette,
  };

  if (hasText(input.brand)) sanitized.brand = input.brand;

  return sanitized;
}

export function resolveThemeColor(theme) {
  if (!isPlainObject(theme)) return null;
  return (
    (theme.palette && theme.palette['bg-canvas']) ||
    (hasText(theme.canvas) ? theme.canvas : null)
  );
}

function clearThemeOverrides(root) {
  for (var i = 0; i < PALETTE_KEYS.length; i++) {
    root.style.removeProperty('--' + PALETTE_KEYS[i]);
  }
}

function clearPreferenceOverrides(root) {
  root.style.removeProperty('--text-scale');
  root.style.removeProperty('--density');
  root.style.removeProperty('--user-font-heading');
  root.style.removeProperty('--user-font-body');
}

function persistAtmosphere(storageKey, atmosphere) {
  try {
    localStorage.setItem(storageKey, atmosphere);
  } catch (e) {
    // localStorage unavailable
  }
}

function resolveFallbackTheme(registry, defaults) {
  var fallback = registry && registry[defaults.ATMOSPHERE];
  var sanitized = sanitizeThemeDefinition(fallback);

  if (sanitized) {
    return {
      id: defaults.ATMOSPHERE,
      mode: sanitized.mode,
      physics: sanitized.physics,
      palette: sanitized.palette,
    };
  }

  if (isPlainObject(fallback)) {
    return {
      id: defaults.ATMOSPHERE,
      mode: isMode(fallback.mode) ? fallback.mode : defaults.MODE,
      physics: isPhysics(fallback.physics)
        ? fallback.physics
        : defaults.PHYSICS,
      canvas: hasText(fallback.canvas) ? fallback.canvas : undefined,
    };
  }

  return {
    id: defaults.ATMOSPHERE,
    mode: defaults.MODE,
    physics: defaults.PHYSICS,
  };
}

export function readStoredUserConfig(storageKey) {
  var raw = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (e) {
    return { value: null, invalid: false };
  }

  if (!raw) return { value: null, invalid: false };

  var parsed = parseJSON(raw);
  if (!isPlainObject(parsed)) {
    return { value: null, invalid: true };
  }

  // Pick known keys with lightweight type guards. Bad fields are silently dropped
  // (VoidEngine defaults fill gaps). Full Zod re-validation happens on init().
  var config = {};
  if (typeof parsed.fontHeading === 'string' || parsed.fontHeading === null)
    config.fontHeading = parsed.fontHeading;
  if (typeof parsed.fontBody === 'string' || parsed.fontBody === null)
    config.fontBody = parsed.fontBody;
  if (
    typeof parsed.scale === 'number' &&
    isFinite(parsed.scale) &&
    parsed.scale > 0
  )
    config.scale = parsed.scale;
  if (
    parsed.density === 'high' ||
    parsed.density === 'standard' ||
    parsed.density === 'low'
  )
    config.density = parsed.density;
  if (typeof parsed.adaptAtmosphere === 'boolean')
    config.adaptAtmosphere = parsed.adaptAtmosphere;
  if (typeof parsed.fixedNav === 'boolean') config.fixedNav = parsed.fixedNav;

  return {
    value: Object.keys(config).length > 0 ? config : null,
    invalid: false,
  };
}

export function readCachedTheme(storageKey, themeId) {
  var raw = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (e) {
    return { value: null, invalid: false };
  }

  if (!raw) return { value: null, invalid: false };

  var parsed = parseJSON(raw);
  if (!isPlainObject(parsed)) {
    return { value: null, invalid: true };
  }

  if (!Object.prototype.hasOwnProperty.call(parsed, themeId)) {
    return { value: null, invalid: false };
  }

  var theme = sanitizeThemeDefinition(parsed[themeId]);
  return {
    value: theme,
    invalid: theme === null,
  };
}

export function readStoredUser(storageKey) {
  var raw = null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch (e) {
    return { value: null, invalid: false };
  }

  if (!raw) return { value: null, invalid: false };

  var parsed = parseJSON(raw);
  if (!isPlainObject(parsed)) {
    return { value: null, invalid: true };
  }

  var validUser =
    hasText(parsed.id) &&
    hasText(parsed.name) &&
    hasText(parsed.email) &&
    (parsed.avatar === null || hasText(parsed.avatar)) &&
    USER_ROLES[parsed.role_name] === true &&
    typeof parsed.approved_tester === 'boolean';

  return {
    value: validUser ? parsed : null,
    invalid: !validUser,
  };
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

  // Brand-overlay axis: present only when the atmosphere references a brand
  // profile. Cleared on switch to a brand-less atmosphere so cascade is clean.
  if (theme.brand) {
    root.setAttribute(constants.BRAND, theme.brand);
  } else {
    root.removeAttribute(constants.BRAND);
  }

  // Inject palette overrides for runtime themes.
  if (theme.palette) {
    var keys = Object.keys(theme.palette);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      root.style.setProperty('--' + key, theme.palette[key]);
    }
  }

  // Update <meta name="theme-color"> to match atmosphere canvas.
  // Replace the element rather than mutating its content attribute —
  // iOS Safari otherwise won't repaint the chrome region until a full reload.
  var oldMeta = document.querySelector('meta[name="theme-color"]');
  if (oldMeta) {
    var color = resolveThemeColor(theme);
    if (color) {
      var newMeta = document.createElement('meta');
      newMeta.setAttribute('name', 'theme-color');
      newMeta.setAttribute('content', color);
      oldMeta.replaceWith(newMeta);
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
    var userConfigResult = readStoredUserConfig(storageKeys.USER_CONFIG);
    var userConfig = userConfigResult.value;

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
      var cachedThemeResult = readCachedTheme(
        storageKeys.THEME_CACHE,
        activeId,
      );
      themeData = cachedThemeResult.value;

      if (cachedThemeResult.invalid) {
        console.warn('Void: Cache Error - clearing corrupted cache');
        try {
          localStorage.removeItem(storageKeys.THEME_CACHE);
        } catch (ignored) {}
      }
    }

    // Safety net if no theme is resolved.
    if (!themeData) {
      activeId = defaults.ATMOSPHERE;
      themeData = resolveFallbackTheme(registry, defaults);
      persistAtmosphere(storageKeys.ATMOSPHERE, activeId);
    }

    clearThemeOverrides(root);

    applyTheme(
      root,
      {
        ...themeData,
        id: activeId,
      },
      attrs,
    );

    if (userConfigResult.invalid) {
      console.warn('Void: Config Error - clearing corrupted user config');
      try {
        localStorage.removeItem(storageKeys.USER_CONFIG);
      } catch (ignored) {}
    }

    if (userConfig) {
      clearPreferenceOverrides(root);
      applyPreferences(root, userConfig);
    } else {
      clearPreferenceOverrides(root);
    }

    return activeId;
  } catch (e) {
    console.warn('Void: Hydration Failed', e);
    var root = document.documentElement;

    clearThemeOverrides(root);
    clearPreferenceOverrides(root);
    applyTheme(root, resolveFallbackTheme(registry, defaults), attrs);
    persistAtmosphere(storageKeys.ATMOSPHERE, defaults.ATMOSPHERE);

    return defaults.ATMOSPHERE;
  }
}
