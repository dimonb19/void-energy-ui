# Phase 1 — Workspace and Contracts

## Goal

Create the extraction-safe workspace package and lock the initial contract surface before any renderer code exists.

## Inputs and dependencies

- [00-rules.md](./00-rules.md)
- [01-architecture.md](./01-architecture.md)
- Current OSS type names in `src/types/kinetic.d.ts` and `src/types/narrative.d.ts`

## In scope

- Root npm workspace setup
- `packages/story-text-premium` scaffold
- Initial package exports
- Complete type surface (including RevealStyle, StaggerPattern)
- Host adapter entry point
- Package-scoped SCSS stub
- Planning documents and phase sequence

## Out of scope

- `pretext` integration
- Final line rendering
- Timeline implementation
- Effect playback
- Conexus wrapper implementation

## Decisions already locked

- Package path: `packages/story-text-premium`
- Exported component: `StoryText`
- Package is generic and extractable
- OSS kinetic runtime stays untouched

## Implementation tasks

1. Add npm workspaces at the repo root (already done).
2. Create `packages/story-text-premium` (already done).
3. Add `package.json`, `tsconfig.json`, `README.md` (already done).
4. Complete the type surface in `src/types.ts`:
   - Add `RevealStyle` type: `'instant' | 'fade' | 'rise' | 'drop' | 'scale' | 'blur'`
   - Add `StaggerPattern` type: `'sequential' | 'wave' | 'cascade' | 'random'`
   - Expand `StoryTextProps` with: `revealStyle`, `staggerPattern`, `stagger`, `revealDuration`, `effectScope`, `cursor`, `cursorChar`, `onrevealcomplete`, `oneffectscomplete`
   - Add `CycleConfig` type for cycle-mode-specific props: `words`, `pauseDuration`, `loop`, `cycleTransition`
5. Update `StoryText.svelte` shell to accept all new props (render plain text for now).
6. Expand host adapter to resolve font, line-height, physics, mode, and CSS vars from a DOM element:
   ```typescript
   createVoidEnergyTextStyleSnapshot(element: HTMLElement, overrides?)
   ```
7. Create `src/styles/story-text.scss` stub with:
   - `.st-visual`, `.st-line`, `.st-unit`, `.st-glyph`, `.st-semantic`, `.st-cursor` base rules
   - `data-st-state` transitions on `st-glyph` (hidden/revealing/visible) — visual effects stubbed, not final
   - Cursor blink keyframe with physics variants
   - Reduced-motion override block
8. Reserve internal subsystem directories (already done):
   - `core/layout/`
   - `core/render/`
   - `core/timeline/`
   - `core/effects/`
9. Add `@chenglou/pretext` as a dependency in the package's `package.json` (pinned to exact version).
10. Verify `npm run check:story-text-premium` passes with the expanded types.
11. Document the package boundary in `plans/premium-story-text/`.

## Public APIs or types added or changed

- `StoryText` (expanded props)
- `TextStyleSnapshot` (existing)
- `StoryCue` (existing)
- `RevealMode` (existing)
- `RevealStyle` (new)
- `StaggerPattern` (new)
- `StoryTextEffect` (existing)
- `EffectScope` (existing)
- `StoryTextProps` (expanded)
- `CycleConfig` (new)
- `createVoidEnergyTextStyleSnapshot` (expanded signature)

## Tests required

- `npm run check` (root — confirms workspace doesn't break app)
- `npm run check:story-text-premium` (package — confirms types are valid)
- Import boundary audit: no file in `packages/story-text-premium/src/` imports from `../../src/`

## Exit criteria

- The package exists as a real workspace package with all types defined.
- The initial export surface is present and documented.
- No unresolved questions remain about where premium story-text code belongs.
- The staged package does not import repo-local runtime internals.
- `StoryText.svelte` accepts all props and renders plain text (no layout/reveal yet).
- The host adapter can resolve a `TextStyleSnapshot` from a live DOM element.
- Package SCSS stub compiles without errors.

## Risks and rollback notes

- Risk: package scaffolding grows into app logic before the architecture is locked.
- Rollback: remove only the workspace package and docs; leave the OSS runtime untouched.
