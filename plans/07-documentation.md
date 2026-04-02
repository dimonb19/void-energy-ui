# 07 — Documentation & Licensing

> Documentation strategy, licensing implementation, and developer-facing content across all three repos.

**Status:** Planning — Wave 1
**Depends on:** 03-public-repo
**Blocks:** Launch

---

## Documentation Tiers

Each repo has documentation appropriate to its audience:

| Repo | Audience | Docs Type |
|------|----------|-----------|
| `void-energy` (public) | Open-source users, potential customers | Full docs site + guides |
| `void-energy-premium` (private) | Licensed customers, collaborators | Package READMEs + interface specs |
| `conexus` (private) | Internal team | App-specific docs |

---

## Public Repo Documentation

### Files

| Document | Purpose | Audience |
|----------|---------|----------|
| **README.md** | First impression. Quick start, feature overview, screenshots | Everyone |
| **LICENSING.md** | Human-readable BSL explanation | Users evaluating the license |
| **THEME-GUIDE.md** | How to create custom atmospheres (already exists) | Developers customizing themes |
| **CHEAT-SHEET.md** | Component + action quick reference (already exists) | Developers building with VE |
| **CONTRIBUTING.md** | How to contribute, PR process (already exists) | Contributors |
| **AI-PLAYBOOK.md** | AI page-building guide (already exists) | Developers using Claude Code |
| **COMPOSITION-RECIPES.md** | Page archetypes (already exists) | Developers building pages |
| **NARRATIVE-EFFECTS.md** | Effect reference (already exists) | Developers using narrative actions |
| **CLAUDE.md** | AI assistant context (streamlined for public) | Claude Code users |
| **CHANGELOG.md** | Version history | Everyone |

### README.md Structure

The README is the most important document. It should be professional, visually appealing, and immediately communicate value.

```markdown
# Void Energy

> Enterprise design system for Svelte 5 + Astro. Three physics engines. Semantic tokens. AI-powered theme generation.

[Badges: npm version, license, build status, Svelte 5]

[Hero screenshot or GIF showing physics switching]

## What is Void Energy?

[2-3 sentences. Not marketing fluff — technical positioning.]

Void Energy is a design system built on Svelte 5 Runes, Astro, and a hybrid SCSS/Tailwind
architecture. Every visual value flows through semantic tokens. Every component adapts to
three physics presets (glass, flat, retro) and two color modes (light, dark).

## Quick Start

npm install void-energy

[3-step setup: install, configure, use a component]

## Features

- **3 Physics Engines** — Glass (blur + glow), Flat (borders + clean), Retro (pixel-perfect)
- **4 Free Atmospheres** — Slate, Terminal, Meridian, Ember
- **50+ Components** — Form fields, navigation, overlays, charts, icons
- **Premium Packages** — Kinetic Text, Ambience Layers, Rive ([see showcase](void.dgrslabs.ink))
- **AI Theme Generator** — Create custom atmospheres with Claude
- **Semantic Tokens** — Zero raw values, full customization
- **Svelte 5 Runes** — Modern reactivity, no legacy patterns

## Atmospheres

[Grid showing 4 starter themes with screenshots]

## Components

[Categorized list with links to showcase]

## Premium Packages

Extend with premium packages (visible on the [showcase site](void.dgrslabs.ink)):
- **Kinetic Text** — Physics-aware animated text effects
- **Ambience Layers** — Immersive visual overlays (Blood, Snow, Rain, Fog)
- **Rive Animations** — Interactive Rive assets by Eric Jordan (2Advanced Studios)
- Interested? [Contact us](mailto:licensing@dgrslabs.com)

## Documentation

- [Theme Guide](THEME-GUIDE.md)
- [Component Cheat Sheet](CHEAT-SHEET.md)
- [AI Playbook](AI-PLAYBOOK.md)
- [Composition Recipes](COMPOSITION-RECIPES.md)

## License

Business Source License 1.1. See [LICENSING.md](LICENSING.md) for details.
```

### Interactive Documentation Site

The Astro-powered site in the public repo serves as live documentation:

| Route | Content |
|-------|---------|
| `/` | Introduction — what VE is, quick start, live physics demo |
| `/components` | Interactive component showcase |
| `/themes` | Atmosphere gallery + AI generator |

**Key principle:** The docs site IS the demo. Users see the system working as they read about it.

---

## Licensing Documentation

### LICENSE file

BSL 1.1 full text. Standard format recognized by GitHub, npm, and license scanners.

Key parameters to set:
- **Licensor:** DGRS Labs
- **Licensed Work:** Void Energy (version number)
- **Additional Use Grant:** [Define what free usage looks like — e.g., "use in non-production, evaluation, personal projects, and projects generating less than $X revenue"]
- **Change Date:** 4 years from each release
- **Change License:** Apache 2.0 or MIT (your choice for what it converts to)

### LICENSING.md

Human-readable explanation:

```markdown
# Licensing

Void Energy is released under the Business Source License 1.1 (BSL).

## What This Means

### You CAN (free):
- Use Void Energy for personal projects
- Use it for evaluation and testing
- Use it for educational purposes
- Use it in open-source projects
- Modify the source code
- Fork and study the code
- Use it in production for small projects (under $[X] annual revenue)

### You NEED a license for:
- Commercial products generating over $[X] annual revenue
- Reselling Void Energy or derivative works
- Offering Void Energy as a hosted service

### Automatic conversion:
- After 4 years, each version automatically converts to [Apache 2.0 / MIT]
- This means today's code becomes fully open-source in 4 years

## Premium Packages

Premium packages (@dgrslabs/void-energy-*) are proprietary and require a separate license.
Contact [email] for premium licensing.

## Questions?

Contact licensing@dgrslabs.com for clarification or custom licensing arrangements.
```

**License approach (decided):** AI-draft the LICENSE and LICENSING.md for Wave 1 launch. Include a visible note: "These terms are pending final legal review and may be updated." Boss sends draft to lawyer immediately. When lawyer returns final terms, swap with a single commit. The risk window is minimal — there won't be $1M revenue customers in week one.

**What the lawyer MUST nail down:**
- Revenue threshold — gross or net? Per product or per company? Annual or lifetime?
- "Commercial use" definition — internal tools? SaaS? Agency client work?
- Change date — 4 years from each release (not from initial release)
- Change license — Apache 2.0 recommended (patent grant matters for enterprise)

---

## Premium Repo Documentation

### Per-Package README

Each premium package gets a README with:

```markdown
# @dgrslabs/void-energy-{package}

> [One-line description]

## Installation

npm install @dgrslabs/void-energy-{package}

Requires private registry access. See [setup guide].

## Requirements

- void-energy >= 0.1.0
- svelte >= 5.0.0

## Usage

[Code example showing basic usage]

## API Reference

[Exports, props, configuration options]

## Physics Adaptation

[How the package adapts to glass/flat/retro if applicable]

## Changelog

See [CHANGELOG.md](CHANGELOG.md)
```

### PACKAGE.md (Interface Spec)

Every premium package must include a `PACKAGE.md` that defines:
- Required exports
- Void Energy integration points
- Physics/mode adaptation requirements
- Testing requirements
- State contract (data attributes, ARIA)

This is the contract that future collaborators (like Eric) must implement.

### Premium README (Root)

The premium repo root README is internal documentation:
- How to create a new package (reference the template)
- How to publish
- Version coordination with `void-energy`
- CI/CD setup

---

## CLAUDE.md Updates

### Public Repo CLAUDE.md

Streamlined version of the current CLAUDE.md:
- Remove all CoNexus references
- Remove premium atmosphere references
- Update component inventory (public tier only)
- Keep the 5 Laws, component patterns, state management
- Note extensibility via `registerTheme()` and premium packages
- Update file structure to match new repo layout

### Premium Repo CLAUDE.md

Focused on package development:
- Package creation patterns
- How to extend the core without modifying it
- Testing requirements
- Import patterns (from `void-energy` peer dependency)

### CoNexus Repo CLAUDE.md

App-specific context:
- How to use imported packages
- Boot sequence
- CoNexus-exclusive feature patterns
- Story engine architecture

---

## Existing Documentation Updates

These files already exist and need updating for the public repo:

| File | Updates Needed |
|------|---------------|
| **CHEAT-SHEET.md** | Remove CoNexus components (Tile, StoryCategory, PortalLoader). Reference only 4 free atmospheres. |
| **THEME-GUIDE.md** | Update to reference only 4 free atmospheres (Slate, Terminal, Meridian, Ember). No "premium atmospheres" mention — just note that users can create unlimited custom themes with the AI generator. |
| **AI-PLAYBOOK.md** | Remove CoNexus-specific recipes. |
| **COMPOSITION-RECIPES.md** | Remove CoNexus page archetypes. |
| **NARRATIVE-EFFECTS.md** | No changes needed (narrative effects stay public). |
| **CONTRIBUTING.md** | Update PR targets, repo references. |

---

## Documentation Maintenance

### Principles
1. **Docs live with code** — no separate docs repo
2. **README is the entry point** — everything is discoverable from README
3. **Interactive > static** — the Astro site is the best documentation
4. **Component registry is the SSOT** — `component-registry.json` is authoritative for AI-facing docs

### Process
- When adding a component: update `component-registry.json` + `CHEAT-SHEET.md`
- When adding an atmosphere: update `THEME-GUIDE.md`
- When adding an action: update `NARRATIVE-EFFECTS.md` or `CHEAT-SHEET.md`
- When changing architecture: update `CLAUDE.md`

---

## Verification Checklist

- [ ] README is professional with screenshots/GIFs
- [ ] LICENSE file contains correct BSL 1.1 text with all parameters filled
- [ ] LICENSING.md is clear and covers all use cases
- [ ] Lawyer has reviewed LICENSE and LICENSING.md
- [ ] CLAUDE.md is streamlined for public consumption (no CoNexus leaks)
- [ ] CHEAT-SHEET.md reflects public component inventory
- [ ] THEME-GUIDE.md references only starter atmospheres
- [ ] Each premium package has a README
- [ ] Package template includes PACKAGE.md interface spec
- [ ] CHANGELOG.md exists and will be maintained
- [ ] No internal/private information in public documentation
