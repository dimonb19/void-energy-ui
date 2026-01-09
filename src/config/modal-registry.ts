// Modal keys.
export const MODAL_KEYS = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  SETTINGS: 'settings',
} as const;

// Lazy-load modal fragments; Svelte 5 resolves promises in snippets.
export const modalRegistry: ModalRegistryType = {
  alert: () => import('../components/modals/AlertFragment.svelte'),
  confirm: () => import('../components/modals/ConfirmFragment.svelte'),
  settings: () => import('../components/modals/SettingsFragment.svelte'),
};
