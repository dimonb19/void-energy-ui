# 01 — Public Repo: `void-energy`

> The public, BSL-licensed starter system. What people fork, star, and install. A complete, working design system on its own. No premium packages — those stay private.

**Status:** Planning — Wave 1 (next step)
**Updated:** 2026-04-07
**Depends on:** Atmosphere split (done), CoNexus extraction (done)
**Blocks:** 03-conexus-repo (Wave 3), 04-npm-distribution

---

## Goal

Create `github.com/dgrslabs/void-energy` as a standalone, polished open-source (BSL) design system that:
- Is installable via `npm install void-energy`
- Can also be forked/cloned as a ready-to-build starter project
- Ships with 4 free atmospheres (Slate, Terminal, Meridian, Frost) covering all physics modes
- Includes 40+ components to build real production apps
- Has an AI atmosphere generator for creating custom themes
- Has professional documentation worthy of GitHub stars
- Tastefully mentions premium packages (KT, Ambience, Rive) without being obnoxious — the showcase site demos them visually
- **Does NOT include** the full Kinetic Text engine, Ambience Layers, or any premium packages — those are strategic moat

**Wave 1 priority:** Ship fast. Clean git: fresh `git init` + single initial commit.

**After Wave 1:** Focus shifts to premium packages (Wave 2). In Wave 1.5 / Wave 2 we will also reorganize `void-energy-ui` into a proper monorepo (Pattern A — see "Repo relationship" below) and retire `void-energy-starter` as a separate artifact.

---

## Source of truth

The public repo is created from the current `void-energy-starter` on Desktop, **not** from this `void-energy-ui` monorepo. The starter already has the clean structure, the 4 atmospheres, its own scripts, tests, and docs. The fixes in this plan are applied to the starter, then it is published.

---

## Repo relationship (current and future)

**Current (Wave 1):**
- `void-energy-ui` — this monorepo. Deployed to `void.dgrslabs.ink` as the public showcase. Stays as-is.
- `void-energy-starter` — becomes the public `dgrslabs/void-energy` repo after the fixes in this plan are applied.
- Temporary duplication is accepted: changes to shared components must land in both until Wave 1.5.

**Target (Wave 1.5 / Wave 2) — Pattern A monorepo:**
Industry-standard layout used by Radix, shadcn, TanStack, Svelte, Astro, Tailwind:
```
void-energy/                       ← one public repo, replaces both starter and monorepo
├── packages/
│   └── void-energy/               ← library, publishes to npm
└── apps/
    └── showcase/                  ← void.dgrslabs.ink, imports via workspace:*
```
One git history, no sync chore, showcase always runs against the working copy. Staging/prod split via two repos is a known anti-pattern and is explicitly rejected.

**Wave 1 does not attempt the monorepo restructure.** We ship the starter as-is first, then reorganize once the library is out the door.

---

## Wave 1 fixes (applied to `void-energy-starter`)

### Fix 1 — LICENSE file

**What:** copy [`LICENSE.md`](../LICENSE.md) from this monorepo into `void-energy-starter/LICENSE` (note: **no extension**, filename is literally `LICENSE`). GitHub auto-detects files named exactly `LICENSE` and displays the license badge on the repo landing page; `LICENSE.md` works too but `LICENSE` is the npm/GitHub convention.

**Action:** `cp /Users/dima/Desktop/void-energy-ui/LICENSE.md /Users/dima/Desktop/void-energy-starter/LICENSE`

**Do NOT add `LICENSING.md`** in Wave 1. A plain-English companion explaining BSL to devs in 30 seconds (can I use this at work? is it free under revenue X? when does it become Apache?) is valuable before active promotion but is not a publish blocker. Revisit after Wave 1 when we start promoting the repo.

The current LICENSE is already with the lawyer. When the final version arrives, swap it in with a single commit.

### Fix 2 — package.json rewrite

**What:** rewrite `void-energy-starter/package.json` so it can be published to npm as `void-energy@0.1.0`.

Changes:
- `"name": "void-energy-starter"` → `"name": "void-energy"`
- `"version": "0.0.1"` → `"version": "0.1.0"`
- Remove `"private": true`
- Add `"license": "BUSL-1.1"`
- Add `"description"`, `"repository"`, `"homepage"`, `"author"`, `"keywords"`
- Add `"files"` field listing only what should end up in the published tarball (exclude `scripts/`, `tests/`, `dist/`, `.claude/`, etc.)

**Why `0.1.0` specifically?** [semver](https://semver.org) rule: `0.y.z` means "initial development, public API may change at any time." Starting at `0.1.0` is the de-facto npm convention because:
- `0.0.x` reads as "prototype, ignore"
- `1.0.0` is a promise of API stability we don't want to make on day one (any breaking change post-1.0 forces `2.0.0`)
- `0.1.0` means "real release, usable, breaking changes go into `0.2.0`" — cheap to iterate

Svelte, Astro, Vite, and most npm packages ship at `0.1.0`.

**Library-vs-template decision (to be confirmed before publish):** the starter today is shaped like a project (has `src/pages/`, `astro.config.mjs`, `vitest.config.ts` at root), not a library. Two options:
- **Template only (recommended for Wave 1):** publish as-is. Consumers `git clone` or we add a `create-void-energy` scaffolder later. No `exports` map needed yet.
- **Library + template (Wave 1.5+):** add the full `exports` map from the original plan and use `files` to exclude pages/config from the tarball. Defer until after the Pattern A monorepo restructure.

Wave 1 ships the template-shaped package.

### Fix 3 — Frost atmosphere

The 4 free atmospheres are **Slate, Terminal, Meridian, Frost**. The starter already has `frost` in `src/config/void-registry.json` — nothing to rename. Earlier plan drafts mentioned "Solar" or "Ember" for the glass/dark slot; that was superseded. Frost is the chosen name.

Coverage: Slate (flat/dark), Terminal (retro/dark), Meridian (flat/light), Frost (glass/dark). All 3 physics + both modes covered.

### Fix 4 — Kinetic Text clarification

The **base kinetic text reveal** stays in the public repo and is free:
- `src/actions/kinetic.ts` — the action
- `src/styles/components/_kinetic.scss` — the SCSS
- `src/types/kinetic.d.ts` — types
- The `/components` page showcase for simple text reveal

The **full `@dgrslabs/void-energy-kinetic-text` package** — the advanced engine with pretext effects, narrative orchestration, etc. — is premium and lives in the premium repo.

**Action:** do not delete any of the files listed above during the starter cleanup. They are intentional and part of the free tier. Add a memory note so future audits don't flag them as "premium residue."

### Fix 5 — CoNexus residue

**Leave as-is.** The three files (`LogoCoNexus.svelte`, `Quill.svelte`, `CommandPaletteFragment.svelte` with CoNexus strings) are low-impact and nobody will care. Not a Wave 1 blocker. Revisit if it becomes embarrassing.

### Fix 6 — No CI/CD workflows

**Ship with zero `.github/workflows/`.** Deployment is not universal — every consumer has a different host (Vercel, Netlify, Cloudflare, static, SSR) with different env vars and build targets. A starter template cannot ship a useful deploy workflow.

A `ci.yml` that runs `check` + `test` on PRs would be useful for external contributors, but for Wave 1 it's optional noise. Publish manually from your laptop (`npm publish`) the first few times. Add CI only if external PRs start arriving.

**Remove the previous plan's Step 6 (CI) and Step 7 (publish workflow) entirely.**

---

## Repository structure (unchanged from starter)

The current `void-energy-starter/src/` layout is correct. No directory restructuring needed for Wave 1. Directories:

```
void-energy-starter/
├── src/
│   ├── actions/            morph, tooltip, navlink, kinetic (base), narrative, drag
│   ├── adapters/           VoidEngine
│   ├── components/
│   │   ├── core/           AtmosphereScope, ThemeScript
│   │   ├── ui/             37 UI primitives
│   │   ├── icons/          Interactive animated SVG icons
│   │   ├── modals/         Modal fragments
│   │   └── app/            App-level wrappers
│   ├── config/             tokens, registries, constants
│   ├── layouts/            Astro layouts
│   ├── lib/                modal, layer stack, transitions, tooltip, etc.
│   ├── pages/              index, 404, _template, api
│   ├── service/            AI integration
│   ├── stores/             toast, user
│   ├── styles/             SCSS engine + components + config + global
│   └── types/              TypeScript definitions
├── scripts/                dev/build/scan/registry tooling
├── tests/                  vitest
├── public/
├── AI-PLAYBOOK.md
├── COMPOSITION-RECIPES.md
├── GETTING-STARTED.md
├── CLAUDE.md
├── README.md
├── LICENSE                 ← added in Fix 1
├── package.json            ← rewritten in Fix 2
├── astro.config.mjs
├── svelte.config.js
├── tailwind.config.mjs
└── tsconfig.json
```

---

## Public component inventory

**Fields (17):** FormField, SearchField, EditField, EditTextarea, GenerateField, GenerateTextarea, PasswordField, PasswordMeter, PasswordChecklist, CopyField, ColorField, Selector, Combobox, Switcher, SliderField, Toggle, DropZone

**Buttons (4):** ActionBtn, IconBtn, ProfileBtn, ThemesBtn

**Navigation (5):** Tabs, Pagination, Breadcrumbs, Sidebar, LoadMore

**Overlays (2):** Modal, Dropdown

**Feedback (1):** Skeleton

**Charts (6):** StatCard, ProgressRing, Sparkline, DonutChart, LineChart, BarChart

**Layout (3):** SettingsRow, PullRefresh, MediaSlider

**Icons:** all custom interactive icons stay public

**Modals (7):** Alert, Confirm, Settings, Themes, Shortcuts, CommandPalette, ManualAtmosphere

Verify final list with `npm run check:registry` after the fixes.

---

## Publish steps

```bash
# 1. Apply the 6 fixes above to void-energy-starter
cd /Users/dima/Desktop/void-energy-starter

# 2. Verify it builds clean
npm ci
npm run check
npm run test
npm run build

# 3. Wipe existing git, start fresh
rm -rf .git
git init
git add -A
git commit -m "Initial commit"

# 4. Create the public repo and push
gh repo create dgrslabs/void-energy --public \
  --description "Enterprise design system for Svelte 5 + Astro" \
  --source=. --push

# 5. Publish to npm
npm publish
```

---

## Verification checklist

- [ ] `LICENSE` file present at repo root (no extension)
- [ ] `package.json` has `name: "void-energy"`, `version: "0.1.0"`, no `"private"`, `license: "BUSL-1.1"`
- [ ] All 4 free atmospheres work (Slate, Terminal, Meridian, Frost)
- [ ] All physics demonstrated: glass (Frost), flat (Slate/Meridian), retro (Terminal)
- [ ] Both color modes work: dark (Slate/Terminal/Frost), light (Meridian)
- [ ] Base kinetic text reveal still works on `/components` page (free tier)
- [ ] Full Kinetic Text engine is NOT included (premium)
- [ ] `npm run check` passes (zero type errors)
- [ ] `npm run test` passes
- [ ] `npm run check:registry` passes
- [ ] AI atmosphere generator works
- [ ] README is professional and complete
- [ ] LICENSE is in place
- [ ] Fresh `git init` → single initial commit
- [ ] `npm publish` succeeds
- [ ] Package installs cleanly from a fresh directory: `npm install void-energy`

---

## Premium mention strategy

The public repo tastefully acknowledges premium packages:
- README: "Premium packages available" section (Kinetic Text engine, Ambience Layers, Rive animations)
- Link to the showcase site where people can SEE all premium features in action
- "Interested? Contact us" — collect contacts, discuss access when demand exists
- No feature degradation — the public system is complete and useful on its own
- The AI generator works fully in the free tier (anyone can create custom atmospheres)
- **The showcase site (void.dgrslabs.ink) IS the marketing** — people see KT engine, Ambience, all 16 themes there
