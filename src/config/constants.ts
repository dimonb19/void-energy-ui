export const STORAGE_KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  USER_CONFIG: 'void_user_config',
} as const;

export const DOM_ATTRS = {
  ATMOSPHERE: 'data-atmosphere',
  PHYSICS: 'data-physics',
  MODE: 'data-mode',
} as const;

export const DEFAULTS = {
  ATMOSPHERE: 'void',
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
