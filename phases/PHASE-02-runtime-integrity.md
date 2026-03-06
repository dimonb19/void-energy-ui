# Phase 02 - Runtime Integrity

## Goal
Fix concrete correctness issues that affect hydration safety, token integrity, and runtime behavior.

## Why This Phase Exists
After boundary rules are stable, the next best work is removing actual runtime defects with low philosophical overhead.

## Scope
- hydration fail-safe completeness
- token naming consistency
- clipboard fallback correctness
- listener cleanup symmetry where it is cheap and clear
- exhaustiveness fixes where the unions are already defined

## Work
1. Make the `<html>` triad fail-safe restore a coherent runtime state.
2. Finish token-family cleanups like `bg-sunk`.
3. Fix `CopyField` fallback behavior.
4. Clean up small correctness defects surfaced by the audit.
5. Apply exhaustive-switch helpers where they improve safety without noise.

## Done When
- The runtime can fail safely into a coherent DOM state.
- Token naming is internally consistent.
- Known concrete behavior bugs from the audit are closed or intentionally deferred with notes.

## Non-Goals
- Architecture rewrites.
- New component APIs without a direct bug-driving reason.
