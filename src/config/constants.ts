export const STORAGE_KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  USER_CONFIG: 'void_user_config',
  THEME_CACHE: 'void_theme_cache',
  USER: 'void_user',
} as const;

export const DOM_ATTRS = {
  ATMOSPHERE: 'data-atmosphere',
  PHYSICS: 'data-physics',
  MODE: 'data-mode',
  BRAND: 'data-brand',
} as const;

/**
 * DEFAULT ATMOSPHERE & PHYSICS
 * ----------------------------
 * Change these to set your app's default theme on first visit.
 *
 * ATMOSPHERE must match a key in src/config/atmospheres.ts.
 * LIGHT_ATMOSPHERE is used when the user's OS prefers light mode.
 * PHYSICS must match the physics preset of your default ATMOSPHERE.
 *
 * After changing, also update the SCSS initial-paint default:
 *   src/styles/base/_themes.scss — line ~10 (default physics) and ~17 (default theme)
 */
export const DEFAULTS = {
  ATMOSPHERE: 'frost',
  LIGHT_ATMOSPHERE: 'meridian',
  PHYSICS: 'glass',
  MODE: 'dark',
} as const;

export const UI_MODALS = {
  CONFIRM: 'confirm',
  INPUT: 'input',
  ALERT: 'alert',
} as const;

export const UI_TOASTS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

export const LOADING_WORDS = [
  'Synthesizing\u2026',
  'Calibrating\u2026',
  'Mapping\u2026',
  'Resolving\u2026',
  'Aligning\u2026',
  'Rendering\u2026',
  'Connecting\u2026',
  'Traversing\u2026',
  'Tuning\u2026',
  'Assembling\u2026',
] as const;
