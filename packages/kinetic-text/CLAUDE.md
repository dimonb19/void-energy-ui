# Package Rules — `@void-energy/kinetic-text`

You are editing the **kinetic text premium engine**. Specialization of [packages/_TEMPLATE/CLAUDE.md](../_TEMPLATE/CLAUDE.md) (package boundary applies — peer dep on `void-energy`, no `../../src/` reaches, no cross-package imports). The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply.

---

## Free / premium split (do not erase)

Per [decisions.md §D11](../../plans/decisions.md#d11--kinetic-text-base-reveal-stays-free-full-engine-is-premium): the **base kinetic reveal** lives in the public repo as `src/actions/kinetic.ts` + `src/styles/components/_kinetic.scss` + `src/types/kinetic.d.ts`. **This package is the advanced engine** — pretext-based per-character layout, the 37-effect narrative library (16 one-shot + 21 continuous), TTS sync, and the `KineticText` / `TtsKineticBlock` / `KineticSkeleton` components. Do not collapse the two — the split is intentional moat.

## Package surface

- **Components**: `KineticText` (the engine), `TtsKineticBlock` (TTS-synced block), `KineticSkeleton` (loading placeholder).
- **Adapter**: `createVoidEnergyTextStyleSnapshot()` from `./adapters/void-energy-host` reads `data-physics` / `data-mode` and the target element's computed styles to feed `styleSnapshot`. Non-VE hosts construct `TextStyleSnapshot` manually.
- **TTS**: `./tts` and `./tts/providers` ship the sync layer. `@chenglou/pretext` is a bundled direct dependency, not a peer.

## Narrative orchestration

The canonical effect vocabulary — `revealStyle`, `speedPreset`, `activeEffect` (continuous), `punctuation` (one-shot) — lives in [AI-REFERENCE.md](AI-REFERENCE.md). That is the source of truth for AI story-generation pipelines. Continuous effects loop during reveal; one-shots fire once when reveal completes. The two are not interchangeable.

Fields the engine resolves and the AI must NOT set: `revealMode`, `stagger`, `speed`, `charSpeed`, `styleSnapshot`, time-cued `cues`. If a new effect is added, update the reference and the type union together — drift breaks the AI contract.
