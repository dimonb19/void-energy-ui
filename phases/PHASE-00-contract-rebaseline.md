# Phase 00 - Contract Rebaseline

## Goal
Lock the real engineering contract for this repository so future sessions stop fighting outdated rules.

## Why This Phase Exists
The repo currently mixes:
- true hard laws
- intentional exceptions
- stale documentation

That creates churn for both humans and AI. This phase makes the contract explicit before code-heavy work starts.

## Decisions To Lock
1. Hybrid Protocol exception model.
2. Trusted internal HTML policy for modal bodies.
3. TypeScript stance: no strict mode vs selective type hygiene.
4. Scanner stance: advisory helper vs real enforcement.
5. Which audit items remain hard requirements:
   - Zod at true external boundaries
   - Result pattern at service boundaries
   - components receiving prevalidated data

## Hybrid Protocol Clarification To Encode
The protocol is for how consumers and future additions should be authored.

Accepted rule:
- Tailwind owns page/layout composition, spacing, responsive composition, and local consumer adjustments.
- SCSS may own component-internal geometry when that geometry is part of the shipped primitive behavior, remains token-driven, and exists to make the primitive work out of the box without repeated utility boilerplate.

Examples that should be documented as valid:
- native button baseline layout
- native input/control geometry
- modal sizing tied to state or tokenized component behavior
- internal affordance layout for composites that should ship pre-shaped

Examples that should stay invalid:
- arbitrary one-off page layout in SCSS
- raw geometry values that bypass tokens
- visual/material effects moved into Tailwind utilities

## Outputs
- Updated contract wording in core docs.
- A short exception charter with allowed SCSS geometry categories.
- Reclassified audit findings list:
  - keep
  - downgrade
  - discard

## Done When
- The docs describe the system as it is actually intended to be built.
- Future contributors and AI can tell which SCSS layout is allowed and which is drift.
- The remaining phases no longer depend on unresolved philosophy questions.

## Non-Goals
- Broad code refactors.
- Strict mode migration.
- Full scanner rewrite.
