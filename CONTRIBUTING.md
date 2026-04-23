# Contributing to Void Energy UI

Thank you for considering contributing to Void Energy UI! This design system powers the **CoNexus** storytelling platform, where "Atmosphere is Context."

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Contributor License Agreement](#2-contributor-license-agreement)
3. [Getting Started](#3-getting-started)
4. [Development Workflow](#4-development-workflow)
5. [Adding a Premium Package](#5-adding-a-premium-package)
6. [Architecture & Discipline](#6-architecture--discipline)
7. [Pull Request Process](#7-pull-request-process)
8. [Style Guidelines](#8-style-guidelines)
9. [Reporting Security Issues](#9-reporting-security-issues)

---

## 1. Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community and the project

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate in a professional setting

### Enforcement

Instances of unacceptable behavior may be reported by opening an issue or contacting the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## 2. Contributor License Agreement

Before we can accept your contribution, you must sign the **Void Energy UI Contributor License Agreement (CLA)**.

### Why a CLA?

Void Energy UI is distributed under the [Business Source License 1.1](./LICENSE.md), which will convert to Apache 2.0 on the Change Date. For the project to be able to license your contribution under both the current BSL and the future Apache 2.0 terms — and to defend the project against IP claims — DGRS Labs Pte. Ltd. needs an explicit grant of rights from every contributor. A CLA is how that grant is recorded.

The Void Energy UI CLA is based on standard industry agreements (similar to the Apache ICLA / Google CLA) and does **not** transfer ownership of your code. You retain full copyright. You are granting DGRS Labs a license to use, modify, and relicense your contribution under the project's current and future licenses.

### How to Sign

- **Individual contributors:** On your first pull request, our CLA bot will comment with a link to sign. Signing is a one-click process backed by your GitHub account and is valid for all future contributions.
- **Corporate contributors:** If you are contributing on behalf of an employer, your employer must sign the Corporate CLA. Contact [biz@dgrslabs.com](mailto:biz@dgrslabs.com) for the CCLA template.

Pull requests will remain open but **cannot be merged** until the CLA is on file.

### What You Are Agreeing To

By signing, you confirm that:

- You have the legal right to submit the contribution
- Your contribution is your original work, or you have the rights to submit it
- You grant DGRS Labs a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, distribute, and sublicense your contribution as part of Void Energy UI
- Your contribution is provided "as is" without warranties

The full CLA text is presented at signing time. If you have questions before signing, email [biz@dgrslabs.com](mailto:biz@dgrslabs.com).

---

## 3. Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and **npm 9+**
- **Git** for version control
- Familiarity with **Svelte 5 (Runes)**, **TypeScript**, and **SCSS**
- Understanding of design systems and component architectures

### Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/dimonb19/void-energy-ui.git
cd void-energy-ui
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## 4. Development Workflow

### Before You Start

1. **Read the documentation:**
   - [CHEAT-SHEET.md](./CHEAT-SHEET.md) — Understand the system components and architecture
   - [README.md](./README.md) — Learn the Triad Architecture and core principles
   - [THEME-GUIDE.md](./THEME-GUIDE.md) — If you're adding a new theme

2. **Check open issues:**
   - Look for issues tagged with `good first issue` or `help wanted`
   - Comment on the issue to let others know you're working on it

3. **Discuss major changes:**
   - For significant changes, open an issue first to discuss your approach
   - This prevents wasted effort and ensures alignment with project goals

---

### Making Changes

#### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:

- `feature/` — New features or enhancements
- `fix/` — Bug fixes
- `docs/` — Documentation updates
- `refactor/` — Code refactoring without functional changes

#### 2. Make Your Changes

Follow the [Architecture & Discipline](#6-architecture--discipline) rules strictly.

#### 3. Test Thoroughly

- Test across **all themes**: void, onyx, terminal, nebula, solar, overgrowth, velvet, crimson (dark) and paper, focus, laboratory, playground (light)
- Test across **all density settings** (high, standard, low)
- Test across **all physics modes** (glass, flat, retro)
- Test on mobile, tablet, and desktop viewports
- Check browser console for errors or warnings

#### 4. Build the Project

Ensure the build succeeds without errors:

```bash
npm run build
```

If you modified [design-tokens.ts](src/config/design-tokens.ts), rebuild tokens:

```bash
npm run build:tokens
```

Run type checking to catch TypeScript and Svelte errors:

```bash
npm run check
```

Run the unit test suite when you change behavior, shared primitives, or state coordination:

```bash
npm run test
```

Run the advisory raw-value scan:

```bash
npm run scan
```

Verify the component registry is in sync with source files:

```bash
npm run check:registry
```

For AI-facing composition guidance and starter handoff material, see:

- `AI-PLAYBOOK.md`
- `COMPOSITION-RECIPES.md`
- `templates/starter/README.md`

Format code:

```bash
npm run format
```

#### 5. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add src/components/ui/Tooltip.svelte src/styles/components/_tooltip.scss
git commit -m "feat: add tooltip component with floating UI"
```

> Stage specific files rather than `git add .` to avoid accidentally including generated files, `.env`, or binary artifacts.

Commit message format:

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style changes (formatting, no logic change)
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `chore:` — Maintenance tasks (build scripts, dependencies)

---

### Adding a New Theme?

Follow the step-by-step guide in [THEME-GUIDE.md](./THEME-GUIDE.md).

**Quick summary:**

1. Edit [src/config/design-tokens.ts](src/config/design-tokens.ts)
2. Run `npm run build:tokens`
3. Test your theme across all components
4. Ensure accessibility (contrast ratios, motion safety)
5. Submit a PR with screenshots

---

## 5. Adding a Premium Package

Void Energy UI supports **premium packages** — self-contained feature modules that build on the core design system and are distributed separately via private npm registry. Packages live in `packages/` and have their own `package.json`, types, styles, and documentation.

### Package Structure

Every premium package follows this layout:

```
packages/
  your-package/
    src/
      index.ts                  Entry point (re-exports component, adapter, types)
      types.ts                  All public TypeScript definitions
      svelte/
        YourComponent.svelte    Main Svelte 5 component
      adapters/
        void-energy-host.ts     Adapter that reads live DOM state from VE hosts
      core/                     Internal engine (layout, rendering, effects, etc.)
      styles/
        your-package.scss       All keyframes, animations, physics variants
    package.json                Scoped name, exports map, peer deps
    README.md                   Full API reference, props, examples
    CHANGELOG.md                Version history
```

### Key Principles

1. **Peer-depend on Svelte, not Void Energy.** The package should work on any Svelte 5 host. VE-specific integration lives in an adapter (`adapters/void-energy-host.ts`) that reads `data-physics`, `data-mode`, CSS variables, and computed styles from the host DOM.

2. **Own your styles.** Package styles use a unique CSS prefix (e.g., `kt-` for Kinetic Text) and ship as a standalone stylesheet via the `./styles` export. Never depend on core SCSS mixins at runtime — the package must be self-contained.

3. **Physics-aware rendering.** Adapt animations to glass (spring easing + motion blur), flat (clean ease-out), and retro (stepped timing + jitter). The adapter provides the active physics preset; your component reads it from `styleSnapshot.physics`.

4. **Reduced motion.** Respect `prefers-reduced-motion` by default (`reducedMotion: 'auto'`). Skip animations and fire callbacks synchronously when active.

5. **Accessibility.** Provide a semantic layer alongside any visual/animated layer. Screen readers should get clean text, not animation artifacts.

6. **Export map.** Provide granular exports so consumers can import only what they need:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./component": "./src/svelte/YourComponent.svelte",
    "./types": "./src/types.ts",
    "./adapters/void-energy-host": "./src/adapters/void-energy-host.ts",
    "./styles": "./src/styles/your-package.css"
  }
}
```

### Example: Kinetic Text

`@void-energy/kinetic-text` is the reference implementation for premium packages. It demonstrates every pattern above:

- **3 reveal modes** (char, word, decode), **8 reveal styles** (pop, scramble, rise, drop, scale, blur, random, instant)
- **37 effects** — 16 one-shot (shake, explode, vortex...) + 21 continuous (breathe, haunt, sparkle...)
- **Three composable layers** — reveal + continuous + one-shot run simultaneously on the same text block
- **Adapter pattern** — `createVoidEnergyTextStyleSnapshot()` reads physics, mode, fonts, and CSS variables from the live DOM
- **Cue system** — time-triggered and completion-triggered one-shot effects for TTS synchronization
- **Seeded PRNG** — deterministic per-character animation parameters for reproducible motion

**Quick start (VE host):**

```svelte
<script lang="ts">
  import KineticText from '@void-energy/kinetic-text/component';
  import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
  import '@void-energy/kinetic-text/styles';

  let el = $state<HTMLElement>();
  const snapshot = $derived(el ? createVoidEnergyTextStyleSnapshot(el) : null);
</script>

<div bind:this={el}>
  {#if snapshot}
    <KineticText
      text="The void stirs..."
      styleSnapshot={snapshot}
      revealMode="word"
      revealStyle="drop"
      activeEffect="breathe"
    />
  {/if}
</div>
```

**Quick start (non-VE host):**

```svelte
<script lang="ts">
  import KineticText from '@void-energy/kinetic-text/component';
  import '@void-energy/kinetic-text/styles';

  const snapshot = {
    font: '16px "Inter", sans-serif',
    lineHeight: 24,
    physics: 'flat' as const,
    mode: 'dark' as const,
    density: 1,
    scale: 1,
    vars: {},
  };
</script>

<KineticText text="Hello world" styleSnapshot={snapshot} />
```

See `packages/kinetic-text/README.md` for the full API reference, effect catalog, and cue authoring guide.

### Adding a Showcase Page

Every premium package should have a showcase page in the main app that demonstrates all its capabilities:

1. Create a page component in `src/components/` (e.g., `KineticTextPage.svelte`)
2. Create an Astro page in `src/pages/` that renders it (e.g., `kinetic-text.astro`)
3. Structure the showcase with:
   - **Hero section** — interactive demo combining multiple features
   - **Feature sections** — one section per major capability (reveal modes, effects, etc.)
   - **Interactive controls** — let users replay, switch modes, fire effects
   - **Reference section** — collapsible `<details>` with the full effect/prop catalog
   - **Technical details** — collapsible explanations of how the engine works

Use the existing `KineticTextPage.svelte` as the reference pattern.

### Checklist for New Packages

- [ ] Package lives in `packages/your-package/`
- [ ] `package.json` has scoped name (`@void-energy/*`), `SEE LICENSE IN LICENSE.md` license, Svelte 5 peer dep
- [ ] Export map provides `.`, `./component`, `./types`, `./adapters/void-energy-host`, `./styles`
- [ ] Adapter reads `data-physics`, `data-mode`, computed font, and CSS variables from host DOM
- [ ] Component adapts to all 3 physics presets (glass, flat, retro) and both color modes
- [ ] Reduced motion is respected by default
- [ ] Semantic/accessible layer is provided alongside visual layer
- [ ] CSS prefix is unique and does not collide with core classes
- [ ] README documents all props, effects/features, and usage examples
- [ ] Showcase page exists in the main app with interactive demos
- [ ] CHEAT-SHEET.md is updated with a summary entry

---

## 6. Architecture & Discipline

### ⚠️ You MUST Follow These Rules

Violating these architectural principles will result in PR rejection.

---

### The Hybrid Protocol (Separation of Concerns)

We separate **Composition Layout** from **Material + Shipped Primitive Geometry**.

| Layer        | Technology | Responsibility                   |
| ------------ | ---------- | -------------------------------- |
| **Layout**   | Tailwind   | Page composition, spacing, responsive structure, consumer-side geometry |
| **Material** | SCSS       | Visuals, physics, complex states, token-driven primitive-internal geometry |

#### ✅ Correct

```svelte
<div class="flex flex-col gap-md p-lg surface-raised">
  <h2 class="text-main">Title</h2>
</div>
```

#### Allowed SCSS Geometry Exceptions

- Native control baselines that should work out of the box
- Primitive-internal alignment and spacing that consumers should not have to restate
- Token-driven sizing tied to component state or behavior

#### ❌ Incorrect

```scss
.surface-raised {
  width: 300px; /* ❌ Arbitrary page/layout geometry in SCSS */
  margin-bottom: 20px; /* ❌ Arbitrary page/layout geometry in SCSS */
}
```

**Why?** Arbitrary layout in SCSS breaks the Density Engine and makes consumers fight shipped primitives instead of composing them.

See [CHEAT-SHEET.md → The Hybrid Protocol](./CHEAT-SHEET.md#the-hybrid-protocol-separation-of-concerns) for details.

---

### The Token Law (No Magic Numbers)

**Never hardcode pixels or colors.**

#### ✅ Correct

```scss
.custom {
  padding: var(--space-md);
  color: var(--text-main);
  border-radius: var(--radius-lg);
}
```

#### ❌ Incorrect

```scss
.custom {
  padding: 24px; /* ❌ Magic number */
  color: #ffffff; /* ❌ Hardcoded color */
  border-radius: 16px; /* ❌ Magic number */
}
```

**Why?** Magic numbers break the Density Engine, theme switching, and responsive scaling.

See [CHEAT-SHEET.md → The Token Law](./CHEAT-SHEET.md#the-token-law-no-magic-numbers) for details.

---

### The State Protocol (DOM-Driven State)

**State lives in attributes, not classes.**

#### ✅ Correct

```svelte
<button data-state="open" aria-pressed="true">Toggle</button>
```

```scss
.dropdown {
  &[data-state='open'] {
    /* ✅ State via attribute */
    opacity: 1;
  }
}
```

#### ❌ Incorrect

```svelte
<button class="active is-open">Toggle</button>
```

```scss
.dropdown.show {
  /* ❌ State via class */
  opacity: 1;
}
```

**Why?** Attribute-based state ensures CSS transitions trigger correctly via the Physics Engine.

See [CHEAT-SHEET.md → The State Protocol](./CHEAT-SHEET.md#the-state-protocol-dom-driven-state) for details.

---

### Law 5 — Spacing Gravity

**Default to generous spacing. When uncertain, go one size up.**

| Surface                            | Minimum        |
| ---------------------------------- | -------------- |
| Floating surface (cards, panels)   | `p-lg gap-lg`  |
| Sunk surface (inputs, wells)       | `p-md gap-md`  |

**Never** use `gap-sm` on a card or `p-sm` on a floating surface. If it looks tight, go one size up.

**Exception:** Dense picker collections (chip groups, theme card grids, tag lists) intentionally use `gap-xs` or `gap-sm`. The tight gap signals "these are members of a unified set." Do not "fix" these to `gap-md`.

---

### The Native-First Protocol

**Build on native HTML elements, not around them.**

Components are thin wrappers that add layout, labeling, and physics styling. The browser owns behavior and accessibility; SCSS owns the material.

#### Always Native

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`

#### Custom Only When

No native element exists for the interaction (e.g., combobox/autocomplete, multi-thumb slider, virtualized data table).

**Reference pattern:** `Selector.svelte` (`src/components/ui/Selector.svelte`) — wraps a native `<select>` with label association and layout. Zero custom dropdown JS. SCSS handles all physics.

#### ✅ Correct

```svelte
<select onchange={handleChange}>
  <option value="a">Option A</option>
</select>
```

#### ❌ Incorrect

```svelte
<div role="listbox" onkeydown={handleKeydown}>
  <div role="option">Option A</div>
</div>
```

**Why?** Native elements provide built-in keyboard navigation, screen reader semantics, form integration, and mobile behavior for free. Custom reimplementations carry thousands of lines of accessibility debt.

See [CLAUDE.md → Native-First Protocol](./CLAUDE.md#5-native-first-protocol) for details.

---

### The Single Source of Truth

**DO NOT** edit these generated files:

- `src/styles/config/_generated-themes.scss`
- `src/config/void-registry.json`
- `src/config/void-physics.json`

**DO** edit:

- `src/config/design-tokens.ts` (The SSOT)
- Run `npm run build:tokens` to regenerate

**Why?** Generated files are overwritten on every build.

---

## 7. Pull Request Process

### Before Submitting

Ensure your PR meets these criteria:

- [ ] **Code follows the Hybrid Protocol** (Tailwind for composition, SCSS for material + approved primitive geometry)
- [ ] **All tokens are semantic** (No magic numbers or hardcoded colors)
- [ ] **State uses attributes, not classes** (`[data-state="..."]`, not `.is-active`)
- [ ] **Components use native elements** (no custom reimplementations of `<select>`, `<dialog>`, etc.)
- [ ] **Comments explain WHY, not WHAT**
- [ ] **Theme works across all physics modes** (if applicable)
- [ ] **No console errors or warnings**
- [ ] **Build succeeds:** `npm run build`
- [ ] **Type checking passes:** `npm run check`
- [ ] **`npm run scan` reviewed:** no unexpected advisory hits
- [ ] **Registry consistent (if UI components changed):** `npm run check:registry`
- [ ] **Tokens rebuilt (if modified):** `npm run build:tokens`

---

### PR Template

When you open a PR, use this template:

```markdown
## Description

[What does this PR do? Why is this change needed?]

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

[How did you test this? Which themes/physics/densities did you check?]

## Screenshots (if applicable)

[Add screenshots for visual changes]

## Checklist

- [ ] I have followed the Hybrid Protocol and stayed within the documented SCSS geometry exceptions
- [ ] I have used native HTML elements (Native-First Protocol)
- [ ] I have used semantic tokens (no magic numbers)
- [ ] I have tested across multiple themes
- [ ] I have tested across multiple density settings
- [ ] I have tested on mobile, tablet, and desktop
- [ ] Build passes: `npm run build`
- [ ] `npm run check` passes (no TypeScript/Svelte errors)
- [ ] I reviewed `npm run scan` output (advisory)
- [ ] `npm run check:registry` passes (if UI components changed)
- [ ] No console errors or warnings
- [ ] I have updated documentation (if needed)
```

---

### Review Process

1. **Manual pre-flight:** Run `npm run build`, `npm run check`, and `npm run scan` locally before submitting
2. **Maintainer review:** A project maintainer will review your code
3. **Feedback:** Address any requested changes
4. **Merge:** Once approved, your PR will be merged

---

## 8. Style Guidelines

### TypeScript

- **Type hygiene, not type gymnastics:** The repo is type-checked, but it is not a strict-mode migration target. Avoid `any` when a precise type is straightforward; do not add complex type machinery unless it pays for itself.
- **Shared types live in `src/types/`:** If a type is reused outside the file where it is defined, move it into a focused file under `src/types/`. Shared types there are ambient globals, so app code should not import them. Keep file-local types unexported.
- **Interfaces for props:** Use TypeScript interfaces for component prop contracts.
- **Descriptive names:** Use clear, semantic variable names.

**Example:**

```typescript
interface CardProps {
  title: string;
  description?: string;
  interactive?: boolean;
}
```

---

### SCSS

- **Use mixins:** Leverage mixins from [src/styles/abstracts/\_mixins.scss](src/styles/abstracts/_mixins.scss)
- **No raw pixel values:** Use tokens (`var(--space-md)`)
- **Comment complex selectors:** Explain WHY, not WHAT

**Example:**

```scss
.custom-card {
  // Use the floating surface physics
  @include surface-raised(true);

  // Responsive padding scales with density
  padding: var(--space-lg);

  // Complex nested state (explain why)
  &[data-variant='premium'] {
    // Premium cards get gold border
    border-color: var(--color-premium);
  }
}
```

---

### Svelte 5 (Runes)

- **Use Runes exclusively:** `$state`, `$derived`, `$effect`, `$props`
- **No legacy Svelte 4 syntax:** No `let` exports, no `$:` reactive statements
- **Separate logic from UI:** Keep complex logic in separate functions or stores

**Example:**

```svelte
<script lang="ts">
  interface Props {
    title: string;
    checked?: boolean;
    count?: number;
  }

  let {
    title,
    checked = $bindable(false), // Two-way binding via bind:checked
    count = 0,
  }: Props = $props();

  let internalCount = $state(count);

  const increment = () => {
    internalCount++;
  };

  // Derived value (replaces legacy $: reactive statements)
  const isEven = $derived(internalCount % 2 === 0);
</script>

<div class="surface-raised p-md">
  <h3>{title}</h3>
  <p>Count: {internalCount} ({isEven ? 'even' : 'odd'})</p>
  <button onclick={increment}>Increment</button>
</div>
```

---

### Comments

- **Document ROLE and RESPONSIBILITY** for new files:

  ```scss
  /*
   * ROLE: Custom tooltip component
   * RESPONSIBILITY: Floating UI positioning and entrance animations
   */
  ```

- **Explain architectural decisions:**

  ```scss
  // We use backdrop-filter instead of opacity to preserve text sharpness
  backdrop-filter: blur(var(--physics-blur));
  ```

- **Use JSDoc for functions:**

  ```typescript
  /**
   * Registers a custom theme at runtime
   * @param id - Unique theme identifier
   * @param data - Theme palette and configuration
   */
  export function registerTheme(id: string, data: ThemeData) {
    // ...
  }
  ```

- **Add warnings for footguns:**

  ```typescript
  // ⚠️ DO NOT call this during SSR - it requires window.localStorage
  export function saveUserPreference() {
    // ...
  }
  ```

---

## 9. Reporting Security Issues

**Do not file public issues or pull requests for security-sensitive reports.**

See [SECURITY.md](./SECURITY.md) for the private disclosure process, response SLAs, supported versions, and safe-harbor terms.

---

## Questions?

- **Documentation:** [CHEAT-SHEET.md](./CHEAT-SHEET.md), [THEME-GUIDE.md](./THEME-GUIDE.md), [README.md](./README.md)
- **Repository:** [github.com/dimonb19/void-energy-ui](https://github.com/dimonb19/void-energy-ui)
- **Issues:** Open an issue in the repository with context, screenshots, and reproduction steps when relevant
- **Security:** See [SECURITY.md](./SECURITY.md) for private vulnerability reporting

---

**Thank you for contributing to Void Energy UI! 🌌**
