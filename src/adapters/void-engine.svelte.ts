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
}

// Palette fallback for incomplete theme definitions.
const FALLBACK_PALETTE: VoidPalette = {
  'bg-canvas': '#000000',
  'bg-surface': '#111111',
  'bg-sink': '#000000',
  'bg-spotlight': '#222222',
  'energy-primary': '#ffffff',
  'energy-secondary': '#888888',
  'border-color': '#333333',
  'text-main': '#ffffff',
  'text-dim': '#aaaaaa',
  'text-mute': '#666666',
  'color-premium': '#ff0000',
  'color-system': '#00ff00',
  'color-success': '#0000ff',
  'color-error': '#ff0000',
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
  });

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
   */
  registerTheme(id: string, definition: Partial<VoidThemeDefinition>) {
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

    // Build a complete base theme as a safety net.
    const registryEntry = this.registry[DEFAULTS.ATMOSPHERE];

    const baseTheme: VoidThemeDefinition = {
      id: DEFAULTS.ATMOSPHERE,
      mode: registryEntry?.mode ?? 'dark',
      physics: registryEntry?.physics ?? 'glass',
      palette: registryEntry?.palette ?? FALLBACK_PALETTE,
      fonts: [],
    };

    // Merge partial overrides on top of the base.
    const safeTheme: VoidThemeDefinition = {
      id: id,
      mode: definition.mode || baseTheme.mode,
      physics: definition.physics || baseTheme.physics,
      palette: {
        ...baseTheme.palette,
        ...(definition.palette || {}),
      },
      fonts: definition.fonts || [],
    };

    // Commit and persist.
    this.registry[id] = safeTheme;

    if (typeof localStorage !== 'undefined') {
      try {
        const cache = JSON.parse(
          localStorage.getItem('void_theme_cache') || '{}',
        );
        cache[id] = safeTheme;
        localStorage.setItem('void_theme_cache', JSON.stringify(cache));
      } catch (e) {
        console.warn('Void: Cache Save Failed - clearing and retrying', e);
        try {
          localStorage.removeItem('void_theme_cache');
          localStorage.setItem(
            'void_theme_cache',
            JSON.stringify({ [id]: safeTheme }),
          );
        } catch {}
      }
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

  setAtmosphere(name: string) {
    if (!this.registry[name]) {
      console.warn(`Void: Unknown atmosphere "${name}".`);
      return;
    }

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
      this.persist();
      return;
    }

    // Use View Transitions API for smooth theme transitions
    document.startViewTransition(() => {
      this.atmosphere = name;
      this.syncDOM();
      this.persist();
    });
  }

  setPreferences(prefs: Partial<UserConfig>) {
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
      this.clearPalette(FALLBACK_PALETTE);
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

  get availableThemes() {
    return Object.keys(this.registry);
  }
}

export const voidEngine = new VoidEngine();
