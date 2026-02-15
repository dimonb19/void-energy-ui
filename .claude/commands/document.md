Document recent changes following established project conventions.

## Scope

If an argument is provided (e.g. `/document DropZone`), scope to that specific component or feature. Otherwise, identify all recent changes by running `git diff HEAD~1 --name-only` and `git diff --name-only` (staged + unstaged).

## Steps

### 1. Identify what changed
- Run `git diff HEAD~1 --name-only` to find recently committed changes
- Run `git diff --name-only` to find uncommitted changes
- Categorize: new components, modified components, new styles, new features, structural changes

### 2. Read what exists
- Read `CHEAT-SHEET.md` to understand current documentation state
- Read the changed component files to extract props interfaces, state logic, and behavior
- Read the corresponding SCSS files to understand physics behavior (glass/flat/retro)

### 3. Update CHEAT-SHEET.md
For each new or significantly changed component, add or update a section using this exact format:

```markdown
#### `<ComponentName>` — Brief description

**Location:** `src/components/ui/ComponentName.svelte`
**CSS:** `.class-name` (`src/styles/components/_file.scss`)

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

### 4. Check showcase coverage
- For each new UI component in `src/components/ui/`, check if a corresponding demo exists in `src/components/ui-library/`
- If missing, **flag it** in the summary output — do not auto-create showcases (they require design intent from the user)

### 5. Update other docs (only when relevant)
- **CONTRIBUTING.md** — Only if a new pattern, convention, or workflow rule was introduced
- **README.md** — Only if project structure changed (new directories, new path aliases, new scripts)
- Skip these files if the changes are routine component additions

### 6. Output summary
After making changes, output a brief summary:
- What was documented (files updated, sections added/modified)
- What still needs attention (missing showcases, incomplete physics notes, etc.)
- Any inconsistencies found (undocumented components, stale references)
