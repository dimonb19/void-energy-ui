interface SelectorOption {
  value: string | number | null;
  label: string;
}

interface SwitcherOption {
  value: string | number | null;
  label: string;
  icon?: string | import('svelte').Component;
  disabled?: boolean;
}
