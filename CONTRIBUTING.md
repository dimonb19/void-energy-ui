# Contributing to Void Energy UI

Thank you for considering contributing to Void Energy UI! This design system powers the **CoNexus** storytelling platform, where "Atmosphere is Context."

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [Development Workflow](#3-development-workflow)
4. [Architecture & Discipline](#4-architecture--discipline)
5. [Pull Request Process](#5-pull-request-process)
6. [Style Guidelines](#6-style-guidelines)

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

## 2. Getting Started

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

## 3. Development Workflow

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

Follow the [Architecture & Discipline](#4-architecture--discipline) rules strictly.

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

## 4. Architecture & Discipline

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

## 5. Pull Request Process

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

## 6. Style Guidelines

### TypeScript

- **Type hygiene, not type gymnastics:** The repo is type-checked, but it is not a strict-mode migration target. Avoid `any` when a precise type is straightforward; do not add complex type machinery unless it pays for itself.
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

## Questions?

- **Documentation:** [CHEAT-SHEET.md](./CHEAT-SHEET.md), [THEME-GUIDE.md](./THEME-GUIDE.md), [README.md](./README.md)
- **Repository:** [github.com/dimonb19/void-energy-ui](https://github.com/dimonb19/void-energy-ui)
- **Issues:** Open an issue in the repository with context, screenshots, and reproduction steps when relevant

---

**Thank you for contributing to Void Energy UI! 🌌**
