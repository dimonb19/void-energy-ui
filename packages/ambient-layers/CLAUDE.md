# Package Rules — `@void-energy/ambient-layers`

You are editing the **ambient layers premium package**. Specialization of [packages/_TEMPLATE/CLAUDE.md](../_TEMPLATE/CLAUDE.md) (package boundary applies — peer dep on `void-energy`, no `../../src/` reaches, no cross-package imports). The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply.

---

## Package surface

Four composable layer categories — **Atmosphere**, **Psychology**, **Action**, **Environment** — driven by a unified `{ variant, intensity }` vocabulary. Two APIs ship side-by-side:

- **Singleton API** (recommended): one `<AmbientHost />` mounted in the app shell, plus an imperative `ambient.push() / .release() / .fire()` handle stack. Nested scopes compose cleanly (page pushes `rain`; modal pushes `calm`; modal closes → `rain` returns).
- **Raw layer components** (`AtmosphereLayer`, `PsychologyLayer`, `ActionLayer`, `EnvironmentLayer`): exported for showcases and consumers that need direct control over decay, `onChange`, or per-instance props.

Lifetime semantics differ per category and are load-bearing — do not unify them:
- `atmosphere`, `psychology`: sticky + auto-decay.
- `environment`: sticky, no decay.
- `action`: one-shot, fires and auto-removes.

The canonical effect vocabulary lives in [AI-REFERENCE.md](AI-REFERENCE.md) — that is the source of truth for variant/intensity names. Do not invent new variants in code without updating the reference.

## Physics adaptation

Layers read the global `<html data-physics data-mode>` contract via CSS only — no host adapter. Every effect must look right across `glass`, `flat`, `retro` and across `light` / `dark` (within the engine's auto-corrected combos: glass and retro require dark). Reduced-motion-safe is a hard requirement — fall back to a still or low-amplitude state, never disable the effect outright unless the variant is intrinsically motion-only.
