import AlertFragment from '../components/modals/AlertFragment.svelte';
import ConfirmFragment from '../components/modals/ConfirmFragment.svelte';
import SettingsFragment from '../components/modals/SettingsFragment.svelte';
import ThemesFragment from '../components/modals/ThemesFragment.svelte';

// Modal keys.
export const MODAL_KEYS = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  SETTINGS: 'settings',
  THEMES: 'themes',
} as const;

// Static modal registry - components are bundled upfront for instant display.
export const modalRegistry: ModalRegistryType = {
  alert: AlertFragment,
  confirm: ConfirmFragment,
  settings: SettingsFragment,
  themes: ThemesFragment,
};
