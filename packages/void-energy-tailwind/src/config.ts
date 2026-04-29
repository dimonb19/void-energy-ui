/**
 * @void-energy/tailwind — Consumer config schema.
 *
 * Types-only surface plus two identity functions (defineConfig,
 * defineAtmosphere) used at a consumer's `void.config.ts` call site for IDE
 * autocomplete and compile-time validation. The file carries zero runtime
 * logic and zero dependencies; importing `@void-energy/tailwind/config` must
 * stay tree-shakeable to nothing in a production bundle.
 *
 * Types are re-declared locally (not imported from ./runtime) so the config
 * subpath stays independent of the runtime subpath — consumers who only need
 * types don't transitively pull any runtime code.
 *
 * Merge semantics, topological extends resolution, and CSS/manifest emission
 * live in ./generator. Config file loading and hand-rolled validation live in
 * ./loader. Both land in ./vite and ./cli (next PR).
 */

export type Physics = 'glass' | 'flat' | 'retro';
export type Mode = 'light' | 'dark' | 'auto';
export type Density = 'compact' | 'default' | 'comfortable';

export type BuiltinName = 'frost' | 'graphite' | 'terminal' | 'meridian';

export interface FontSourceEntry {
  url: string;
  format?: 'woff2' | 'woff' | 'truetype' | 'opentype';
}

export interface FontSource {
  family: string;
  src: string | FontSourceEntry[];
  weight?: string | number;
  style?: 'normal' | 'italic';
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  unicodeRange?: string;
}

export interface FontAssignments {
  heading?: string;
  body?: string;
  mono?: string;
}

export interface AtmosphereDef {
  physics: Physics;
  mode: 'light' | 'dark';
  tokens: Record<string, string>;
  label?: string;
  extends?: string;
}

export interface InitDefaults {
  atmosphere?: string;
  physics?: Physics;
  mode?: Mode;
  density?: Density;
}

export interface VoidConfig {
  /**
   * MODE A — full replacement. When present, VE's four built-in atmospheres
   * are omitted from the generated CSS and manifest unless re-listed here.
   * `extendAtmospheres` and `omitBuiltins` are ignored in this mode.
   */
  atmospheres?: Record<string, AtmosphereDef>;

  /**
   * MODE B — keep built-ins, add more. Each key renders alongside the four
   * free atmospheres. A name collision with a built-in lets the config entry
   * win (it overrides the built-in in the manifest and emits its tokens).
   */
  extendAtmospheres?: Record<string, AtmosphereDef>;

  /**
   * MODE C — keep some built-ins, drop others. Combines with
   * `extendAtmospheres`. Ignored when `atmospheres` is provided.
   */
  omitBuiltins?: BuiltinName[];

  /**
   * @font-face declarations emitted into `void.generated.css` at build time.
   * Runtime font registration is intentionally out of scope (D-L0.8).
   */
  fonts?: FontSource[];

  /**
   * :root overrides for --font-heading / --font-body / --font-mono. Emitted
   * after `@font-face` blocks so they win the cascade over `tokens.css`.
   */
  fontAssignments?: FontAssignments;

  /**
   * Fed into the runtime's default-resolution chain by `init({ manifest })`.
   * localStorage > manifest.defaults > init({ defaults }) > L0 hard-coded.
   */
  defaults?: InitDefaults;

  /**
   * Relative path from the project root where `void.generated.css` and
   * `void.manifest.json` are emitted by the CLI. The Vite plugin uses
   * virtual modules and ignores this field. Defaults to 'src/styles'.
   */
  outDir?: string;
}

/**
 * Identity function. Exists to hand the consumer autocomplete on a raw
 * object literal without requiring `satisfies VoidConfig` annotations.
 */
export function defineConfig(config: VoidConfig): VoidConfig {
  return config;
}

/**
 * Identity function. Lets consumers write
 *   { midnight: defineAtmosphere({ ... }) }
 * and still get per-field type checking inside the object literal.
 */
export function defineAtmosphere(def: AtmosphereDef): AtmosphereDef {
  return def;
}
