# AI Playbook

Compact operating guide for AI agents building apps with Void Energy. Tool-aware companion to [SYSTEM-PROMPT.md](SYSTEM-PROMPT.md) (the tool-agnostic contract) — this file maps the contract onto how to actually find context inside this repo.

## Job

Build pages and app screens by composing the shipped system.

- Reuse existing primitives, actions, controllers, layouts, and native HTML patterns.
- In the starter repo, prefer editing `src/pages/` and `src/components/app/`. Edit `src/layouts/` only for shared shell changes.
- Do not edit shipped system files in `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the task explicitly asks for design-system work.

## Layer Map (L0 / L1 / L2)

The repo is structured as three concentric layers. Know which layer you are editing — the rules differ.

- **L0 — `packages/void-energy-tailwind/`** — framework-agnostic Tailwind preset. Pure CSS + vanilla JS. No Svelte, no SCSS dependencies. Token output must match L1 exactly. Consumers in React/Vue/HTML take this.
- **L1 — `src/` plus premium packages** — full Svelte 5 design system in `src/`, plus premium add-ons (`packages/ambient-layers/`, `packages/kinetic-text/`, `packages/dgrs/`).
  - `src/components/ui/`, `src/components/icons/`, `src/components/core/` — shipped primitives. Read-only outside system tasks.
  - `src/components/app/` and `src/pages/` — app-level / consumer-side. This is where consumer composition happens.
- **L2 — `.claude/`, `CLAUDE.md` files, registry, catalogs, `SYSTEM-PROMPT.md`, `AGENTS.md`, `skills/`** — AI workflow infrastructure that sits on top of the system. Walk-up `CLAUDE.md` resolution loads layer-specific rules per CWD.

## First Stops

Read these in order before inventing anything:

1. `src/config/component-registry.json` — authoritative inventory of primitives, actions, controllers, utilities, patterns, and layouts.
2. `COMPOSITION-RECIPES.md` — page archetypes composed from shipped primitives.
3. The nearest `CLAUDE.md` for your CWD (root + `src/CLAUDE.md` + `src/pages/CLAUDE.md` + per-package files load automatically).
4. `.claude/rules/*.md` relevant to the file type you are touching.

For premium-package work, the **package `AI-REFERENCE.md` is canonical** — go there before reading the catalogs:

- Working with ambient layers (rain, fog, danger, impact, …) → read [packages/ambient-layers/AI-REFERENCE.md](packages/ambient-layers/AI-REFERENCE.md). It owns the variant/intensity vocabulary, lifetime semantics (sticky / decay / one-shot), and scene recipes.
- Working with kinetic text (reveal styles, continuous effects, one-shot punctuation, TTS sync) → read [packages/kinetic-text/AI-REFERENCE.md](packages/kinetic-text/AI-REFERENCE.md). It owns `revealStyle`, `speedPreset`, `activeEffect`, `punctuation`, and `styleSpans`.

Use `CHEAT-SHEET.md` for deeper SCSS/component examples only after the compact sources above.

## Build Order

1. Parse the user request into page goals, content blocks, interactions, and mood.
2. Check the component registry for shipped primitives, actions, controllers, and patterns.
3. Check `COMPOSITION-RECIPES.md` for the nearest page archetype.
4. Read the nearest local page analog in `src/pages/`, `src/components/app/`, or app-level `src/components/`. Read `src/layouts/` only if the task touches the shared shell.
5. Compose the page with shipped pieces.
6. Run the narrow verification set for the touched files.

## Compose-Only Rules

- There is no prize for creating a new primitive when a shipped one already exists.
- Native HTML is valid Void Energy output when the system styles it already.
- Tailwind owns page composition, responsive layout, spacing, and consumer-side geometry.
- SCSS owns visual physics, materials, and primitive-internal geometry. Do not move those concerns into Tailwind.
- State belongs in `data-*` and ARIA attributes, not modifier classes.
- Before writing Tailwind classes, check `.claude/rules/tailwind-registry.md` — standard Tailwind scales (numeric spacing, stock colors, default breakpoints) are fully replaced with semantic tokens.

## No-Invention Matrix

If the request sounds like this, use the shipped system first:

- Choice picker: `selector`, `switcher`, `tabs`, `combobox`
- Boolean control: `toggle`
- Text input: `edit-field`, `generate-field`, `edit-textarea`, `generate-textarea`, `search-field`
- Navigation: `sidebar`, `breadcrumbs`, `tabs`, `dropdown`, `navlink`
- Actions: native `<button>` with `btn-*`, `ActionBtn`, `IconBtn`
- Feedback: `toast`, `modal`, `skeleton`, `progress-ring`
- Media: `image`, `avatar`, `video`, `adaptive-image` (physics/mode-aware decorative imagery — never branch on atmosphere name in app code)
- Markdown / formatted string content: `markdown` (do not hand-roll `marked()` + `{@html}`; pass `trusted` only for strings committed in source)
- Data display: `stat-card`, `line-chart`, `bar-chart`, `donut-chart`, `sparkline`
- Motion: `tooltip`, `morph`, `kinetic`, `narrative`, `aura`, `font-shift`, `laser-aim`
- Ambient color glow / color spill from image / scene tinting: `use:aura` (color optional — omit for atmosphere-driven glow) + `extractAura` (only when color must come from an image). Do NOT hand-write `box-shadow`, `radial-gradient`, `filter: blur()`, or sibling overlay divs to recreate the effect.
- Drag and reorder: `draggable`, `dropTarget`, `reorderByDrop`, `resolveReorderByDrop`
- Backdrop weather / mood overlays / one-shot scene beats: `@void-energy/ambient-layers` — `ambient.push(category, variant, intensity)` for sticky layers, `ambient.fire(variant, intensity)` for one-shot beats. Mount `<AmbientHost />` once at the layout level.
- Text reveals with continuous mood and one-shot punctuation: `@void-energy/kinetic-text` — `KineticText` for narrative beats, `TtsKineticBlock` for TTS-synced reveal with timed action dispatch. The free `use:kinetic` action covers basic typewriter / cycle / decode reveals only; the package adds the 37-effect narrative library.
- TTS-synced narrative reveal: `TtsKineticBlock` — wires `<audio>`, reveal timing, and timed action dispatch together. See `COMPOSITION-RECIPES.md › Narrative UI`.

If the request still appears uncovered, prove it by checking the registry first and naming the missing capability explicitly.

## Page Defaults

- Page wrapper: `container flex flex-col gap-2xl py-2xl`
- Section wrapper: `flex flex-col gap-xl`
- Floating surfaces: `surface-raised p-lg flex flex-col gap-lg`
- Sunk wells: `surface-sunk p-md flex flex-col gap-md`
- Tight coupling only: `gap-xs` for label → input, icon + text, title + subtitle

## Verification

Run the narrowest set that matches the change:

- `npm run check` for TS/Svelte and registry validation
- `npm run scan` after editing `.svelte` or `.scss`
- `npm run test` when logic or stores change
- `npm run build:tokens` after editing `src/config/design-tokens.ts`

When UI changed, verify across `glass`, `flat`, and `retro`, and both modes where supported.

## Repo Roles

This repo is the editable source of the system.

- Design-system work (L1): edit `src/components/ui/`, `src/styles/`, `src/config/`, `src/lib/`, `src/actions/`, `src/stores/`, and registry docs only when the task is about the system itself.
- Premium-package work: edit a single `packages/<name>/` at a time; package boundaries (peer dep on `void-energy`, no `../../src/` reaches, no cross-package imports) are load-bearing.
- App-building work: stay in consumer files (`src/pages/`, `src/components/app/`) and compose with what ships.

The future starter should copy the starter-specific material from `templates/starter/`.
