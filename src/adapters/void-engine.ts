/* ==========================================================================
   VOID ENERGY UI ENGINE (Vanilla TypeScript)
   DOM-First Architecture / Deterministic Hydration
   ========================================================================== */

import THEME_REGISTRY from '../config/void-registry.json';
import { VOID_TOKENS } from '../config/design-tokens';

export type VoidPhysics = 'glass' | 'flat' | 'retro';
export type VoidMode = 'light' | 'dark';
export type VoidDensity = 'high' | 'standard' | 'low';
type ErrorHandler = (error: Error) => void;

interface EngineOptions {
  onError?: ErrorHandler;
}

export interface ThemeConfig {
  physics: VoidPhysics;
  mode: VoidMode;
}

type Registry = Record<string, ThemeConfig>;
const REGISTRY = THEME_REGISTRY as Registry;

const DENSITY_FACTORS = VOID_TOKENS.density.factors;

function applyDensity(root: HTMLElement, density: VoidDensity) {
  const factor = DENSITY_FACTORS[density] ?? 1;
  root.style.setProperty('--density', factor.toString());

  // Cleanup legacy individual overrides if present
  const SPACE_KEYS = Object.keys(VOID_TOKENS.density.scale);
  SPACE_KEYS.forEach((token) => {
    root.style.removeProperty(`--space-${token}`);
  });
}

type Listener = (engine: VoidEngine) => void;

interface UserConfig {
  fontHeading?: string | null;
  fontBody?: string | null;
  scale: number;
  density: VoidDensity;
}

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
    // Default safe config
    this.userConfig = {
      fontHeading: null,
      fontBody: null,
      scale: 1,
      density: 'standard',
    };

    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  // --- STORAGE HELPERS ---

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
      console.warn('Void Engine: Storage write failed.', e);
    }
  }

  // --- CORE LIFECYCLE ---

  private init(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. DOM TRUTH (Priority 1)
    // Check if a blocking script or SSR has already set the atmosphere.
    const domAtmosphere = root.getAttribute('data-atmosphere');

    // 2. STORAGE TRUTH (Priority 2)
    const storedAtmosphere = this.safeGet(KEYS.ATMOSPHERE);

    // 3. RESOLVE ATMOSPHERE
    if (domAtmosphere && this.hasTheme(domAtmosphere)) {
      // Trust the DOM. The hydration script won the race.
      this.atmosphere = domAtmosphere;
    } else if (storedAtmosphere && this.hasTheme(storedAtmosphere)) {
      // Fallback to storage if DOM is blank
      this.atmosphere = storedAtmosphere;
      this.syncAttributes(); // Apply it to DOM
    } else {
      // Default to Void
      this.atmosphere = 'void';
      this.syncAttributes();
    }

    // 4. LOAD USER CONFIG (Typography, Density, Scale)
    const storedConfig = this.safeGet(KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        this.userConfig = { ...this.userConfig, ...parsed };
      } catch (e) {
        console.error('Void Engine: Corrupt user config', e);
      }
    }

    // 5. INITIAL RENDER
    // Applies the user config (CSS Vars) to match the resolved atmosphere.
    this.render();
  }

  // --- PUBLIC API ---

  public hasTheme(name: string): boolean {
    return !!REGISTRY[name];
  }

  public setAtmosphere(name: string): void {
    if (!REGISTRY[name]) {
      const errorMsg = `Void Engine: Atmosphere "${name}" is not registered.`;
      if (this.onError) {
        this.onError(new Error(errorMsg));
        return;
      }
      console.error(`${errorMsg} Falling back to 'void'.`);
      name = 'void';
    }

    this.atmosphere = name;

    // Write State
    this.syncAttributes();
    this.safeSet(KEYS.ATMOSPHERE, name);
    this.notify();
  }

  /**
   * Sets preferences for fonts, scale, and density.
   * Trigger: User changes settings in UI.
   */
  public setPreferences(prefs: Partial<UserConfig>): void {
    this.userConfig = { ...this.userConfig, ...prefs };
    this.render();
    this.persist();
    this.notify();
  }

  public subscribe(callback: Listener): () => void {
    this.observers.push(callback);
    // Notify immediately to sync local state
    callback(this);

    // NOTE: Removed `this.render()`.
    // Subscription is now pure and does not force DOM repaints.

    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  public getConfig(name?: string): ThemeConfig {
    const target = name || this.atmosphere;
    return REGISTRY[target] || REGISTRY['void'];
  }

  // --- INTERNAL ENGINE ---

  private notify(): void {
    this.observers.forEach((cb) => cb(this));
  }

  /**
   * Syncs the "Structural" attributes (Atmosphere, Physics, Mode) to the HTML tag.
   */
  private syncAttributes(): void {
    if (typeof document === 'undefined') return;

    const config = REGISTRY[this.atmosphere];
    const root = document.documentElement;

    // Use setAttribute to ensure CSS selectors [data-atmosphere="..."] match
    root.setAttribute('data-atmosphere', this.atmosphere);
    root.setAttribute('data-physics', config.physics);
    root.setAttribute('data-mode', config.mode);
  }

  /**
   * Renders "User Preference" CSS Variables (Scale, Fonts, Density).
   * This is separated from syncAttributes() because it deals with
   * quantitative customization, not qualitative themes.
   */
  public render(): void {
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
    applyDensity(root, this.userConfig.density);
  }

  private persist(): void {
    // We persist both, though atmosphere is usually instant-saved in setAtmosphere
    this.safeSet(KEYS.ATMOSPHERE, this.atmosphere);
    this.safeSet(KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }
}

declare global {
  interface Window {
    Void: VoidEngine;
  }
}
