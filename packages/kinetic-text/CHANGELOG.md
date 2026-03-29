# Changelog

## 0.1.0 — 2026-03-29

Initial release of the kinetic text package.

### Features

- **Pretext-based layout engine** — wraps `@chenglou/pretext` for font-aware text measurement, line breaking, and per-grapheme position computation with single-entry caching.
- **Character renderer** — builds a two-layer DOM (visual + semantic) with per-unit reveal and effect animation targets. Supports resize-aware re-rendering with state preservation.
- **5 reveal modes** — `char`, `word`, `sentence`, `sentence-pair`, `decode`.
- **5 reveal styles** — `fade`, `rise`, `drop`, `scale`, `blur`, plus `instant` binary flip.
- **4 stagger patterns** — `sequential`, `wave`, `cascade`, `random` with seeded PRNG.
- **18 narrative effects** — 6 one-shot (`shake`, `quake`, `jolt`, `glitch`, `surge`, `warp`) and 12 continuous (`drift`, `flicker`, `breathe`, `tremble`, `pulse`, `whisper`, `fade`, `freeze`, `burn`, `static`, `distort`, `sway`).
- **Cue system** — time-triggered and completion-triggered one-shot effects with per-cue duration overrides and range targeting.
- **Physics-aware rendering** — glass (motion blur + spring easing), flat (standard), retro (stepped timing + seeded jitter).
- **Reduced motion** — respects `prefers-reduced-motion` (auto), with `always`/`never` overrides. Skips reveal, suppresses animations, fires callbacks normally.
- **Void Energy host adapter** — `createVoidEnergyTextStyleSnapshot()` resolves physics, mode, font, and CSS variables from the live DOM.
- **Non-VE consumer path** — manual `TextStyleSnapshot` construction, no adapter dependency.
- **Deterministic PRNG** — mulberry32 seeded from text + mode hash, ensuring reproducible stagger and decode behavior.
- **Accessibility** — semantic layer with `aria-live="polite"` and `aria-busy` state, screen-reader-only text content.
