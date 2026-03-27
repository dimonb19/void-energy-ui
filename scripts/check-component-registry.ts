import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const PATHS = {
  registry: path.join(ROOT, 'src/config/component-registry.json'),
  componentsDir: path.join(ROOT, 'src/components/ui'),
  modalRegistry: path.join(ROOT, 'src/config/modal-registry.ts'),
  modalTypes: path.join(ROOT, 'src/types/modal.d.ts'),
  toastStore: path.join(ROOT, 'src/stores/toast.svelte.ts'),
  sharedTypes: path.join(ROOT, 'src/types/void-ui.d.ts'),
  passwordValidation: path.join(ROOT, 'src/lib/password-validation.svelte.ts'),
  containersScss: path.join(ROOT, 'src/styles/components/_containers.scss'),
  effectsScss: path.join(ROOT, 'src/styles/components/_effects.scss'),
};

type RegistryComponentEntry = {
  component: string;
  import: string;
  props: string[];
  slots: string[];
  propTypes?: Record<string, string>;
  compose?: string;
  related?: string[];
};

type RegistryTypeEntry = {
  source: string;
  shape: string[];
  note?: string;
};

type RegistryCallableEntry = {
  symbol: string;
  import: string;
  signature?: string;
  args?: string[];
  returns?: string[] | string;
  compose?: string;
  related?: string[];
};

type RegistryControllerMethodEntry = {
  args?: string[];
  returns?: string[] | string;
  [key: string]: unknown;
};

type RegistryControllerEntry = {
  component: string;
  import: string;
  api?: string[];
  state?: string[];
  methods?: Record<string, RegistryControllerMethodEntry>;
  related?: string[];
};

type RegistryModalControllerEntry = RegistryControllerEntry & {
  keys?: string[];
  methods?: Record<string, RegistryControllerMethodEntry> & {
    open?: RegistryControllerMethodEntry & {
      keys?: string[];
      sizes?: string[];
      propsByKey?: Record<string, string[]>;
    };
  };
};

type RegistryToastControllerEntry = RegistryControllerEntry & {
  types?: string[];
  methods?: Record<string, RegistryControllerMethodEntry> & {
    loading?: RegistryControllerMethodEntry & {
      returns?: string[];
    };
    promise?: RegistryControllerMethodEntry & {
      messages?: string[];
    };
  };
};

type RegistryPatternEntry = {
  note?: string;
  related?: string[];
};

type RegistryLayoutEntry = {
  note?: string;
  related?: string[];
};

type RegistryControllers = Record<string, RegistryControllerEntry> & {
  modal?: RegistryModalControllerEntry;
  toast?: RegistryToastControllerEntry;
};

type Registry = {
  types?: Record<string, RegistryTypeEntry>;
  components: Record<string, RegistryComponentEntry>;
  utilities?: Record<string, RegistryCallableEntry>;
  actions?: Record<string, RegistryCallableEntry>;
  controllers: RegistryControllers;
  patterns: Record<string, RegistryPatternEntry>;
  layouts?: Record<string, RegistryLayoutEntry>;
};

type ParsedSlot = {
  name: string;
  kind: 'none' | 'arg' | 'object';
  keys: string[];
};

const SLOT_PROP_NAMES = new Set(['children', 'trigger', 'panel']);
const RESOLVABLE_EXTENSIONS = [
  '',
  '.ts',
  '.js',
  '.json',
  '.svelte',
  '.svelte.ts',
  '.svelte.js',
];
const errors: string[] = [];

function fail(message: string) {
  errors.push(message);
}

function readText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf8');
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readText(filePath)) as T;
}

function compareArrays(
  label: string,
  actual: string[],
  expected: string[],
  sort = true,
) {
  const left = sort ? [...actual].sort() : [...actual];
  const right = sort ? [...expected].sort() : [...expected];

  if (left.length !== right.length) {
    fail(`${label} mismatch:\n  actual: ${left.join(', ') || '(none)'}\n  expected: ${right.join(', ') || '(none)'}`);
    return;
  }

  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      fail(`${label} mismatch:\n  actual: ${left.join(', ') || '(none)'}\n  expected: ${right.join(', ') || '(none)'}`);
      return;
    }
  }
}

function splitTopLevel(source: string): string[] {
  const parts: string[] = [];
  let current = '';
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let depthAngle = 0;
  let quote: '"' | "'" | '`' | null = null;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const prev = index > 0 ? source[index - 1] : '';

    if (quote) {
      current += char;
      if (char === quote && prev !== '\\') {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') depthParen += 1;
    if (char === ')') depthParen -= 1;
    if (char === '{') depthBrace += 1;
    if (char === '}') depthBrace -= 1;
    if (char === '[') depthBracket += 1;
    if (char === ']') depthBracket -= 1;
    if (char === '<') depthAngle += 1;
    if (char === '>' && depthAngle > 0) depthAngle -= 1;

    if (
      char === ',' &&
      depthParen === 0 &&
      depthBrace === 0 &&
      depthBracket === 0 &&
      depthAngle === 0
    ) {
      if (current.trim()) parts.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) parts.push(current.trim());
  return parts;
}

function parseComponentProps(source: string): string[] {
  const match = source.match(
    /let\s*\{([\s\S]*?)\}\s*:[^=]*=\s*\$props\(\);/m,
  );

  if (!match) return [];

  const rawProps = splitTopLevel(match[1]);
  return rawProps
    .map((rawProp) => {
      const withoutDefault = rawProp.split('=')[0].trim();
      if (withoutDefault.startsWith('...')) return withoutDefault;
      if (withoutDefault.includes(':')) {
        return withoutDefault.split(':')[0].trim();
      }
      return withoutDefault;
    })
    .filter(Boolean);
}

function normalizeRegistryProp(prop: string): string {
  if (prop.startsWith('...rest')) return '...rest';
  return prop.replace(/:bindable$/, '');
}

function collapseWhitespace(source: string): string {
  return source.replace(/\s+/g, ' ').trim();
}

function normalizeContractText(source: string): string {
  return collapseWhitespace(
    source
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\/\/.*$/gm, ' ')
      .replace(/import\([^)]*\)\./g, ''),
  )
    .replace(/\s*=\s*/g, '=')
    .replace(/\s*\|\s*/g, ' | ')
    .replace(/\s*&\s*/g, ' & ');
}

function extractBraceBlock(source: string, openBraceIndex: number): string | null {
  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openBraceIndex, index + 1);
      }
    }
  }

  return null;
}

function extractParenBlock(source: string, openParenIndex: number): string | null {
  let depth = 0;

  for (let index = openParenIndex; index < source.length; index += 1) {
    const char = source[index];
    if (char === '(') depth += 1;
    if (char === ')') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(openParenIndex, index + 1);
      }
    }
  }

  return null;
}

function extractPropsInterfaceName(source: string): string | null {
  const match = source.match(
    /let\s*\{[\s\S]*?\}\s*:\s*([A-Za-z0-9_]+)\s*=\s*\$props\(\);/m,
  );
  return match?.[1] ?? null;
}

function extractInterfaceBlock(source: string, interfaceName: string): string | null {
  const pattern = new RegExp(
    `interface\\s+${escapeRegExp(interfaceName)}(?:\\s+extends[^{]+)?\\s*\\{`,
  );
  const match = pattern.exec(source);
  if (!match) return null;

  const openBraceIndex = source.indexOf('{', match.index);
  return openBraceIndex === -1 ? null : extractBraceBlock(source, openBraceIndex);
}

function parseInterfacePropertyTypes(source: string, interfaceName: string) {
  const block = extractInterfaceBlock(source, interfaceName);
  if (!block) return new Map<string, string>();

  const body = block
    .slice(1, -1)
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/.*$/gm, ' ');
  const propertyTypes = new Map<string, string>();

  for (const rawEntry of body.split(';')) {
    const entry = rawEntry.trim();
    if (!entry) continue;

    const match = entry.match(/^([A-Za-z_][A-Za-z0-9_]*)(\??)\s*:\s*([\s\S]+)$/);
    if (!match) continue;

    const [, propName, , rawType] = match;
    propertyTypes.set(propName, normalizeContractText(rawType));
  }

  return propertyTypes;
}

function extractFunctionParamNames(source: string, symbol: string): string[] | null {
  const exportIndex = source.indexOf(`export function ${symbol}`);
  if (exportIndex === -1) return null;

  const openParenIndex = source.indexOf('(', exportIndex);
  if (openParenIndex === -1) return null;

  const block = extractParenBlock(source, openParenIndex);
  if (!block) return null;

  return splitTopLevel(block.slice(1, -1))
    .map((param) => {
      const withoutDefault = param.split('=')[0].trim();
      const withoutRest = withoutDefault.replace(/^\.\.\./, '');
      return withoutRest.split(':')[0].trim().replace(/\?$/, '');
    })
    .filter(Boolean);
}

function extractMethodParamNames(source: string, memberName: string): string[] | null {
  const pattern = new RegExp(
    `^\\s*(?:async\\s+)?${escapeRegExp(stripGenericSuffix(memberName))}(?:<[^\\n>]+>)?\\s*\\(`,
    'm',
  );
  const match = pattern.exec(source);
  if (!match) return null;

  const openParenIndex = source.indexOf('(', match.index);
  if (openParenIndex === -1) return null;

  const block = extractParenBlock(source, openParenIndex);
  if (!block) return null;

  return splitTopLevel(block.slice(1, -1))
    .map((param) => {
      const withoutDefault = param.split('=')[0].trim();
      const withoutRest = withoutDefault.replace(/^\.\.\./, '');
      return withoutRest.split(':')[0].trim().replace(/\?$/, '');
    })
    .filter(Boolean);
}

function extractRegistryArgNames(args: string[] | undefined): string[] {
  return (args ?? [])
    .map((arg) =>
      arg
        .split('=')[0]
        .trim()
        .split(':')[0]
        .trim()
        .replace(/\?$/, ''),
    )
    .filter(Boolean);
}

function extractSignatureName(signature: string | undefined): string | null {
  if (!signature || !signature.includes('(')) return null;
  return signature.slice(0, signature.indexOf('(')).trim();
}

function extractSignatureArgNames(signature: string | undefined): string[] {
  if (!signature) return [];
  const openParenIndex = signature.indexOf('(');
  const closeParenIndex = signature.lastIndexOf(')');
  if (openParenIndex === -1 || closeParenIndex === -1) return [];

  return extractRegistryArgNames(
    splitTopLevel(signature.slice(openParenIndex + 1, closeParenIndex)),
  );
}

function normalizeParamName(name: string): string {
  return name === 'el' || name === 'element' ? 'node' : name;
}

function normalizeParamNames(names: string[]): string[] {
  return names.map(normalizeParamName);
}

function parseObjectKeys(source: string): string[] {
  return splitTopLevel(source)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.split(':')[0].trim())
    .sort();
}

function parseSlotSignature(signature: string): ParsedSlot {
  const trimmed = signature.trim();
  const match = trimmed.match(/^(\w+)\(([\s\S]*)\)$/);

  if (!match) {
    return { name: trimmed, kind: 'none', keys: [] };
  }

  const [, name, rawInner] = match;
  const inner = rawInner.trim();

  if (!inner) {
    return { name, kind: 'none', keys: [] };
  }

  if (inner.startsWith('{') && inner.endsWith('}')) {
    return {
      name,
      kind: 'object',
      keys: parseObjectKeys(inner.slice(1, -1)),
    };
  }

  return { name, kind: 'arg', keys: [] };
}

function parseRenderedSlots(source: string): ParsedSlot[] {
  const matches = [
    ...source.matchAll(/\{@render\s+(\w+)\(([\s\S]*?)\)\}/g),
  ];
  const priority: Record<ParsedSlot['kind'], number> = {
    none: 0,
    arg: 1,
    object: 2,
  };
  const slots = new Map<string, ParsedSlot>();

  for (const match of matches) {
    const [, name, rawInner] = match;
    const inner = rawInner.trim();
    let parsed: ParsedSlot;

    if (!inner) {
      parsed = { name, kind: 'none', keys: [] };
    } else if (inner.startsWith('{') && inner.endsWith('}')) {
      parsed = {
        name,
        kind: 'object',
        keys: parseObjectKeys(inner.slice(1, -1)),
      };
    } else {
      parsed = { name, kind: 'arg', keys: [] };
    }

    const current = slots.get(name);
    if (!current || priority[parsed.kind] > priority[current.kind]) {
      slots.set(name, parsed);
    }
  }

  return [...slots.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function formatSlot(slot: ParsedSlot): string {
  if (slot.kind === 'object') {
    return `${slot.name}({ ${slot.keys.join(', ')} })`;
  }
  if (slot.kind === 'arg') {
    return `${slot.name}(...)`;
  }
  return `${slot.name}()`;
}

function compareSlots(
  componentKey: string,
  actualSlots: ParsedSlot[],
  registrySlots: ParsedSlot[],
) {
  compareArrays(
    `${componentKey} slot names`,
    actualSlots.map((slot) => slot.name),
    registrySlots.map((slot) => slot.name),
  );

  const registryByName = new Map(registrySlots.map((slot) => [slot.name, slot]));

  for (const actualSlot of actualSlots) {
    const registrySlot = registryByName.get(actualSlot.name);
    if (!registrySlot) continue;

    if (actualSlot.kind !== registrySlot.kind) {
      fail(
        `${componentKey} slot signature mismatch for ${actualSlot.name}:\n  actual: ${formatSlot(actualSlot)}\n  registry: ${formatSlot(registrySlot)}`,
      );
      continue;
    }

    if (actualSlot.kind === 'object') {
      compareArrays(
        `${componentKey} slot keys for ${actualSlot.name}`,
        actualSlot.keys,
        registrySlot.keys,
      );
    }
  }
}

function resolveAlias(specifier: string): string | null {
  const aliases: Record<string, string> = {
    '@actions/': path.join(ROOT, 'src/actions/'),
    '@adapters/': path.join(ROOT, 'src/adapters/'),
    '@components/': path.join(ROOT, 'src/components/'),
    '@config/': path.join(ROOT, 'src/config/'),
    '@lib/': path.join(ROOT, 'src/lib/'),
    '@stores/': path.join(ROOT, 'src/stores/'),
  };

  const prefix = Object.keys(aliases).find((alias) => specifier.startsWith(alias));
  if (!prefix) return null;

  const basePath = path.join(aliases[prefix], specifier.slice(prefix.length));
  for (const extension of RESOLVABLE_EXTENSIONS) {
    const candidate = basePath + extension;
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

function resolveSpecifier(specifier: string): string | null {
  if (specifier.startsWith('src/')) {
    const candidate = path.join(ROOT, specifier);
    return fs.existsSync(candidate) ? candidate : null;
  }

  return resolveAlias(specifier);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripGenericSuffix(name: string): string {
  return name.replace(/<.*$/, '');
}

function stripContractName(source: string): string {
  return stripGenericSuffix(
    source
      .replace(/^readonly\s+/, '')
      .split('(')[0]
      .split(':')[0]
      .trim()
      .replace(/\?$/, ''),
  );
}

function hasExportedSymbol(source: string, symbol: string): boolean {
  const escaped = escapeRegExp(stripGenericSuffix(symbol));
  return new RegExp(`\\bexport\\s+(?:function|const|class)\\s+${escaped}\\b`).test(
    source,
  );
}

function hasTypeDeclaration(source: string, typeName: string): boolean {
  const escaped = escapeRegExp(stripGenericSuffix(typeName));
  return new RegExp(`\\b(?:interface|type|class)\\s+${escaped}\\b`).test(source);
}

function hasMethodDeclaration(source: string, memberName: string): boolean {
  const escaped = escapeRegExp(stripGenericSuffix(memberName));
  return new RegExp(
    `^\\s*(?:async\\s+)?${escaped}(?:<[^\\n>]+>)?\\s*\\(`,
    'm',
  ).test(source);
}

function hasGetterDeclaration(source: string, memberName: string): boolean {
  const escaped = escapeRegExp(stripGenericSuffix(memberName));
  return new RegExp(`^\\s*get\\s+${escaped}\\s*\\(`, 'm').test(source);
}

function hasFieldDeclaration(source: string, memberName: string): boolean {
  const escaped = escapeRegExp(stripGenericSuffix(memberName));
  return new RegExp(
    `^\\s*(?:private\\s+|protected\\s+|public\\s+)?(?:readonly\\s+)?${escaped}\\s*=`,
    'm',
  ).test(source);
}

function hasControllerStateMember(source: string, memberName: string): boolean {
  return (
    hasFieldDeclaration(source, memberName) || hasGetterDeclaration(source, memberName)
  );
}

function extractQuotedUnion(source: string): string[] {
  return [...source.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function extractTopLevelModalContractKeys(source: string): string[] {
  const blockMatch = source.match(/type ModalContract = \{([\s\S]*?)^\};/m);
  if (!blockMatch) return [];

  return [...blockMatch[1].matchAll(/^\s{2}(?:'([a-z-]+)'|([a-z]+)):/gm)].map(
    (match) => match[1] ?? match[2],
  );
}

function extractLoadingControllerKeys(source: string): string[] {
  const match = source.match(
    /loading\(message: string\): VoidLoadingToastController \{[\s\S]*?return \{([\s\S]*?)^\s*\};/m,
  );

  if (!match) return [];

  return [...match[1].matchAll(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?::|,)/gm)].map(
    (result) => result[1],
  );
}

function extractPromiseMessageKeys(source: string): string[] {
  const match = source.match(/interface VoidPromiseMessages<[^>]+> \{([\s\S]*?)^\}/m);
  if (!match) return [];

  return [...match[1].matchAll(/^\s{2}([A-Za-z_][A-Za-z0-9_]*)\s*:/gm)].map(
    (result) => result[1],
  );
}

function extractSurfacePatternKeys(source: string): string[] {
  return [...source.matchAll(/^\.(surface-[a-z0-9-]+)\b/gm)].map(
    (match) => match[1],
  );
}

function extractEffectPatternKeys(source: string): string[] {
  return [...source.matchAll(/^\.(shimmer-surface)\b/gm)].map(
    (match) => match[1],
  );
}

function validateCallableEntries(
  sectionLabel: string,
  entries: Record<string, RegistryCallableEntry> | undefined,
  expectedSymbols: string[],
) {
  const registryEntries = entries ?? {};
  const symbols = Object.values(registryEntries).map((entry) => entry.symbol);
  compareArrays(`${sectionLabel} coverage`, symbols, expectedSymbols);

  for (const [key, entry] of Object.entries(registryEntries)) {
    const resolvedImport = resolveSpecifier(entry.import);
    if (!resolvedImport) {
      fail(`${sectionLabel}.${key} import does not resolve: ${entry.import}`);
      continue;
    }

    const source = readText(resolvedImport);
    if (!hasExportedSymbol(source, entry.symbol)) {
      fail(
        `${sectionLabel}.${key} symbol mismatch:\n  expected export: ${entry.symbol}`,
      );
      continue;
    }

    const signatureName = extractSignatureName(entry.signature);
    if (signatureName && signatureName !== entry.symbol) {
      fail(
        `${sectionLabel}.${key} signature name mismatch:\n  actual: ${signatureName}\n  expected: ${entry.symbol}`,
      );
    }

    const actualParamNames = extractFunctionParamNames(source, entry.symbol);
    if (!actualParamNames) {
      fail(`${sectionLabel}.${key} could not parse params for ${entry.symbol}`);
      continue;
    }
    const normalizedActualParamNames = normalizeParamNames(actualParamNames);

    const signatureArgNames = extractSignatureArgNames(entry.signature);
    if (signatureArgNames.length > 0) {
      compareArrays(
        `${sectionLabel}.${key} signature args`,
        normalizedActualParamNames,
        normalizeParamNames(signatureArgNames),
        false,
      );
    }

    const registryArgNames = extractRegistryArgNames(entry.args);
    if (registryArgNames.length > 0) {
      const comparableActualArgs =
        sectionLabel === 'actions' && normalizedActualParamNames.length > 1
          ? normalizedActualParamNames.slice(1)
          : normalizedActualParamNames;
      compareArrays(
        `${sectionLabel}.${key} args`,
        comparableActualArgs,
        normalizeParamNames(registryArgNames),
        false,
      );
    }
  }
}

const registry = readJson<Registry>(PATHS.registry);
const EXPECTED_UTILITY_SYMBOLS = [
  'createPasswordValidation',
  'typewrite',
  'isOneShotEffect',
  'reorderByDrop',
  'resolveReorderByDrop',
];
const EXPECTED_ACTION_SYMBOLS = [
  'tooltip',
  'morph',
  'kinetic',
  'narrative',
  'navlink',
  'draggable',
  'dropTarget',
];
const EXPECTED_CONTROLLER_COMPONENTS = [
  'modal',
  'toast',
  'voidEngine',
  'layerStack',
  'shortcutRegistry',
  'user',
];

for (const [typeName, entry] of Object.entries(registry.types ?? {})) {
  const resolvedSource = resolveSpecifier(entry.source);
  if (!resolvedSource) {
    fail(`type ${typeName} source does not resolve: ${entry.source}`);
    continue;
  }

  if (!hasTypeDeclaration(readText(resolvedSource), typeName)) {
    fail(
      `type ${typeName} was not found in ${entry.source}\n  expected declaration: ${stripGenericSuffix(typeName)}`,
    );
  }
}

const componentFiles = fs
  .readdirSync(PATHS.componentsDir)
  .filter((file) => file.endsWith('.svelte'))
  .map((file) => file.replace(/\.svelte$/, ''));
const registryComponents = Object.values(registry.components).map(
  (entry) => entry.component,
);

compareArrays(
  'UI component coverage',
  componentFiles,
  registryComponents,
);

for (const [componentKey, entry] of Object.entries(registry.components)) {
  const expectedImport = `@components/ui/${entry.component}.svelte`;
  if (entry.import !== expectedImport) {
    fail(
      `${componentKey} import mismatch:\n  actual: ${entry.import}\n  expected: ${expectedImport}`,
    );
  }

  const resolvedImport = resolveSpecifier(entry.import);
  if (!resolvedImport) {
    fail(`${componentKey} import does not resolve: ${entry.import}`);
    continue;
  }

  const source = readText(resolvedImport);
  const actualProps = parseComponentProps(source);
  if (actualProps.length === 0) {
    fail(`${componentKey} props could not be parsed from ${entry.import}`);
    continue;
  }

  const actualPublicSlotProps = actualProps.filter((prop) =>
    SLOT_PROP_NAMES.has(prop),
  );
  const actualNonSlotProps = actualProps.filter(
    (prop) => !actualPublicSlotProps.includes(prop),
  );
  const registryProps = entry.props.map(normalizeRegistryProp);
  compareArrays(`${componentKey} props`, actualNonSlotProps, registryProps);

  const interfaceName = extractPropsInterfaceName(source);
  const actualPropTypes = interfaceName
    ? parseInterfacePropertyTypes(source, interfaceName)
    : new Map<string, string>();
  const registryPropTypes = Object.keys(entry.propTypes ?? {}).sort();
  for (const propName of registryPropTypes) {
    if (!actualNonSlotProps.includes(propName)) {
      fail(
        `${componentKey} propTypes references missing prop: ${propName}`,
      );
      continue;
    }

    const actualType = actualPropTypes.get(propName);
    if (!actualType) {
      continue;
    }

    const registryType = normalizeContractText(entry.propTypes?.[propName] ?? '');
    if (actualType !== registryType) {
      fail(
        `${componentKey} propTypes mismatch for ${propName}:\n  actual: ${actualType}\n  registry: ${registryType}`,
      );
    }
  }

  const actualSlots = parseRenderedSlots(source).filter((slot) =>
    actualPublicSlotProps.includes(slot.name),
  );
  const registrySlots = entry.slots.map(parseSlotSignature).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  compareSlots(componentKey, actualSlots, registrySlots);
}

validateCallableEntries(
  'utilities',
  registry.utilities,
  EXPECTED_UTILITY_SYMBOLS,
);
validateCallableEntries('actions', registry.actions, EXPECTED_ACTION_SYMBOLS);

const referencedPasswordUtility = Object.entries(registry.components)
  .filter(([, entry]) => entry.compose?.includes('createPasswordValidation'))
  .map(([key]) => key);
if (
  referencedPasswordUtility.length > 0 &&
  !Object.values(registry.utilities ?? {}).some(
    (entry) => entry.symbol === 'createPasswordValidation',
  )
) {
  fail(
    `createPasswordValidation is referenced by ${referencedPasswordUtility.join(', ')} but no utility entry exists`,
  );
}

const controllerEntries = Object.values(registry.controllers);
const registryControllerComponents = controllerEntries.map(
  (entry) => entry.component,
);
compareArrays(
  'controller coverage',
  registryControllerComponents,
  EXPECTED_CONTROLLER_COMPONENTS,
);

for (const [controllerKey, entry] of Object.entries(registry.controllers)) {
  const resolvedImport = resolveSpecifier(entry.import);
  if (!resolvedImport) {
    fail(
      `controller ${controllerKey} import does not resolve: ${entry.import}`,
    );
    continue;
  }

  if (!hasExportedSymbol(readText(resolvedImport), entry.component)) {
    fail(
      `controller ${controllerKey} symbol mismatch:\n  expected export: ${entry.component}`,
    );
    continue;
  }

  const source = readText(resolvedImport);
  const apiMethodNames = (entry.api ?? []).map(stripContractName);
  for (const methodName of apiMethodNames) {
    if (!hasMethodDeclaration(source, methodName)) {
      fail(`controller ${controllerKey} api method missing in source: ${methodName}`);
    }
  }

  const stateMemberNames = (entry.state ?? []).map(stripContractName);
  for (const memberName of stateMemberNames) {
    if (!hasControllerStateMember(source, memberName)) {
      fail(
        `controller ${controllerKey} state member missing in source: ${memberName}`,
      );
    }
  }

  const registryMethodNames = Object.keys(entry.methods ?? {});
  if (registryMethodNames.length > 0) {
    compareArrays(
      `controller ${controllerKey} api vs methods`,
      apiMethodNames,
      registryMethodNames,
      false,
    );
  }

  for (const [methodName, methodEntry] of Object.entries(entry.methods ?? {})) {
    if (!hasMethodDeclaration(source, methodName)) {
      fail(`controller ${controllerKey} method missing in source: ${methodName}`);
      continue;
    }

    const actualParamNames = extractMethodParamNames(source, methodName);
    if (!actualParamNames) {
      fail(
        `controller ${controllerKey} could not parse params for method: ${methodName}`,
      );
      continue;
    }

    const registryArgNames = extractRegistryArgNames(methodEntry.args);
    compareArrays(
      `controller ${controllerKey}.${methodName} args`,
      actualParamNames,
      registryArgNames,
      false,
    );
  }
}

const modalRegistryText = readText(PATHS.modalRegistry);
const modalTypesText = readText(PATHS.modalTypes);
const toastStoreText = readText(PATHS.toastStore);
const sharedTypesText = readText(PATHS.sharedTypes);
const modalController = registry.controllers.modal as
  | RegistryModalControllerEntry
  | undefined;
const toastController = registry.controllers.toast as
  | RegistryToastControllerEntry
  | undefined;

const modalKeysBlock = modalRegistryText.match(
  /export const MODAL_KEYS = \{([\s\S]*?)\} as const;/m,
);
const modalKeys = modalKeysBlock ? extractQuotedUnion(modalKeysBlock[1]) : [];
const modalContractKeys = extractTopLevelModalContractKeys(modalTypesText);
compareArrays('modal keys vs modal contract', modalKeys, modalContractKeys);

const registryModalKeys = modalController?.keys ?? [];
compareArrays('registry modal keys', modalKeys, registryModalKeys);

const registryOpenKeys = modalController?.methods?.open?.keys ?? [];
compareArrays('registry modal open keys', modalKeys, registryOpenKeys);

const registryOpenPropsByKey = Object.keys(
  modalController?.methods?.open?.propsByKey ?? {},
);
compareArrays('registry modal propsByKey keys', modalKeys, registryOpenPropsByKey);

const sizeUnionMatch = modalTypesText.match(/size:\s*([^;]+);/);
const modalSizes = sizeUnionMatch ? extractQuotedUnion(sizeUnionMatch[1]) : [];
const registryModalSizes = modalController?.methods?.open?.sizes ?? [];
compareArrays('registry modal sizes', modalSizes, registryModalSizes);

const toastTypeUnionMatch = sharedTypesText.match(/type VoidToastType = ([^;]+);/);
const toastTypes = toastTypeUnionMatch
  ? extractQuotedUnion(toastTypeUnionMatch[1])
  : [];
const registryToastTypes = toastController?.types ?? [];
compareArrays('registry toast types', toastTypes, registryToastTypes);

const loadingControllerKeys = extractLoadingControllerKeys(toastStoreText);
const registryLoadingReturns = toastController?.methods?.loading?.returns ?? [];
const normalizedRegistryLoadingReturns = registryLoadingReturns.map((entry) =>
  entry.startsWith('id:') ? 'id' : entry.split('(')[0],
);
compareArrays(
  'registry toast.loading controller',
  loadingControllerKeys,
  normalizedRegistryLoadingReturns,
  false,
);

const promiseMessageKeys = extractPromiseMessageKeys(sharedTypesText);
const registryPromiseMessages =
  toastController?.methods?.promise?.messages?.map((entry) =>
    entry.split(':')[0],
  ) ?? [];
compareArrays(
  'registry toast.promise messages',
  promiseMessageKeys,
  registryPromiseMessages,
  false,
);

const referenceKeys = new Set([
  ...Object.keys(registry.components),
  ...Object.keys(registry.utilities ?? {}),
  ...Object.keys(registry.actions ?? {}),
  ...Object.keys(registry.controllers),
  ...Object.keys(registry.patterns),
  ...Object.keys(registry.layouts ?? {}),
]);

for (const [sectionLabel, section] of Object.entries({
  components: registry.components,
  utilities: registry.utilities ?? {},
  actions: registry.actions ?? {},
  controllers: registry.controllers,
  patterns: registry.patterns,
  layouts: registry.layouts ?? {},
})) {
  for (const [entryKey, entry] of Object.entries(section)) {
    const related = (entry as { related?: string[] }).related ?? [];
    for (const reference of related) {
      if (!referenceKeys.has(reference)) {
        fail(
          `${sectionLabel}.${entryKey} related reference does not resolve: ${reference}`,
        );
      }
    }
  }
}

const patternKeys = Object.keys(registry.patterns);
const requiredPatternKeys = [
  ...extractSurfacePatternKeys(readText(PATHS.containersScss)),
  ...extractEffectPatternKeys(readText(PATHS.effectsScss)),
];

for (const patternKey of requiredPatternKeys) {
  if (!patternKeys.includes(patternKey)) {
    fail(`pattern missing for shipped class recipe: ${patternKey}`);
  }
}

if (errors.length > 0) {
  console.error('Component registry check failed.\n');
  errors.forEach((error, index) => {
    console.error(`${index + 1}. ${error}\n`);
  });
  process.exit(1);
}

console.log(
  'Component registry is consistent with type, component, action, utility, controller, layout, and pattern sources.',
);
