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

// The shape of a theme in the registry (logic only)
export interface ThemeConfig {
  physics: VoidPhysics;
  mode: VoidMode;
}

// The shape of a FULL theme definition (for injection)
export interface RuntimeThemeDefinition extends ThemeConfig {
  palette: Record<string, string>; // The colors (e.g., 'energy-primary': '#f00')
}

// Mutable Registry
type Registry = Record<string, ThemeConfig>;

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

const KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  USER_CONFIG: 'void_user_config',
};

export class VoidEngine {
  public atmosphere: string;
  private observers: Function[]; // Loosened type for easier interop
  private onError?: ErrorHandler;
  public userConfig: {
    fontHeading?: string | null;
    fontBody?: string | null;
    scale: number;
    density: VoidDensity;
  };

  // 1. The Master Registry (Starts with Static, grows with Dynamic)
  private registry: Registry;

  constructor(options?: EngineOptions) {
    this.atmosphere = 'void';
    this.observers = [];
    this.onError = options?.onError;

    // Load the static build-time registry
    this.registry = { ...(THEME_REGISTRY as Registry) };

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

  // --- RUNTIME INJECTION (The Collaborator Feature) ---

  /**
   * Injects a new theme into the engine at runtime.
   * Useful for loading themes from a Backend API or User Upload.
   */
  public injectTheme(name: string, definition: RuntimeThemeDefinition): void {
    if (this.registry[name]) {
      console.warn(`Void Engine: Overwriting existing theme "${name}"`);
    }

    // A. Update Logic Registry
    this.registry[name] = {
      physics: definition.physics,
      mode: definition.mode,
    };

    // B. Generate CSS Variables
    // We map the palette object to CSS Custom Properties
    const cssVars = Object.entries(definition.palette)
      .map(([key, value]) => `--${key}: ${value};`)
      .join('\n');

    const cssRule = `
      [data-atmosphere='${name}'] {
        color-scheme: ${definition.mode};
        ${cssVars}
      }
    `;

    // C. Inject to DOM
    if (typeof document !== 'undefined') {
      let styleTag = document.getElementById('void-dynamic-themes');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'void-dynamic-themes';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent += cssRule;
    }

    // D. Notify Listeners (UI updates list)
    this.notify();
  }

  // --- STORAGE HELPERS ---

  private safeGet(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  private safeSet(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (e) {}
  }

  // --- CORE LIFECYCLE ---

  private init(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const domAtmosphere = root.getAttribute('data-atmosphere');
    const storedAtmosphere = this.safeGet(KEYS.ATMOSPHERE);

    // Resolve Atmosphere using the instance registry
    if (domAtmosphere && this.hasTheme(domAtmosphere)) {
      this.atmosphere = domAtmosphere;
    } else if (storedAtmosphere && this.hasTheme(storedAtmosphere)) {
      this.atmosphere = storedAtmosphere;
      this.syncAttributes();
    } else {
      this.atmosphere = 'void';
      this.syncAttributes();
    }

    const storedConfig = this.safeGet(KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        this.userConfig = { ...this.userConfig, ...parsed };
      } catch (e) {}
    }

    this.render();
  }

  // --- PUBLIC API ---

  public hasTheme(name: string): boolean {
    return !!this.registry[name];
  }

  // Returns the list of valid theme keys (Static + Injected)
  public getAvailableThemes(): string[] {
    return Object.keys(this.registry);
  }

  public setAtmosphere(name: string): void {
    if (!this.registry[name]) {
      const errorMsg = `Void Engine: Atmosphere "${name}" is not registered.`;
      if (this.onError) this.onError(new Error(errorMsg));
      console.error(`${errorMsg} Falling back to 'void'.`);
      name = 'void';
    }

    this.atmosphere = name;
    this.syncAttributes();
    this.safeSet(KEYS.ATMOSPHERE, name);
    this.notify();
  }

  public setPreferences(prefs: Partial<typeof this.userConfig>): void {
    this.userConfig = { ...this.userConfig, ...prefs };
    this.render();
    this.persist();
    this.notify();
  }

  public subscribe(callback: Function): () => void {
    this.observers.push(callback);
    callback(this);
    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  public getConfig(name?: string): ThemeConfig {
    const target = name || this.atmosphere;
    return this.registry[target] || this.registry['void'];
  }

  // --- INTERNAL ENGINE ---

  private notify(): void {
    this.observers.forEach((cb) => cb(this));
  }

  private syncAttributes(): void {
    if (typeof document === 'undefined') return;
    const config = this.registry[this.atmosphere];
    const root = document.documentElement;
    root.setAttribute('data-atmosphere', this.atmosphere);
    root.setAttribute('data-physics', config.physics);
    root.setAttribute('data-mode', config.mode);
  }

  public render(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    const safeScale = Math.min(Math.max(this.userConfig.scale, 0.75), 2);
    root.style.setProperty('--text-scale', safeScale.toString());

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

    applyDensity(root, this.userConfig.density);
  }

  private persist(): void {
    this.safeSet(KEYS.ATMOSPHERE, this.atmosphere);
    this.safeSet(KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }
}
