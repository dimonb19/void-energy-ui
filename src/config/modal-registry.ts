import AlertFragment from '@components/modals/AlertFragment.svelte';
import CommandPaletteFragment from '@components/modals/CommandPaletteFragment.svelte';
import ConfirmFragment from '@components/modals/ConfirmFragment.svelte';
import SettingsFragment from '@components/modals/SettingsFragment.svelte';
import ShortcutsFragment from '@components/modals/ShortcutsFragment.svelte';
import ThemesFragment from '@components/modals/ThemesFragment.svelte';

// Modal keys.
export const MODAL_KEYS = {
  ALERT: 'alert',
  CONFIRM: 'confirm',
  PALETTE: 'palette',
  SETTINGS: 'settings',
  SHORTCUTS: 'shortcuts',
  THEMES: 'themes',
} as const;

// Static modal registry - components are bundled upfront for instant display.
export const modalRegistry: ModalRegistryType = {
  alert: AlertFragment,
  confirm: ConfirmFragment,
  palette: CommandPaletteFragment,
  settings: SettingsFragment,
  shortcuts: ShortcutsFragment,
  themes: ThemesFragment,
};
