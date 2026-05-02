// DETERMINISTIC TEMPLATING ONLY. NO LLM CALLS.
// See plans/phase-1-decisions.md#d11.
//
// Inputs: scripts/skill-templates/*.template.md (hand-curated bodies,
// co-canonical with SYSTEM-PROMPT.md) + component-registry.json +
// design-tokens.ts + COMPOSITION-RECIPES.md. Re-runs are byte-stable.
//
// scripts/build-skill.ts — emits the seven L2 distribution artifacts (D10):
//   1. skills/void-skill/SKILL.md                              (canonical)
//   2. skills/void-skill/references/component-catalog.md       (from component-registry.json)
//   3. skills/void-skill/references/token-vocabulary.md        (from design-tokens.ts)
//   4. skills/void-skill/references/composition-recipes.md     (from COMPOSITION-RECIPES.md)
//   5. AGENTS.md                                               (from agents-md.template.md)
//   6. .agents/skills/void-skill/SKILL.md                      (Codex copy — byte-identical to (1))
//   7. .cursor/rules/void-energy.mdc                           (Cursor Rules — from cursor-rules.template.md)
//
// Pure string substitution; re-running produces no diff. No fetch / no model invocation.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PATHS = {
  systemPrompt: path.join(ROOT, 'SYSTEM-PROMPT.md'),
  registry: path.join(ROOT, 'src/config/component-registry.json'),
  designTokens: path.join(ROOT, 'src/config/design-tokens.ts'),
  compositionRecipes: path.join(ROOT, 'COMPOSITION-RECIPES.md'),
  templatesDir: path.join(__dirname, 'skill-templates'),
  description: path.join(__dirname, 'skill-templates/description.md'),
  skillBody: path.join(__dirname, 'skill-templates/skill-body.template.md'),
  cursorRulesBody: path.join(__dirname, 'skill-templates/cursor-rules.template.md'),
  agentsBody: path.join(__dirname, 'skill-templates/agents-md.template.md'),
};

const LICENSE = 'BSL-1.1';

// --------------------------------------------------------------------------
// Frontmatter — pulled deterministically from scripts/skill-templates/description.md
// --------------------------------------------------------------------------

function readDescription(): string {
  const text = fs.readFileSync(PATHS.description, 'utf8');
  // Pick the v5b line marked **v5b** | **<chars>** | **"<description>"** | <rationale> in the markdown table.
  // The picked candidate is bolded with **v5b** as the first cell; bracket the description in the third cell.
  const lineMatch = text.match(/\|\s*\*\*v5b\*\*\s*\|\s*\*\*\d+\*\*\s*\|\s*\*\*"([^"]+)"\*\*\s*\|/);
  if (!lineMatch) {
    throw new Error('build-skill: could not locate v5b description in scripts/skill-templates/description.md');
  }
  return lineMatch[1].trim();
}

// --------------------------------------------------------------------------
// Strip authoring HTML comments from templates (the build pseudocode block at
// the bottom of skill-body.template.md is for human authors, not for the
// emitted artifact).
// --------------------------------------------------------------------------

function stripBuildComments(text: string): string {
  return text.replace(/\n?<!--[\s\S]*?-->\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function preserveLeadingComment(text: string): string {
  // For agents-md.template.md and cursor-rules.template.md we keep the leading
  // "do not hand-edit" comment because it is part of the emitted artifact.
  // Strip only frontmatter authoring instructions if any survived.
  return text.trimEnd() + '\n';
}

// --------------------------------------------------------------------------
// Emitter: skills/void-skill/SKILL.md
// --------------------------------------------------------------------------

function emitSkillMd(description: string): string {
  const body = stripBuildComments(fs.readFileSync(PATHS.skillBody, 'utf8'));
  const frontmatter =
    `---\n` +
    `name: void-energy\n` +
    `description: ${description}\n` +
    `license: ${LICENSE}\n` +
    `---\n\n`;
  return frontmatter + body;
}

// --------------------------------------------------------------------------
// Emitter: .cursor/rules/void-energy.mdc
// --------------------------------------------------------------------------

function emitCursorMdc(description: string): string {
  const body = stripBuildComments(fs.readFileSync(PATHS.cursorRulesBody, 'utf8'));
  const frontmatter = `---\ndescription: ${description}\nalwaysApply: true\n---\n\n`;
  return frontmatter + body;
}

// --------------------------------------------------------------------------
// Emitter: AGENTS.md (the template is already the final body)
// --------------------------------------------------------------------------

function emitAgentsMd(): string {
  return preserveLeadingComment(fs.readFileSync(PATHS.agentsBody, 'utf8'));
}

// --------------------------------------------------------------------------
// Emitter: references/component-catalog.md (from component-registry.json)
// --------------------------------------------------------------------------

type RegistryComponentEntry = {
  description?: string;
  category?: string;
  component: string;
  import: string;
  props?: string[];
  propTypes?: Record<string, string>;
  slots?: string[];
  variants?: string[];
  related?: string[];
  compose?: string;
  example?: string;
};

type RegistryCallableEntry = {
  description?: string;
  category?: string;
  symbol: string;
  import: string;
  signature?: string;
  args?: string[];
  returns?: string[] | string;
  related?: string[];
  compose?: string;
  example?: string;
};

type RegistryControllerEntry = {
  description?: string;
  category?: string;
  component: string;
  import: string;
  api?: string[];
  state?: string[];
  related?: string[];
  compose?: string;
  example?: string;
};

type RegistryPatternEntry = {
  usage?: string;
  spacing?: string;
  variants?: string[];
  note?: string;
};

type RegistryParticipationEntry = {
  usage?: string;
  values?: string[];
  note?: string;
};

type Registry = {
  meta?: {
    rules?: string[];
    spacing?: string[];
    _categories?: Record<string, string[]>;
  };
  components: Record<string, RegistryComponentEntry>;
  utilities?: Record<string, RegistryCallableEntry>;
  actions?: Record<string, RegistryCallableEntry>;
  controllers?: Record<string, RegistryControllerEntry>;
  patterns?: Record<string, RegistryPatternEntry>;
  layouts?: Record<string, RegistryPatternEntry>;
  participation?: Record<string, RegistryParticipationEntry>;
};

function fenceBlock(language: string, content: string): string {
  return '```' + language + '\n' + content.trim() + '\n```';
}

function renderComponentSection(key: string, entry: RegistryComponentEntry): string {
  const lines: string[] = [];
  lines.push(`#### ${entry.component} \`${key}\``);
  if (entry.description) lines.push('', entry.description);
  lines.push('', `- **Import:** \`import ${entry.component} from '${entry.import}';\``);
  if (entry.category) lines.push(`- **Category:** ${entry.category}`);
  if (entry.variants?.length) lines.push(`- **Variants:** ${entry.variants.join(', ')}`);
  if (entry.props?.length) lines.push(`- **Props:** ${entry.props.map((p) => `\`${p}\``).join(', ')}`);
  if (entry.propTypes && Object.keys(entry.propTypes).length) {
    const pairs = Object.entries(entry.propTypes)
      .map(([name, type]) => `  - \`${name}\`: \`${type}\``)
      .join('\n');
    lines.push('- **Prop types:**', pairs);
  }
  if (entry.slots?.length) lines.push(`- **Slots:** ${entry.slots.map((s) => `\`${s}\``).join(', ')}`);
  if (entry.related?.length) lines.push(`- **Related:** ${entry.related.map((r) => `\`${r}\``).join(', ')}`);
  if (entry.compose) lines.push('', `**When to use.** ${entry.compose}`);
  if (entry.example) {
    lines.push('', '**Example:**', '', fenceBlock('svelte', entry.example));
  }
  return lines.join('\n');
}

function renderCallableSection(key: string, entry: RegistryCallableEntry, kind: 'utility' | 'action'): string {
  const lines: string[] = [];
  lines.push(`### ${entry.symbol} \`${key}\` _(${kind})_`);
  if (entry.description) lines.push('', entry.description);
  lines.push('', `- **Import:** \`import { ${entry.symbol} } from '${entry.import}';\``);
  if (entry.category) lines.push(`- **Category:** ${entry.category}`);
  if (entry.signature) lines.push(`- **Signature:** \`${entry.signature}\``);
  if (entry.args?.length) {
    lines.push('- **Args:**');
    for (const arg of entry.args) lines.push(`  - \`${arg}\``);
  }
  if (entry.returns) {
    const returns = Array.isArray(entry.returns) ? entry.returns : [entry.returns];
    lines.push('- **Returns:**');
    for (const r of returns) lines.push(`  - \`${r}\``);
  }
  if (entry.related?.length) lines.push(`- **Related:** ${entry.related.map((r) => `\`${r}\``).join(', ')}`);
  if (entry.compose) lines.push('', `**When to use.** ${entry.compose}`);
  if (entry.example) lines.push('', '**Example:**', '', fenceBlock('ts', entry.example));
  return lines.join('\n');
}

function renderControllerSection(key: string, entry: RegistryControllerEntry): string {
  const lines: string[] = [];
  lines.push(`### ${entry.component} \`${key}\` _(singleton)_`);
  if (entry.description) lines.push('', entry.description);
  lines.push('', `- **Import:** \`import { ${entry.component} } from '${entry.import}';\``);
  if (entry.category) lines.push(`- **Category:** ${entry.category}`);
  if (entry.api?.length) {
    lines.push('- **API:**');
    for (const m of entry.api) lines.push(`  - \`${m}\``);
  }
  if (entry.state?.length) {
    lines.push('- **State:**');
    for (const s of entry.state) lines.push(`  - \`${s}\``);
  }
  if (entry.related?.length) lines.push(`- **Related:** ${entry.related.map((r) => `\`${r}\``).join(', ')}`);
  if (entry.compose) lines.push('', `**When to use.** ${entry.compose}`);
  if (entry.example) lines.push('', '**Example:**', '', fenceBlock('ts', entry.example));
  return lines.join('\n');
}

function renderPatternSection(key: string, entry: RegistryPatternEntry): string {
  const lines: string[] = [];
  lines.push(`### \`${key}\``);
  if (entry.note) lines.push('', entry.note);
  if (entry.usage) lines.push('', '**Usage:**', '', fenceBlock('svelte', entry.usage));
  if (entry.spacing) lines.push(`- **Spacing:** ${entry.spacing}`);
  if (entry.variants?.length) lines.push(`- **Variants:** ${entry.variants.map((v) => `\`${v}\``).join(', ')}`);
  return lines.join('\n');
}

function renderParticipationSection(key: string, entry: RegistryParticipationEntry): string {
  const lines: string[] = [];
  lines.push(`### \`${key}\``);
  if (entry.values?.length) lines.push('', `**Values:** ${entry.values.map((v) => `\`${v}\``).join(', ')}`);
  if (entry.note) lines.push('', entry.note);
  if (entry.usage) lines.push('', '**Usage:**', '', fenceBlock('html', entry.usage));
  return lines.join('\n');
}

function emitComponentCatalog(): string {
  const registry: Registry = JSON.parse(fs.readFileSync(PATHS.registry, 'utf8'));
  const out: string[] = [];

  out.push('# Component Catalog');
  out.push('');
  out.push(
    '> Generated from `src/config/component-registry.json`. Do not hand-edit. Edit the registry and run `npm run build:skill`.',
  );
  out.push('');
  out.push(
    'Every shipped Void Energy primitive, action, utility, controller singleton, container pattern, layout, and physics-participation attribute. Each entry lists import path, props/args, slots, when-to-use, and a starting example.',
  );
  out.push('');

  // Categories index
  const categories = registry.meta?._categories ?? {};
  if (Object.keys(categories).length) {
    out.push('## Categories');
    out.push('');
    for (const [cat, keys] of Object.entries(categories)) {
      out.push(`- **${cat}:** ${keys.map((k) => `\`${k}\``).join(', ')}`);
    }
    out.push('');
  }

  // Components — group by category, then alphabetical within group, fall back to "uncategorised"
  out.push('## Components');
  out.push('');
  const componentsByCategory = new Map<string, [string, RegistryComponentEntry][]>();
  for (const [key, entry] of Object.entries(registry.components)) {
    const cat = entry.category ?? 'uncategorised';
    if (!componentsByCategory.has(cat)) componentsByCategory.set(cat, []);
    componentsByCategory.get(cat)!.push([key, entry]);
  }
  const sortedCategories = [...componentsByCategory.keys()].sort();
  for (const cat of sortedCategories) {
    out.push(`### ${cat}`);
    out.push('');
    const entries = componentsByCategory.get(cat)!.sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of entries) {
      out.push(renderComponentSection(key, entry));
      out.push('');
    }
  }

  // Actions
  if (registry.actions && Object.keys(registry.actions).length) {
    out.push('## Actions');
    out.push('');
    const actions = Object.entries(registry.actions).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of actions) {
      out.push(renderCallableSection(key, entry, 'action'));
      out.push('');
    }
  }

  // Utilities
  if (registry.utilities && Object.keys(registry.utilities).length) {
    out.push('## Utilities');
    out.push('');
    const utilities = Object.entries(registry.utilities).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of utilities) {
      out.push(renderCallableSection(key, entry, 'utility'));
      out.push('');
    }
  }

  // Controllers (singletons)
  if (registry.controllers && Object.keys(registry.controllers).length) {
    out.push('## Controllers (singletons)');
    out.push('');
    out.push('Import once. Never re-instantiate.');
    out.push('');
    const controllers = Object.entries(registry.controllers).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of controllers) {
      out.push(renderControllerSection(key, entry));
      out.push('');
    }
  }

  // Patterns
  if (registry.patterns && Object.keys(registry.patterns).length) {
    out.push('## Class-Recipe Patterns');
    out.push('');
    const patterns = Object.entries(registry.patterns).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of patterns) {
      out.push(renderPatternSection(key, entry));
      out.push('');
    }
  }

  // Layouts
  if (registry.layouts && Object.keys(registry.layouts).length) {
    out.push('## Layouts');
    out.push('');
    const layouts = Object.entries(registry.layouts).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of layouts) {
      out.push(renderPatternSection(key, entry));
      out.push('');
    }
  }

  // Participation contract
  if (registry.participation && Object.keys(registry.participation).length) {
    out.push('## Physics Participation Attributes');
    out.push('');
    out.push(
      'Wrapper-only attribute API for foreign markup that needs to opt into Void Energy physics without rewriting through Svelte primitives.',
    );
    out.push('');
    const participation = Object.entries(registry.participation).sort(([a], [b]) => a.localeCompare(b));
    for (const [key, entry] of participation) {
      out.push(renderParticipationSection(key, entry));
      out.push('');
    }
  }

  // Import index appendix
  out.push('## Import Index');
  out.push('');
  out.push(
    'Every public import path, in one block. Treat as a copy/paste reference; do not invent alias roots.',
  );
  out.push('');
  const imports: { name: string; from: string }[] = [];
  for (const [, entry] of Object.entries(registry.components)) {
    imports.push({ name: entry.component, from: entry.import });
  }
  for (const [, entry] of Object.entries(registry.actions ?? {})) {
    imports.push({ name: `{ ${entry.symbol} }`, from: entry.import });
  }
  for (const [, entry] of Object.entries(registry.utilities ?? {})) {
    imports.push({ name: `{ ${entry.symbol} }`, from: entry.import });
  }
  for (const [, entry] of Object.entries(registry.controllers ?? {})) {
    imports.push({ name: `{ ${entry.component} }`, from: entry.import });
  }
  imports.sort((a, b) => a.name.localeCompare(b.name));
  out.push('```ts');
  for (const imp of imports) {
    out.push(`import ${imp.name} from '${imp.from}';`);
  }
  out.push('```');
  out.push('');

  // Rules block from registry meta
  if (registry.meta?.rules?.length) {
    out.push('## Registry-Level Rules');
    out.push('');
    for (const rule of registry.meta.rules) {
      out.push(`- ${rule}`);
    }
    out.push('');
  }

  return out.join('\n');
}

// --------------------------------------------------------------------------
// Emitter: references/token-vocabulary.md (from design-tokens.ts)
// --------------------------------------------------------------------------

function emitTokenVocabulary(): string {
  const source = fs.readFileSync(PATHS.designTokens, 'utf8');
  const out: string[] = [];

  out.push('# Token Vocabulary');
  out.push('');
  out.push(
    '> Generated from `src/config/design-tokens.ts`. Do not hand-edit. Edit `design-tokens.ts` and run `npm run build:skill` (and `npm run build:tokens` to regenerate the SCSS bridge).',
  );
  out.push('');
  out.push(
    'The semantic-token dictionary that every Void Energy surface composes from. Names below match CSS variables (e.g. `xs` → `--space-xs`, exposed to Tailwind as `gap-xs`, `p-xs`, etc.). Atmospheres and physics presets remap colors and motion at runtime — names stay stable, values do not.',
  );
  out.push('');

  // --- Spacing ---
  const spacing = extractRecord(source, /export const VOID_SPACING = \{([\s\S]*?)\} as const;/m);
  out.push('## Spacing — `--space-*`');
  out.push('');
  out.push('Density-scaled (0.75x compact, 1x standard, 1.25x relaxed). Values shown are at standard density.');
  out.push('');
  out.push('| Token | Value | Tailwind utilities | Purpose |');
  out.push('|---|---|---|---|');
  out.push('| `--space-xs` | 0.5rem (8px) | `gap-xs`, `p-xs`, `m-xs` | Icon gaps, label→input, inline icon+text |');
  out.push('| `--space-sm` | 1rem (16px) | `gap-sm`, `p-sm`, `m-sm` | Button padding, dense pickers |');
  out.push('| `--space-md` | 1.5rem (24px) | `gap-md`, `p-md`, `m-md` | Sunk surface default, form-field groups |');
  out.push('| `--space-lg` | 2rem (32px) | `gap-lg`, `p-lg`, `m-lg` | Floating surface default (Law 5 floor) |');
  out.push('| `--space-xl` | 3rem (48px) | `gap-xl`, `py-xl` | Between content blocks in a section |');
  out.push('| `--space-2xl` | 4rem (64px) | `gap-2xl`, `py-2xl` | Between page sections |');
  out.push('| `--space-3xl` | 6rem (96px) | `gap-3xl` | Layout-scale spacing |');
  out.push('| `--space-4xl` | 8rem (128px) | `gap-4xl` | Hero / large-spread sections |');
  out.push('| `--space-5xl` | 10rem (160px) | `gap-5xl` | Mega spacing |');
  out.push('');
  out.push('Source values:');
  out.push('');
  out.push('```ts');
  out.push(spacing.trim());
  out.push('```');
  out.push('');

  // --- Breakpoints ---
  const responsive = extractRecord(source, /export const VOID_RESPONSIVE = \{([\s\S]*?)\} as const;/m);
  out.push('## Breakpoints — `tablet:`, `small-desktop:`, etc.');
  out.push('');
  out.push(
    'Tailwind v4 custom breakpoint names. There is no `sm:` / `md:` / `lg:` — read this list before assuming Tailwind defaults.',
  );
  out.push('');
  out.push('```ts');
  out.push(responsive.trim());
  out.push('```');
  out.push('');

  // --- Container widths ---
  const container = extractRecord(source, /export const VOID_CONTAINER = \{([\s\S]*?)\} as const;/m);
  out.push('## Container Max-Widths');
  out.push('');
  out.push('Responsive container constraints. Used by `.container` Tailwind helper.');
  out.push('');
  out.push('```ts');
  out.push(container.trim());
  out.push('```');
  out.push('');

  // --- Z-Index Layers ---
  const layers = extractRecord(source, /export const VOID_LAYERS = \{([\s\S]*?)\} as const;/m);
  out.push('## Z-Index Layers — `z()` in SCSS');
  out.push('');
  out.push('Semantic z-index scale. Use `z()` in SCSS (e.g. `z-index: z(\'overlay\');`).');
  out.push('');
  out.push('```ts');
  out.push(layers.trim());
  out.push('```');
  out.push('');

  // --- Border Radius ---
  const radius = extractRecord(source, /export const VOID_RADIUS = \{([\s\S]*?)\} as const;/m);
  out.push('## Border Radius — `--radius-*`');
  out.push('');
  out.push(
    'Default to `var(--radius-base)` (8px in glass/flat, 0 in retro). Use `var(--radius-full)` for pills. Retro physics force every radius to 0 — do not fight that with hardcoded values.',
  );
  out.push('');
  out.push('```ts');
  out.push(radius.trim());
  out.push('```');
  out.push('');

  // --- Color tokens (theme-reactive, not literal here) ---
  out.push('## Colors (theme-reactive)');
  out.push('');
  out.push(
    'Color tokens are remapped per atmosphere. Names stay stable; values change. The runtime engine sets these at `<html>` level when `data-atmosphere` changes.',
  );
  out.push('');
  out.push('| Group | Tokens |');
  out.push('|---|---|');
  out.push(
    '| Canvas | `--bg-canvas`, `--bg-surface`, `--bg-sunk`, `--bg-spotlight` |',
  );
  out.push('| Energy | `--energy-primary`, `--energy-secondary` |');
  out.push('| Text | `--text-main`, `--text-dim`, `--text-mute` |');
  out.push('| Border | `--border-color` |');
  out.push(
    '| Semantic | `--color-premium`, `--color-system`, `--color-success`, `--color-error` (each has `-light`, `-dark`, `-subtle` variants) |',
  );
  out.push('');
  out.push(
    'Tailwind utilities exposed: `text-main`, `text-dim`, `text-mute`, `bg-surface`, `bg-sunk`, `bg-canvas`, `border-energy-primary`, etc. Source of atmosphere palettes: `src/config/atmospheres.ts`.',
  );
  out.push('');

  // --- Physics tokens (per-preset block) ---
  out.push('## Physics — `--physics-*`, `--speed-*`, `--ease-*`');
  out.push('');
  out.push(
    'Per-preset values. The runtime engine swaps these at `<html>` level when `data-physics` changes. Glass = blurred, organic motion. Flat = clean, no lift. Retro = instant, hard borders.',
  );
  out.push('');
  out.push('| Token | glass | flat | retro |');
  out.push('|---|---|---|---|');
  out.push('| `--physics-blur` | 20px | 0 | 0 |');
  out.push('| `--physics-border-width` | 1px | 1px | 2px |');
  out.push('| `--speed-instant` | 100ms | 80ms | 0 |');
  out.push('| `--speed-fast` | 200ms | 133ms | 0 |');
  out.push('| `--speed-base` | 300ms | 280ms | 0 |');
  out.push('| `--speed-slow` | 500ms | 350ms | 0 |');
  out.push('| `--delay-cascade` | 50ms | 40ms | 0 |');
  out.push('| `--delay-sequence` | 100ms | 80ms | 0 |');
  out.push('| `--lift` | -3px | 0 | -2px |');
  out.push('| `--scale` | 1.02 | 1 | 1 |');
  out.push('| `--radius-base` | 8px | 8px | 0 |');
  out.push('| `--ease-spring-gentle` | spring | ease-out | steps(2) |');
  out.push('');
  out.push('Engine-enforced invariants — only four of six combinations are valid:');
  out.push('');
  out.push('- `glass` + `dark` ✅, `flat` + `dark` ✅, `flat` + `light` ✅, `retro` + `dark` ✅');
  out.push('- `glass` + `light` → runtime downgrades physics to `flat` (glass needs darkness to glow)');
  out.push('- `retro` + `light` → runtime forces mode to `dark` (CRT requires a black canvas)');
  out.push('');

  // --- Typography ---
  out.push('## Typography — `text-*` scales, `--font-*`');
  out.push('');
  out.push(
    '`clamp()`-based fluid scales. Font families remap per atmosphere via `--font-atmos-heading` and `--font-atmos-body`.',
  );
  out.push('');
  out.push('| Scale | Tailwind | Notes |');
  out.push('|---|---|---|');
  out.push('| `caption` | `text-caption` | Smallest legible label |');
  out.push('| `small` | `text-small` | Helper text, hints |');
  out.push('| `body` | `text-body` | Body copy ceiling (16px desktop) |');
  out.push('| `h6`–`h1` | `text-h6`–`text-h1` | Heading scales with `clamp()` fluid sizing |');
  out.push('');
  out.push('Weights: `--font-weight-regular` (400), `medium` (500), `semibold` (600), `bold` (700), `extrabold` (800).');
  out.push('Families: `--font-heading`, `--font-body`, `--font-code` (atmosphere-overridable).');
  out.push('');

  // --- Modal & dialog widths ---
  out.push('## Structural Constants');
  out.push('');
  out.push('| Token | Value | Purpose |');
  out.push('|---|---|---|');
  out.push('| `--modal-width-xs` | 24rem | Modal: confirm/alert |');
  out.push('| `--modal-width-sm` | 32rem | Modal: small forms |');
  out.push('| `--modal-width-md` | 40rem | Modal: standard |');
  out.push('| `--modal-width-lg` | 64rem | Modal: settings, large content |');
  out.push('| `--modal-width-xl` | 75rem | Modal: command palette, wide |');
  out.push('| `--tooltip-max-width` | 250px | Tooltip ceiling |');
  out.push('| `--dialog-gutter` | `var(--space-xl)` | Dialog horizontal gutter |');
  out.push('| `--dialog-gutter-lg` | `var(--space-2xl)` | Dialog gutter (large) |');
  out.push('');

  // --- Aura / ambient overrides ---
  out.push('## Effect Overrides — Aura & Ambient');
  out.push('');
  out.push(
    '`use:aura` reads `--aura-color` (atmosphere-driven by default; consumer can pass `color` to override) and animates over `--aura-transition-duration` (1.5s). Spread / opacity tokens are tunable via the package.',
  );
  out.push('');
  out.push(
    '`@void-energy/ambient-layers` carries its own raw-color tokens (`--ambient-sepia-shadow`, `--ambient-glitch-r`, `--ambient-night-top`, etc.) for sepia / glitch / night / neon / dawn presets. These are the only audited "raw color" tokens in the system; they are intentional package-internal constants and carry `// void-ignore` annotations in the SCSS.',
  );
  out.push('');

  // --- Common raw-value substitutions ---
  out.push('## Common Raw-Value Substitutions');
  out.push('');
  out.push(
    'Diagnostic table for translating raw values into tokens. If you find yourself typing one of these, replace it with the named token.',
  );
  out.push('');
  out.push('| Raw value the model produced | Replace with |');
  out.push('|---|---|');
  out.push('| `padding: 32px` / `padding: 2rem` | `padding: var(--space-lg)` |');
  out.push('| `padding: 24px` / `padding: 1.5rem` | `padding: var(--space-md)` |');
  out.push('| `padding: 16px` / `padding: 1rem` | `padding: var(--space-sm)` |');
  out.push('| `gap: 8px` | `gap: var(--space-xs)` |');
  out.push('| `class="gap-[20px]"` | choose `gap-md` (24px) — never bracket-syntax utilities |');
  out.push('| `class="max-w-[400px]"` | use a container class or token-based width; bracket-syntax is banned |');
  out.push('| `color: #ffffff` | `color: var(--text-main)` (atmosphere-aware) |');
  out.push('| `color: #888` / `color: gray` | `color: var(--text-mute)` |');
  out.push('| `border: 1px solid #ccc` | `border: var(--physics-border-width) solid var(--border-color)` |');
  out.push('| `border-radius: 8px` | `border-radius: var(--radius-base)` |');
  out.push('| `border-radius: 9999px` | `border-radius: var(--radius-full)` |');
  out.push('| `transition: 200ms ease` | `transition: var(--speed-fast) var(--ease-flow)` |');
  out.push('| `box-shadow: 0 4px 12px rgba(0,0,0,0.2)` | use a `surface-*` mixin or `var(--shadow-float)` |');
  out.push('| `filter: blur(20px)` | `filter: blur(var(--physics-blur))` |');
  out.push('| `font-size: 16px` | `font-size: var(--font-body)` or use the `text-body` utility |');
  out.push('| `z-index: 50` | `z-index: z(\'dropdown\')` (SCSS) |');
  out.push('');

  // --- Hard prohibitions ---
  out.push('## Hard Prohibitions (Token Law)');
  out.push('');
  out.push('- Bracket-syntax Tailwind utilities (`gap-[20px]`, `max-w-[400px]`, `tablet:max-w-[400px]`).');
  out.push('- Inline visual styles (`style="color: #fff"`). Inline styles reserved for runtime positioning.');
  out.push('- Physics utilities in Tailwind (`shadow-lg`, `backdrop-blur-md`).');
  out.push('- `text-shadow: 0 0 Npx ...` — use a SCSS `@include shadow-*` mixin instead.');
  out.push('- `min-width: Nrem` / `min-height: Nrem` on controls — control sizing comes from `--control-height` / `--size-touch-min`.');
  out.push('- `inset: ±Npx` for runtime positioning is allowed inline; for static positioning use SCSS with tokens.');
  out.push('- Editing generated files: `_generated-themes.scss`, `_fonts.scss`, `void-registry.json`, `void-physics.json`, `font-registry.ts`. Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.');
  out.push('');
  out.push(
    'Reviewed exceptions carry `// void-ignore` with written justification (shimmer highlights, readability floors, browser-mandated constants, scan-line / dotted-pattern stripe widths). Do not add new ones casually.',
  );
  out.push('');

  return out.join('\n');
}

function extractRecord(source: string, pattern: RegExp): string {
  const match = source.match(pattern);
  if (!match) return '/* (token block could not be extracted) */';
  return match[1];
}

// --------------------------------------------------------------------------
// Emitter: references/composition-recipes.md (from COMPOSITION-RECIPES.md)
// --------------------------------------------------------------------------

function emitCompositionRecipes(): string {
  const recipes = fs.readFileSync(PATHS.compositionRecipes, 'utf8');
  const out: string[] = [];

  out.push('# Composition Recipes');
  out.push('');
  out.push(
    '> Generated from `COMPOSITION-RECIPES.md`. Do not hand-edit. Edit the source file and run `npm run build:skill`.',
  );
  out.push('');

  // Build procedure preamble (six-step recipe per description.md disposition table)
  out.push('## Build Procedure');
  out.push('');
  out.push(
    'Follow this procedure for any page-composition or component-composition task. The recipes below are the *patterns*; this is the *order of operations* that uses them.',
  );
  out.push('');
  out.push(
    '1. **Parse the brief.** Identify the page archetype (dashboard, marketing, settings, story hub, analytics, narrative, auth) — match it to one of the recipes below.',
  );
  out.push('2. **Check the registry.** `src/config/component-registry.json` is the inventory; `references/component-catalog.md` is the AI-readable view. If a primitive covers the need, use it. Do not invent a parallel.');
  out.push('3. **Find the analog.** Identify the nearest existing page that does what you are building. Match its layout primitives, surface depth, and spacing rhythm.');
  out.push('4. **Pick tokens.** From `references/token-vocabulary.md`. Spacing, color, motion, typography — never hardcode.');
  out.push('5. **Compose.** Tailwind for layout (`flex`, `grid`, `gap-*`, `p-*`); SCSS only for material (surface mixins, when-state, when-physics). State via `data-*`.');
  out.push('6. **Verify.** Result must render correctly under all three physics presets (`glass`, `flat`, `retro`) and both modes where the active physics permits. Run `npm run check` before reporting done.');
  out.push('');
  out.push('---');
  out.push('');

  // Strip the H1 from the source (we inserted our own at top), then append.
  const stripped = recipes.replace(/^#\s.*?\n/, '').trim();
  out.push(stripped);
  out.push('');

  // Component skeleton appendix
  out.push('---');
  out.push('');
  out.push('## When Extending the System (Component Skeleton)');
  out.push('');
  out.push(
    'For consumer-side components in `@components/app/` only. `@components/ui/` is read-only. New library primitives go through `/new-component`.',
  );
  out.push('');
  out.push('```svelte');
  out.push('<script lang="ts">');
  out.push('  interface MyComponentProps {');
  out.push('    value: string;');
  out.push('    checked?: boolean;');
  out.push('    onchange?: (value: string) => void;');
  out.push('    class?: string;');
  out.push('  }');
  out.push('');
  out.push('  let {');
  out.push('    value,');
  out.push('    checked = $bindable(false),');
  out.push('    onchange,');
  out.push("    class: className = '',");
  out.push('  }: MyComponentProps = $props();');
  out.push('</script>');
  out.push('');
  out.push('<div');
  out.push('  class="my-component flex gap-md {className}"');
  out.push("  data-state={checked ? 'active' : ''}");
  out.push('>');
  out.push('  <!-- Layout = Tailwind. State = data attributes. Visual physics = SCSS class. -->');
  out.push('</div>');
  out.push('');
  out.push('<style lang="scss">');
  out.push("  @use '../abstracts' as *;");
  out.push('');
  out.push('  .my-component {');
  out.push('    @include surface-raised;');
  out.push("    @include when-state('active') { border-color: var(--energy-primary); }");
  out.push('    @include when-retro           { border-width: var(--physics-border-width); }');
  out.push('    @include when-light           { background: var(--bg-surface); }');
  out.push('  }');
  out.push('</style>');
  out.push('```');
  out.push('');

  // Page Scaffold (from §7 of SYSTEM-PROMPT.md)
  out.push('---');
  out.push('');
  out.push('## Page Scaffold (default)');
  out.push('');
  out.push(
    'When in doubt, start here. Container → section → raised card → header → sunk well → content. Every gap and padding is a Spacing-Gravity floor; never go down a size without justification.',
  );
  out.push('');
  out.push('```svelte');
  out.push('<div class="container flex flex-col gap-2xl py-2xl">');
  out.push('  <section class="flex flex-col gap-xl">');
  out.push('    <div class="surface-raised p-lg flex flex-col gap-lg">');
  out.push('      <div class="flex flex-col gap-xs">');
  out.push('        <h2>Section title</h2>');
  out.push('        <p class="text-dim">Short explanation.</p>');
  out.push('      </div>');
  out.push('      <div class="surface-sunk p-md flex flex-col gap-md">');
  out.push('        <!-- content -->');
  out.push('      </div>');
  out.push('    </div>');
  out.push('  </section>');
  out.push('</div>');
  out.push('```');
  out.push('');

  return out.join('\n');
}

// --------------------------------------------------------------------------
// Driver
// --------------------------------------------------------------------------

function ensureDir(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeIfChanged(filePath: string, content: string): boolean {
  ensureDir(filePath);
  let prev: string | null = null;
  try {
    prev = fs.readFileSync(filePath, 'utf8');
  } catch {
    prev = null;
  }
  if (prev === content) return false;
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

export type BuildOutputs = Record<
  | 'skillMd'
  | 'componentCatalog'
  | 'tokenVocabulary'
  | 'compositionRecipes'
  | 'agentsMd'
  | 'codexSkillMd'
  | 'cursorMdc',
  string
>;

export function buildOutputs(): BuildOutputs {
  const description = readDescription();
  const skillMd = emitSkillMd(description);
  return {
    skillMd,
    componentCatalog: emitComponentCatalog(),
    tokenVocabulary: emitTokenVocabulary(),
    compositionRecipes: emitCompositionRecipes(),
    agentsMd: emitAgentsMd(),
    codexSkillMd: skillMd, // (f) byte-identical to (a)
    cursorMdc: emitCursorMdc(description),
  };
}

export function targetPaths(rootDir: string) {
  return {
    skillMd: path.join(rootDir, 'skills/void-skill/SKILL.md'),
    componentCatalog: path.join(rootDir, 'skills/void-skill/references/component-catalog.md'),
    tokenVocabulary: path.join(rootDir, 'skills/void-skill/references/token-vocabulary.md'),
    compositionRecipes: path.join(rootDir, 'skills/void-skill/references/composition-recipes.md'),
    agentsMd: path.join(rootDir, 'AGENTS.md'),
    codexSkillMd: path.join(rootDir, '.agents/skills/void-skill/SKILL.md'),
    cursorMdc: path.join(rootDir, '.cursor/rules/void-energy.mdc'),
  };
}

function main() {
  const outputs = buildOutputs();
  const targets = targetPaths(ROOT);
  const changed: string[] = [];
  for (const key of Object.keys(outputs) as (keyof BuildOutputs)[]) {
    const wrote = writeIfChanged(targets[key], outputs[key]);
    if (wrote) changed.push(path.relative(ROOT, targets[key]));
  }

  console.log(`build-skill: emitted 7 artifacts.`);
  if (changed.length === 0) {
    console.log('  (no changes — outputs already up to date)');
  } else {
    for (const file of changed) console.log(`  + ${file}`);
  }
}

const isEntry = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntry) {
  main();
}
