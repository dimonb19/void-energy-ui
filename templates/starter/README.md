# Starter Handoff

This folder holds starter-specific assets that should live in the future consumer repo, not in the editable Void Energy source workspace.

## Copy Into The Starter

Seed the starter from a tagged snapshot of this repo so the runtime, layout shell, actions, stores, registries, and shipped primitives stay in sync. Then overlay the starter-specific files from this folder.

- `templates/starter/CLAUDE.md` -> starter repo root as `CLAUDE.md`
- `templates/starter/README.md` -> starter repo root as `README.md`
- `templates/starter/scripts/validate.ts` -> starter repo `scripts/validate.ts`
- `templates/starter/src/pages/index.astro` -> starter repo `src/pages/index.astro`
- `templates/starter/src/pages/_template.astro` -> starter repo `src/pages/_template.astro`
- `templates/starter/src/components/app/HomePage.svelte` -> starter repo `src/components/app/HomePage.svelte`
- `templates/starter/src/components/app/TemplatePage.svelte` -> starter repo `src/components/app/TemplatePage.svelte`

Copy these source-repo files into the starter overlay as well:

- `AI-PLAYBOOK.md`
- `COMPOSITION-RECIPES.md`
- `src/config/component-registry.json`
- `src/types/`
- `.claude/commands/build-page.md`
- `.claude/commands/new-page.md`
- `.claude/rules/page-composition.md`
- `.claude/rules/component-usage.md`
- `.claude/rules/styling.md`
- `.claude/rules/read-only-system.md`
- `.claude/rules/new-page.md`
- any existing `.claude/rules/*.md` and `.claude/hooks/*` you want enforced

Add this to the starter `package.json` scripts:

```json
{
  "scripts": {
    "validate": "tsx scripts/validate.ts"
  }
}
```

## Starter Shape

Use this structure in the starter repo:

```text
void-energy-starter/
  CLAUDE.md
  README.md
  .claude/
  src/
    config/
      component-registry.json
      design-tokens.ts
    components/
      ui/
      icons/
      core/
      app/
        HomePage.svelte
        TemplatePage.svelte
    layouts/
      Layout.astro
    pages/
      index.astro
      _template.astro
    styles/
    types/
  scripts/
    validate.ts
```

## Baseline Lock

The starter validator treats these as shipped system paths:

- `src/components/ui/`
- `src/components/icons/`
- `src/components/core/`
- `src/styles/`
- `src/types/`
- `src/config/design-tokens.ts`

By default it compares those paths against the repository root commit, which gives you a stable starter baseline instead of a moving branch baseline.

If you intentionally approve a new shipped-system baseline later, either:

- create `.void-starter-baseline` in the starter repo root and put a commit, tag, or branch ref inside it
- or run validation with `VOID_VALIDATE_BASELINE_REF=<ref>`

Do not point the validator at a moving ref like `origin/main` unless you explicitly want a moving policy gate.

## Why These Stay Separate

This repo is the editable source of the UI system.

The starter is the composition-only workspace where AI should:

- build pages
- reuse shipped primitives
- avoid editing `src/components/ui/`
- avoid editing `src/components/icons/`
- avoid editing `src/components/core/`
- avoid editing `src/styles/`
- avoid editing `src/types/`
- avoid editing `src/config/design-tokens.ts`

That no-edit policy belongs in the starter, not in the source workspace.

## Source Repo Note

This source repo intentionally does not expose a starter validator. Use `npm run check` and `npm run scan` here. `npm run validate` belongs only in the starter repo.
