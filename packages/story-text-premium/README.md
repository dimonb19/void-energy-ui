# `@dgrslabs/void-energy-story-text`

Staged premium package for the `pretext`-based story text renderer.

This package exists inside the source repo only to lock the architecture, export surface, and extraction boundary before the actual renderer work begins. It is designed to move into `void-energy-premium/packages/story-text` later with minimal path changes.

## Current Scope

- Phase 1 scaffold only
- Export surface and shared types
- Void Energy host snapshot entry point
- Reserved subsystem directories for layout, renderer, timeline, and effects

## Non-Negotiables

- Do not import from the repo-local `src/` runtime tree.
- Do not import `voidEngine`, stores, modal managers, or current OSS actions.
- Keep app-specific orchestration out of this package.

## Export Surface

- `StoryText`
- `createVoidEnergyTextStyleSnapshot`
- `TextStyleSnapshot`
- `StoryCue`
- `RevealMode`
- `StoryTextEffect`
- `EffectScope`
- `StoryTextProps`

## Internal Layout

```text
src/
  adapters/
    void-energy-host.ts
  core/
    effects/
    layout/
    render/
    timeline/
  svelte/
    StoryText.svelte
  index.ts
  types.ts
```
