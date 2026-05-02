# SKILL.md / Cursor Rules `description:` field — M6a hand-off

This file documents the `description:` field that `scripts/build-skill.ts` (M6b) injects into:

- `skills/void-skill/SKILL.md` frontmatter (canonical)
- `.agents/skills/void-skill/SKILL.md` frontmatter (Codex copy — byte-identical)
- `.cursor/rules/void-energy.mdc` frontmatter (Cursor Rules — same trigger string per D10)

The description is the load-bearing trigger surface — it's what every skill-aware agent matches against to decide whether to load this skill. Vercel's [April 2026 evals](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) measured 56% non-invocation in default config; description tuning is what closes that gap. Iteration target: ≥80% invocation rate across ≥10 representative prompts, floor 70%.

## Final pick (v5b)

```
Builds atmosphere-aware, physics-driven Void Energy interfaces — glass, flat, or retro surfaces with density-scaled tokens, theme switching, and Svelte 5 runes. Use this skill for VE design system, theming, or component-composition tasks.
```

- **Length:** 240 chars (target 150–250 ✓; cap 1024).
- **Trigger keywords covered as exact substrings:** atmosphere ✓, physics ✓, theme ✓, design system ✓, glass ✓, flat (bonus) ✓, retro ✓, surface (surfaces) ✓, density (density-scaled) ✓.
- **Voice:** third-person, action-led ("Builds…"). No first/second-person.
- **Pattern:** preferred "Use this skill for…" form per Vercel guidance.
- **Banned phrasing avoided:** does not contain *"invoke the skill first"* (which Vercel measured causes agents to skip required config).
- **Iteration history:** v5 (220 chars) named "theming" but missed "theme" as a substring (theming = t-h-e-m-i-n-g, theme = t-h-e-m-e). v5b adds "theme switching" to satisfy the keyword check while preserving the v5 structure and pacing.

## Candidates considered (≥3 per D11 Rule 3)

| # | Length | Candidate | Rationale (kept / rejected) |
|---|---|---|---|
| v1 | 254 | "Builds atmosphere-aware, physics-driven Void Energy interfaces — glass, flat, or retro surfaces with density-scaled tokens and Svelte 5 runes. Use this skill when building, theming, or composing any VE component, page, or design-system surface." | Strong keyword coverage; **rejected** for length (slightly over the 250 sweet spot). |
| v2 | 264 | "Builds physics-aware Void Energy UIs — atmosphere × physics × mode triad with token-locked surfaces, density, and Svelte 5 runes. Use this skill for any task involving the VE design system: theming, composing pages, or selecting glass / flat / retro surfaces." | Triad framing is clean; **rejected** for length and slightly weaker action-verb energy ("UIs" reads more passive than "interfaces"). |
| v3 | 233 | "Generates atmosphere-themed, physics-aware UIs with the Void Energy design system. Applies to any task involving theming, surface composition, density tuning, or the glass / flat / retro physics presets — Svelte 5 runes throughout." | Uses the alternate "Applies to any task involving…" preferred pattern; **rejected** because "Generates… UIs" is weaker than "Builds… interfaces" — and v5 hits the same triggers in a tighter form. Keep as fallback if v5 underperforms in the M6b iteration gate. |
| v4 | 274 | "Builds distinctive, physics-aware frontends with the Void Energy design system — atmosphere × physics × mode triad, glass / flat / retro surfaces, density-scaled tokens, Svelte 5 runes. Use this skill for any VE design-system, theming, or component-composition task." | Closest to the Anthropic frontend-design SKILL.md voice ("Create distinctive, production-grade…"); **rejected** for length (24 chars over the upper sweet-spot bound). Consider for v6 iteration if M6b finds undertriggering. |
| v5 | 220 | "Builds atmosphere-aware, physics-driven Void Energy interfaces — glass, flat, or retro surfaces with density-scaled tokens and Svelte 5 runes. Use this skill for VE design system, theming, or component-composition tasks." | Tight, hits 7 of 8 keywords; **rejected** because "theming" does not contain "theme" as a substring — the keyword gate failed. Kept as a fallback if M6b finds v5b verbose. |
| **v5b** | **240** | **"Builds atmosphere-aware, physics-driven Void Energy interfaces — glass, flat, or retro surfaces with density-scaled tokens, theme switching, and Svelte 5 runes. Use this skill for VE design system, theming, or component-composition tasks."** | **Picked.** Sits cleanly in 150–250; opens with strong active verb; lists the three named physics presets (highest-signal differentiator); uses the preferred "Use this skill for…" pattern; covers all 8 mandated trigger keywords as exact substrings. |

## Notes for M6b's close gate (D11 Rule 3)

The M6a output is **v1 of the description, not the final**. M6b's invocation-rate test (≥10 representative VE prompts via Claude Code skill discovery; target ≥80%, floor 70%) is what closes the loop. If invocation falls under floor:

1. Try v3 (alternate "Applies to any task involving…" preferred pattern — different rhetorical hook).
2. Try v4 (richer keyword surface; accept the longer length since 274 is well under the 1024 cap).
3. Synthesize v6 from observed misses — if the agent skips on prompts about Kinetic Text / ambient layers / specific atmospheres, fold those nouns in.
4. Document iteration count and final invocation rate in the M6b PR description per D11 Rule 3.

**Banned phrasing to avoid in any iteration:** *"invoke the skill first"* (Vercel measured this causes agents to skip required project-exploration steps).

**Preferred phrasing patterns:** *"Use this skill when…"*, *"Use this skill for…"*, *"Applies to any task involving…"*, *"explore project first"*. Per Anthropic's authoring guide, be "pushy" — undertriggering is the failure mode.

## SYSTEM-PROMPT.md content that did not fit cleanly into the compressed body

This section flags content from `SYSTEM-PROMPT.md` that the compressed `skill-body.template.md` body could not absorb without breaching the section-size targets. M6b should plant this content in the deterministically-emitted reference files (or extend the references-tree if needed):

| SYSTEM-PROMPT.md section | Disposition for M6b |
|---|---|
| §4 Token Dictionary — full spacing / color / motion / typography / z-index / breakpoint / max-width tables, plus the "Map raw concepts to tokens" table (`filter: blur` → `var(--physics-blur)`, etc.) | Plant in `references/token-vocabulary.md` — this is exactly what the deterministic emitter from `src/config/design-tokens.ts` produces. The "Map raw concepts to tokens" rows are the highest-value diagnostic surface; emit them as a "Common raw-value substitutions" appendix at the bottom of the token-vocabulary reference. |
| §5 Component Contract — full primitive-needs table (single-choice picker / boolean / text input / etc.), the prop-API conventions section, and the "When to build new" gate | Plant in `references/component-catalog.md`. The body keeps the opinionated-defaults list; the catalog carries the full registry-driven enumeration plus the prop-API conventions section verbatim. |
| §5 Premium-package surfaces (`@void-energy/ambient-layers`, `@void-energy/kinetic-text`) — full table with engine surfaces and use-when guidance | The compressed body names the recommended path; M6b should keep the package `AI-REFERENCE.md` files as the canonical effect vocabulary. Do **not** duplicate effect vocabularies into the references tree — link out from `references/component-catalog.md` instead. |
| §6 Import Paths — the full enumerated import block (every shipped primitive, every action, every singleton) | Plant in `references/component-catalog.md` as a final "Import index" appendix. The body keeps only the alias-root table. |
| §7 Build Procedure — six-step recipe (parse → check registry → find analog → pick tokens → compose → verify) | Plant as a prefix to `references/composition-recipes.md` (a "Build procedure" preamble) so the recipes have the procedural context. The compressed body's "Acceptance" section already covers the verification half. |
| §7 Page Scaffold + Component Skeleton snippets | The compressed body keeps the page scaffold inline (it's the highest-value reach-for default). Plant the Component Skeleton in `references/composition-recipes.md` as a "When extending the system" appendix. |
| §8 Hard Prohibitions — full list with all failure modes (`text-shadow: 0 0 Npx`, `min-width: Nrem`, `inset: ±Npx`, etc.) | The compressed body keeps the high-frequency entries. Plant the full enumeration in `references/token-vocabulary.md` (it pairs naturally with the "Common raw-value substitutions" appendix). |
| §10 Extension — `voidEngine.registerTheme()` and `voidEngine.loadExternalTheme()` examples | Consider a fourth reference file `references/extension.md` if M6b finds the body undertriggering on theme-registration prompts. Otherwise plant as an appendix to `references/composition-recipes.md`. |
| Markdown rendering / `trusted` flag review surface guidance from SYSTEM-PROMPT.md §5 | Compressed body has the one-line directive ("never hand-roll `marked()` + `{@html}`"). Full security review surface lives in `AGENTS.md` Component Conventions section (already in `agents-md.template.md`); no need to duplicate to references. |
| `use:aura` constraint (use only on image-backed / atmosphere-primary surfaces) | Same as above — compressed body trimmed; full guidance lives in `AGENTS.md` Component Conventions. M6b can also plant in `references/component-catalog.md` under the `use:aura` action entry. |

## Order of operations for M6b

1. Read this file plus the three `*.template.md` files.
2. Run the deterministic emitters to produce `references/component-catalog.md`, `references/token-vocabulary.md`, `references/composition-recipes.md` from the source-of-truth files (per the pseudocode comment at the bottom of `skill-body.template.md`).
3. Plant the §"SYSTEM-PROMPT.md content that did not fit cleanly" overflow into those references per the disposition table.
4. Stitch frontmatter (`name: void-energy`, `description: <v5 above>`, `license: ...`) onto `skill-body.template.md` → emit `skills/void-skill/SKILL.md`.
5. `cp skills/void-skill/SKILL.md .agents/skills/void-skill/SKILL.md` (Codex copy — byte-identical).
6. Stitch frontmatter (`description: <v5 above>`; **no `globs:` field** per D10) onto `cursor-rules.template.md` → emit `.cursor/rules/void-energy.mdc`.
7. `cp agents-md.template.md AGENTS.md` (the template is already the final body — only the do-not-hand-edit header survives unchanged).
8. Run `npm run check:skill` to verify regenerability + line-count gates (≤200 on `skills/void-skill/SKILL.md` and `.cursor/rules/void-energy.mdc`) + the determinism comment in `build-skill.ts`.
9. Run the D11 Rule 3 invocation-rate gate. Iterate the description if under 70% floor.
