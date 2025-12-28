/* ==========================================================================
   VOID ENERGY UI ENGINE (Vanilla TypeScript)
   The framework-agnostic logic controller.
   ========================================================================== 

   PURPOSE:
   This class serves as the Single Source of Truth for the UI's state.
   It decouples the "Active Theme" from any specific framework (Svelte, React, etc.),
   allowing the design system to run on the metal of the browser.

   THE TRIAD ARCHITECTURE:
   In this system, users select an "Atmosphere" (e.g., 'terminal'), but the
   Engine automatically derives the Physics and Mode from that choice.
   
   Selection: "terminal"
      │
      └─> 1. Atmosphere: "terminal" (Sets Colors/Fonts via SCSS)
      └─> 2. Physics:    "retro"    (Sets Motion/Borders via Variables)
      └─> 3. Mode:       "dark"     (Sets Contrast/Inversion)

   USAGE:
   1. Initialize: The engine auto-starts in the browser and reads localStorage.
   2. Subscribe: Frameworks (Svelte stores, React hooks) subscribe to changes.
   3. Switch: Call `Void.setAtmosphere('name')` to trigger a global update.

   ========================================================================== */

import THEME_REGISTRY from '../config/void-registry.json';

export type VoidPhysics = 'glass' | 'flat' | 'retro';
export type VoidMode = 'light' | 'dark';
export type VoidDensity = 'high' | 'standard' | 'low';

type ErrorHandler = (error: Error) => void;

interface EngineOptions {
  onError?: ErrorHandler;
}

// --- FIX: Restored Interface ---
export interface ThemeConfig {
  physics: VoidPhysics;
  mode: VoidMode;
}

// Type the registry using the interface
type Registry = Record<string, ThemeConfig>;
const REGISTRY = THEME_REGISTRY as Registry;

// DENSITY MAPS (matches src/styles/config/_user-themes.scss)
const DENSITY_MAPS = {
  high: {
    'space-xs': '0.25rem', // 4px
    'space-sm': '0.5rem', // 8px
    'space-md': '1rem', // 16px
    'space-lg': '1.5rem', // 24px
    'space-xl': '2rem', // 32px
    'space-2xl': '3rem', // 48px
  },
  low: {
    'space-xs': '0.75rem', // 12px
    'space-sm': '1.25rem', // 20px
    'space-md': '2rem', // 32px
    'space-lg': '2.5rem', // 40px
    'space-xl': '4rem', // 64px
    'space-2xl': '5rem', // 80px
  },
  // Standard is handled by removing overrides (CSS fallback)
};

// Listener now receives the whole engine instance,
// allowing access to both Atmosphere AND UserConfig.
type Listener = (engine: VoidEngine) => void;

// Define the User Preference Shape
interface UserConfig {
  fontHeading?: string | null; // null = reset to atmosphere default
  fontBody?: string | null;
  scale: number; // 0.85 to 1.50
  density: VoidDensity; // 'high' | 'standard' | 'low'
}

// Define Storage Keys
const KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  USER_CONFIG: 'void_user_config',
};

export class VoidEngine {
  public atmosphere: string;
  private observers: Listener[];
  private onError?: ErrorHandler;
  public userConfig: UserConfig;

  constructor(options?: EngineOptions) {
    this.atmosphere = 'void';
    this.observers = [];
    this.onError = options?.onError;
    this.userConfig = {
      fontHeading: null,
      fontBody: null,
      scale: 1,
      density: 'standard',
    };

    // Auto-init only in browser environments
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private safeGet(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('Void Engine: Storage access denied.', e);
      return null;
    }
  }

  private safeSet(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (e) {
      // Quota exceeded or access denied - silently fail or log telemetry
      console.warn('Void Engine: Storage write failed.', e);
    }
  }

  private init(): void {
    const stored = this.safeGet(KEYS.ATMOSPHERE);
    if (stored && REGISTRY[stored]) {
      this.setAtmosphere(stored);
    } else {
      // Set attributes even when falling back to the default atmosphere.
      this.setAtmosphere('void');
    }

    // Load User Config
    const storedConfig = this.safeGet(KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        this.userConfig = { ...this.userConfig, ...JSON.parse(storedConfig) };
        this.applyUserConfig(); // Apply immediately
      } catch (e) {
        console.error('Void Engine: Corrupt user config', e);
      }
    }
  }

  // Validation helper used by adapters before attempting a switch.
  public hasTheme(name: string): boolean {
    return !!REGISTRY[name];
  }

  /**
   * Routes an atmosphere selection through the Triad Engine to derive Physics and Mode,
   * update DOM attributes, and propagate notifications.
   */
  public setAtmosphere(name: string): void {
    // Guard against unknown atmospheres before mutating state.
    if (!REGISTRY[name]) {
      const errorMsg = `Void Engine: Atmosphere "${name}" is not registered in REGISTRY.`;

      // Surface to host application if it provided telemetry hooks.
      if (this.onError) {
        this.onError(new Error(errorMsg));
        return; // Stop execution, do not fallback silently
      }

      // Default behavior: Descriptive error + controlled fallback.
      console.error(
        `${errorMsg} Falling back to 'void'. Available themes: ${Object.keys(REGISTRY).join(', ')}`,
      );
      name = 'void';
    }

    // State update
    this.atmosphere = name;
    const config = REGISTRY[name];

    // DOM Updates (The Triad)
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-atmosphere', name);
      root.setAttribute('data-physics', config.physics);
      root.setAttribute('data-mode', config.mode);
    }

    this.safeSet(KEYS.ATMOSPHERE, name);

    // Notify adapters
    this.notify();
  }

  /**
   * Subscribe to changes. Returns an unsubscribe function.
   * Used by adapters to synchronize UI shells on mount.
   */
  public subscribe(callback: Listener): () => void {
    this.observers.push(callback);
    // Fire immediately so components sync on mount.
    // CHANGE 2: Pass 'this' so the subscriber has full context immediately.
    callback(this);

    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    // CHANGE 3: Pass 'this' on updates too.
    this.observers.forEach((cb) => cb(this));
  }

  /**
   * Helper to get the full config of the current (or specific) theme
   */
  public getConfig(name?: string): ThemeConfig {
    const target = name || this.atmosphere;
    // Returns the explicit config or the void default
    return REGISTRY[target] || REGISTRY['void'];
  }

  // Update User Preferences
  public setPreferences(prefs: Partial<UserConfig>): void {
    this.userConfig = { ...this.userConfig, ...prefs };
    this.applyUserConfig();
    this.persist();
    this.notify(); // Tell Svelte/React to update UI
  }

  // Apply logic to the DOM (The "Render" step)
  private applyUserConfig(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // A. Font Scaling
    const safeScale = Math.min(Math.max(this.userConfig.scale, 0.75), 2);
    root.style.setProperty('--text-scale', safeScale.toString());

    // B. Font Overrides
    if (this.userConfig.fontHeading) {
      root.style.setProperty(
        '--user-font-heading',
        this.userConfig.fontHeading,
      );
    } else {
      root.style.removeProperty('--user-font-heading');
    }

    if (this.userConfig.fontBody) {
      root.style.setProperty('--user-font-body', this.userConfig.fontBody);
    } else {
      root.style.removeProperty('--user-font-body');
    }

    // C. Density Maps
    const density = this.userConfig.density;
    if (density === 'standard') {
      // CLEANUP: Remove inline styles so SCSS defaults apply
      Object.keys(DENSITY_MAPS.high).forEach((key) =>
        root.style.removeProperty(`--${key}`),
      );
    } else {
      // INJECT: Apply the specific map (High or Low)
      const map = DENSITY_MAPS[density];
      Object.entries(map).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  }

  private persist(): void {
    this.safeSet(KEYS.ATMOSPHERE, this.atmosphere);
    this.safeSet(KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }
}

// Global declaration for window.Void usage
declare global {
  interface Window {
    Void: VoidEngine;
  }
}

// Create global instance for plain HTML usage
if (typeof window !== 'undefined' && !window.Void) {
  window.Void = new VoidEngine();
}
