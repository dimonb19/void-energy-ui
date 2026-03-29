# Premium Story Text Plan

Source of truth for the premium `pretext`-based story text system.

This plan stages the premium rewrite inside this repo as `packages/story-text-premium` while keeping the current OSS kinetic stack untouched in `src/actions/kinetic.ts`, `src/actions/narrative.ts`, and `src/components/ui/KineticText.svelte`.

## Current Status

| Phase | Status | Exit Gate |
| :--- | :--- | :--- |
| Phase 1 — Workspace and Contracts | In Progress | Package boundary, exports, types (incl. RevealStyle, StaggerPattern), and rules are locked |
| Phase 2 — Layout and Renderer | Planned | Final layout is stable before reveal begins |
| Phase 3 — Reveal Engine | Planned | All reveal modes, styles, and stagger patterns are deterministic and grapheme-safe |
| Phase 4 — Effect Engine | Planned | All current narrative effects exist in premium form with scope support |
| Phase 5 — Host and Conexus | Planned | Conexus consumes the package through a wrapper only |
| Phase 6 — Extraction and Release | Planned | Package can move to `void-energy-premium` without refactor |

## Document Set

| File | Purpose | Owner |
| :--- | :--- | :--- |
| [00-rules.md](./00-rules.md) | Hard boundaries, implementation laws, CSS/JS split, and phase-gate policy | Void Energy core |
| [01-architecture.md](./01-architecture.md) | Package architecture, DOM structure, type taxonomy, runtime flow, and contracts | Void Energy core |
| [10-phase-1-workspace-and-contracts.md](./10-phase-1-workspace-and-contracts.md) | Workspace setup, package contract, and export surface | Void Energy core |
| [20-phase-2-layout-and-renderer.md](./20-phase-2-layout-and-renderer.md) | `pretext` adapter, layout cache, renderer, and accessibility layer | Premium package owner |
| [30-phase-3-reveal-engine.md](./30-phase-3-reveal-engine.md) | Deterministic RAF reveal engine, modes, styles, stagger patterns | Premium package owner |
| [40-phase-4-effect-engine.md](./40-phase-4-effect-engine.md) | Continuous and one-shot effect rebuild with explicit scopes | Premium package owner |
| [50-phase-5-host-and-conexus.md](./50-phase-5-host-and-conexus.md) | Void Energy host adapter and Conexus consumption | App integration owner |
| [60-phase-6-extraction-and-release.md](./60-phase-6-extraction-and-release.md) | Extraction path into `void-energy-premium` and private release shape | Void Energy core |

## Locked Decisions

- The premium implementation lives in `packages/story-text-premium` until extraction.
- The OSS runtime in `src/actions/kinetic.ts`, `src/actions/narrative.ts`, and `src/components/ui/KineticText.svelte` stays unchanged.
- The premium package is generic and extractable. Conexus consumes it through its own wrapper.
- `pretext` is the layout engine only. Reveal timing, effects, cueing, accessibility, and host adaptation stay in the premium package.
- The exported premium component name is `StoryText`.
- Reveal timing is JS-driven (RAF timeline). Reveal visuals and effects are CSS-driven (keyframes + data attributes).
- All randomness is seeded for deterministic replay.

## Type Taxonomy

Three orthogonal concepts control text appearance:

| Concept | Type | Values | Controls |
| :--- | :--- | :--- | :--- |
| Grouping order | `RevealMode` | char, word, sentence, sentence-pair, cycle, decode | WHAT units reveal together |
| Per-unit animation | `RevealStyle` | instant, fade, rise, drop, scale, blur | HOW each unit appears |
| Delay distribution | `StaggerPattern` | sequential, wave, cascade, random | WHERE the reveal wave flows |

## Glossary

- `StoryText`: the premium package component exported to host apps.
- `TextStyleSnapshot`: the resolved style contract passed into the premium package from the host.
- `StoryCue`: a timed instruction that triggers one-shot effects at exact narrative or TTS moments.
- `RevealStyle`: the per-unit CSS animation that plays when a unit transitions from hidden to visible.
- `StaggerPattern`: the delay distribution algorithm that determines reveal order across units.
- `Host adapter`: app-owned code that converts Void Energy runtime state into `TextStyleSnapshot`.
- `Semantic layer`: the plain-text accessibility layer that mirrors the visual renderer.
- `Visual layer`: the fixed-line renderer driven by `pretext`, split into `st-line` > `st-unit` spans.
- `Unit`: a single grapheme rendered as an `st-unit` span in the visual layer.
- `Phase offset`: `--st-phase` CSS variable (0.0–1.0) per unit, enabling organic per-character effects.

## Working Order

1. Read [00-rules.md](./00-rules.md).
2. Read [01-architecture.md](./01-architecture.md).
3. Execute work only from the current active phase document.
4. Do not start the next phase until the current phase exit gate is met and documented.

## Repo Staging Paths

```text
packages/story-text-premium/
plans/premium-story-text/
```

These paths are intentionally extraction-safe. When the premium repo is created, the package should move to `void-energy-premium/packages/story-text` with only path-level changes.
