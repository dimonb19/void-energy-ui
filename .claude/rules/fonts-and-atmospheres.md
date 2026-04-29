---
paths:
  - "src/config/fonts.ts"
  - "src/config/atmospheres.ts"
  - "src/config/constants.ts"
---

# Fonts & Atmospheres — File Architecture

## File Roles

| File | Purpose | Editable? |
|------|---------|-----------|
| `src/config/fonts.ts` | All font definitions, preload config, font utilities | Yes — developer entry point |
| `src/config/atmospheres.ts` | Free atmosphere palettes (4 themes), semantic color bases | Yes — developer entry point |
| `src/config/design-tokens.ts` | Orchestrator: spacing, physics, typography + re-exports | Read-only in starter |
| `src/config/constants.ts` | Runtime defaults (ATMOSPHERE, PHYSICS, MODE) | Yes — change default theme here |

## Adding a Font

1. Add entry to `FONTS` in `src/config/fonts.ts`
2. Place `.woff2` files in `/public/fonts/`
3. Run `npm run build:tokens`

Do NOT edit `design-tokens.ts` for font changes.

## Adding an Atmosphere

1. Add entry to `ATMOSPHERES` in `src/config/atmospheres.ts`
2. Follow the theme creation checklist (see `.claude/rules/theme-creation.md`)
3. Run `npm run build:tokens`

Do NOT add themes directly to `VOID_TOKENS.themes` in `design-tokens.ts`.

## Changing the Default Atmosphere

Three places must stay in sync:

1. **`src/config/constants.ts`** — `DEFAULTS.ATMOSPHERE`, `LIGHT_ATMOSPHERE`, `PHYSICS`
2. **`src/styles/base/_themes.scss`** — SCSS initial-paint defaults (physics preset + theme key)
3. The default theme's `physics` value must match `DEFAULTS.PHYSICS`

If these drift, users see a flash of wrong theme on first paint.

## Import Rules

- Consumer code imports from `@config/design-tokens` (re-exports everything)
- Direct imports from `@config/fonts` or `@config/atmospheres` are also valid
- DGRS atmospheres live in `packages/dgrs/src/config/atmospheres.ts` — not in core

## The 4 Free Atmospheres

| Theme | Physics | Mode | Font |
|-------|---------|------|------|
| frost | glass | dark | Space Grotesk (sharp) + Inter (clean) — default |
| graphite | flat | dark | Inter (clean) |
| terminal | retro | dark | Courier Prime (code) |
| meridian | flat | light | Poppins (geometric) + Inter (clean) |

These cover all 3 physics presets and both color modes.
