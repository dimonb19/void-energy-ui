// ==========================================================================
// 1. PRIMITIVES & SHARED
// ==========================================================================
type VoidPhysics = 'glass' | 'flat' | 'retro';
type VoidMode = 'light' | 'dark';
type VoidDensity = 'high' | 'standard' | 'low';

// ==========================================================================
// 2. DESIGN TOKENS & PALETTE
// ==========================================================================
// The contract for the color system
interface VoidPalette {
  // CANVAS
  'bg-canvas': string;
  'bg-surface': string;
  'bg-sink': string;
  'bg-spotlight': string;

  // ENERGY
  'energy-primary': string;
  'energy-secondary': string;

  // STRUCTURE
  'border-color': string;

  // SIGNAL
  'text-main': string;
  'text-dim': string;
  'text-mute': string;

  // SEMANTIC
  'color-premium': string;
  'color-system': string;
  'color-success': string;
  'color-error': string;

  // TYPOGRAPHY
  'font-atmos-heading': string;
  'font-atmos-body': string;
}

interface VoidPhysicsPrimitive {
  blur: number; // px
  borderWidth: number; // px
  speedBase: number; // ms
  speedFast: number; // ms
  easeStabilize: string;
  easeSnap: string;
  easeFlow: string;
}

interface VoidThemeConfig {
  physics: VoidPhysics;
  mode: VoidMode;
}

interface VoidThemeDefinition extends VoidThemeConfig {
  id?: string; // Internal ID (e.g., 'collaborator-v1')
  label?: string; // Human readable name (e.g., "Brand X")
  palette: VoidPalette; // Strict palette (must provide all base colors)
  fonts?: Array<{
    name: string;
    url: string;
  }>;
}

// The shape of our Runtime Registry
type ThemeRegistry = Record<string, VoidThemeDefinition>;

// ==========================================================================
// 3. COMPONENT: TOASTS
// ==========================================================================
type VoidToastType = 'info' | 'success' | 'error' | 'warning' | 'loading';

interface VoidToastItem {
  id: number;
  message: string;
  type: VoidToastType;
}

// ==========================================================================
// 4. COMPONENT: MODALS
// ==========================================================================
// ⚠️ Update this list when you add new modals to modal-registry.ts
type VoidModalKey = 'alert' | 'confirm' | 'settings' | 'input';

interface VoidModalOptions {
  size?: 'sm' | 'md' | 'lg' | 'full';
  preventClose?: boolean;
}

// ==========================================================================
// 5. COMPONENT: TOOLTIPS
// ==========================================================================
interface VoidTooltipOptions {
  content: string;
  // Inline import keeps this file global!
  placement?: import('@floating-ui/dom').Placement;
}
