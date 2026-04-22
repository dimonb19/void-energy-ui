Document recent changes following established project conventions. Keeps the AI-facing documentation in sync with the code.

## Scope

If an argument is provided (e.g. `/document DropZone`), scope to that specific component, feature, or file.

Otherwise, identify all recent changes:

- `git diff HEAD~1 --name-only` (last commit)
- `git diff --name-only` (uncommitted, staged + unstaged)

Categorize the changes: new components, modified components, new styles, new features, new actions, new singletons, structural changes.

## Canonical documentation surfaces

These are the files you may update. Pick the right one — updating the wrong surface creates drift.

| Surface | Purpose | When to update |
|---|---|---|
| [CHEAT-SHEET.md](../../CHEAT-SHEET.md) | Developer reference — components, actions, transitions, mixins, patterns | New or changed component / action / mixin / pattern |
| [AI-PLAYBOOK.md](../../AI-PLAYBOOK.md) | High-level "how AI should work here" | New operating principle introduced |
| [COMPOSITION-RECIPES.md](../../COMPOSITION-RECIPES.md) | Page archetypes | New page archetype demonstrated |
| [SYSTEM-PROMPT.md](../../SYSTEM-PROMPT.md) | Tool-agnostic LLM system prompt | Any shipped primitive, action, token, or 5-Law-level rule changed — SYSTEM-PROMPT.md is the portable contract and must stay accurate |
| [src/config/component-registry.json](../../src/config/component-registry.json) | Machine-readable inventory | New component, changed props/slots, renamed component |
| [packages/kinetic-text/AI-REFERENCE.md](../../packages/kinetic-text/AI-REFERENCE.md) | Kinetic-text runtime AI contract (for CoNexus LLM pipeline) | New/changed KT effect, reveal style, speed preset |
| [packages/ambient-layers/AI-REFERENCE.md](../../packages/ambient-layers/AI-REFERENCE.md) | Ambient-layers runtime AI contract | New/changed ambient effect or layer category |
| [CONTRIBUTING.md](../../CONTRIBUTING.md) | PR process and conventions | New workflow rule or convention |
| [README.md](../../README.md) | Project overview | New scripts, new path aliases, new top-level structure |
| [THEME-GUIDE.md](../../THEME-GUIDE.md) | Custom theme authoring | New palette key or WCAG rule |

Do **not** create new top-level documentation files without explicit user approval — documentation sprawl is a drift vector.

## Steps

### 1. Identify what changed

- Run the git diffs scoped above.
- List each touched file and categorize it.
- Cross-reference the categorization against the surface table to determine which docs need updating.

### 2. Read what exists

For each doc surface that needs updating:

- Read the current content for the relevant section.
- Read the changed source files (component `.svelte`, partner SCSS, action `.ts`, etc.) to extract accurate props, state logic, behavior, and physics nuances.
- If docs already cover the change accurately, skip that surface.

### 3. Update CHEAT-SHEET.md (most common surface)

For each new or significantly changed component, add or update a section using this exact format:

```markdown
#### `<ComponentName>` — Brief description

**Location:** `src/components/ui/ComponentName.svelte`
**CSS:** `.kebab-name` (`src/styles/components/_file.scss`)

**Props:**
| Prop | Type | Default | Description |
| --- | --- | --- | --- |

**States:** (if applicable)
| State | Attribute | Visual |
| --- | --- | --- |

**Usage:**
```svelte
<ComponentName prop="value" />
```

**Physics:**
- **Glass:** description
- **Flat:** description
- **Retro:** description
```

Do NOT add sections for components that are already fully documented and unchanged.

### 4. Update SYSTEM-PROMPT.md (when contract-level changes happen)

Update `SYSTEM-PROMPT.md` when any of the following changed:

- A shipped primitive's public API (props, slots, name).
- A token's semantic meaning or the token dictionary shape.
- A 5-Law rule or its enforcement boundary.
- An action, controller, or singleton's public contract.
- The component catalog (new component shipped, existing one removed).
- Import paths for public primitives.

The file is hand-curated. Do not regenerate it from scratch. Edit in place to reflect the change while preserving the document's condensed tone (it is consumed by LLMs via API, not read by humans).

Do **not** add to SYSTEM-PROMPT.md:

- Claude Code-specific mechanics (walk-up, `.claude/` directory, rules, hooks).
- Development workflow (pre-flight audit, analog matching — those stay in `CLAUDE.md` / `src/CLAUDE.md`).
- Monorepo build commands.
- Premium package internals (those ship in their own context).

### 5. Update registry-adjacent docs

- If a new component was added, the registry entry must already exist (it's required by the `/new-component` command). Verify `npm run check:registry` passes.
- If a kinetic-text or ambient-layers effect changed, update the matching package `AI-REFERENCE.md`. That file is the canonical source for the runtime AI contract — do not duplicate the information in root-level docs.

### 6. Update other docs — only when relevant

- **CONTRIBUTING.md** — only if a new pattern, convention, or workflow rule was introduced.
- **README.md** — only if project structure changed (new directories, new path aliases, new scripts).
- **THEME-GUIDE.md** — only if theme authoring rules or palette contract changed.
- Skip these for routine component additions.

### 7. Output summary

After making changes, output:

- Which doc surfaces were updated (list file paths + section names).
- What was added, modified, or removed in each.
- Any inconsistencies found during the pass (undocumented components, stale references, broken cross-links).
- Anything that needs attention but is out of scope for this invocation (missing showcases, incomplete physics notes, orphaned registry entries).
