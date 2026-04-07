/*
 * 🔮 VOID ENGINE (adapter)
 * Role: Reactive state coordinator; validates inputs and delegates DOM painting
 * to the bootloader kernel.
 */

import THEME_REGISTRY from '@config/void-registry.json';
import { STORAGE_KEYS, DOM_ATTRS, DEFAULTS } from '@config/constants';
import { VOID_TOKENS } from '@config/design-tokens';
import {
  formatBoundaryError,
  parseExternalThemePayload,
  parseRestorableThemeCache,
  parseStoredThemeCache,
  parseStoredUserConfig,
} from '@lib/boundary';
import {
  applyTheme,
  applyPreferences,
  resolveThemeColor,
} from '@lib/void-boot';
import { err, ok } from '@lib/result';

// Mode-aware palette fallbacks for incomplete theme definitions.
// Uses SEMANTIC_DARK/SEMANTIC_LIGHT from design-tokens.ts for correct semantic colors.
const FALLBACK_DARK: VoidPalette = {
  // Canvas
  'bg-canvas': '#000000',
  'bg-surface': '#111111',
  'bg-sunk': '#000000',
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
  'bg-sunk': '#e0e0e0',
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

const DEFAULT_THEME_PALETTES = {
  dark: VOID_TOKENS.themes[
    DEFAULTS.ATMOSPHERE as keyof typeof VOID_TOKENS.themes
  ].palette,
  light:
    VOID_TOKENS.themes[
      DEFAULTS.LIGHT_ATMOSPHERE as keyof typeof VOID_TOKENS.themes
    ].palette,
} as const;

interface TemporaryThemeEntry {
  handle: number;
  themeId: string;
  returnTo: string;
  label: string;
  ephemeral: boolean;
}

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
    fixedNav: false,
  });

  // Temporary theme contexts (for story themes, previews, or forced scopes).
  private temporaryThemeStack = $state<TemporaryThemeEntry[]>([]);
  private nextTemporaryHandle = 1;
  private ephemeralThemeIds = new Set<string>();

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
    try {
      const safeTheme = this.normalizeThemeDefinition(id, definition);
      this.commitTheme(id, safeTheme, true);
    } finally {
      console.groupEnd();
    }
  }

  registerEphemeralTheme(id: string, definition: PartialThemeDefinition) {
    const safeTheme = this.normalizeThemeDefinition(id, definition, {
      silent: true,
    });
    this.ephemeralThemeIds.add(id);
    this.commitTheme(id, safeTheme, false);
  }

  unregisterEphemeralTheme(id: string) {
    if (!this.ephemeralThemeIds.has(id)) return;

    this.ephemeralThemeIds.delete(id);
    const nextRegistry = { ...this.registry };
    delete nextRegistry[id];
    this.registry = nextRegistry as ThemeRegistry;
  }

  /**
   * Unregister a custom (non-built-in, non-ephemeral) theme.
   * If the theme is currently active, falls back to the default atmosphere.
   * Also removes it from the localStorage cache.
   */
  unregisterTheme(id: string) {
    if (this.builtInThemeIds.has(id) || this.ephemeralThemeIds.has(id)) return;
    if (!this.registry[id]) return;

    // If this theme is active, fall back to default
    if (this.atmosphere === id) {
      this.setAtmosphere('void');
    }

    const nextRegistry = { ...this.registry };
    delete nextRegistry[id];
    this.registry = nextRegistry as ThemeRegistry;

    // Remove from localStorage cache
    try {
      const cache = this.readThemeCache();
      delete cache[id];
      localStorage.setItem(STORAGE_KEYS.THEME_CACHE, JSON.stringify(cache));
    } catch {
      // Storage unavailable
    }
  }

  async loadExternalTheme(
    url: string,
  ): Promise<VoidResult<{ id: string }, BoundaryError>> {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        return err({
          code: 'http_error',
          source: 'VoidEngine.loadExternalTheme',
          message: `Theme request failed with status ${res.status}.`,
          status: res.status,
        });
      }

      const data = await res.json();
      const parsed = parseExternalThemePayload(
        data,
        'VoidEngine.loadExternalTheme',
      );
      if (!parsed.ok) {
        console.error(formatBoundaryError(parsed.error));
        return parsed;
      }

      this.registerTheme(parsed.data.id, parsed.data.definition);
      this.setAtmosphere(parsed.data.id);
      return ok({ id: parsed.data.id });
    } catch (e) {
      console.error('Void: External Theme Load Failed', e);
      return err({
        code: 'network',
        source: 'VoidEngine.loadExternalTheme',
        message: 'Failed to fetch external theme.',
      });
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

    // Manual selection invalidates any temporary theme stack.
    this.clearTemporaryThemes();
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
      if (shouldPersist) this.persist();
      this.syncDOM();
      return;
    }

    // Update theme-color meta BEFORE the view transition so Safari picks up
    // the new status bar color before capturing the old-state snapshot.
    this.updateThemeColorMeta(name);

    // Reactive state ($state) and CSS custom properties must update together
    // inside the callback. Setting this.atmosphere before startViewTransition
    // would trigger Svelte reactivity before the old-state screenshot is
    // captured, producing a broken intermediate frame (new content, old colors).
    document.startViewTransition(() => {
      this.atmosphere = name;
      if (shouldPersist) this.persist();
      this.syncDOM();
    });
  }

  setPreferences(prefs: Partial<UserConfig>) {
    // If disabling adaptAtmosphere while temporary themes are active,
    // restore the user's baseline theme before persisting.
    if (
      prefs.adaptAtmosphere === false &&
      this.temporaryThemeStack.length > 0
    ) {
      const returnTo = this.clearTemporaryThemes();
      if (returnTo) {
        this.atmosphere = returnTo;
      }
    }

    this.userConfig = { ...this.userConfig, ...prefs };
    this.syncDOM();
    this.persist();
  }

  private init() {
    const root = document.documentElement;

    this.hydrateCachedThemes();

    // Trust the bootloader paint and sync state from the DOM.
    const domAtmosphere = root.getAttribute(DOM_ATTRS.ATMOSPHERE);

    if (domAtmosphere && this.registry[domAtmosphere]) {
      this.atmosphere = domAtmosphere;
    } else {
      this.atmosphere = DEFAULTS.ATMOSPHERE;
    }

    // Load user prefs into state only.
    let storedConfig: string | null = null;
    try {
      storedConfig = localStorage.getItem(STORAGE_KEYS.USER_CONFIG);
    } catch {
      storedConfig = null;
    }

    if (storedConfig) {
      const parsed = parseStoredUserConfig(
        storedConfig,
        'VoidEngine.init user config',
      );
      if (parsed.ok) {
        this.userConfig = { ...this.userConfig, ...parsed.data };
      } else {
        console.error(formatBoundaryError(parsed.error));
        try {
          localStorage.removeItem(STORAGE_KEYS.USER_CONFIG);
        } catch {
          // Storage unavailable
        }
      }
    }

    // Note: do not call syncDOM() here; ThemeScript already painted the DOM.
  }

  /**
   * Update <meta name="theme-color"> eagerly (before View Transition snapshot).
   * Mirrors the resolution logic in void-boot.js applyTheme().
   */
  private updateThemeColorMeta(name: string) {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const entry = this.registry[name];
    if (!entry) return;
    const color = resolveThemeColor(
      entry as VoidThemeDefinition & {
        canvas?: string;
      },
    );
    if (color) meta.setAttribute('content', color);
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
    try {
      localStorage.setItem(STORAGE_KEYS.ATMOSPHERE, this.atmosphere);
      localStorage.setItem(
        STORAGE_KEYS.USER_CONFIG,
        JSON.stringify(this.userConfig),
      );
    } catch {
      // Storage full or unavailable
    }
  }

  private readThemeCache(): Record<string, VoidThemeDefinition> {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEYS.THEME_CACHE);
    } catch {
      return {};
    }

    if (!raw) return {};

    const parsed = parseStoredThemeCache(
      raw,
      'VoidEngine.registerTheme cache read',
    );
    if (parsed.ok) return parsed.data;

    console.warn(formatBoundaryError(parsed.error));
    try {
      localStorage.removeItem(STORAGE_KEYS.THEME_CACHE);
    } catch {
      // Storage unavailable
    }
    return {};
  }

  private hydrateCachedThemes() {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEYS.THEME_CACHE);
    } catch {
      return;
    }

    if (!raw) return;

    const parsed = parseRestorableThemeCache(
      raw,
      'VoidEngine.init theme cache',
    );
    if (!parsed.ok) {
      console.warn(formatBoundaryError(parsed.error));
      try {
        localStorage.removeItem(STORAGE_KEYS.THEME_CACHE);
      } catch {
        // Storage unavailable
      }
      return;
    }

    for (const [id, definition] of Object.entries(parsed.data)) {
      this.commitTheme(
        id,
        this.normalizeThemeDefinition(id, definition, { silent: true }),
        false,
      );
    }
  }

  private normalizeThemeDefinition(
    id: string,
    definition: PartialThemeDefinition,
    options: { silent?: boolean } = {},
  ): VoidThemeDefinition {
    const { silent = false } = options;
    const nextDefinition: PartialThemeDefinition = {
      ...definition,
      palette: definition.palette ? { ...definition.palette } : undefined,
      fonts: definition.fonts ? [...definition.fonts] : undefined,
    };

    // Enforce physics/mode constraints.
    if (nextDefinition.physics === 'glass' && nextDefinition.mode === 'light') {
      if (!silent) {
        console.warn(
          `⚠️ Void Violation: Atmosphere "${id}" attempts to use GLASS physics in LIGHT mode. This breaks visibility. Falling back to FLAT physics.`,
        );
      }
      nextDefinition.physics = 'flat';
    }

    if (nextDefinition.physics === 'retro' && nextDefinition.mode === 'light') {
      if (!silent) {
        console.warn(
          `⚠️ Void Violation: RETRO physics requires Dark mode for contrast. Forcing Dark mode.`,
        );
      }
      nextDefinition.mode = 'dark';
    }

    const targetMode = nextDefinition.mode || 'dark';
    const fallbackPalette =
      targetMode === 'light' ? FALLBACK_LIGHT : FALLBACK_DARK;

    // Build a mode-compatible base theme so partial runtime palettes inherit
    // from the correct built-in atmosphere before falling back to generic tokens.
    const baseThemeId =
      targetMode === 'light' ? DEFAULTS.LIGHT_ATMOSPHERE : DEFAULTS.ATMOSPHERE;
    const registryEntry =
      this.registry[baseThemeId] ?? this.registry[DEFAULTS.ATMOSPHERE];
    const basePalette = DEFAULT_THEME_PALETTES[targetMode];

    const baseTheme: VoidThemeDefinition = {
      id: baseThemeId,
      mode: registryEntry?.mode ?? targetMode,
      physics:
        registryEntry?.physics ??
        (targetMode === 'light' ? 'flat' : DEFAULTS.PHYSICS),
      palette: basePalette ?? fallbackPalette,
      fonts: [],
      tagline: registryEntry?.tagline,
    };

    return {
      id,
      label: nextDefinition.label,
      mode: targetMode,
      physics: nextDefinition.physics || baseTheme.physics,
      palette: {
        ...fallbackPalette,
        ...baseTheme.palette,
        ...(nextDefinition.palette || {}),
      },
      fonts: nextDefinition.fonts || [],
      tagline: nextDefinition.tagline,
    };
  }

  private commitTheme(
    id: string,
    safeTheme: VoidThemeDefinition,
    shouldPersist: boolean,
  ) {
    this.registry[id] = safeTheme;

    if (!shouldPersist) return;

    // Cache theme to localStorage (non-critical, failures are silently ignored)
    try {
      const cache = this.readThemeCache();
      cache[id] = safeTheme;
      localStorage.setItem(STORAGE_KEYS.THEME_CACHE, JSON.stringify(cache));
    } catch {
      // Storage full or unavailable - continue without caching
    }
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

  /**
   * Returns only user-registered custom themes (excludes built-in and ephemeral).
   * Use this for showing custom themes in the theme selector UI.
   */
  get customAtmospheres(): string[] {
    return Object.keys(this.registry).filter(
      (id) => !this.builtInThemeIds.has(id) && !this.ephemeralThemeIds.has(id),
    );
  }

  // ===========================================================================
  // TEMPORARY THEME API
  // ===========================================================================

  /**
   * Check if a temporary theme is currently active.
   */
  get hasTemporaryTheme(): boolean {
    return this.temporaryThemeStack.length > 0;
  }

  /**
   * Get temporary theme info for UI display.
   */
  get temporaryThemeInfo() {
    const active =
      this.temporaryThemeStack[this.temporaryThemeStack.length - 1];
    if (!active) return null;

    return {
      id: active.themeId,
      label: active.label,
      returnTo: active.returnTo,
    };
  }

  pushTemporaryTheme(
    themeId: string,
    label: string = 'Custom theme',
  ): number | null {
    if (!this.userConfig.adaptAtmosphere) {
      return null;
    }

    if (!this.registry[themeId]) {
      console.warn(`Void: Unknown atmosphere "${themeId}"`);
      return null;
    }

    const handle = this.nextTemporaryHandle++;
    const active =
      this.temporaryThemeStack[this.temporaryThemeStack.length - 1];

    this.temporaryThemeStack.push({
      handle,
      themeId,
      returnTo: active?.themeId ?? this.atmosphere,
      label,
      ephemeral: this.ephemeralThemeIds.has(themeId),
    });

    this._applyAtmosphere(themeId);
    return handle;
  }

  updateTemporaryTheme(
    handle: number,
    themeId: string,
    label: string = 'Custom theme',
  ) {
    const index = this.temporaryThemeStack.findIndex(
      (entry) => entry.handle === handle,
    );
    if (index === -1) return;

    if (!this.registry[themeId]) {
      console.warn(`Void: Unknown atmosphere "${themeId}"`);
      return;
    }

    const entry = this.temporaryThemeStack[index];
    entry.themeId = themeId;
    entry.label = label;
    entry.ephemeral = this.ephemeralThemeIds.has(themeId);

    const nextEntry = this.temporaryThemeStack[index + 1];
    if (nextEntry) {
      nextEntry.returnTo = themeId;
    }

    if (index === this.temporaryThemeStack.length - 1) {
      this._applyAtmosphere(themeId);
    }
  }

  releaseTemporaryTheme(handle: number) {
    const index = this.temporaryThemeStack.findIndex(
      (entry) => entry.handle === handle,
    );
    if (index === -1) return;

    const entry = this.temporaryThemeStack[index];
    const isTop = index === this.temporaryThemeStack.length - 1;

    if (!isTop) {
      const nextEntry = this.temporaryThemeStack[index + 1];
      if (nextEntry) {
        nextEntry.returnTo = entry.returnTo;
      }
      this.temporaryThemeStack.splice(index, 1);
      return;
    }

    this.temporaryThemeStack.pop();

    const nextTop =
      this.temporaryThemeStack[this.temporaryThemeStack.length - 1];
    const restoreTo = nextTop?.themeId ?? entry.returnTo;
    this._applyAtmosphere(restoreTo);
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
    return this.pushTemporaryTheme(themeId, label) !== null;
  }

  /**
   * Exit temporary theme and restore user's preference.
   */
  restoreUserTheme() {
    const active =
      this.temporaryThemeStack[this.temporaryThemeStack.length - 1];
    if (active) {
      this.releaseTemporaryTheme(active.handle);
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

  private clearTemporaryThemes(): string | null {
    const returnTo = this.temporaryThemeStack[0]?.returnTo ?? null;
    this.temporaryThemeStack = [];
    return returnTo;
  }
}

export const voidEngine = new VoidEngine();
