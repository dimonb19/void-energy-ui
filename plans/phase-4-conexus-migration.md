# Phase 4 — CoNexus Migration

> Rebuild CoNexus as a private Svelte/Astro app that consumes `void-energy` from public npm and premium packages from GitHub Packages, exactly the way any external customer would.

**Status:** Planning — blocked on Phase 3 + 3b completion
**Priority:** Phase 4 (final phase)
**Depends on:** Phase 3 complete (public monorepo shipped, premium packages published), Phase 3b (TTS + KT sync)
**Blocks:** nothing — this is the last phase

---

## Goal

Create `github.com/dgrslabs/conexus` as a private repository containing a single Svelte/Astro application that:

- Imports `void-energy` from public npmjs.org
- Imports `@dgrslabs/void-energy-kinetic-text`, `@dgrslabs/void-energy-dgrs`, `@dgrslabs/void-energy-ambient-layers`, and eventually `@dgrslabs/void-energy-rive` from GitHub Packages
- Contains only CoNexus-specific code: the story engine, narrative orchestration, portal effects, and the interactive storytelling experience
- Has zero local copies of library code — everything is a dependency
- Is the living proof that Void Energy works end-to-end for a real application

After Phase 3, the current monorepo's CoNexus-specific code has been extracted and the system is complete: three repos in a clean dependency hierarchy, with each repo serving its defined purpose.

---

## Why CoNexus migrates last

See [decisions.md §D8](decisions.md#d8--conexus-migrates-last). In short: CoNexus is the consumer. Migrating it earlier would force library architectural decisions based on one app's needs, polluting the public API with CoNexus-shaped assumptions. Migrating last means the library is already stable and well-defined, and CoNexus has to adapt to it rather than the other way around.

A secondary benefit: the migration itself becomes the definitive proof that the system works for external consumers. If CoNexus can be built on top of `npm install void-energy` and some premium packages, so can anyone else's app.

---

## Repository layout

```
github.com/dgrslabs/conexus                    PRIVATE
│
├── package.json
├── astro.config.mjs
├── svelte.config.js
├── tailwind.config.mjs
├── tsconfig.json
├── README.md                                    private docs
├── CLAUDE.md                                    CoNexus-specific AI rules
├── .claude/                                     CoNexus-specific rules/commands
│   └── rules/
│       ├── story-engine.md
│       └── narrative-orchestration.md
│
├── .npmrc                                       auth config for GitHub Packages (gitignored)
│
├── src/
│   ├── pages/                                   Astro routes
│   │   ├── index.astro                          landing
│   │   ├── story/[id].astro                     story viewer
│   │   ├── library.astro                        story library
│   │   └── api/                                 backend endpoints
│   │
│   ├── story-engine/                            CoNexus-exclusive
│   │   ├── runner.ts                            story execution
│   │   ├── state.svelte.ts                      story state
│   │   ├── choices.ts                           branching logic
│   │   └── persistence.ts                       save/load
│   │
│   ├── narrative/                               CoNexus-exclusive
│   │   ├── orchestrator.svelte.ts               sequencing ambient + KT + atmosphere shifts
│   │   ├── events.ts
│   │   └── triggers.ts
│   │
│   ├── components/                              CoNexus-only UI (not library-worthy)
│   │   ├── StoryReader.svelte
│   │   ├── ChoiceList.svelte
│   │   ├── LibraryGrid.svelte
│   │   └── CharacterPortrait.svelte
│   │
│   ├── layouts/
│   │   └── StoryLayout.astro
│   │
│   ├── service/                                 backend services (AI story generation)
│   │   ├── story-generator.ts
│   │   └── anthropic-client.ts
│   │
│   ├── stores/
│   │   └── player.svelte.ts                     player state
│   │
│   └── boot/
│       └── register-dgrs.ts                     registers DGRS atmospheres on startup
│
└── public/
    └── (CoNexus assets, story media)
```

**What's NOT in this repo:**
- No components that belong in `void-energy` — those are imported from npm
- No atmosphere definitions — those come from `@dgrslabs/void-energy-dgrs`
- No KT engine code — that's `@dgrslabs/void-energy-kinetic-text`
- No ambient layers — those are `@dgrslabs/void-energy-ambient-layers`
- No Rive bindings — those are `@dgrslabs/void-energy-rive`
- No design tokens, SCSS engine, physics — all from `void-energy`

---

## Dependencies

```json
{
  "name": "conexus",
  "private": true,
  "type": "module",
  "dependencies": {
    "astro": "^5.0.0",
    "svelte": "^5.0.0",
    "void-energy": "^0.1.0",
    "@dgrslabs/void-energy-kinetic-text": "^0.1.0",
    "@dgrslabs/void-energy-dgrs": "^0.1.0",
    "@dgrslabs/void-energy-ambient-layers": "^0.1.0",
    "@dgrslabs/void-energy-rive": "^0.1.0",
    "@anthropic-ai/sdk": "..."
  }
}
```

CoNexus has no workspace setup, no `packages/` folder, no sub-apps. It is a single Astro application. Everything it displays visually is imported from published packages.

### `.npmrc` for GitHub Packages auth

```
@dgrslabs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` is set in the developer's environment and in Vercel (or wherever CoNexus deploys). The `.npmrc` itself is committed; only the token is secret.

---

## Boot sequence

CoNexus has to register the 12 DGRS atmospheres at startup because they're not built into the public `void-energy` library (which only ships the 4 free atmospheres).

```ts
// src/boot/register-dgrs.ts
import { voidEngine } from 'void-energy/engine';
import { dgrsAtmospheres } from '@dgrslabs/void-energy-dgrs';

export function registerDGRSAtmospheres() {
  for (const [id, def] of Object.entries(dgrsAtmospheres)) {
    voidEngine.registerTheme(id, def);
  }
}
```

Called once from the root layout or equivalent early init hook. After this runs, the engine knows about all 16 atmospheres (4 free from core + 12 from DGRS).

---

## How CoNexus uses each premium package

### `void-energy` (public)
- All 40+ components (Button, SearchField, Modal, Dropdown, etc.)
- Physics presets and mode switching
- Token system
- The 4 free atmospheres (Slate, Terminal, Meridian, Frost)
- AI atmosphere generator
- Base kinetic text action for simple reveals
- Narrative and drag actions
- All utilities (modal manager, layer stack, transitions, shortcut registry)

### `@dgrslabs/void-energy-kinetic-text` (premium)
- Advanced kinetic text engine for story rendering
- Pretext effects for character introductions and scene transitions
- Narrative sequencing hooks

CoNexus is the primary consumer — its entire reading experience is rendered through KT.

### `@dgrslabs/void-energy-dgrs` (premium)
- 12 DGRS atmospheres registered at boot
- DGRS UI components: `Tile`, `StoryCategory`, `PortalLoader`, `LoadingTextCycler`, `StoryFeed`
- These are shared across all future DGRS Labs apps

### `@dgrslabs/void-energy-ambient-layers` (premium)
- Blood, Snow, Rain, Fog layers triggered by story events
- Narrative orchestrator decides when to fade layers in/out based on the current scene

### `@dgrslabs/void-energy-rive` (premium)
- Rive glass effect bindings for premium visual moments
- Used selectively for key story beats (not persistent)

---

## Migration steps

1. **Create the private repo:** `gh repo create dgrslabs/conexus --private`

2. **Scaffold a fresh Astro project** using `npm create void-energy@latest` or a manual setup. The scaffolded starter gives us a known-good baseline importing `void-energy`.

3. **Extract CoNexus-only code from the current monorepo:**
   - Story engine code (anywhere it lives now)
   - Narrative orchestration
   - CoNexus-specific pages and layouts
   - CoNexus-specific components (StoryReader, ChoiceList, etc.)
   - Backend service code for story generation
   - Player state stores
   - Move all of this into the new `conexus/src/`

4. **Identify any code that "feels library-worthy" but is currently CoNexus-only:**
   - If it's generically useful, it should probably be promoted to `void-energy` or to a premium package
   - Discuss case-by-case; defer promotion if it delays Phase 3
   - For the migration itself, keep questionable code in CoNexus and promote later

5. **Wire up imports:**
   - Replace all relative imports of library code with imports from `void-energy`
   - Replace imports of DGRS components with imports from `@dgrslabs/void-energy-dgrs`
   - Replace imports of KT with `@dgrslabs/void-energy-kinetic-text`
   - Replace imports of ambient with `@dgrslabs/void-energy-ambient-layers`

6. **Configure auth:**
   - Add `.npmrc` with `@dgrslabs` registry pointing to GitHub Packages
   - Add `.npmrc` to `.gitignore` if it contains the token directly
   - Alternative: use `${GITHUB_TOKEN}` substitution and keep `.npmrc` committed

7. **Register DGRS atmospheres at boot** via `src/boot/register-dgrs.ts`

8. **Verify the migration:**
   - `npm install` succeeds with GitHub Packages auth
   - `npm run dev` starts without errors
   - Every page renders correctly
   - All 16 atmospheres work
   - Ambient layers trigger correctly
   - Kinetic text renders stories correctly

9. **Update Vercel (or whichever deploy target CoNexus uses):**
   - Add `GITHUB_TOKEN` environment variable for package auth during build
   - Point the deployment at the new repo
   - Verify production build succeeds

10. **Retire CoNexus code from the current monorepo:**
    - After CoNexus runs cleanly from its new repo, delete the CoNexus-specific code from the old monorepo
    - The old monorepo's fate is already sealed by Phase 2 — it's replaced by the new public `void-energy` monorepo. Phase 3 just ensures no dangling CoNexus references remain.

---

## What changes about CoNexus

### Before Phase 3

CoNexus code is scattered throughout `void-energy-ui/` mixed with library code. Pages, components, story engine, library primitives, DGRS atmospheres — all in one git tree. Library changes and CoNexus changes are indistinguishable in the commit log.

### After Phase 3

CoNexus is a thin app. Every library primitive is imported. Every atmosphere comes from a package. The CoNexus repo contains only the story engine, narrative logic, and CoNexus-specific pages. Commits in the CoNexus repo are CoNexus commits, not library commits.

### What this enables

- **Library updates without touching CoNexus.** A new version of `void-energy` ships; CoNexus bumps the dependency when ready.
- **CoNexus updates without touching the library.** Story engine improvements, new pages, narrative tweaks — all isolated.
- **Clean release cycles.** CoNexus releases on its own schedule. Library releases on its own schedule. Premium packages release on their own schedule.
- **The library is tested by CoNexus.** If CoNexus can import it and build successfully, it works for external consumers too.

---

## Verification checklist

- [ ] Private repo created at `github.com/dgrslabs/conexus`
- [ ] Repo contains only CoNexus-specific code (no library code, no atmosphere definitions, no KT engine, no ambient layers)
- [ ] `package.json` declares `void-energy` from public npm
- [ ] `package.json` declares `@dgrslabs/*` premium packages from GitHub Packages
- [ ] `.npmrc` configured for GitHub Packages with token substitution
- [ ] `npm install` succeeds with valid GitHub token
- [ ] `npm run dev` starts cleanly
- [ ] All pages render correctly
- [ ] All 16 atmospheres are registered and switchable (4 free + 12 DGRS)
- [ ] Kinetic text renders stories correctly using the premium engine
- [ ] Ambient layers trigger correctly based on narrative events
- [ ] DGRS UI components (Tile, PortalLoader, StoryFeed) render correctly
- [ ] Production build succeeds
- [ ] Deploys successfully to Vercel with `GITHUB_TOKEN` env var
- [ ] No CoNexus-specific code remains in any other repo
- [ ] The old `void-energy-ui` monorepo is either retired (its role replaced by the new public repo) or contains only legacy/archive content
- [ ] CoNexus `CLAUDE.md` references the installed packages, not relative paths

---

## Out of scope for Phase 3

- **New CoNexus features.** Phase 3 is migration only. Any new story features, new narrative effects, or new gameplay mechanics come after Phase 3 ships.
- **Promoting CoNexus-only code to the library.** If something feels library-worthy, note it and defer. Promoting during migration creates scope creep.
- **Changing the library to fit CoNexus.** If the library is missing something CoNexus needs, work around it in CoNexus. Library changes happen in a separate cycle after Phase 3.
- **Automated story generation improvements.** The story engine is imported as-is. No AI/prompting work.
- **Public CoNexus beta or launch.** Phase 3 is migration. Launch planning is a separate effort.

---

## After Phase 3 — the end state

Three repos, three roles, clean dependency direction:

```
┌──────────────────────────────────────────┐
│  dgrslabs/void-energy  (PUBLIC)           │
│  ├── packages/void-energy                 │── npmjs.org
│  ├── packages/create-void-energy          │── npmjs.org
│  ├── apps/showcase                        │── void.dgrslabs.ink
│  └── apps/starter-template                │── payload for create-void-energy
└──────────────────────────────────────────┘
                  ▲
                  │ depends on
                  │
┌──────────────────────────────────────────┐
│  dgrslabs/void-energy-premium  (PRIVATE)  │
│  └── packages/                            │── GitHub Packages
│      ├── kinetic-text                     │
│      ├── dgrs                             │
│      ├── ambient                         │
│      └── rive                             │
└──────────────────────────────────────────┘
                  ▲
                  │ depends on
                  │
┌──────────────────────────────────────────┐
│  dgrslabs/conexus  (PRIVATE)              │
│  └── Single Astro app                     │── production CoNexus
│      (story engine, narrative,            │
│       consumer of everything above)       │
└──────────────────────────────────────────┘
```

The system is complete. The launch plan is done. From here, work becomes feature work inside whichever repo owns it, not architectural restructuring.
