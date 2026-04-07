# Phase 2 — AI Automation Foundation

> Build the robust AI context system inside the current `void-energy-ui` monorepo. This is foundational infrastructure — not a "polish pass" that happens later during the restructure. The system must have strong AI automation before Phase 3 touches anything.

**Status:** Planning — blocked on Phase 1 (Ambience Layers) completion
**Priority:** Phase 2 (second priority, after Ambience ships)
**Depends on:** Phase 1 complete
**Blocks:** Phase 3 (monorepo restructure inherits and redistributes this work)

---

## Why Phase 2 (and why now, not later)

AI automation is not a cosmetic feature. It is the primary differentiator of how Void Energy is consumed:

- **Consumers build with AI.** The entire value proposition is "AI composes apps correctly using the system." If the AI hallucinates components, forgets the 5 Laws, or recreates primitives that already exist, the system fails at its job.
- **The team builds with AI.** Every hour of AI assistance inside the monorepo that drifts from the 5 Laws is an hour of cleanup later. Strong AI context prevents drift at the source.
- **Later is harder.** Bolting on AI automation during the Phase 3 restructure means doing two disruptive things at once. Landing it in the current monorepo first means Phase 3 inherits a working system and just redistributes it across workspaces.

**This phase delivers foundation. Phase 3 will redistribute that foundation across `packages/` and `apps/` workspaces, but it will not have to invent it.**

---

## Goal

Inside the current `void-energy-ui` monorepo, establish:

1. **A layered `CLAUDE.md` + `.claude/` system** that provides the right rules at the right scope (system-level vs consumer-level)
2. **A complete, enforced `component-registry.json`** that is the single source of truth for "what components exist"
3. **Strict rules, agents, commands, and skills** that make Claude Code reliably follow the 5 Laws and the Void Energy protocols
4. **A package-level CLAUDE.md pattern** that premium packages (starting with ambience, kinetic-text, dgrs) all follow
5. **AI-readable catalogs** (`CHEAT-SHEET.md`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`) that are curated, accurate, and referenced by the rules

After Phase 2, opening Claude Code anywhere in the monorepo produces correct, rule-following behavior without manual prompting.

---

## How Claude Code discovers context (mechanics)

Three loading mechanisms, each with different scope:

### 1. `CLAUDE.md` files — walked up from CWD

Claude Code walks up the filesystem from the current working directory and loads every `CLAUDE.md` it finds along the way. Nearest wins on conflicts; higher-level files still contribute rules that aren't overridden.

**Example:** `cd packages/ambience && claude` loads:
1. `packages/ambience/CLAUDE.md` (nearest)
2. `packages/CLAUDE.md` if it exists
3. `CLAUDE.md` at monorepo root
4. `~/.claude/CLAUDE.md` (user-global)

**This is the lever.** Different directories need different AI behavior. Put strict library rules in `src/CLAUDE.md` (for core library work). Put package-level rules in `packages/*/CLAUDE.md`. Put consumer rules in `src/pages/CLAUDE.md` (for showcase/app work). Let the walk-up do the merging.

### 2. `.claude/` directories — nearest-only

Only the **nearest** `.claude/` directory is active. Claude Code does not merge rules/agents/commands from multiple levels. Whichever `.claude/` is at or above CWD is the one used.

**Implication:** the monorepo has one canonical `.claude/` at the root. Package-level `.claude/` directories would **override** it entirely, which is usually not what we want. So: one root `.claude/`, package-specific behavior goes into `packages/*/CLAUDE.md` instead.

### 3. Machine-readable manifests — read because `CLAUDE.md` points at them

`component-registry.json`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, `CHEAT-SHEET.md` are plain files. The AI reads them because the active `CLAUDE.md` tells it to. Think of them as the "data layer" underneath the "instructions layer."

---

## The layered layout (inside current monorepo)

```
void-energy-ui/                                ← current monorepo root
│
├── CLAUDE.md                                  ← ROOT: shared rules
│                                                 5 Laws, Runes Doctrine, Token Law,
│                                                 Native-first, State Protocol,
│                                                 workspace map, pointers
│
├── .claude/                                   ← ROOT: canonical AI infrastructure
│   ├── rules/                                   loaded on-demand by file type
│   │   ├── scss-physics.md                      trigger: editing .scss
│   │   ├── svelte-runes.md                      trigger: editing .svelte
│   │   ├── token-law.md                         trigger: any file with raw values
│   │   ├── native-first.md
│   │   ├── state-protocol.md
│   │   └── composition-only.md                  trigger: editing consumer code
│   ├── agents/                                  subagents
│   │   ├── design-reviewer.md                   (already exists)
│   │   ├── a11y-checker.md                      (already exists)
│   │   ├── migration-helper.md
│   │   └── registry-auditor.md                  new: checks registry consistency
│   ├── commands/                                slash commands
│   │   ├── new-component.md                     (already exists as skill)
│   │   ├── review.md                            (already exists as skill)
│   │   ├── simplify.md                          (already exists as skill)
│   │   ├── document.md                          (already exists as skill)
│   │   ├── build-page.md                        (already exists as skill)
│   │   └── migrate.md                           (already exists as skill)
│   ├── skills/                                  existing skill definitions (many already present)
│   └── settings.json                            hooks, permissions
│
├── AI-PLAYBOOK.md                             ← ROOT: high-level "how AI should work here"
├── COMPOSITION-RECIPES.md                     ← ROOT: page archetypes
├── CHEAT-SHEET.md                             ← ROOT: component + action catalog
│
├── src/
│   ├── CLAUDE.md                              ← CORE LIBRARY: strict rules
│   │                                              "you are editing the core library.
│   │                                               pre-flight audit mandatory.
│   │                                               no inventions. read analog."
│   │
│   ├── config/
│   │   └── component-registry.json            ← SSOT — enforced by check:registry
│   │
│   └── pages/
│       └── CLAUDE.md                          ← SHOWCASE/APP: consumer rules
│                                                  "you are editing consumer code.
│                                                   compose from library.
│                                                   do not modify src/components."
│
└── packages/
    ├── ambience/
    │   └── CLAUDE.md                          ← PACKAGE: premium-package rules
    │                                              "you are editing the ambience package.
    │                                               peer-depend on void-energy only.
    │                                               no cross-reach into other packages."
    ├── kinetic-text/
    │   └── CLAUDE.md                          ← same pattern
    └── dgrs/
        └── CLAUDE.md                          ← same pattern
```

---

## What each layer contains

### Root `CLAUDE.md` — shared across the monorepo

**Scope:** rules true everywhere.

**Content:**
- Workspace map ("`src/` is the core library, `src/pages/` is the showcase app, `packages/*` are premium packages")
- The **5 Laws** in full (Hybrid Protocol, Token Law, Runes Doctrine, State Protocol, Spacing Gravity)
- Runes Doctrine, Native-first, State Protocol
- "Before any task, read the relevant component-registry.json"
- Pointer to `src/CLAUDE.md` and `packages/*/CLAUDE.md` for specialized behavior
- Pointer to `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`, `CHEAT-SHEET.md`

**Most of this already exists today.** Phase 2 audits, restructures, and splits it into the layered form below.

### Root `.claude/` — canonical AI infrastructure

Already largely in place today. Phase 2 gaps to fill:

- **`.claude/rules/`** — extract topic-specific rule files from the current CLAUDE.md. Each rule file is loaded on-demand based on file type or task. Keeps the root CLAUDE.md shorter and more focused.
- **`.claude/agents/registry-auditor.md`** — new subagent that audits `component-registry.json` for drift, missing entries, or stale docs.
- **`.claude/settings.json`** — formalize hooks. Consider a pre-edit hook on `.svelte` files that reminds the AI to check the registry first.

### `src/CLAUDE.md` — core library rules (strict)

**Scope:** rules that apply only when editing the core library (anything in `src/` except `src/pages/`).

**Content:**
- Pre-flight audit protocol (currently in root CLAUDE.md — moved here because it only applies to library work)
- "Before creating any component, check `src/config/component-registry.json` to ensure it doesn't exist"
- "No inventions" — use existing mixins, tokens, abstractions
- "Read the analog" — find the nearest existing pattern and replicate it
- "Report findings before implementing"
- Specific SCSS and component patterns used inside the library

**Why here and not at root:** these rules are wrong for consumer code. A page or app developer *should* compose freely. Putting these constraints at the root would over-gate non-library work.

### `src/pages/CLAUDE.md` — showcase/app rules (consumer-level)

**Scope:** rules for editing pages, layouts, or app-level code.

**Content:**
- "You are building consumer-side code. You are a **consumer** of the core library."
- "Compose primitives from `src/components/ui/*`. Do NOT modify them from here."
- "If you need to change a component's behavior, propose it to the user — do not reach across into `src/components/` to edit."
- Composition patterns for pages
- Integration patterns for premium packages

### `packages/*/CLAUDE.md` — premium package rules

**Scope:** rules for editing a specific premium package.

**Content (template, one per package):**
- "You are editing the `@dgrslabs/void-energy-{name}` package."
- "This package depends on `void-energy` as a peer. It does NOT reach into `src/` via relative paths."
- "All imports from the core library must go through public exports (`void-energy/tokens`, `void-energy/styles`, `void-energy/components/*`)."
- "This package does NOT import from other `packages/*` — premium packages are independent of each other."
- "The package is a dedicated module designed to be liftable into the Phase 3 premium repo with zero refactoring."
- Package-specific patterns (e.g., kinetic text's engine API, ambience's layer API)

**Three packages need this file:** `packages/ambience/CLAUDE.md`, `packages/kinetic-text/CLAUDE.md`, `packages/dgrs/CLAUDE.md`.

---

## The component registry as SSOT

`src/config/component-registry.json` is the single source of truth for "what components exist, what props they take, what they do, where to find them."

**Shape (simplified):**

```json
{
  "components": {
    "Button": {
      "category": "action",
      "path": "./components/ui/Button.svelte",
      "description": "Primary action button with physics adaptation",
      "props": {
        "variant": { "type": "'primary' | 'secondary' | 'ghost' | 'error'", "default": "'primary'" },
        "size": { "type": "'sm' | 'md' | 'lg'", "default": "'md'" },
        "disabled": { "type": "boolean", "default": false }
      },
      "examples": [
        "<Button>Click me</Button>",
        "<Button variant='ghost'>Cancel</Button>"
      ]
    },
    ...
  },
  "actions": { ... },
  "icons": { ... }
}
```

### Why it matters

When a user asks their AI "add a search field to this page," the AI should:
1. Read `component-registry.json`
2. Find `SearchField`
3. Import it correctly
4. Use it with the documented props

Without the registry, the AI guesses — creates a custom `<input type="search">` in a div, hallucinates a component called `Search`, or duplicates functionality that already exists. The registry eliminates the guessing.

### Enforcement

The existing `scripts/check-component-registry.ts` verifies that every `.svelte` file in `components/ui/` has a registry entry and vice versa. Runs on `npm run check:registry`. Source files and registry cannot drift.

**Phase 2 work:**
- Audit the current registry for completeness and accuracy
- Expand the schema to include `examples`, `description`, and `category` for every entry if not already present
- Consider adding a `since` field (version added) for future migration help
- Ensure premium packages can register their components too — either via a separate `packages/*/component-registry.json` in each package, or by extending the core registry with a `package` field. Decide at implementation time.

### How it travels later

In Phase 3, when `void-energy` becomes an npm package, `component-registry.json` ships inside the published tarball via the `files` field. Consumer AI (Claude Code running in a user's project) reads it from `node_modules/void-energy/src/config/component-registry.json`. The starter template's CLAUDE.md points the AI at that exact path.

**Phase 2 prepares for this** by making the registry complete and the rules reference it correctly. Phase 3 just redistributes the location.

---

## Distinction from Phase 3's AI work

Phase 2 builds the foundation **in the current monorepo structure** (`src/`, `packages/`, `src/pages/`). Phase 3 will redistribute that foundation across the new structure (`packages/void-energy/`, `apps/showcase/`, `apps/starter-template/`):

| Phase 2 location                      | Phase 3 new location                           |
|---------------------------------------|------------------------------------------------|
| `CLAUDE.md` (root)                    | `CLAUDE.md` (monorepo root) — mostly same      |
| `.claude/`                            | `.claude/` (monorepo root) — mostly same       |
| `src/CLAUDE.md`                       | `packages/void-energy/CLAUDE.md`               |
| `src/pages/CLAUDE.md`                 | `apps/showcase/CLAUDE.md` + new `apps/starter-template/CLAUDE.md` (self-contained) |
| `packages/ambience/CLAUDE.md`         | `packages/ambience/CLAUDE.md` in the **premium** repo |
| `src/config/component-registry.json`  | `packages/void-energy/src/config/component-registry.json` |
| `AI-PLAYBOOK.md` (root)               | `packages/void-energy/AI-PLAYBOOK.md` (ships in npm tarball) |
| `COMPOSITION-RECIPES.md` (root)       | `packages/void-energy/COMPOSITION-RECIPES.md` (ships in npm tarball) |
| `CHEAT-SHEET.md` (root)               | `packages/void-energy/CHEAT-SHEET.md` (ships in npm tarball) |

**The content stays the same. Only the paths change.** Phase 2 writes the rules once; Phase 3 moves the files. This is why Phase 2 has to land first — Phase 3 becomes a mechanical move instead of a "write and restructure simultaneously" scramble.

---

## Consumer AI context — brief preview

The **starter template** that `create-void-energy` scaffolds in Phase 3 will have a **self-contained** `CLAUDE.md` and `.claude/` directory. "Self-contained" means it duplicates the 5 Laws and core rules rather than inheriting from a monorepo root (because once copied to a user's disk, there is no monorepo root above it).

**Phase 2 prepares for this** by making sure `src/pages/CLAUDE.md` already contains everything a consumer would need — if Phase 2 writes rich consumer-level rules, Phase 3 can lift them into the starter template with minor tweaks. See [phase-3-monorepo-structure.md](phase-3-monorepo-structure.md) for the full starter template design.

---

## Implementation order

1. **Audit the current `CLAUDE.md`**
   - Identify which rules are universal (stay at root)
   - Identify which rules are library-specific (move to `src/CLAUDE.md`)
   - Identify which rules are consumer-specific (move to `src/pages/CLAUDE.md`)
   - Identify which rules are topic-specific (move to `.claude/rules/*.md` with triggers)

2. **Split into layered files**
   - Keep root `CLAUDE.md` focused on the 5 Laws, workspace map, pointers
   - Create `src/CLAUDE.md` with strict library rules
   - Create `src/pages/CLAUDE.md` with consumer rules
   - Create `.claude/rules/*.md` files for topic-specific rules

3. **Write package-level CLAUDE.md for each `packages/*`**
   - `packages/ambience/CLAUDE.md`
   - `packages/kinetic-text/CLAUDE.md`
   - `packages/dgrs/CLAUDE.md`
   - Use a consistent template across all three

4. **Audit `component-registry.json`**
   - Verify every `.svelte` file in `components/ui/` has a complete entry
   - Add missing fields (examples, description, category)
   - Run `npm run check:registry` — fix any drift

5. **Build `.claude/agents/registry-auditor.md`**
   - A subagent that reads the registry and flags inconsistencies
   - Can be invoked via `Agent` tool for routine audits

6. **Curate `CHEAT-SHEET.md`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md`**
   - Make sure they're accurate, current, and AI-readable
   - Add new sections as needed for ambience (now that Phase 1 is done)
   - Cross-link so the AI can navigate from one to another

7. **Formalize `.claude/settings.json`**
   - Hooks that enforce rules automatically where possible
   - Pre-edit reminder on `.svelte` files: "check the registry first"
   - Permissions tuning

8. **Test the layered behavior**
   - `cd src/components/ui && claude` — verify strict library rules kick in
   - `cd src/pages && claude` — verify consumer rules kick in
   - `cd packages/ambience && claude` — verify package rules kick in
   - Each should produce correctly scoped behavior without manual prompting

9. **Document the system**
   - Add a section to the root `CLAUDE.md` explaining the layering (for future humans reading the file)
   - Update any existing docs that reference the old single-file CLAUDE.md structure

---

## Verification checklist

- [ ] Root `CLAUDE.md` contains the 5 Laws, workspace map, and pointers to sub-directory rules
- [ ] `src/CLAUDE.md` exists with strict library-level rules
- [ ] `src/pages/CLAUDE.md` exists with consumer-level rules
- [ ] `packages/ambience/CLAUDE.md` exists with package-level rules
- [ ] `packages/kinetic-text/CLAUDE.md` exists with package-level rules
- [ ] `packages/dgrs/CLAUDE.md` exists with package-level rules
- [ ] `.claude/rules/` contains topic-specific rule files (SCSS, Runes, Token Law, Native-first, State, Composition)
- [ ] `.claude/agents/registry-auditor.md` exists and runs
- [ ] `component-registry.json` is complete — every `components/ui/*.svelte` file has an entry
- [ ] Every registry entry has `category`, `path`, `description`, `props`
- [ ] `npm run check:registry` passes
- [ ] `CHEAT-SHEET.md`, `AI-PLAYBOOK.md`, `COMPOSITION-RECIPES.md` are current and accurate
- [ ] Running Claude Code in `src/components/ui/` produces strict library behavior
- [ ] Running Claude Code in `src/pages/` produces consumer behavior
- [ ] Running Claude Code in `packages/ambience/` produces package-level behavior
- [ ] A subagent invocation correctly audits the registry for drift
- [ ] Root `CLAUDE.md` documents the layered system for future maintainers

---

## Out of scope for Phase 2

- **Restructuring into `packages/void-energy/` and `apps/*`.** That's Phase 3. Phase 2 works within the current directory structure.
- **Shipping AI context inside an npm package.** That's Phase 3 (via the `files` field). Phase 2 only ensures the content is ready to ship.
- **Building a consumer-facing starter template.** That's Phase 3. Phase 2 prepares the consumer rules in `src/pages/CLAUDE.md` so they can be lifted later.
- **AI-powered migration tooling.** Maybe Phase 4 or later.
- **Telemetry on AI usage.** Never — privacy-first.
- **Dynamic registry generation from AST.** Static JSON with a CI check is enough.
