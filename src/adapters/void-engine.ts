/* ==========================================================================
   VOID ENERGY UI ENGINE (Secured v2.0)
   DOM-First Architecture / CSSOM Injection / Strict Validation
   ========================================================================== */

import THEME_REGISTRY from '../config/void-registry.json';
import { VOID_TOKENS } from '../config/design-tokens';

// --- TYPES ---
type ErrorHandler = (error: Error) => void;

interface EngineOptions {
  onError?: ErrorHandler;
}

// Mutable Registry
type Registry = Record<string, ThemeConfig>;

// --- CONSTANTS & SECURITY CONFIG ---

// 1. DENSITY FACTORS
const DENSITY_FACTORS = VOID_TOKENS.density.factors;

// 2. SAFEGUARD: The Fallback Palette (Source of Truth)
const FALLBACK_PALETTE = VOID_TOKENS.themes.void.palette;

// 3. ALLOWLIST: The only keys permitted in the CSS Injection
// Derived from the Token Contract in design-tokens.ts
const ALLOWED_CSS_VARS = new Set([
  'bg-canvas',
  'bg-surface',
  'bg-sink',
  'bg-spotlight',
  'energy-primary',
  'energy-secondary',
  'border-highlight',
  'border-shadow',
  'text-main',
  'text-dim',
  'text-mute',
  'color-premium',
  'color-system',
  'color-success',
  'color-error',
  'font-atmos-heading',
  'font-atmos-body',
]);

// 4. VALIDATION REGEX
// Allows: Alphanumeric, spaces, dashes, commas, parentheses, dots, percentages, quotes, hash
// Denies: Semicolons (;), Braces ({}), Brackets ([]), Angle Brackets (<>)
// This prevents breaking out of the CSS rule context.
const SAFE_VALUE_PATTERN = /^[a-zA-Z0-9\s\-\,\(\)\.\%\#\'\"]+$/;

const KEYS = {
  ATMOSPHERE: 'void_atmosphere',
  USER_CONFIG: 'void_user_config',
};

// --- THE VALIDATOR ---

class ThemeValidator {
  /**
   * Sanitizes a theme definition. Throws detailed errors if unsafe.
   */
  static validate(name: string, definition: RuntimeThemeDefinition): void {
    // A. Check Structure
    if (!definition || typeof definition !== 'object') {
      throw new Error(`Theme "${name}": Invalid definition object.`);
    }

    // B. Check Physics Mode
    const validPhysics = ['glass', 'flat', 'retro'];
    if (!validPhysics.includes(definition.physics)) {
      throw new Error(
        `Theme "${name}": Invalid physics "${definition.physics}". Must be one of: ${validPhysics.join(', ')}`,
      );
    }

    // C. Check Palette Object
    if (!definition.palette || typeof definition.palette !== 'object') {
      throw new Error(`Theme "${name}": Missing palette object.`);
    }

    // D. Validate Every Key/Value Pair
    Object.entries(definition.palette).forEach(([key, value]) => {
      // D1. Key Security
      if (!ALLOWED_CSS_VARS.has(key)) {
        // We warn but skip invalid keys instead of crashing, to be resilient
        console.warn(
          `Void Engine: Ignoring unknown property "${key}" in theme "${name}".`,
        );
        delete definition.palette[key];
        return;
      }

      // D2. Value Security
      if (typeof value !== 'string' || !SAFE_VALUE_PATTERN.test(value)) {
        throw new Error(
          `Theme "${name}": Unsafe value detected for "${key}". Value must not contain control characters (;{}<>).`,
        );
      }
    });

    // E. Validate External Fonts (Optional)
    if (definition.fonts) {
      if (!Array.isArray(definition.fonts)) {
        throw new Error(`Theme "${name}": Fonts must be an array.`);
      }
      definition.fonts.forEach((font) => {
        if (
          !font.url.startsWith('http') ||
          font.url.includes('<') ||
          font.url.includes('>')
        ) {
          throw new Error(`Theme "${name}": Invalid font URL "${font.url}".`);
        }
      });
    }
  }
}

// --- THE ENGINE ---

export class VoidEngine {
  public atmosphere: string;
  private observers: Function[];
  private onError?: ErrorHandler;

  // The Managed Stylesheet for Runtime Injections
  private dynamicSheet: CSSStyleSheet | null = null;

  public userConfig: {
    fontHeading?: string | null;
    fontBody?: string | null;
    scale: number;
    density: VoidDensity;
  };

  private registry: Registry;

  constructor(options?: EngineOptions) {
    this.atmosphere = 'void';
    this.observers = [];
    this.onError = options?.onError;

    // Load static registry
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
   * Securely injects a new theme into the CSSOM.
   */
  public injectTheme(name: string, definition: RuntimeThemeDefinition): void {
    try {
      // 1. THE BOUNCER: Strict Validation
      ThemeValidator.validate(name, definition);

      if (this.registry[name]) {
        console.warn(`Void Engine: Overwriting existing theme "${name}"`);
      }

      // 2. DEFENSIVE MERGE
      // Ensure no "undefined" variables exist by filling gaps with the Fallback Palette.
      const compositePalette = {
        ...FALLBACK_PALETTE,
        ...definition.palette,
      };

      // 3. LOAD EXTERNAL FONTS
      if (definition.fonts && definition.fonts.length > 0) {
        this.loadExternalFonts(definition.fonts);
      }

      // 4. CSSOM INJECTION
      this.injectToCSSOM(name, definition.mode, compositePalette);

      // 5. UPDATE REGISTRY (Logic Layer)
      this.registry[name] = {
        physics: definition.physics,
        mode: definition.mode,
      };

      // 6. NOTIFY LISTENERS
      this.notify();
    } catch (error) {
      if (this.onError && error instanceof Error) {
        this.onError(error);
      } else {
        console.error(error);
      }
    }
  }

  /**
   * CSSOM Helper: Inserts the rule into a managed stylesheet.
   * This is safer than textContent += because the browser parses the rule object-model.
   */
  private injectToCSSOM(
    name: string,
    mode: string,
    palette: Record<string, string>,
  ) {
    if (typeof document === 'undefined') return;

    // A. Initialize Sheet if needed
    if (!this.dynamicSheet) {
      const styleEl = document.createElement('style');
      styleEl.id = 'void-dynamic-themes';
      document.head.appendChild(styleEl);
      this.dynamicSheet = styleEl.sheet;
    }

    // B. Build the Variables Block
    // Since we validated keys and values, this string construction is now safe.
    const cssVars = Object.entries(palette)
      .map(([key, value]) => `--${key}: ${value}`)
      .join('; ');

    // C. Construct the Rule
    // sanitize 'name' to ensure it doesn't break the selector
    const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '');
    const rule = `
      [data-atmosphere='${safeName}'] {
        color-scheme: ${mode};
        ${cssVars}
      }
    `;

    // D. Insert Rule
    try {
      // Insert at the end of the sheet
      this.dynamicSheet?.insertRule(rule, this.dynamicSheet.cssRules.length);
    } catch (e) {
      console.error(`Void Engine: Failed to inject CSS rule for "${name}".`, e);
    }
  }

  // --- INTERNAL UTILS ---

  private loadExternalFonts(fonts: { name: string; url: string }[]) {
    if (typeof document === 'undefined') return;

    fonts.forEach((font) => {
      // Simple duplicate check
      if (!document.querySelector(`link[href="${font.url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        link.media = 'all';
        document.head.appendChild(link);
      }
    });
  }

  private safeGet(key: string): string | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private safeSet(key: string, value: string): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(key, value);
    } catch {}
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
      } catch {}
    }

    this.render();
  }

  // --- PUBLIC API ---

  public hasTheme(name: string): boolean {
    return !!this.registry[name];
  }

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

    this.applyDensity(root, this.userConfig.density);
  }

  private applyDensity(root: HTMLElement, density: VoidDensity) {
    const factor = DENSITY_FACTORS[density] ?? 1;
    root.style.setProperty('--density', factor.toString());

    // Cleanup legacy individual overrides if present
    const SPACE_KEYS = Object.keys(VOID_TOKENS.density.scale);
    SPACE_KEYS.forEach((token) => {
      root.style.removeProperty(`--space-${token}`);
    });
  }

  private persist(): void {
    this.safeSet(KEYS.ATMOSPHERE, this.atmosphere);
    this.safeSet(KEYS.USER_CONFIG, JSON.stringify(this.userConfig));
  }
}
