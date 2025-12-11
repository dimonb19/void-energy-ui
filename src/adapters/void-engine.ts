/* ==========================================================================
   VOID ENERGY UI ENGINE (Vanilla TypeScript)
   The framework-agnostic logic controller.
   ========================================================================== */

export type VoidPhysics = 'glass' | 'flat' | 'retro';
export type VoidMode = 'light' | 'dark';

interface ThemeConfig {
  physics: VoidPhysics;
  mode: VoidMode;
}

// The Source of Truth for behavior logic
const THEME_CONFIG: Record<string, ThemeConfig> = {
  // --- CORE THEMES (Glass / Dark) ---
  void: { physics: 'glass', mode: 'dark' },
  onyx: { physics: 'glass', mode: 'dark' },
  overgrowth: { physics: 'glass', mode: 'dark' },
  ember: { physics: 'glass', mode: 'dark' },
  glacier: { physics: 'glass', mode: 'dark' },
  nebula: { physics: 'glass', mode: 'dark' },
  crimson: { physics: 'glass', mode: 'dark' },
  velvet: { physics: 'glass', mode: 'dark' },
  solar: { physics: 'glass', mode: 'dark' },

  // --- EXCEPTIONS ---
  terminal: { physics: 'retro', mode: 'dark' },
  paper: { physics: 'flat', mode: 'light' },
  laboratory: { physics: 'flat', mode: 'light' },
};

const KEYS = { ATMOSPHERE: 'void_atmosphere' };

type Listener = (atmosphere: string) => void;

export class VoidEngine {
  public atmosphere: string;
  private observers: Listener[];

  constructor() {
    this.atmosphere = 'void';
    this.observers = [];

    // Auto-init only in browser environments
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init(): void {
    const stored = localStorage.getItem(KEYS.ATMOSPHERE);
    if (stored && THEME_CONFIG[stored]) {
      this.setAtmosphere(stored);
    } else {
      // Ensure attributes are set even if default
      this.setAtmosphere('void');
    }
  }

  /**
   * Switches the active atmosphere and updates the DOM attributes.
   * This is the "Triad Engine" logic: Atmosphere -> Physics + Mode.
   */
  public setAtmosphere(name: string): void {
    // 1. Validation
    if (!THEME_CONFIG[name]) {
      console.warn(
        `Void Engine: Atmosphere "${name}" not found. Falling back to 'void'.`,
      );
      name = 'void';
    }

    // 2. State Update
    this.atmosphere = name;
    const config = THEME_CONFIG[name];

    // 3. DOM Updates (The Triad)
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.setAttribute('data-atmosphere', name);
      root.setAttribute('data-physics', config.physics);
      root.setAttribute('data-mode', config.mode);
    }

    // 4. Persistence
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(KEYS.ATMOSPHERE, name);
    }

    // 5. Notify Frameworks
    this.notify();
  }

  /**
   * Subscribe to changes. Returns an unsubscribe function.
   * Useful for React/Svelte/Vue adapters.
   */
  public subscribe(callback: Listener): () => void {
    this.observers.push(callback);
    // Fire immediately so components sync on mount
    callback(this.atmosphere);

    return () => {
      this.observers = this.observers.filter((cb) => cb !== callback);
    };
  }

  private notify(): void {
    this.observers.forEach((cb) => cb(this.atmosphere));
  }

  /**
   * Helper to get the full config of the current (or specific) theme
   */
  public getConfig(name?: string): ThemeConfig {
    const target = name || this.atmosphere;
    return THEME_CONFIG[target] || THEME_CONFIG['void'];
  }
}

// Global Declaration for window.Void usage
declare global {
  interface Window {
    Void: VoidEngine;
  }
}

// Create global instance for plain HTML usage
if (typeof window !== 'undefined') {
  window.Void = new VoidEngine();
}
