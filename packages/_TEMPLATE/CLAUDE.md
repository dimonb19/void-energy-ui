# Package Rules — `packages/_TEMPLATE/`

> Template. Copy to `packages/<name>/CLAUDE.md` and replace the package-specific section. Per-package files stay ≤30 lines (L0 has its own ceiling — see [void-energy-tailwind/CLAUDE.md](../void-energy-tailwind/CLAUDE.md)).

You are editing the **`@void-energy/<name>`** package (DGRS carve-out per [decisions.md §D30](../../plans/decisions.md#d30--dgrs-atmospheres--shared-ui-carve-out) is the one exception — see [dgrs/CLAUDE.md](../dgrs/CLAUDE.md)). The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply unchanged. The strict library audit in [src/CLAUDE.md](../../src/CLAUDE.md) does **not** — packages have different boundaries.

---

## 1. Package boundary (the only universal package rule)

This package depends on `void-energy` (the L1 core library) as a **peer**, exactly like any external consumer. That means:

- **Never reach into `src/` via relative paths** (`../../src/...`, `../../../src/...`). Use the published exports.
- **All imports from the core library go through public exports.** Path aliases (`@adapters/*`, `@lib/*`, `@components/*`) are L1-internal and not available here.
- **Do not import from other `packages/*`.** Premium packages are independent of each other; if two packages need to share something, the shared piece belongs in `void-energy` core or in a new shared package proposed to the user.
- **No backdoor imports.** When this package goes private (Phase 3b), the consumer-style discipline is what makes the cutover mechanical.

Enforcement is by convention right now — there is no lint rule blocking it. The discipline is the deliverable.

---

## 2. Package-specific rules

> Replace this section in the per-package copy. Cover only what is genuinely package-local: the engine/layer API surface, atmosphere registration patterns, the package's own conventions. Do not restate root `CLAUDE.md` content. Keep it tight.

(per-package content here)

---

## 3. When in doubt

- 5 Laws + workspace map: root [CLAUDE.md](../../CLAUDE.md).
- Token vocabulary, Tailwind utilities, SCSS toolkit: `.claude/rules/` files load on path match.
- Package surface vocabulary lives in this package's `README.md` and `AI-REFERENCE.md` (where present).
- If a package needs a rule that isn't in this template or in root, surface it to the user — do not add it silently.
