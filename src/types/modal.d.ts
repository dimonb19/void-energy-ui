// The exact props required for each modal
type ModalContract = {
  alert: { title: string; body: string };
  confirm: {
    title: string;
    body: string;
    cost?: number;
    onConfirm: () => void;
    onCancel?: () => void;
  };
  settings: {
    initialMusic?: number;
    onSave?: (prefs: any) => void;
  };
};

type ModalKey = keyof ModalContract;
