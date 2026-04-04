---
paths:
  - "src/components/ui/**/*"
  - "src/components/icons/**/*"
  - "src/components/core/**/*"
  - "src/styles/**/*"
  - "src/types/**/*"
  - "src/config/design-tokens.ts"
---

# STOP - Read-Only System

You are inside shipped system files.

In the starter repo, these paths are read-only by convention:

- `src/components/ui/`
- `src/components/icons/`
- `src/components/core/`
- `src/styles/`
- `src/types/`
- `src/config/design-tokens.ts`

## Developer-Editable Config Files

These files are designed for customization and are NOT read-only:

- `src/config/fonts.ts` — add/remove font families
- `src/config/atmospheres.ts` — add/replace theme palettes
- `src/config/constants.ts` — change default atmosphere / physics

## What To Do

- Stop editing this file
- Return to `src/pages/` or `src/components/app/`
- Only use `src/layouts/` when the shared shell itself needs to change
- Compose with the shipped system instead of modifying it

## Only Continue If

- the user explicitly asked for system-level work
- and changing the shipped system is truly required

Otherwise, close this file and build the page from consumer files.
