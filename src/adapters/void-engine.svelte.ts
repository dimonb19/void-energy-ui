/* src/adapters/void-engine.svelte.ts */
import { getContext, setContext } from 'svelte';
import THEME_REGISTRY from '../config/void-registry.json';
import { VOID_TOKENS } from '../config/design-tokens';
import { STORAGE_KEYS, DOM_ATTRS, DEFAULTS } from '../config/constants';

// We just define the shape of the User Config
interface UserConfig {
  fontHeading: string | null;
  fontBody: string | null;
  scale: number;
  density: VoidDensity;
}

// --- THE REACTIVE ENGINE ---
export class VoidEngine {
  // 1. REACTIVE STATE (The Truth)
  // We use $state directly. No more observers.
  atmosphere = $state<string>(DEFAULTS.ATMOSPHERE);
  userConfig = $state<UserConfig>({
    fontHeading: null,
    fontBody: null,
    scale: 1,
    density: 'standard',
  });

  // Derived state for easy UI consumption
  currentTheme = $derived(
    (THEME_REGISTRY as any)[this.atmosphere] ||
      (THEME_REGISTRY as any)[DEFAULTS.ATMOSPHERE],
  );

  constructor() {
    // Singleton Initialization
    if (typeof window !== 'undefined') {
      this.init();
      // Debug helper
      (window as any).Void = this;
    }
  }

  // --- ACTIONS ---

  setAtmosphere(name: string) {
    if (!(THEME_REGISTRY as any)[name]) {
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

    // 1. TRUST THE DOM (The Hydration Script has already run)
    const domAtmosphere = root.getAttribute(DOM_ATTRS.ATMOSPHERE);

    // Only verify it exists in our registry to prevent crashes
    if (domAtmosphere && (THEME_REGISTRY as any)[domAtmosphere]) {
      this.atmosphere = domAtmosphere;
    } else {
      // Fallback only if DOM is empty (Should never happen with ThemeScript)
      this.atmosphere = DEFAULTS.ATMOSPHERE;
    }

    // 2. Load User Prefs (These don't cause FOUC as badly, so we load them here)
    const storedConfig = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
    if (storedConfig) {
      try {
        this.userConfig = { ...this.userConfig, ...JSON.parse(storedConfig) };
      } catch (e) {
        console.error('Void: Corrupt config', e);
      }
    }

    // Ensure we are synced
    this.syncDOM();
  }

  private syncDOM() {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Attributes (The Triad)
    root.setAttribute(DOM_ATTRS.ATMOSPHERE, this.atmosphere);
    root.setAttribute(DOM_ATTRS.PHYSICS, this.currentTheme.physics);
    root.setAttribute(DOM_ATTRS.MODE, this.currentTheme.mode);

    // 2. CSS Variables (The User Overrides)
    const { scale, density, fontHeading, fontBody } = this.userConfig;

    // Scale (Clamped safe range)
    root.style.setProperty(
      '--text-scale',
      Math.min(Math.max(scale, 0.75), 2).toString(),
    );

    // Density
    const densityMap = VOID_TOKENS.density.factors as Record<string, number>;
    root.style.setProperty('--density', (densityMap[density] || 1).toString());

    // Fonts
    if (fontHeading) root.style.setProperty('--user-font-heading', fontHeading);
    else root.style.removeProperty('--user-font-heading');

    if (fontBody) root.style.setProperty('--user-font-body', fontBody);
    else root.style.removeProperty('--user-font-body');
  }

  private persist() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.ATMOSPHERE, this.atmosphere);
    localStorage.setItem(
      STORAGE_KEYS.USER_CONFIG,
      JSON.stringify(this.userConfig),
    );
  }

  // Helper for UI Lists
  get availableThemes() {
    return Object.keys(THEME_REGISTRY);
  }
}

// --- SINGLETON EXPORT ---
// We create one instance for the entire app.
export const voidEngine = new VoidEngine();
