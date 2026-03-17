interface SidebarItem {
  id: string;
  label: string;
}

interface SidebarSection {
  label?: string;
  items: SidebarItem[];
}

interface TabItem {
  id: string;
  label: string;
  icon?: string | import('svelte').Component;
  disabled?: boolean;
}
