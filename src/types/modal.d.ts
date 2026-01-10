/**
 * Modal props contract defining the data shape for each modal type.
 * This enforces type safety: modal.open<K>(key, props) ensures props match the key.
 *
 * To add a new modal:
 * 1. Add entry here with prop interface
 * 2. Update modal-registry.ts with static import
 * 3. Create component in src/components/modals/
 */
type ModalContract = {
  /** Simple information modal with title and body text */
  alert: {
    title: string;
    body: string;
  };

  /** Confirmation dialog with optional callbacks and cost display */
  confirm: {
    title: string;
    body: string;
    /** Optional numeric cost displayed with currency formatting */
    cost?: number;
    /** Callback fired when user confirms action */
    onConfirm: () => void;
    /** Optional callback fired when user cancels (defaults to simple close) */
    onCancel?: () => void;
  };

  /** Settings panel modal for play options */
  settings: {
    /** Initial settings mode preference */
    initialSettings?: SettingMode;
    /** Initial play mode preference */
    initialPlayMode?: PlayMode;
    /** Initial "don't show again" state */
    initialDontShowAgain?: boolean;
    /** Whether the user is a guest (limits play mode options) */
    isGuest?: boolean;
    /** Callback fired when user saves preferences */
    onSave?: (prefs: SettingsPreferences) => void;
    /** Callback fired when "don't show again" changes */
    onDontShowAgainChange?: (value: boolean) => void;
  };
};

/**
 * Settings mode: use personal profile settings or author's defaults.
 */
type SettingMode = 'personal' | 'default';

/**
 * Play mode: text-only (limited) or with media (unlimited).
 */
type PlayMode = 'play_limited' | 'play_unlimited';

/**
 * User preferences saved from the settings modal.
 */
interface SettingsPreferences {
  settings: SettingMode;
  play_mode: PlayMode;
}

/**
 * Union of all valid modal keys.
 * Used in modal manager's type-safe open<K> method.
 */
type ModalKey = keyof ModalContract;

/**
 * Modal state when a modal is actively open.
 */
interface ModalStateActive<K extends ModalKey> {
  key: K;
  props: ModalContract[K];
  size: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Modal state when no modal is open.
 */
interface ModalStateClosed {
  key: null;
  props: Record<string, never>;
  size: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Union type representing all possible modal states.
 */
type ModalState = ModalStateClosed | ModalStateActive<ModalKey>;

/**
 * Registry mapping modal keys to their components.
 */
type ModalRegistryType = {
  [K in ModalKey]: import('svelte').Component<ModalContract[K]>;
};

/**
 * Generic modal component type for dynamic rendering.
 */
type ModalComponentType = import('svelte').Component<Record<string, unknown>>;
