/*
 * 🔮 VOID ENGINE (adapter)
 * Role: Reactive state coordinator; validates inputs and delegates DOM painting
 * to the bootloader kernel.
 */

import THEME_REGISTRY from '../config/void-registry.json';
import { STORAGE_KEYS, DOM_ATTRS, DEFAULTS } from '../config/constants';
import { applyTheme, applyPreferences } from '../lib/void-boot';

interface UserConfig {
  fontHeading: string | null;
  fontBody: string | null;
  scale: number;
  density: 'high' | 'standard' | 'low';
  adaptAtmosphere: boolean; // Allow theme to adapt to story mood
}

// Mode-aware palette fallbacks for incomplete theme definitions.
// Uses SEMANTIC_DARK/SEMANTIC_LIGHT from design-tokens.ts for correct semantic colors.
const FALLBACK_DARK: VoidPalette = {
  // Canvas
  'bg-canvas': '#000000',
  'bg-surface': '#111111',
  'bg-sink': '#000000',
  'bg-spotlight': '#222222',
  // Energy
  'energy-primary': '#ffffff',
  'energy-secondary': '#888888',
  // Structure
  'border-color': '#333333',
  // Signal
  'text-main': '#ffffff',
  'text-dim': '#aaaaaa',
  'text-mute': '#666666',
  // Semantic base colors (from SEMANTIC_DARK)
  'color-premium': '#ff8c00',
  'color-system': '#a078ff',
  'color-success': '#00e055',
  'color-error': '#ff3c40',
  // Semantic variants (from SEMANTIC_DARK)
  'color-premium-light': 'oklch(from #ff8c00 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #ff8c00 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #ff8c00 l c h / 0.15)',
  'color-system-light': 'oklch(from #a078ff calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #a078ff calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #a078ff l c h / 0.15)',
  'color-success-light': 'oklch(from #00e055 calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #00e055 calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #00e055 l c h / 0.15)',
  'color-error-light': 'oklch(from #ff3c40 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #ff3c40 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #ff3c40 l c h / 0.15)',
  // Typography
  'font-atmos-heading': 'sans-serif',
  'font-atmos-body': 'sans-serif',
};

const FALLBACK_LIGHT: VoidPalette = {
  // Canvas (light mode)
  'bg-canvas': '#ffffff',
  'bg-surface': '#f5f5f5',
  'bg-sink': '#e0e0e0',
  'bg-spotlight': '#fafafa',
  // Energy (dark for contrast)
  'energy-primary': '#000000',
  'energy-secondary': '#444444',
  // Structure
  'border-color': '#cccccc',
  // Signal (dark text on light)
  'text-main': '#000000',
  'text-dim': '#333333',
  'text-mute': '#666666',
  // Semantic base colors (from SEMANTIC_LIGHT - deeper for light backgrounds)
  'color-premium': '#b45309',
  'color-system': '#6d28d9',
  'color-success': '#15803d',
  'color-error': '#dc2626',
  // Semantic variants (from SEMANTIC_LIGHT)
  'color-premium-light': 'oklch(from #b45309 calc(l * 1.25) c h)',
  'color-premium-dark': 'oklch(from #b45309 calc(l * 0.75) c h)',
  'color-premium-subtle': 'oklch(from #b45309 l c h / 0.15)',
  'color-system-light': 'oklch(from #6d28d9 calc(l * 1.25) c h)',
  'color-system-dark': 'oklch(from #6d28d9 calc(l * 0.75) c h)',
  'color-system-subtle': 'oklch(from #6d28d9 l c h / 0.15)',
  'color-success-light': 'oklch(from #15803d calc(l * 1.25) c h)',
  'color-success-dark': 'oklch(from #15803d calc(l * 0.75) c h)',
  'color-success-subtle': 'oklch(from #15803d l c h / 0.15)',
  'color-error-light': 'oklch(from #dc2626 calc(l * 1.25) c h)',
  'color-error-dark': 'oklch(from #dc2626 calc(l * 0.75) c h)',
  'color-error-subtle': 'oklch(from #dc2626 l c h / 0.15)',
  // Typography
  'font-atmos-heading': 'sans-serif',
  'font-atmos-body': 'sans-serif',
};

export class VoidEngine {
  // Reactive atmosphere state (source of truth).
  atmosphere = $state<string>(DEFAULTS.ATMOSPHERE);

  // Runtime registry initialized from the build artifacts.
  registry = $state<ThemeRegistry>({
    ...(THEME_REGISTRY as ThemeRegistryJSON as ThemeRegistry),
  });

  userConfig = $state<UserConfig>({
    fontHeading: null,
    fontBody: null,
    scale: 1,
    density: 'standard',
    adaptAtmosphere: true,
  });

  // Temporary theme context (for story themes, previews, or forced contexts).
  // Stores the previous atmosphere to restore when exiting temporary mode.
  private previousAtmosphere = $state<string | null>(null);
  temporaryLabel = $state<string | null>(null);

  // Track built-in themes (from static registry) vs runtime-registered (story themes)
  private builtInThemeIds: Set<string> = new Set(Object.keys(THEME_REGISTRY));

  // Derived theme snapshot for UI consumption.
  currentTheme = $derived(
    this.registry[this.atmosphere] || this.registry[DEFAULTS.ATMOSPHERE],
  );

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
      window.Void = this;
    }
  }

  /**
   * Registers a theme with "Safety Merge" logic.
   * Accepts partial palettes - missing keys are filled from the base theme.
   */
  registerTheme(id: string, definition: PartialThemeDefinition) {
    console.group(`Void: Registering Atmosphere "${id}"`);

    // Enforce physics/mode constraints.
    if (definition.physics === 'glass' && definition.mode === 'light') {
      console.warn(
        `⚠️ Void Violation: Atmosphere "${id}" attempts to use GLASS physics in LIGHT mode. This breaks visibility. Falling back to FLAT physics.`,
      );
      definition.physics = 'flat'; // Force correction
    }

    if (definition.physics === 'retro' && definition.mode === 'light') {
      console.warn(
        `⚠️ Void Violation: RETRO physics requires Dark mode for contrast. Forcing Dark mode.`,
      );
      definition.mode = 'dark'; // Force correction
    }

    // Determine mode first (for fallback selection)
    const targetMode = definition.mode || 'dark';

    // Select mode-appropriate fallback palette
    const fallbackPalette =
      targetMode === 'light' ? FALLBACK_LIGHT : FALLBACK_DARK;

    // Build a complete base theme as a safety net.
    const registryEntry = this.registry[DEFAULTS.ATMOSPHERE];

    const baseTheme: VoidThemeDefinition = {
      id: DEFAULTS.ATMOSPHERE,
      mode: registryEntry?.mode ?? 'dark',
      physics: registryEntry?.physics ?? 'glass',
      palette: registryEntry?.palette ?? fallbackPalette,
      fonts: [],
    };

    // Merge partial overrides on top of the base.
    const safeTheme: VoidThemeDefinition = {
      id: id,
      mode: targetMode,
      physics: definition.physics || baseTheme.physics,
      palette: {
        ...fallbackPalette,
        ...(definition.palette || {}),
      },
      fonts: definition.fonts || [],
      tagline: definition.tagline,
    };

    // Commit and persist.
    this.registry[id] = safeTheme;

    // Cache theme to localStorage (non-critical, failures are silently ignored)
    try {
      const cache = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.THEME_CACHE) || '{}',
      );
      cache[id] = safeTheme;
      localStorage.setItem(STORAGE_KEYS.THEME_CACHE, JSON.stringify(cache));
    } catch {
      // Storage full or unavailable - continue without caching
    }

    console.groupEnd();
  }

  async loadExternalTheme(url: string) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.id && data.palette) {
        this.registerTheme(data.id, data);
        this.setAtmosphere(data.id);
        return true;
      }
    } catch (e) {
      console.error('Void: External Theme Load Failed', e);
      return false;
    }
  }

  /**
   * Set atmosphere (user-initiated). Clears any temporary theme context.
   */
  setAtmosphere(name: string) {
    if (!this.registry[name]) {
      console.warn(`Void: Unknown atmosphere "${name}".`);
      return;
    }

    // Clear temporary theme on manual selection (user chose a new theme)
    this.previousAtmosphere = null;
    this.temporaryLabel = null;

    this._applyAtmosphere(name, true);
  }

  /**
   * Internal: Apply atmosphere without clearing temporary context or persisting.
   * Used by temporary theme API to avoid side effects.
   */
  private _applyAtmosphere(name: string, shouldPersist: boolean = false) {
    // Check for View Transitions API support and user preferences
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const supportsViewTransitions =
      typeof document !== 'undefined' && 'startViewTransition' in document;

    // Fallback for unsupported browsers or reduced motion preference
    if (!supportsViewTransitions || prefersReducedMotion) {
      this.atmosphere = name;
      this.syncDOM();
      if (shouldPersist) this.persist();
      return;
    }

    // Use View Transitions API for smooth theme transitions
    document.startViewTransition(() => {
      this.atmosphere = name;
      this.syncDOM();
      if (shouldPersist) this.persist();
    });
  }

  setPreferences(prefs: Partial<UserConfig>) {
    // If disabling adaptAtmosphere while temporary theme is active,
    // restore user's preference BEFORE persisting (avoids View Transition race)
    if (prefs.adaptAtmosphere === false && this.previousAtmosphere) {
      this.atmosphere = this.previousAtmosphere;
      this.previousAtmosphere = null;
      this.temporaryLabel = null;
    }

    this.userConfig = { ...this.userConfig, ...prefs };
    this.syncDOM();
    this.persist();
  }

  private init() {
    const root = document.documentElement;

    // Trust the bootloader paint and sync state from the DOM.
    const domAtmosphere = root.getAttribute(DOM_ATTRS.ATMOSPHERE);

    if (domAtmosphere && this.registry[domAtmosphere]) {
      this.atmosphere = domAtmosphere;
    } else {
      this.atmosphere = DEFAULTS.ATMOSPHERE;
    }

    // Load user prefs into state only.
    const storedConfig = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        this.userConfig = { ...this.userConfig, ...JSON.parse(storedConfig) };
      } catch (e) {
        console.error('Void: Corrupt config - resetting to defaults', e);
        localStorage.removeItem(STORAGE_KEYS.USER_CONFIG);
      }
    }

    // Note: do not call syncDOM() here; ThemeScript already painted the DOM.
  }

  private syncDOM() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Prepare theme data for the bootloader.
    const themeData = {
      ...this.currentTheme,
      id: this.atmosphere,
    };

    // Apply theme via the shared bootloader kernel.
    applyTheme(root, themeData, DOM_ATTRS);

    // Bootloader is additive; engine removes runtime palette when returning to static themes.
    const isStatic = Object.keys(THEME_REGISTRY).includes(this.atmosphere);
    if (isStatic) {
      this.clearPalette(FALLBACK_DARK);
    }

    // Apply user preferences via the shared kernel.
    applyPreferences(root, this.userConfig);
  }

  private clearPalette(palette: Partial<VoidPalette>) {
    const root = document.documentElement;
    Object.keys(palette).forEach((key) => {
      root.style.removeProperty(`--${key}`);
    });
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ATMOSPHERE, this.atmosphere);
    localStorage.setItem(
      STORAGE_KEYS.USER_CONFIG,
      JSON.stringify(this.userConfig),
    );
  }

  get availableAtmospheres() {
    return Object.keys(this.registry);
  }

  /**
   * Returns only built-in themes (excludes runtime-registered story themes).
   * Use this for the theme selector UI.
   */
  get builtInAtmospheres(): string[] {
    return Object.keys(this.registry).filter((id) =>
      this.builtInThemeIds.has(id),
    );
  }

  // ===========================================================================
  // TEMPORARY THEME API
  // ===========================================================================

  /**
   * Check if a temporary theme is currently active.
   */
  get hasTemporaryTheme(): boolean {
    return this.previousAtmosphere !== null;
  }

  /**
   * Get temporary theme info for UI display.
   */
  get temporaryThemeInfo() {
    if (!this.previousAtmosphere) return null;
    return {
      id: this.atmosphere,
      label: this.temporaryLabel || 'Custom theme',
      returnTo: this.previousAtmosphere,
    };
  }

  /**
   * Apply a temporary theme with save/restore capability.
   * If user manually changes theme while active, temporary context is cleared.
   * Respects `adaptAtmosphere` setting - does nothing if disabled.
   *
   * @param themeId - The theme to apply temporarily
   * @param label - Display label for UI (e.g., "Story theme", "Preview")
   * @returns true if applied, false if blocked by user preference
   */
  applyTemporaryTheme(
    themeId: string,
    label: string = 'Custom theme',
  ): boolean {
    // Respect user preference - don't override if adaptAtmosphere is disabled
    if (!this.userConfig.adaptAtmosphere) {
      return false;
    }

    if (!this.registry[themeId]) {
      console.warn(`Void: Unknown atmosphere "${themeId}"`);
      return false;
    }

    // Only save returnTo if not already in temporary mode
    if (!this.previousAtmosphere) {
      this.previousAtmosphere = this.atmosphere;
    }
    this.temporaryLabel = label;

    this._applyAtmosphere(themeId);
    return true;
  }

  /**
   * Exit temporary theme and restore user's preference.
   */
  restoreUserTheme() {
    if (this.previousAtmosphere) {
      const returnTo = this.previousAtmosphere;
      this.previousAtmosphere = null;
      this.temporaryLabel = null;
      this._applyAtmosphere(returnTo);
    }
  }

  // ===========================================================================
  // BACKWARDS COMPATIBILITY (Story Mode Aliases)
  // ===========================================================================

  /**
   * @deprecated Use `hasTemporaryTheme` instead.
   */
  get isInStoryMode(): boolean {
    return this.hasTemporaryTheme;
  }

  /**
   * @deprecated Use `applyTemporaryTheme(themeId, 'Story theme')` instead.
   */
  enterStoryMode(themeId: string | null) {
    if (themeId) this.applyTemporaryTheme(themeId, 'Story theme');
  }

  /**
   * @deprecated Use `restoreUserTheme()` instead.
   */
  exitStoryMode() {
    this.restoreUserTheme();
  }
}

export const voidEngine = new VoidEngine();
