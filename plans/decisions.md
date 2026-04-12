# Canonical Decisions

> Every architectural and strategic decision that shapes the plan, with the reasoning behind it. Do not re-litigate these without updating this file.
> Last updated: 2026-04-12

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

**How to apply:** see [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md). The premium repo uses the same pattern.

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

**Decision:** `dgrslabs/void-energy-premium` is a monorepo with `packages/kinetic-text`, `packages/dgrs`, `packages/ambient`, `packages/rive`. No `apps/` folder.

**Why:** consistency with the public repo, and because premium packages share tooling (token pipeline, type generation, test setup). One repo means one version cadence and one CI.

**How to apply:** all four premium packages declare `void-energy` as a peer dependency installed from public npm. Each has its own `package.json` with a `publishConfig` that can be flipped from private (GitHub Packages) to public (npmjs.org) independently. See [phase-4b-premium-packages.md](phase-4b-premium-packages.md).

---

## D7 — Ambient Layers ships first, as a dedicated package from day one

**Decision:** Phase 1 = Ambient Layers, built as `@dgrslabs/void-energy-ambient-layers` inside the current monorepo's `packages/` folder from the first commit — not as loose files in `src/` that get lifted later.

**Why:** Kinetic Text was built this way and the pattern works. Starting as a package enforces API discipline (must import via public exports only), enables independent versioning, and means Phase 3 lifts the package into the premium repo with zero refactoring — just a file move and a version pin. The alternative (build in `src/` first, extract later) creates refactoring debt and breaks API boundaries during development.

**How to apply:** create `packages/ambient/` mirroring the existing `packages/kinetic-text/` layout. Peer-depend on `void-energy` via `workspace:*`. All core imports go through public `void-energy/*` exports, never relative paths.

---

## D8 — AI automation foundation lands before the monorepo restructure

**Decision:** Phase 3 = AI automation foundation, built in the current monorepo after L0 and TTS sync ship but before Phase 4 touches the directory structure.

**Why:** AI automation is not a cosmetic polish pass. It is the primary way Void Energy is consumed — by AI agents building apps on top of it. If the AI hallucinates components, forgets the 5 Laws, or recreates primitives that already exist, the system fails at its job. Landing the foundation while the current monorepo is stable means Phase 4 inherits a working system and only has to redistribute its files across workspaces, rather than inventing and restructuring simultaneously.

**How to apply:** inside the current monorepo, build layered `CLAUDE.md` files (root, `src/`, `src/pages/`, `packages/*/`), complete the `component-registry.json`, formalize rules in `.claude/rules/`, and audit the existing `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, `CHEAT-SHEET.md`. Phase 4 will move the files without rewriting the content.

---

## D9 — CoNexus migrates last

**Decision:** Phase 6 = CoNexus migration. Nothing CoNexus-related touches Phases 1–5.

**Why:** CoNexus is the consumer. Migrating it earlier would force architectural decisions based on one app's needs and pollute the library with assumptions. Migrating last means the library has to be cleanly usable by any external consumer, which is the right pressure to keep the APIs honest.

**How to apply:** during Phases 1–5, CoNexus changes are on hold. When Phase 6 begins, CoNexus is rebuilt as a thin app consuming `void-energy` from public npm and `@dgrslabs/void-energy-*` from GitHub Packages.

---

## D10 — Free vs premium split

**Decision:** 4 atmospheres, 40+ components, AI generator, all actions (narrative, drag, base kinetic reveal) are **free**. Kinetic Text engine, DGRS package, Ambient Layers, Rive animations are **premium**.

**Free atmospheres:** Slate (flat/dark), Terminal (retro/dark), Meridian (flat/light), Frost (glass/dark). All 3 physics + both modes covered. AI generator lets anyone create unlimited custom themes.

**Why:** the free tier must be complete and useful on its own — no feature degradation, no "buy the atmosphere pack" upsell. The AI generator removes any reason to gate atmospheres. The premium packages are all additive immersion layers that real apps (CoNexus) need but that small projects do not.

**How to apply:** the public repo never contains premium code. Premium packages live only in the private repo and install as optional dependencies. See [phase-4b-premium-packages.md](phase-4b-premium-packages.md).

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

**Decision:** `component-registry.json`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, `CHEAT-SHEET.md`, and `SYSTEM-PROMPT.md` ship inside the `void-energy` npm tarball via the `files` field. The `.claude/` directory does NOT ship — it's monorepo development tooling only. Consumers get their AI context from the starter template, which copies a self-contained `CLAUDE.md` + `.claude/` into their new project.

**Why:** consumer AI (Claude Code running in a user's project) needs to read the registry from `node_modules/void-energy/` to know what components exist without inventing new ones. `SYSTEM-PROMPT.md` enables any automation tool (not just Claude Code) to generate correct VE code. Shipping `.claude/` would bloat the tarball and leak monorepo-specific rules.

**How to apply:** see [phase-3-ai-automation.md](phase-3-ai-automation.md) for the foundation and [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md) for the distribution layout.

---

## D15 — Starter template is self-contained

**Decision:** `apps/starter-template/CLAUDE.md` and `apps/starter-template/.claude/` are self-contained — they duplicate the 5 Laws and core rules rather than inheriting from the monorepo root.

**Why:** once copied to a consumer's disk, there is no "monorepo root" above the template. Inheritance would break. Inside the monorepo this creates minor redundancy with root, but Claude Code handles duplication gracefully.

**How to apply:** test the starter template by running Claude Code inside a fresh clone of just that folder and verifying it behaves correctly with no parent context.

---

## D16 — Ambient Layers scope: 4 categories with multiple effects

**Decision:** Ambient Layers delivers four categories: Blood, Snow, Rain, Fog — with multiple intensity/variant effects per category. Shipped.

**Why:** these four cover the range CoNexus needs (horror/intensity, cold/isolation, mood/weather, mystery/obscurity) and demonstrate the system's physics adaptation across all four classic ambient effect categories.

**How to apply:** Ambient Layers is complete and ships in `packages/ambient-layers/`. Phase 4b lifts it into the premium repo.

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

---

## D19 — Layer architecture: L0 / L1 / L2

**Decision:** Void Energy's value is decomposed into three independent layers:
- **L0** — framework-agnostic design system brain (`@void-energy/tailwind`). Tokens, atmospheres, physics, density. Pure CSS + vanilla JS.
- **L1** — Svelte 5 component library (`void-energy`). 40+ components with constraint enforcement. The actual product.
- **L2** — AI pipeline (CLAUDE.md, registry, recipes). Turns L1 into an automated frontend engine.

**Why:** VE is currently Svelte-only, which limits reach to ~3% of frontend developers. The token system (atmospheres, physics, density) is pure CSS custom properties with zero framework dependency — it can be extracted without losing fidelity. Separating the brain (L0) from the body (L1) lets VE sit *underneath* other component libraries instead of competing with them. "shadcn + VE" instead of "shadcn vs VE." L0 is the gateway to L1; L2 is the moat that only works on top of L1.

**How to apply:** L0 ships as a separate npm package from the same public monorepo. L0 and L1 share the same `design-tokens.ts` SSOT. L0 imports nothing from L1. L2 only references L1 components and patterns.

---

## D20 — L0 ships as `@void-energy/tailwind`, not inside `void-energy`

**Decision:** the framework-agnostic preset is a separate package (`@void-energy/tailwind`), not a sub-export of `void-energy`.

**Why:** consumers who only want tokens should not install Svelte as a peer dependency. Keeping L0 as a separate package means its dependency graph is: Tailwind CSS v4, nothing else. A React developer never sees Svelte in their `node_modules`. The package name also signals clearly what it is — a Tailwind preset, not a component library.

**How to apply:** both packages live in the public monorepo (`packages/void-energy/` and `packages/void-energy-tailwind/`). Published independently to npm. The monorepo structure in [phase-4a-monorepo-structure.md](phase-4a-monorepo-structure.md) updated to include L0 as a workspace package.

---

## D21 — No L0.5 (CSS component classes)

**Decision:** do NOT build a CSS-only component layer (`.ve-button`, `.ve-card`, etc.) between L0 tokens and L1 Svelte components.

**Why:** L0.5 would create two component systems to maintain in perpetual sync. CSS classes cannot enforce composition constraints (TypeScript props, slot contracts, data-state protocol) — the enforcement that makes L1 valuable is framework-level, not style-level. L0.5 also creates an upgrade off-ramp: someone using `.ve-button` CSS classes has less reason to upgrade to L1, not more, because they already "have VE components." L0 deliberately doesn't give you components, which creates pull toward L1. Additionally, the CSS component framework market (Bootstrap, DaisyUI, Pico) is brutally competitive with minimal differentiation opportunity.

**How to apply:** if someone asks for CSS components, point them to L0 (tokens) + their preferred component library (shadcn, Radix, etc.). The answer is "use our design system brain with your own body."

---

## D22 — Phase order: L0 (1), TTS (2), L2 (3) — Ambient complete

**Decision:** Phase 1 is now the L0 Tailwind preset extraction. Phase 2 is TTS + KT sync. Phase 3 is the L2 AI automation foundation. Ambient Layers (previously Phase 1) is complete and shipped.

**Why:** with Ambient Layers done, the next highest-leverage move is expanding VE's addressable market. L0 is low effort (the token system already exists and is well-structured for extraction) with outsized reach (millions of Tailwind users across every framework). TTS sync follows because KT needs timeline-driven reveal before CoNexus can build its narrative reading experience. L2 depends on understanding the L0/L1 split to provide correct context at each layer.

**How to apply:** see [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md), [phase-2-tts-kinetic-sync.md](phase-2-tts-kinetic-sync.md), and [phase-3-ai-automation.md](phase-3-ai-automation.md).

---

## D23 — L0 includes only free atmospheres

**Decision:** `@void-energy/tailwind` ships with 4 atmosphere CSS files: Frost (glass/dark), Slate (flat/dark), Terminal (retro/dark), Meridian (flat/light). The 12 DGRS atmospheres remain premium-only.

**Why:** the free tier must demonstrate all 3 physics presets + both color modes without any "buy the atmosphere pack" upsell. The AI atmosphere generator (future) lets anyone create unlimited custom atmospheres. Premium atmospheres are additive luxury, not gated necessity. This matches D10 (free vs premium split).

**How to apply:** L0's build script generates CSS only for the 4 free atmospheres. Premium atmospheres ship separately via `@dgrslabs/void-energy-dgrs` (which can optionally produce L0-compatible CSS files for its atmospheres in the future).

---

---

## D24 — Tailwind v4 migration before L0 extraction (Phase 0) ✓ COMPLETE

**Decision:** Migrate the existing L1 codebase from Tailwind v3.4 to v4 as Phase 0, before extracting L0.

**Why:** L0 must target v4's CSS-first `@theme` API (that's how presets work in v4). Running L1 on v3 while building L0 for v4 means maintaining two Tailwind integration approaches and cannot validate the `@theme` block against the running system.

**How it played out:** Phase 0 swapped the build tool (`@astrojs/tailwind` → `@tailwindcss/vite`) and replaced `tailwind.config.mjs` with a CSS `@theme` block in [src/styles/tailwind-theme.css](../src/styles/tailwind-theme.css). The risks the original plan flagged (`text-*` namespace collision, `@astrojs/tailwind` v6 availability) turned out to be non-issues. The *actual* problems were five v4 quirks the plan didn't anticipate, fixed in Phase 0a:

1. Bare `border` family hardcoded to 1px (v3's `borderWidth.DEFAULT` no longer wired) — fixed via `@layer void-overrides` block
2. Bare `rounded` not driven by `--radius-*` namespace — fixed via `@utility rounded`
3. `min-h-control` namespace mismatch (`--min-height-*`, not `--min-h-*`) — fixed via `@utility`
4. `.container` shadowed by Tailwind v4's built-in container utility — fixed via `void-overrides` layer
5. `--max-width > --spacing > --container` fallback chain shadowing container queries — fixed via explicit `--max-width-*` declarations

The Phase 0a fixes also surfaced the **`@theme inline` vs `@theme reference` distinction** as the load-bearing learning for L0: any token whose name SCSS/atmosphere/physics CSS already defines on `:root` must use `@theme reference` to avoid a self-reference cycle. The full namespace strategy and footgun inventory are documented in [phase-1-l0-tailwind-preset.md](phase-1-l0-tailwind-preset.md), which absorbs all Phase 0/0a learnings.

---

## D25 — Design language modernization before L0 extraction (Phase 0b) ✓ COMPLETE

**Decision:** Update the visual language to 2025-2026 best practices before Phase 1 extracts L0.

**Why:** L0 will bake these values into `@void-energy/tailwind` — shipping MD2-era uppercase buttons and 4px flat radius as the default for all Tailwind consumers would hurt adoption. The system's architecture is modern; only the surface-level styling was dated.

**Changes:**
1. **Button typography:** Sentence case + medium weight (500) + 0.02em tracking replaces uppercase + semibold (600) + 0.05em tracking. CTA retains uppercase. `.btn-loud` opt-in class preserves old treatment.
2. **Flat radius:** `--radius-base` from 4px (`VOID_RADIUS.sm`) to 8px (`VOID_RADIUS.md`), matching glass and industry standard (shadcn, MD3, Linear all use 8px+).
3. **Flat hover:** Removed lift/scale transforms (`lift: '0px'`, `scale: 1`). Flat buttons use 12% background tint on hover — the modern minimal pattern.
4. **Active press:** Reduced from `brightness(0.85)/scale(0.96)` to `brightness(0.92)/scale(0.98)`. Flat physics uses tint-only (no scale).
5. **Glass glow:** Alpha values reduced from 40-60% to 25-40%. Still brand-defining, no longer overwhelming.
6. **CTA weight:** Reduced from extrabold (800) to bold (700) — assertive without being oppressive alongside uppercase.

**Reviewed and confirmed no changes needed:** Flat easings (already standard ease-out, no overshoot), focus ring (dual-ring pattern is best-in-class), spacing scale (4px base is industry standard), density scaling (unaffected by all changes).

---

## D26 — Mobile deployment via Capacitor + cloud builds (Phase 5)

**Decision:** Ship Void Energy apps to App Store and Google Play using Capacitor as the native WebView wrapper, with cloud build services (Capawesome/Appflow/Codemagic) handling compilation and signing. Deliver as a `ve-app-template` — a ready-to-clone project that builders use without touching native code.

**Why:** VE apps are web apps; app stores require native binaries. Capacitor is the mature, Ionic-backed bridge for this exact use case. Cloud builds eliminate the Mac/Xcode requirement so any team member on any OS can ship to both stores. The template approach means the native configuration is done once by the maintainer, not reinvented per app.

**Key constraints:**
- Mobile apps use `output: 'static'` (WebView can't run Node); backend stays hosted (Go API / Vercel SSR)
- Glass physics (`backdrop-filter`) must be tested on mid-range Android before shipping — if it can't sustain 60fps, flat becomes the mobile default
- Safe-area tokens already exist in `_reset.scss`; layout primitives must consume them
- Status bar color must sync with the active atmosphere/mode
- Keyboard resize mode must be `ionic` to avoid breaking `dvh` layouts

**How to apply:** Phase 5 executes after Phase 4 (monorepo restructure + premium packages), before Phase 6 (CoNexus migration). The plan is written now so Phases 1–4 can account for mobile concerns (L0 safe-area utilities, capacitor helper exports). See [phase-5-mobile-deployment.md](phase-5-mobile-deployment.md).

---

## D27 — Tool-agnostic system prompt (`SYSTEM-PROMPT.md`), not a `.void/` config directory

**Decision:** L2's portable automation surface is a single `SYSTEM-PROMPT.md` file — a condensed, API-ready prompt that any LLM can consume. No `.void/` directory, no `project.yaml`, no `void-agent` CLI config format.

**Why:** `.claude/` and `CLAUDE.md` are Claude Code-specific (walk-up discovery, rule triggers, nearest-only merging). That locks L2's value to one tool. A single system prompt file is the minimal portable piece — any automation tool (Cursor, custom agents, CI pipelines, a future `void-agent` CLI) can read it. A `.void/` config directory would duplicate the content already in `.claude/` and the AI catalogs, creating two systems to maintain. The config format for a CLI that doesn't exist yet would be speculative — design the config when the tool exists and has real requirements.

**What it contains:** condensed 5 Laws, component catalog (from `component-registry.json`), composition patterns, token vocabulary, constraint summary, import paths. Self-contained — an LLM reading only this file produces correct VE code.

**What it does NOT contain:** Claude Code-specific mechanics, development workflow instructions (pre-flight audit, analog matching), premium package details, monorepo structure.

**How to apply:** `SYSTEM-PROMPT.md` ships in the npm tarball alongside `component-registry.json` and the other catalogs. CoNexus extends it with a CoNexus-specific `SYSTEM-PROMPT.md` that references the base from `node_modules/void-energy/`. See [phase-3-ai-automation.md](phase-3-ai-automation.md).

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
| D7 | Ambient Layers as dedicated package from day one | Committed (shipped) |
| D8 | AI automation foundation lands in current monorepo (Phase 3) | Committed |
| D9 | CoNexus migrates last (Phase 6) | Committed |
| D10 | Free vs premium split | Committed |
| D11 | KT base free, engine premium | Committed |
| D12 | BSL 1.1 with lawyer review | Pending lawyer |
| D13 | No CI/CD in starter template | Committed |
| D14 | AI automation via npm package | Committed |
| D15 | Starter template self-contained | Committed |
| D16 | Ambient scope: 4 categories with multiple effects | Committed (shipped) |
| D17 | Selective publishing via publishConfig | Committed |
| D18 | Eric deal: revenue share, no equity | Proposed |
| D19 | Layer architecture: L0 / L1 / L2 | Committed |
| D20 | L0 as separate `@void-energy/tailwind` package | Committed |
| D21 | No L0.5 CSS component classes | Committed |
| D22 | L0 Phase 1, TTS Phase 2, L2 Phase 3 (Ambient complete) | Committed |
| D23 | L0 includes only free atmospheres | Committed |
| D24 | Tailwind v4 migration before L0 (Phase 0) | Committed (shipped) |
| D25 | Design language modernization before L0 (Phase 0b) | Committed (shipped) |
| D26 | Mobile deployment via Capacitor + cloud builds (Phase 5) | Planned |
| D27 | Tool-agnostic `SYSTEM-PROMPT.md`, no `.void/` config directory | Committed |
