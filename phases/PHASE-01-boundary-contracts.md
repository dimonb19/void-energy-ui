# Phase 01 - Boundary Contracts

## Goal
Harden the true external boundaries without turning the whole UI layer into a validation framework.

## Why This Phase Exists
This is the highest-leverage safety work if the project keeps:
- Zod at external I/O boundaries
- Result-style service contracts
- prevalidated data entering components

## Scope
- `src/adapters/void-engine.svelte.ts`
- `src/stores/user.svelte.ts`
- `src/components/core/ThemeScript.astro`
- `src/components/core/UserScript.astro`
- `src/lib/void-boot.js`
- any other real external boundary discovered during implementation

## Work
1. Define schemas only for true inputs:
   - localStorage payloads
   - external theme fetch payloads
   - persisted user config
2. Introduce typed Result boundaries where services/adapters currently return booleans or throw.
3. Move validation/recovery out of UI components where practical.
4. Keep internal component logic lightweight; do not add generic validation wrappers everywhere.

## Done When
- External data is parsed before state mutation.
- Boundary functions return predictable typed outcomes.
- Components stop owning avoidable boundary error handling.

## Non-Goals
- Strict TypeScript mode.
- Rewriting every helper to use Zod.
- Converting purely internal presentational props into schema-validated boundaries.
