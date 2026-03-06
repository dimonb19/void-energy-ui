# Phase 03 - Docs And Guardrails

## Goal
Make the docs honest and the guardrails proportionate to an AI-first workflow.

## Why This Phase Exists
This repo is intended for AI-assisted building. That means:
- the written rules must be accurate
- a few reliable guardrails are better than many aspirational ones

## Scope
- `CLAUDE.md`
- `CHEAT-SHEET.md`
- `THEME-GUIDE.md`
- `README.md`
- `.claude/rules/*`
- `scripts/scan-physics.ts` only if its behavior should match the docs

## Work
1. Remove false claims from docs.
2. Document the Hybrid Protocol exception charter from Phase 00.
3. Fix concrete doc drift:
   - token names
   - PortalLoader notes
   - toast contract wording
   - scanner wording
4. Decide the scanner's role:
   - advisory helper with limited claims
   - or slightly stronger minimal enforcement

## Done When
- Docs and code stop contradicting each other on the major rules.
- AI can rely on the docs without being misled by outdated enforcement claims.
- Guardrails are small, intentional, and maintained.

## Non-Goals
- Heavy CI policy engines.
- Large AST tooling projects unless later proven necessary.
