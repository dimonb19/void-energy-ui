# 03 — Public Repo: `void-energy`

> The public, BSL-licensed starter system. What people fork, star, and install. A complete, working design system on its own.

**Status:** Planning — Wave 1 (ship in 2-3 weeks)
**Updated:** 2026-03-31
**Depends on:** 01-atmosphere-split (all 4 atmospheres ready)
**Blocks:** 05-conexus-repo (Wave 2), 06-npm-distribution

---

## Goal

Create `github.com/dgrslabs/void-energy` as a standalone, polished open-source (BSL) design system that:
- Is installable via `npm install void-energy`
- Ships with 4 free atmospheres (Slate, Terminal, Meridian, Ember) covering all physics modes
- Includes Kinetic Text package (key marketing differentiator, rides the Pretext hype wave)
- Includes 50+ components to build real production apps
- Has an AI atmosphere generator for creating custom themes
- Has professional documentation worthy of GitHub stars
- Tastefully mentions premium collaborator packages without being obnoxious

**Wave 1 priority:** Ship fast. The public repo does NOT depend on CoNexus extraction being complete. CoNexus-specific files are simply excluded during repo creation. Clean git: init commit + license.

---

## Repository Structure

```
void-energy/
├── src/
│   ├── engine/                      ← VoidEngine runtime
│   │   ├── void-engine.svelte.ts    ← Theme/physics/mode state management
│   │   ├── void-boot.js             ← FOUC prevention (runs before paint)
│   │   └── index.ts
│   │
│   ├── tokens/                      ← Token system (SSOT)
│   │   ├── design-tokens.ts         ← All token definitions
│   │   ├── build.ts                 ← Token → SCSS/JSON generator
│   │   └── index.ts
│   │
│   ├── physics/                     ← Physics engine SCSS
│   │   ├── _glass.scss
│   │   ├── _flat.scss
│   │   ├── _retro.scss
│   │   └── _index.scss
│   │
│   ├── atmospheres/                 ← 4 free atmospheres
│   │   ├── slate.ts                 ← flat/dark (default)
│   │   ├── terminal.ts              ← retro/dark
│   │   ├── meridian.ts              ← flat/light
│   │   ├── ember.ts                 ← glass/dark
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── abstracts/               ← SCSS engine (mixins, functions)
│   │   ├── base/                    ← Reset, typography, accessibility
│   │   ├── components/              ← Component SCSS (buttons, inputs, etc.)
│   │   ├── config/                  ← Generated themes (4 free only)
│   │   └── global.scss              ← Main entry + density system
│   │
│   ├── packages/
│   │   └── kinetic-text/            ← Kinetic Text package (ships FREE with void-energy)
│   │       ├── src/
│   │       │   ├── svelte/
│   │       │   │   └── KineticText.svelte
│   │       │   ├── core/
│   │       │   ├── adapters/
│   │       │   ├── types.ts
│   │       │   ├── index.ts
│   │       │   └── styles/
│   │       ├── dist/
│   │       ├── package.json
│   │       └── README.md
│   │
│   ├── components/
│   │   ├── core/                    ← AtmosphereScope, ThemeScript
│   │   ├── ui/                      ← All public UI primitives
│   │   ├── icons/                   ← Interactive animated SVG icons
│   │   └── modals/                  ← Modal fragments
│   │
│   ├── actions/                     ← Svelte actions
│   │   ├── morph.ts
│   │   ├── tooltip.ts
│   │   ├── navlink.ts
│   │   ├── kinetic.ts               ← The action (not the premium package)
│   │   ├── narrative.ts             ← 18 narrative effects
│   │   └── drag.ts                  ← Drag-and-drop system
│   │
│   ├── lib/                         ← Utilities
│   │   ├── transitions.svelte.ts
│   │   ├── modal-manager.svelte.ts
│   │   ├── layer-stack.svelte.ts
│   │   ├── shortcut-registry.svelte.ts
│   │   ├── password-validation.svelte.ts
│   │   ├── atmosphere-generator.ts  ← AI theme generator
│   │   ├── void-tooltip.ts
│   │   ├── drag-manager.ts
│   │   ├── boundary.ts
│   │   ├── timing.ts
│   │   └── result.ts
│   │
│   ├── stores/                      ← Reactive state
│   │   ├── toast.svelte.ts
│   │   └── user.svelte.ts
│   │
│   ├── config/                      ← Configuration
│   │   ├── constants.ts
│   │   ├── font-registry.ts         ← Only starter fonts
│   │   ├── modal-registry.ts
│   │   ├── ui-geometry.ts
│   │   ├── void-registry.json       ← 4 free themes
│   │   ├── void-physics.json
│   │   └── component-registry.json  ← Public components only
│   │
│   ├── types/                       ← TypeScript definitions
│   │   ├── void-ui.d.ts
│   │   ├── void-result.d.ts
│   │   ├── design-tokens.d.ts
│   │   ├── narrative.d.ts
│   │   ├── drag.d.ts
│   │   ├── kinetic.d.ts
│   │   ├── charts.d.ts
│   │   ├── combobox.d.ts
│   │   ├── selection.d.ts
│   │   ├── slider-field.d.ts
│   │   ├── modal.d.ts
│   │   ├── navigation.d.ts
│   │   ├── boundary.d.ts
│   │   ├── generation.d.ts
│   │   ├── ai.d.ts
│   │   ├── atmosphere-generator.d.ts
│   │   ├── morph.d.ts
│   │   ├── password-validation.d.ts
│   │   └── global.d.ts
│   │
│   └── service/                     ← AI integration
│       ├── ai.ts
│       ├── ai-config.ts
│       └── providers/
│           ├── anthropic.ts
│           └── openai-compatible.ts
│
├── .claude/                         ← AI agent context (for consumers using Claude Code)
│   └── rules/
├── CLAUDE.md                        ← Streamlined for public consumption
├── README.md                        ← Professional, star-worthy
├── THEME-GUIDE.md                   ← How to create custom atmospheres
├── CHEAT-SHEET.md                   ← Component + action quick reference
├── CONTRIBUTING.md                  ← PR process
├── AI-PLAYBOOK.md                   ← AI page-building guide
├── COMPOSITION-RECIPES.md           ← Page archetypes
├── NARRATIVE-EFFECTS.md             ← Effect reference
├── LICENSE                          ← BSL 1.1
├── LICENSING.md                     ← Human-readable license explanation
├── package.json
├── tsconfig.json
├── svelte.config.js
├── tailwind.config.mjs
└── astro.config.mjs
```

---

## Public Component Inventory

### UI Primitives (all stay public)

**Fields (16):** FormField, SearchField, EditField, EditTextarea, GenerateField, GenerateTextarea, PasswordField, PasswordMeter, PasswordChecklist, CopyField, ColorField, Selector, Combobox, Switcher, SliderField, Toggle, DropZone

**Buttons (4):** ActionBtn, IconBtn, ProfileBtn, ThemesBtn

**Navigation (5):** Tabs, Pagination, Breadcrumbs, Sidebar, LoadMore

**Overlays (2):** Modal, Dropdown

**Feedback (1):** Skeleton

**Charts (6):** StatCard, ProgressRing, Sparkline, DonutChart, LineChart, BarChart

**Layout (3):** SettingsRow, PullRefresh, MediaSlider

**Icons (35):** All custom interactive icons stay public

**Modals (7):** Alert, Confirm, Settings, Themes, Shortcuts, CommandPalette, ManualAtmosphere

### Removed from public (CoNexus-only)
- Tile, StoryCategory, PortalLoader, LoadingTextCycler
- StoryFeed, PortalLoaderDemo, ReorderShowcase
- TilesShowcase, PortalRing (showcase pages)

---

## Package Exports

```json
{
  "name": "void-energy",
  "version": "0.1.0",
  "license": "BUSL-1.1",
  "type": "module",
  "svelte": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/types/index.d.ts",
      "svelte": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./engine": "./src/engine/index.ts",
    "./tokens": "./src/tokens/index.ts",
    "./components/*": "./src/components/ui/*.svelte",
    "./icons/*": "./src/components/icons/*.svelte",
    "./core/*": "./src/components/core/*.svelte",
    "./modals/*": "./src/components/modals/*.svelte",
    "./actions/*": "./src/actions/*.ts",
    "./lib/*": "./src/lib/*.ts",
    "./stores/*": "./src/stores/*.ts",
    "./config/*": "./src/config/*",
    "./styles": "./src/styles/global.scss",
    "./styles/*": "./src/styles/**/*.scss",
    "./types": "./src/types/index.d.ts"
  },
  "peerDependencies": {
    "svelte": "^5.0.0",
    "astro": "^5.0.0"
  },
  "peerDependenciesMeta": {
    "astro": { "optional": true }
  }
}
```

---

## Documentation Site

The public repo doubles as a documentation site (Astro-powered):

### Pages
| Route | Content |
|-------|---------|
| `/` | Introduction — what Void Energy is, quick start, live demo |
| `/components` | Interactive component showcase (all public primitives) |
| `/themes` | Atmosphere gallery, theme creation guide, AI generator |

### Navigation
- **Intro** (home)
- **Components** (showcase)
- **Themes** (atmosphere gallery)
- Link to premium packages documentation (external)

---

## CLAUDE.md for Public Repo

The public CLAUDE.md should be:
- Streamlined (no CoNexus references)
- Focused on the public component set
- Include the 5 Laws, component patterns, and state management docs
- Reference only 4 starter atmospheres
- Note that the system is extensible via `registerTheme()` and premium packages

---

## Setup Steps

### Step 1: Create the repository
```bash
gh repo create dgrslabs/void-energy --public --description "Enterprise design system for Svelte 5 + Astro"
```

### Step 2: Initialize from monorepo
- Copy the file structure above
- Remove all CoNexus-specific files (per 02-conexus-extraction)
- Remove DGRS-private atmosphere definitions (per 01-atmosphere-split)
- Update `_generated-themes.scss` to contain only 4 free themes (Slate, Terminal, Meridian, Ember)
- Update `void-registry.json` to list only 4 free themes
- Update `font-registry.ts` to include only free-tier fonts
- Include Kinetic Text package in `packages/kinetic-text/`
- Update `component-registry.json` to list only public components

### Step 3: Clean imports
- Search for any remaining references to removed components
- Update Navigation to remove CoNexus tab
- Update showcase pages to remove CoNexus demos

### Step 4: Add BSL license (AI-drafted placeholder)
- `LICENSE` file with BSL 1.1 text — AI-drafted, clearly marked as "pending legal review"
- `LICENSING.md` with human-readable explanation
- Boss sends draft to lawyer immediately after Wave 1 launch
- When lawyer returns final terms, swap with a single commit (clean git history)
- Include a note: "These terms are pending final legal review and may be updated"
- License header in key source files (optional but professional)

### Step 5: Polish README
Professional README with:
- Hero image/GIF showing the system in action
- Feature list (physics, atmospheres, tokens, components)
- Quick start instructions
- Links to documentation
- Premium tier mention (tasteful, not aggressive)
- BSL license badge

### Step 6: CI/CD
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build:tokens
      - run: npm run check
      - run: npm run test
      - run: npm run build
```

### Step 7: npm publish workflow
```yaml
# .github/workflows/publish.yml
name: Publish
on:
  release:
    types: [published]
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci && npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Premium Mention Strategy

The public repo should tastefully acknowledge premium collaborator packages:
- README: "Extend with premium packages" section (Rive animations, future add-ons)
- No "premium atmospheres" upsell — the 4 free atmospheres are complete, and the AI generator lets anyone create more
- No feature degradation — the public system is complete and useful on its own
- The AI generator works fully in the free tier (anyone can create custom atmospheres)
- Kinetic Text ships free — it's a marketing tool, not a premium gate

---

## Verification Checklist

- [ ] Repo builds from clean clone (`npm ci && npm run build`)
- [ ] All 4 free atmospheres work (Slate, Terminal, Meridian, Ember)
- [ ] All physics modes demonstrated (glass via Ember, flat via Slate/Meridian, retro via Terminal)
- [ ] Both color modes work (dark via Slate/Terminal/Ember, light via Meridian)
- [ ] Kinetic Text package builds and works
- [ ] `npm run check` passes (zero type errors)
- [ ] `npm run test` passes
- [ ] `npm run check:registry` passes
- [ ] No CoNexus references in any file
- [ ] No DGRS-private atmosphere definitions in generated SCSS
- [ ] AI atmosphere generator works
- [ ] Documentation site renders correctly
- [ ] README is professional and complete
- [ ] BSL license is properly formatted
- [ ] Package publishes to npm successfully
