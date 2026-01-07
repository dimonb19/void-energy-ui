import type { Component } from 'svelte';

// Define the available modal keys
export const MODAL_KEYS = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  SETTINGS: 'settings',
} as const;

// We use an async importer pattern
// ⚠️ Note: Svelte 5 handles promises in snippets gracefully
export const modalRegistry: Record<
  string,
  () => Promise<{ default: Component<any> }>
> = {
  alert: () => import('../components/modals/AlertFragment.svelte'),
  confirm: () => import('../components/modals/ConfirmFragment.svelte'),
  settings: () => import('../components/modals/SettingsFragment.svelte'),
};
