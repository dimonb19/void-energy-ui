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
  /** Simple information modal with title and trusted internal rich body text */
  alert: {
    title: string;
    body: string;
  };

  /** Confirmation dialog with optional callbacks and trusted internal rich body text */
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

  /** Display preferences demo modal showcasing form controls */
  settings: {
    initialLayout?: DemoLayout;
    initialNotifications?: DemoNotificationLevel;
    initialRemember?: boolean;
    onSave?: (prefs: DemoPreferences) => void;
    onRememberChange?: (value: boolean) => void;
  };

  /** Atmospheres selector */
  themes: {};

  /** Keyboard shortcuts reference */
  shortcuts: {};

  /** Command palette (Cmd+K) */
  palette: {};
};

type DemoLayout = 'compact' | 'comfortable';

type DemoNotificationLevel = 'all' | 'critical';

interface DemoPreferences {
  layout: DemoLayout;
  notifications: DemoNotificationLevel;
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
