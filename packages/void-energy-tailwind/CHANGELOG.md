# Changelog

All notable changes to `@void-energy/tailwind` are documented here. This package follows [Semantic Versioning](https://semver.org/).

## 0.1.0 — 2026-04-23

Initial published release of the L0 preset.

### Added
- Tailwind CSS v4 preset bundling Void Energy tokens, physics presets (glass, flat, retro), and atmosphere themes as framework-agnostic CSS.
- `theme.css` and `theme-no-container.css` entry points for drop-in use.
- Per-atmosphere CSS files under `./atmospheres/*` and per-physics files under `./physics/*` for selective loading.
- JSON descriptors (`atmospheres.json`, `builtins.json`) for tooling discovery.
- Runtime helpers (`./runtime`, `./head`, `./config`, `./generator`, `./vite`) exposed as ESM + CJS.
- `void-energy` CLI (`./bin/void-energy.js`) for project scaffolding.
