/* ==========================================================================
   VOID ENERGY UI ENGINE (Vanilla TypeScript)
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

const DENSITY_MAPS = VOID_TOKENS.density;

const SPACE_KEYS: Array<keyof (typeof DENSITY_MAPS)['standard']> = [
  'xs',
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
];

function getDensityFactor(density: VoidDensity): number {
  const standard = DENSITY_MAPS?.standard;
  const target = DENSITY_MAPS?.[density];

  if (!standard || !target) return 1;

  const totalStandard = SPACE_KEYS.reduce((sum, key) => {
    const value = parseFloat(String(standard[key]));
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  const totalTarget = SPACE_KEYS.reduce((sum, key) => {
    const value = parseFloat(String(target[key]));
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);

  if (!totalStandard || !totalTarget) return 1;

  return totalTarget / totalStandard;
}

function applyDensity(root: HTMLElement, density: VoidDensity) {
  const factor = getDensityFactor(density);
  root.style.setProperty('--density', factor.toString());

  // If the map is missing, rely on the calc-based defaults.
  const targetMap = DENSITY_MAPS?.[density];
  const standardMap = DENSITY_MAPS?.standard;
  if (!targetMap || !standardMap) return;

  // Standard falls back to SCSS defaults to avoid stale inline overrides.
  if (density === 'standard') {
    SPACE_KEYS.forEach((token) => {
      root.style.removeProperty(`--space-${token}`);
    });
    return;
  }

  SPACE_KEYS.forEach((token) => {
    const value = targetMap[token];
    if (value) {
      root.style.setProperty(`--space-${token}`, value);
    }
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

  private init(): void {
    const stored = this.safeGet(KEYS.ATMOSPHERE);
    if (stored && REGISTRY[stored]) {
      this.setAtmosphere(stored);
    } else {
      this.setAtmosphere('void');
    }

    // Load User Config
    const storedConfig = this.safeGet(KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        this.userConfig = { ...this.userConfig, ...JSON.parse(storedConfig) };
      } catch (e) {
        console.error('Void Engine: Corrupt user config', e);
      }
    }
    // Apply immediately on boot
    this.render();
  }

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
    const config = REGISTRY[name];

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-atmosphere', name);
      root.setAttribute('data-physics', config.physics);
      root.setAttribute('data-mode', config.mode);
    }

    this.safeSet(KEYS.ATMOSPHERE, name);
    this.notify();
  }

  public subscribe(callback: Listener): () => void {
    this.observers.push(callback);
    // Notify immediately so component state syncs
    callback(this);
    // FORCE RENDER: Ensures DOM is in sync even if Hydration wiped attributes
    this.render();

    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    this.observers.forEach((cb) => cb(this));
  }

  public getConfig(name?: string): ThemeConfig {
    const target = name || this.atmosphere;
    return REGISTRY[target] || REGISTRY['void'];
  }

  public setPreferences(prefs: Partial<UserConfig>): void {
    this.userConfig = { ...this.userConfig, ...prefs };
    this.render();
    this.persist();
    this.notify();
  }

  // --- RENAMED: applyUserConfig -> render (Public) ---
  // Publicly exposed so adapters can force a repaint if the DOM is reset
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
    this.safeSet(KEYS.ATMOSPHERE, this.atmosphere);
    this.safeSet(KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }
}

declare global {
  interface Window {
    Void: VoidEngine;
  }
}
