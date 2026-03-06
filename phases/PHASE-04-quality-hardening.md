# Phase 04 - Quality Hardening

## Goal
Apply targeted quality improvements that help maintenance and automation without forcing unwanted process overhead.

## Why This Phase Exists
Once the contract, boundaries, runtime, and docs are stable, this phase captures the remaining high-value polish.

## Scope
- cheap `any` removals
- targeted tests around the highest-risk flows
- selective cleanup improvements

## Work
1. Remove low-cost `any` usage that does not require major refactors.
2. Add targeted tests for the most failure-prone flows:
   - boot/hydration
   - overlay focus and Escape precedence
   - clipboard fallback if retained
   - one representative chart or dataviz path
3. Improve cleanup symmetry where it benefits testability and predictability.

## Done When
- The most avoidable weak typing is gone.
- A minimal regression net exists for the riskiest flows.
- Remaining quality debt is explicit and intentionally accepted.

## Non-Goals
- Full strict-mode migration.
- Broad test coverage mandates across every primitive.
