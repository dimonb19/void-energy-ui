/*
 * ==========================================================================
 * 🔮 VOID ENGINE (ADAPTER)
 * ==========================================================================
 * Role: The Reactive Brain.
 * Responsibility: Manages state, validates inputs, and delegates DOM painting
 * to the shared Bootloader kernel.
 * ==========================================================================
 */

import THEME_REGISTRY from '../config/void-registry.json';
import { STORAGE_KEYS, DOM_ATTRS, DEFAULTS } from '../config/constants';
import { applyTheme, applyPreferences } from '../lib/void-boot';

// --- TYPES ---
interface UserConfig {
  fontHeading: string | null;
  fontBody: string | null;
  scale: number;
  density: 'high' | 'standard' | 'low';
}

// 🛡️ SAFETY: A complete palette fallback.
const FALLBACK_PALETTE: VoidPalette = {
  'bg-canvas': '#000000',
  'bg-surface': '#111111',
  'bg-sink': '#000000',
  'bg-spotlight': '#222222',
  'energy-primary': '#ffffff',
  'energy-secondary': '#888888',
  'border-highlight': '#444444',
  'border-shadow': '#222222',
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

// --- THE REACTIVE ENGINE ---
export class VoidEngine {
  // 1. REACTIVE STATE (The Truth)
  atmosphere = $state<string>(DEFAULTS.ATMOSPHERE);

  // Runtime Registry initialized with our static build artifacts
  registry = $state<ThemeRegistry>({ ...(THEME_REGISTRY as any) });

  userConfig = $state<UserConfig>({
    fontHeading: null,
    fontBody: null,
    scale: 1,
    density: 'standard',
  });

  // Derived state for easy UI consumption
  currentTheme = $derived(
    this.registry[this.atmosphere] || this.registry[DEFAULTS.ATMOSPHERE],
  );

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
      window.Void = this;
    }
  }

  // --- ACTIONS ---

  /**
   * Registers a theme with "Safety Merge" logic.
   */
  registerTheme(id: string, definition: Partial<VoidThemeDefinition>) {
    console.group(`Void: Registering Atmosphere "${id}"`);

    // 🛡️ GUARDRAIL: The Law of Physics
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

    // A. THE SAFETY NET
    const registryEntry = this.registry[DEFAULTS.ATMOSPHERE];

    const baseTheme: VoidThemeDefinition = {
      id: DEFAULTS.ATMOSPHERE,
      mode: (registryEntry?.mode as any) || 'dark',
      physics: (registryEntry?.physics as any) || 'glass',
      palette: (registryEntry as any)?.palette || FALLBACK_PALETTE,
      fonts: [],
    };

    // B. THE PARTIAL MERGE
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

    // C. COMMIT & PERSIST
    this.registry[id] = safeTheme;

    if (typeof localStorage !== 'undefined') {
      try {
        const cache = JSON.parse(
          localStorage.getItem('void_theme_cache') || '{}',
        );
        cache[id] = safeTheme;
        localStorage.setItem('void_theme_cache', JSON.stringify(cache));
      } catch (e) {
        console.warn('Void: Cache Save Failed', e);
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
    this.atmosphere = name;
    this.syncDOM();
    this.persist();
  }

  setPreferences(prefs: Partial<UserConfig>) {
    this.userConfig = { ...this.userConfig, ...prefs };
    this.syncDOM();
    this.persist();
  }

  // --- INTERNAL MECHANICS ---

  private init() {
    const root = document.documentElement;

    // 1. TRUST THE BOOTLOADER
    // We do not run hydration logic here. We simply read the
    // DOM state that the Bootloader script already painted.
    const domAtmosphere = root.getAttribute(DOM_ATTRS.ATMOSPHERE);

    // Sync Svelte state to match the DOM
    if (domAtmosphere && this.registry[domAtmosphere]) {
      this.atmosphere = domAtmosphere;
    } else {
      this.atmosphere = DEFAULTS.ATMOSPHERE;
    }

    // 2. Load User Prefs (into State only)
    const storedConfig = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        this.userConfig = { ...this.userConfig, ...JSON.parse(storedConfig) };
      } catch (e) {
        console.error('Void: Corrupt config', e);
      }
    }

    // Note: We do NOT call syncDOM() here.
    // The browser is already painted correctly by ThemeScript.
  }

  private syncDOM() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. PREPARE DATA
    const themeData = {
      ...this.currentTheme,
      id: this.atmosphere,
    };

    // 2. APPLY THEME (Using Shared Kernel)
    // This handles attributes (triad) and dynamic palette injection
    applyTheme(root, themeData, DOM_ATTRS);

    // 3. CLEANUP (Engine Exclusive Logic)
    // The bootloader is additive. The Engine must handle the subtraction.
    // If we switch back to a STATIC theme (CSS-based), we must remove
    // the inline styles so the CSS classes can take over.
    const isStatic = Object.keys(THEME_REGISTRY).includes(this.atmosphere);
    if (isStatic) {
      // We use the fallback keys to know which vars to wipe
      this.clearPalette(FALLBACK_PALETTE);
    }

    // 4. APPLY PREFS (Using Shared Kernel)
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
