// ==========================================================================
// 1. PRIMITIVES
// ==========================================================================

/**
 * Physics preset defining material behavior and motion characteristics.
 * - glass: Translucent surfaces with blur, glow effects, smooth easing (modern UI)
 * - flat: Opaque surfaces, sharp borders, minimal motion (accessibility-friendly)
 * - retro: Hard edges, stepped animations, pixelated effects (terminal/CRT aesthetic)
 */
type VoidPhysics = 'glass' | 'flat' | 'retro';

/**
 * Color mode determining palette brightness and contrast.
 * - dark: Low luminance backgrounds, high contrast text (default for glass/retro)
 * - light: High luminance backgrounds, readable in bright environments (default for flat)
 */
type VoidMode = 'light' | 'dark';

/**
 * Spacing density factor affecting whitespace and control sizing.
 * - high (0.75): Compact layout, information-dense interfaces
 * - standard (1.0): Balanced spacing, WCAG-compliant touch targets (default)
 * - low (1.25): Relaxed layout, generous whitespace, accessibility-enhanced
 */
type VoidDensity = 'high' | 'standard' | 'low';

// ==========================================================================
// 2. DESIGN TOKENS
// ==========================================================================

/**
 * Theme palette contract (required tokens for every theme).
 * All values are CSS color strings (hex, rgb, rgba, oklch, etc.).
 *
 * Token hierarchy:
 * 1. CANVAS: Background layers (darkest → lightest)
 * 2. ENERGY: Accent colors for interactive elements
 * 3. STRUCTURE: Borders and dividers
 * 4. SIGNAL: Text hierarchy (most → least prominent)
 * 5. SEMANTIC: Status indicators
 * 6. TYPOGRAPHY: Atmosphere-specific fonts
 *
 * See: design-tokens.ts for theme definitions
 * See: THEME-GUIDE.md for palette design guidelines
 */
interface VoidPalette {
  // CANVAS: Background layers defining depth
  /** Deepest background layer (e.g., #010020 for void, #000000 for onyx) */
  'bg-canvas': string;

  /** Elevated surface layer for cards/modals (semi-transparent for glass physics) */
  'bg-surface': string;

  /** Recessed surface for inputs (carved into the void, z-index negative) */
  'bg-sink': string;

  /** Gradient spotlight overlay (radial-gradient endpoint) */
  'bg-spotlight': string;

  // ENERGY: Accent colors for interactive elements
  /** Primary accent for CTAs, links, focus states (e.g., cyan #33e2e6) */
  'energy-primary': string;

  /** Secondary accent for borders, hover states (e.g., blue #3875fa) */
  'energy-secondary': string;

  // STRUCTURE: Borders and dividers
  /** Universal border color (typically semi-transparent energy-secondary) */
  'border-color': string;

  // SIGNAL: Text hierarchy (descending prominence)
  /** Highest contrast text for headings and primary content */
  'text-main': string;

  /** Medium contrast text for body content (85% opacity) */
  'text-dim': string;

  /** Low contrast text for metadata and placeholders (60% opacity) */
  'text-mute': string;

  // SEMANTIC: Status indicators (base colors)
  /** Premium features, warnings, or gold-tier content (e.g., orange #ff8c00) */
  'color-premium': string;

  /** System messages and informational states (e.g., purple #a078ff) */
  'color-system': string;

  /** Success states and confirmations (e.g., green #00e055) */
  'color-success': string;

  /** Error states and destructive actions (e.g., red #ff3c40) */
  'color-error': string;

  // SEMANTIC: Auto-generated variants (lighter, darker, subtle backgrounds)
  'color-premium-light': string;
  'color-premium-dark': string;
  'color-premium-subtle': string;
  'color-system-light': string;
  'color-system-dark': string;
  'color-system-subtle': string;
  'color-success-light': string;
  'color-success-dark': string;
  'color-success-subtle': string;
  'color-error-light': string;
  'color-error-dark': string;
  'color-error-subtle': string;

  // TYPOGRAPHY: Atmosphere-specific fonts
  /** Font stack for headings (e.g., 'Hanken Grotesk', sans-serif) */
  'font-atmos-heading': string;

  /** Font stack for body text (e.g., 'Inter', sans-serif) */
  'font-atmos-body': string;
}

/**
 * Physics configuration defining motion and visual characteristics.
 * These values are consumed by CSS custom properties and Svelte transitions.
 */
interface VoidPhysicsPrimitive {
  /** Backdrop blur intensity in pixels (0 for flat/retro, 12 for glass) */
  blur: number;

  /** Border thickness in pixels (1px for glass/flat, 2px for retro) */
  borderWidth: number;

  /** Standard transition duration in milliseconds (base motion speed) */
  speedBase: number;

  /** Quick transition duration in milliseconds (micro-interactions) */
  speedFast: number;

  /** Easing for smooth flow transitions (e.g., linear) */
  easeFlow: string;
}

/**
 * Base theme configuration (physics + mode pairing).
 */
interface VoidThemeConfig {
  /** Physics preset determining visual and motion characteristics */
  physics: VoidPhysics;

  /** Color mode (light or dark) */
  mode: VoidMode;
}

/**
 * Complete theme definition with palette and optional metadata.
 * Used to register custom themes at runtime or build-time.
 */
interface VoidThemeDefinition extends VoidThemeConfig {
  /** Internal theme ID (e.g., 'collaborator-v1') */
  id?: string;

  /** Human-readable theme name (e.g., "Brand X") */
  label?: string;

  /** Short mood descriptor (e.g., "Stealth / Cinema") */
  tagline?: string;

  /** Required color and typography tokens (see VoidPalette interface) */
  palette: VoidPalette;

  /** Optional custom fonts to load via @font-face */
  fonts?: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Partial theme definition for registerTheme().
 * Allows providing only the palette keys you want to override.
 * Missing keys are filled from the base theme via Safety Merge.
 */
type PartialThemeDefinition = Partial<Omit<VoidThemeDefinition, 'palette'>> & {
  palette?: Partial<VoidPalette>;
};

/**
 * Runtime theme registry mapping atmosphere names to theme definitions.
 * Keys are atmosphere identifiers (e.g., 'void', 'onyx', 'terminal').
 */
type ThemeRegistry = Record<string, VoidThemeDefinition>;

/**
 * JSON registry structure for static theme configuration.
 * Used when importing void-registry.json before runtime palette generation.
 */
type ThemeRegistryJSON = Record<
  string,
  { physics: VoidPhysics; mode: VoidMode; tagline?: string }
>;

// ==========================================================================
// 2.5 USER CONFIGURATION
// ==========================================================================

/**
 * User preferences for the Void Engine.
 * Persisted to localStorage and applied via applyPreferences().
 */
interface UserConfig {
  /** Custom heading font (null = use theme default) */
  fontHeading: string | null;
  /** Custom body font (null = use theme default) */
  fontBody: string | null;
  /** UI scale multiplier (1 = 100%) */
  scale: number;
  /** Spacing density factor */
  density: VoidDensity;
  /** Allow themes to adapt to story mood */
  adaptAtmosphere: boolean;
}

// ==========================================================================
// 3. COMPONENT: TOASTS
// ==========================================================================

/**
 * Toast notification type determining visual treatment and icon.
 */
type VoidToastType = 'info' | 'success' | 'error' | 'warning' | 'loading';

/**
 * Toast item data structure for the toast queue.
 */
interface VoidToastItem {
  /** Unique identifier for this toast (auto-generated timestamp) */
  id: number;

  /** Message content (HTML string, trusted internal use only) */
  message: string;

  /** Visual type determining color and icon */
  type: VoidToastType;
}

/**
 * Controller returned by toast.loading() for managing a loading toast.
 * Provides methods to update, transition, or close the toast.
 */
interface VoidLoadingToastController {
  /** Unique identifier for this toast */
  readonly id: number;

  /** Update the loading message without changing state */
  update(message: string): void;

  /** Transition to success state with optional message, then auto-dismiss */
  success(message?: string, duration?: number): void;

  /** Transition to error state with optional message, then auto-dismiss */
  error(message?: string, duration?: number): void;

  /** Transition to warning state with optional message, then auto-dismiss */
  warning(message?: string, duration?: number): void;

  /** Close the toast immediately without transition */
  close(): void;
}

/**
 * Message configuration for toast.promise().
 * Supports static strings or dynamic functions for success/error messages.
 */
interface VoidPromiseMessages<T> {
  /** Message shown while promise is pending */
  loading: string;

  /** Message shown on resolve (string or function receiving result) */
  success: string | ((data: T) => string);

  /** Message shown on reject (string or function receiving error) */
  error: string | ((err: unknown) => string);
}

// ==========================================================================
// 4. COMPONENT: TOOLTIPS
// ==========================================================================

/**
 * Tooltip configuration options.
 */
interface VoidTooltipOptions {
  /** Tooltip text content (plain text only, no HTML) */
  content: string;

  /**
   * Tooltip placement relative to trigger element.
   * Inline import keeps this file global (avoids Floating UI dependency in types).
   * See: @floating-ui/dom documentation for valid placements.
   */
  placement?: import('@floating-ui/dom').Placement;
}

// ==========================================================================
// 5. COMPONENT: SWITCHER / SELECT
// ==========================================================================

interface SwitcherOption {
  value: string | number | null;
  label: string;
  icon?: string | import('svelte').Component;
}

interface SwitcherProps {
  options: SwitcherOption[];
  value: string | number | null;
  onchange?: (value: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  class?: string;
}

interface SelectorProps {
  options: SwitcherOption[];
  value?: string | number | null;
  onchange?: (value: string) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  /** Hidden placeholder option text (renders as first option with value={null}) */
  placeholder?: string;
  /** CSS classes applied to the inner <select> element */
  selectClass?: string;
  /** Flex alignment for the wrapper (default: 'center') */
  align?: 'start' | 'center' | 'end';
  /** CSS classes applied to the wrapper div */
  class?: string;
}
