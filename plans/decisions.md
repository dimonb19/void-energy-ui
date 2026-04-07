# Canonical Decisions

> Every architectural and strategic decision that shapes the plan, with the reasoning behind it. Do not re-litigate these without updating this file.
> Last updated: 2026-04-07

---

## D1 — Repository topology: three repos

**Decision:** three separate GitHub repositories.
- `dgrslabs/void-energy` — public, BSL 1.1
- `dgrslabs/void-energy-premium` — private
- `dgrslabs/conexus` — private

**Why:** different lifecycles. Premium packages are a shared library collection; CoNexus is a shipping app. Mixing them would force premium changes to wait on CoNexus release cycles and vice versa. Separating public from premium is non-negotiable — any code physically present in the public repo is a licensing and moat risk.

**How to apply:** dependency direction is `conexus → premium → void-energy`, never reversed. Premium and CoNexus both install `void-energy` from public npm the same way external consumers do.

---

## D2 — Monorepo pattern: Pattern A (packages + apps)

**Decision:** the public `void-energy` repo is a monorepo shaped as `packages/` + `apps/` with workspaces, the same pattern used by Radix, shadcn, TanStack, Svelte, Astro, and Tailwind.

**Why:** the three competing patterns are:
- **Pattern A (chosen):** library + docs site in one repo via workspaces. Zero drift, atomic changes, one CI. Industry standard.
- **Pattern B (rejected):** separate library repo and separate consumer/docs repo. Every library change requires two PRs and a publish step between them. High friction for a solo dev.
- **Pattern C (rejected):** "staging vs prod" with manual sync script. Known anti-pattern — the sync rots, public repo falls behind, final syncs become huge unrelated diffs.

**How to apply:** see [phase-2-monorepo-structure.md](phase-2-monorepo-structure.md). The premium repo uses the same pattern.

---

## D3 — Two npm packages from the public repo

**Decision:** publish both `void-energy` (library) and `create-void-energy` (scaffolder) from the public monorepo.

**Why:** these serve two distinct audiences that cannot be served by one package.
- **`npm install void-energy`** — for existing projects (like CoNexus) that want to add components to code they already have.
- **`npm create void-energy@latest`** — for new projects that want a whole scaffolded starter on a blank canvas.

Forcing one to use the other creates friction: `install` users would have to extract components from a scaffolded project, `create` users would have to manually wire up every file.

**How to apply:** both packages are maintained in `packages/void-energy` and `packages/create-void-energy` inside the public monorepo. Released together or independently.

---

## D4 — Template payload lives in `apps/starter-template`

**Decision:** the content that `create-void-energy` hands to users lives in `apps/starter-template/` inside the public monorepo. The `create-void-energy` package itself is just a thin CLI that copies that folder to the user's target directory.

**Why:** the starter template is the product for external users. Keeping it as a runnable app inside the monorepo means we can dev/test/verify it continuously — if it breaks, we find out immediately because it's a workspace like any other. The scaffolder becomes trivially thin.

**How to apply:** `apps/starter-template` imports `void-energy` via `workspace:*` during development, and its `package.json` is templated so the published version shows `"void-energy": "^0.x.0"` for real users.

---

## D5 — Showcase site is `apps/showcase`, lives in the public monorepo

**Decision:** the existing `void.dgrslabs.ink` showcase site becomes `apps/showcase/` inside the public monorepo. The current standalone `void-energy-ui` repo is retired at the end of Phase 2.

**Why:** keeping the showcase separate from the library creates drift. Pattern A solves this by having the showcase import the library via `workspace:*` so every change is reflected instantly and atomically. This is how Radix, Svelte, Astro, and Tailwind all work.

**How to apply:** showcase imports `void-energy` via `workspace:*`. For premium demos it installs the premium packages from GitHub Packages (Phase 2). Deploys to Vercel from the monorepo; Vercel supports workspaces natively.

---

## D6 — Premium repo uses the same Pattern A

**Decision:** `dgrslabs/void-energy-premium` is a monorepo with `packages/kinetic-text`, `packages/dgrs`, `packages/ambience`, `packages/rive`. No `apps/` folder.

**Why:** consistency with the public repo, and because premium packages share tooling (token pipeline, type generation, test setup). One repo means one version cadence and one CI.

**How to apply:** all four premium packages declare `void-energy` as a peer dependency installed from public npm. Each has its own `package.json` with a `publishConfig` that can be flipped from private (GitHub Packages) to public (npmjs.org) independently. See [phase-2-premium-packages.md](phase-2-premium-packages.md).

---

## D7 — Ambience Layers ships first, as a dedicated package from day one

**Decision:** Phase 1 = Ambience Layers, built as `@dgrslabs/void-energy-ambience` inside the current monorepo's `packages/` folder from the first commit — not as loose files in `src/` that get lifted later.

**Why:** Kinetic Text was built this way and the pattern works. Starting as a package enforces API discipline (must import via public exports only), enables independent versioning, and means Phase 3 lifts the package into the premium repo with zero refactoring — just a file move and a version pin. The alternative (build in `src/` first, extract later) creates refactoring debt and breaks API boundaries during development.

**How to apply:** create `packages/ambience/` mirroring the existing `packages/kinetic-text/` layout. Peer-depend on `void-energy` via `workspace:*`. All core imports go through public `void-energy/*` exports, never relative paths.

---

## D8 — AI automation foundation lands before the monorepo restructure

**Decision:** Phase 2 = AI automation foundation, built in the current monorepo after Ambience ships but before Phase 3 touches the directory structure.

**Why:** AI automation is not a cosmetic polish pass. It is the primary way Void Energy is consumed — by AI agents building apps on top of it. If the AI hallucinates components, forgets the 5 Laws, or recreates primitives that already exist, the system fails at its job. Landing the foundation while the current monorepo is stable means Phase 3 inherits a working system and only has to redistribute its files across workspaces, rather than inventing and restructuring simultaneously.

**How to apply:** inside the current monorepo, build layered `CLAUDE.md` files (root, `src/`, `src/pages/`, `packages/*/`), complete the `component-registry.json`, formalize rules in `.claude/rules/`, and audit the existing `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, `CHEAT-SHEET.md`. Phase 3 will move the files without rewriting the content.

---

## D9 — CoNexus migrates last

**Decision:** Phase 4 = CoNexus migration. Nothing CoNexus-related touches Phases 1, 2, or 3.

**Why:** CoNexus is the consumer. Migrating it earlier would force architectural decisions based on one app's needs and pollute the library with assumptions. Migrating last means the library has to be cleanly usable by any external consumer, which is the right pressure to keep the APIs honest.

**How to apply:** during Phase 1 and 2, CoNexus changes are on hold. When Phase 3 begins, CoNexus is rebuilt as a thin app consuming `void-energy` from public npm and `@dgrslabs/void-energy-*` from GitHub Packages.

---

## D10 — Free vs premium split

**Decision:** 4 atmospheres, 40+ components, AI generator, all actions (narrative, drag, base kinetic reveal) are **free**. Kinetic Text engine, DGRS package, Ambience Layers, Rive animations are **premium**.

**Free atmospheres:** Slate (flat/dark), Terminal (retro/dark), Meridian (flat/light), Frost (glass/dark). All 3 physics + both modes covered. AI generator lets anyone create unlimited custom themes.

**Why:** the free tier must be complete and useful on its own — no feature degradation, no "buy the atmosphere pack" upsell. The AI generator removes any reason to gate atmospheres. The premium packages are all additive immersion layers that real apps (CoNexus) need but that small projects do not.

**How to apply:** the public repo never contains premium code. Premium packages live only in the private repo and install as optional dependencies. See [phase-3-premium-packages.md](phase-3-premium-packages.md).

---

## D11 — Kinetic Text: base reveal stays free, full engine is premium

**Decision:** the base kinetic text reveal (the `kinetic` action + `_kinetic.scss` + showcase demo) stays in the public repo. The full `@dgrslabs/void-energy-kinetic-text` package (advanced engine with pretext effects, narrative orchestration) is premium.

**Why:** the simple reveal is a common effect many apps want, and shipping it free demonstrates the system's capabilities. The advanced engine is the moat — it took significant R&D and is genuinely differentiating.

**How to apply:** when auditing the public repo for "premium residue," do NOT remove `src/actions/kinetic.ts`, `src/styles/components/_kinetic.scss`, or `src/types/kinetic.d.ts`. They are intentional.

---

## D12 — BSL 1.1 license with lawyer review

**Decision:** public repo ships under BSL 1.1 (Business Source License). An AI-drafted version is the current placeholder; the boss has sent it to a lawyer for final terms. When the lawyer returns, swap with a single commit.

**Proposed terms:** $1M revenue threshold, 4-year change date, converts to Apache 2.0.

**Why:** BSL lets us open-source the code for community adoption while reserving commercial use for ourselves until CoNexus establishes traction. MIT/Apache would forfeit the moat; fully closed would forfeit adoption. BSL is the middle ground used by Sentry, Cockroach, MariaDB.

**How to apply:** copy the current `LICENSE.md` from this monorepo into the public repo as `LICENSE` (no extension, GitHub convention). Do not add `LICENSING.md` companion yet — add it before active promotion to make the terms developer-readable in 30 seconds.

---

## D13 — No CI/CD workflows in the starter template

**Decision:** the starter template ships with zero `.github/workflows/`. No deploy workflow, no publish workflow.

**Why:** deployment is not universal. Every consumer has a different host (Vercel, Netlify, Cloudflare, static, SSR) with different env vars and build targets. A template cannot ship a useful deploy workflow. A `ci.yml` that runs tests is optional noise for a starter.

**How to apply:** the public monorepo itself can have a `ci.yml` for its own development (running tests on PRs), but the `apps/starter-template/` payload that consumers receive has none.

---

## D14 — AI automation distributes via the npm package

**Decision:** `component-registry.json`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, and `CHEAT-SHEET.md` ship inside the `void-energy` npm tarball via the `files` field. The `.claude/` directory does NOT ship — it's monorepo development tooling only. Consumers get their AI context from the starter template, which copies a self-contained `CLAUDE.md` + `.claude/` into their new project.

**Why:** consumer AI (Claude Code running in a user's project) needs to read the registry from `node_modules/void-energy/` to know what components exist without inventing new ones. Shipping `.claude/` would bloat the tarball and leak monorepo-specific rules.

**How to apply:** see [phase-2-ai-automation.md](phase-2-ai-automation.md) for the foundation and [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) for the distribution layout.

---

## D15 — Starter template is self-contained

**Decision:** `apps/starter-template/CLAUDE.md` and `apps/starter-template/.claude/` are self-contained — they duplicate the 5 Laws and core rules rather than inheriting from the monorepo root.

**Why:** once copied to a consumer's disk, there is no "monorepo root" above the template. Inheritance would break. Inside the monorepo this creates minor redundancy with root, but Claude Code handles duplication gracefully.

**How to apply:** test the starter template by running Claude Code inside a fresh clone of just that folder and verifying it behaves correctly with no parent context.

---

## D16 — Ambience Layers scope: Blood, Snow, Rain, Fog

**Decision:** Phase 1 delivers exactly four layers: Blood, Snow, Rain, Fog. No more, no less.

**Why:** these four cover the range CoNexus needs (horror/intensity, cold/isolation, mood/weather, mystery/obscurity) and demonstrate the system's physics adaptation across all four classic ambient effect categories. More would delay later phases; fewer would leave CoNexus undercooked.

**How to apply:** see [phase-1-ambience-layers.md](phase-1-ambience-layers.md).

---

## D17 — Selective publishing via `publishConfig`

**Decision:** each premium package has its own `publishConfig` in its `package.json`. A single field flip moves a package from private (GitHub Packages) to public (npmjs.org) without restructuring.

**Why:** enables scenarios like "open-source Rive for the Eric Jordan partnership while keeping KT and DGRS private" with zero repo surgery.

**How to apply:** default `publishConfig.registry` is GitHub Packages. To flip a package public: change one line, run `npm publish`, done.

---

## D18 — Eric Jordan deal: revenue share, no equity

**Decision:** Eric Jordan builds `@dgrslabs/void-energy-rive`. Compensation is 25-30% revenue share on his specific package, not equity. Creative ownership of `.riv` source files stays with Eric; DGRS owns distribution rights. Revenue share continues on shipped assets if the partnership ends.

**Why:** equity sets a bad precedent for future collaborators and dilutes the core team. Revenue share aligns incentives without giving up ownership. Scope is limited to Rive specifically, not Void Energy as a whole.

**How to apply:** present deal after Phase 3 ships. Rive package timeline is decoupled from the main phases.

---

## Decision summary table

| # | Decision | Status |
|---|----------|--------|
| D1 | Three-repo topology | Committed |
| D2 | Pattern A monorepo | Committed |
| D3 | Two npm packages (library + scaffolder) | Committed |
| D4 | Template payload in `apps/starter-template` | Committed |
| D5 | Showcase in `apps/showcase` | Committed |
| D6 | Premium repo uses Pattern A | Committed |
| D7 | Ambience Layers as dedicated package from day one (Phase 1) | Committed |
| D8 | AI automation foundation lands in current monorepo (Phase 2) | Committed |
| D9 | CoNexus migrates last (Phase 4) | Committed |
| D10 | Free vs premium split | Committed |
| D11 | KT base free, engine premium | Committed |
| D12 | BSL 1.1 with lawyer review | Pending lawyer |
| D13 | No CI/CD in starter template | Committed |
| D14 | AI automation via npm package | Committed |
| D15 | Starter template self-contained | Committed |
| D16 | Ambience scope: Blood/Snow/Rain/Fog | Committed |
| D17 | Selective publishing via publishConfig | Committed |
| D18 | Eric deal: revenue share, no equity | Proposed |
