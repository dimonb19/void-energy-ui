/**
 * Modal props contract defining the data shape for each modal type.
 * This enforces type safety: modal.open<K>(key, props) ensures props match the key.
 *
 * To add a new modal:
 * 1. Add entry here with prop interface
 * 2. Update modal-registry.ts with lazy loader
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

  /** Settings panel modal for user preferences */
  settings: {
    /** Initial music volume (0-100, defaults to stored preference) */
    initialMusic?: number;
    /** Callback fired when user saves preferences */
    onSave?: (prefs: any) => void;
  };
};

/**
 * Union of all valid modal keys.
 * Used in modal manager's type-safe open<K> method.
 */
type ModalKey = keyof ModalContract;
