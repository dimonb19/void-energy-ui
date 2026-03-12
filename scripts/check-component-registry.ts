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
  compose?: string;
};

type RegistryUtilityEntry = {
  symbol: string;
  import: string;
};

type Registry = {
  components: Record<string, RegistryComponentEntry>;
  utilities?: Record<string, RegistryUtilityEntry>;
  controllers: {
    modal?: {
      import: string;
      keys?: string[];
      methods?: {
        open?: {
          keys?: string[];
          sizes?: string[];
          propsByKey?: Record<string, string[]>;
        };
      };
    };
    toast?: {
      import: string;
      types?: string[];
      methods?: {
        loading?: {
          returns?: string[];
        };
        promise?: {
          messages?: string[];
        };
      };
    };
  };
  patterns: Record<string, unknown>;
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

  for (const char of source) {
    if (char === '(') depthParen += 1;
    if (char === ')') depthParen -= 1;
    if (char === '{') depthBrace += 1;
    if (char === '}') depthBrace -= 1;
    if (char === '[') depthBracket += 1;
    if (char === ']') depthBracket -= 1;

    if (
      char === ',' &&
      depthParen === 0 &&
      depthBrace === 0 &&
      depthBracket === 0
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

function extractQuotedUnion(source: string): string[] {
  return [...source.matchAll(/'([^']+)'/g)].map((match) => match[1]);
}

function extractTopLevelModalContractKeys(source: string): string[] {
  const blockMatch = source.match(/type ModalContract = \{([\s\S]*?)^\};/m);
  if (!blockMatch) return [];

  return [...blockMatch[1].matchAll(/^\s{2}([a-z]+):/gm)].map(
    (match) => match[1],
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

const registry = readJson<Registry>(PATHS.registry);
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

  const resolvedImport = resolveAlias(entry.import);
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

  const actualSlots = parseRenderedSlots(source).filter((slot) =>
    actualPublicSlotProps.includes(slot.name),
  );
  const registrySlots = entry.slots.map(parseSlotSignature).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  compareSlots(componentKey, actualSlots, registrySlots);
}

const utilityEntry = registry.utilities?.['create-password-validation'];
if (!utilityEntry) {
  fail('utilities.create-password-validation is missing');
} else {
  const resolvedImport = resolveAlias(utilityEntry.import);
  if (!resolvedImport) {
    fail(
      `create-password-validation import does not resolve: ${utilityEntry.import}`,
    );
  } else {
    const source = readText(resolvedImport);
    if (!source.includes(`export function ${utilityEntry.symbol}(`)) {
      fail(
        `create-password-validation symbol mismatch:\n  expected export: ${utilityEntry.symbol}`,
      );
    }
  }
}

const referencedPasswordUtility = Object.entries(registry.components)
  .filter(([, entry]) => entry.compose?.includes('createPasswordValidation'))
  .map(([key]) => key);
if (referencedPasswordUtility.length > 0 && !utilityEntry) {
  fail(
    `createPasswordValidation is referenced by ${referencedPasswordUtility.join(', ')} but no utility entry exists`,
  );
}

const modalRegistryText = readText(PATHS.modalRegistry);
const modalTypesText = readText(PATHS.modalTypes);
const toastStoreText = readText(PATHS.toastStore);
const sharedTypesText = readText(PATHS.sharedTypes);

const modalKeysBlock = modalRegistryText.match(
  /export const MODAL_KEYS = \{([\s\S]*?)\} as const;/m,
);
const modalKeys = modalKeysBlock ? extractQuotedUnion(modalKeysBlock[1]) : [];
const modalContractKeys = extractTopLevelModalContractKeys(modalTypesText);
compareArrays('modal keys vs modal contract', modalKeys, modalContractKeys);

const registryModalKeys = registry.controllers.modal?.keys ?? [];
compareArrays('registry modal keys', modalKeys, registryModalKeys);

const registryOpenKeys =
  registry.controllers.modal?.methods?.open?.keys ?? [];
compareArrays('registry modal open keys', modalKeys, registryOpenKeys);

const registryOpenPropsByKey = Object.keys(
  registry.controllers.modal?.methods?.open?.propsByKey ?? {},
);
compareArrays('registry modal propsByKey keys', modalKeys, registryOpenPropsByKey);

const sizeUnionMatch = modalTypesText.match(/size:\s*([^;]+);/);
const modalSizes = sizeUnionMatch ? extractQuotedUnion(sizeUnionMatch[1]) : [];
const registryModalSizes = registry.controllers.modal?.methods?.open?.sizes ?? [];
compareArrays('registry modal sizes', modalSizes, registryModalSizes);

const modalControllerImport = registry.controllers.modal?.import;
if (!modalControllerImport || !resolveAlias(modalControllerImport)) {
  fail(`modal controller import does not resolve: ${modalControllerImport ?? '(missing)'}`);
}

const toastControllerImport = registry.controllers.toast?.import;
if (!toastControllerImport || !resolveAlias(toastControllerImport)) {
  fail(`toast controller import does not resolve: ${toastControllerImport ?? '(missing)'}`);
}

const toastTypeUnionMatch = sharedTypesText.match(/type VoidToastType = ([^;]+);/);
const toastTypes = toastTypeUnionMatch
  ? extractQuotedUnion(toastTypeUnionMatch[1])
  : [];
const registryToastTypes = registry.controllers.toast?.types ?? [];
compareArrays('registry toast types', toastTypes, registryToastTypes);

const loadingControllerKeys = extractLoadingControllerKeys(toastStoreText);
const registryLoadingReturns =
  registry.controllers.toast?.methods?.loading?.returns ?? [];
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
  registry.controllers.toast?.methods?.promise?.messages?.map((entry) =>
    entry.split(':')[0],
  ) ?? [];
compareArrays(
  'registry toast.promise messages',
  promiseMessageKeys,
  registryPromiseMessages,
  false,
);

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

console.log('Component registry is consistent with component, utility, controller, and pattern sources.');
