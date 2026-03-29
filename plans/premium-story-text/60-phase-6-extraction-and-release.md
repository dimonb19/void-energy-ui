# Phase 6 — Extraction and Release

## Goal

Prepare the staged package for relocation into `void-energy-premium` and document the private release shape without refactoring the implementation.

## Inputs and dependencies

- Completed package implementation through Phase 5
- Private registry strategy for premium distribution
- Public peer dependency expectations

## In scope

- Extraction checklist
- Package-level dependency audit
- Peer dependency rules
- Private publish shape
- Isolation verification
- Build pipeline for standalone package
- Consumer setup documentation

## Out of scope

- Customer provisioning
- Registry billing or sales operations
- Marketing or landing page

## Decisions already locked

- Extraction is a relocation, not a redesign.
- The package must run with only documented peers and inputs.
- No package file may rely on this repo's internal `src/` runtime tree.

## Implementation tasks

### Pre-extraction audit

1. Import boundary verification:
   - Scan all files in `packages/story-text-premium/src/` for imports
   - Confirm: only `svelte`, `@chenglou/pretext`, browser APIs, and package-local imports
   - No `../../src/` paths, no `@actions/`, `@lib/`, `@adapters/`, `@stores/` aliases
2. Alias resolution:
   - Package `tsconfig.json` must not inherit path aliases from root `tsconfig.json` that won't exist in the premium repo
   - Replace any aliased imports with relative paths
3. Style independence:
   - Package SCSS must not `@use` anything from `../../src/styles/`
   - All style tokens used by the package must flow through `TextStyleSnapshot.vars` or be defined in package-local SCSS
4. Asset audit:
   - No references to root-level config files, generated files, or scripts

### Build pipeline

5. Add a standalone build script to the package:
   - Compile TypeScript → ESM + declarations
   - Compile SCSS → CSS
   - Output to `dist/` with proper `exports` map
6. Update `package.json`:
   ```json
   {
     "name": "@dgrslabs/void-energy-story-text",
     "version": "0.1.0",
     "type": "module",
     "license": "UNLICENSED",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "svelte": "./dist/svelte/StoryText.svelte",
         "default": "./dist/index.js"
       },
       "./types": "./dist/types.d.ts",
       "./adapters/void-energy-host": {
         "types": "./dist/adapters/void-energy-host.d.ts",
         "default": "./dist/adapters/void-energy-host.js"
       },
       "./styles": "./dist/styles/story-text.css"
     },
     "peerDependencies": {
       "svelte": "^5.0.0"
     },
     "dependencies": {
       "@chenglou/pretext": "0.0.3"
     }
   }
   ```
7. Peer dependency documentation:
   - `svelte`: required (^5.0.0)
   - `@chenglou/pretext`: bundled as direct dependency (not peer)
   - No other runtime dependencies

### Relocation steps

8. Move `packages/story-text-premium/` to `void-energy-premium/packages/story-text/`:
   - Copy the directory
   - Update `tsconfig.json` to remove `extends` pointing to parent
   - Update any remaining path references
   - Verify build passes in isolation
9. Update the premium repo's root workspace config to include the package.
10. Test installation as a dependency:
    - In a fresh test project: `npm install @dgrslabs/void-energy-story-text`
    - Import `StoryText`, render with a manual `TextStyleSnapshot`
    - Verify: component renders, reveals text, effects play

### Consumer setup documentation

11. Write `README.md` with:
    - Installation (`npm install @dgrslabs/void-energy-story-text`)
    - Basic usage (manual TextStyleSnapshot)
    - Void Energy host usage (adapter)
    - Props reference
    - Effect list
    - Cue authoring guide
    - Reduced motion behavior
    - Physics/mode behavior
12. Write `CHANGELOG.md` with initial release notes.

### Cleanup in source repo

13. After extraction:
    - Remove `packages/story-text-premium/` from the source repo
    - Remove workspace entry from root `package.json`
    - Remove `check:story-text-premium` script
    - Keep `plans/premium-story-text/` as historical reference
    - Update CLAUDE.md if it references the premium package

## Public APIs or types added or changed

- None by default. Any public API changes at this stage must be treated as release blockers.

## Tests required

- Isolated install and build (outside this repo)
- Isolated package type-check
- Contract test against a sample premium host
- Import boundary scan (automated)
- Build output verification (all exports resolve)

## Exit criteria

- The package runs outside this repo with only documented inputs.
- No imports remain that point back into this repo's app-local runtime.
- Extraction to the premium repo is operational, not architectural.
- Build output includes types, JS, Svelte components, and CSS.
- A consumer can install, import, and render `StoryText` without accessing the source repo.

## Risks and rollback notes

- Risk: hidden assumptions about root config, aliases, or generated assets.
  Rollback: re-stage the package locally, remove hidden assumptions, and rerun isolation tests before publishing.
- Risk: Svelte component compilation requires Vite/SvelteKit build pipeline that the consumer may not have.
  Mitigation: distribute `.svelte` source files (standard for Svelte libraries) with `svelte` condition in exports. Consumers compile as part of their own build.
- Risk: `@chenglou/pretext` v0.0.3 API changes in a future release.
  Mitigation: pin exact version, wrap behind `PretextLayout` adapter. Update adapter when upgrading.

## Extraction Checklist

- [ ] Package path no longer references this repo's root aliases
- [ ] Package scripts run without root-only helper files
- [ ] Package SCSS has no `@use` paths pointing outside the package
- [ ] Package `tsconfig.json` does not `extend` a parent config
- [ ] Package README reflects the private distribution path
- [ ] Peer dependency list is explicit and minimal
- [ ] Consumer setup instructions are complete and tested
- [ ] Build output passes `tsc --noEmit` in a fresh project
- [ ] A non-VE host can use the package with manual `TextStyleSnapshot`
