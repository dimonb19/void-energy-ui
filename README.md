# 🌌 Void Energy UI

> "We do not paint pixels; we define materials."

The Void Energy UI is a framework-agnostic, physics-based design system for the **CoNexus** storytelling platform.
It combines the performance of **Tailwind CSS** (for Layout) with a bespoke **SCSS Physics Engine** (for Materials).

## 📚 Documentation

- **[CHEAT-SHEET.md](./CHEAT-SHEET.md)** — Quick reference for developers (components, mixins, tokens)
- **[THEME-GUIDE.md](./THEME-GUIDE.md)** — Step-by-step guide to creating custom themes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines and PR process
- **[CLAUDE.md](./CLAUDE.md)** — AI assistant instructions and design system laws
- **[.claude/README.md](./.claude/README.md)** — Claude Code setup, skills, hooks, and agents

---

## 🚀 The Triad Architecture

Every pixel on screen is calculated by the intersection of three layers:

1.  **Atmosphere (The Soul):** Defines Color (`--energy-primary`) and Fonts.
2.  **Physics (The Laws):** Defines Texture, Geometry, and Motion (`glass`, `flat`, `retro`).
3.  **Mode (The Polarity):** Handles Light/Dark environment switching.

### The Law of Immutability (Active Enforcement)
In the Void Energy system, **Atmospheres are strict presets.**
The `VoidEngine` includes an active guardrail system that prevents "broken" physics combinations.

* **User Choice:** Users select an **Atmosphere** (e.g., "Void", "Paper", "Terminal").
* **System Correction:** If an invalid combination is registered (e.g., via API), the Engine auto-corrects it to preserve legibility.

| Violation Detected | System Correction | Reason |
| :--- | :--- | :--- |
| **Glass + Light Mode** | Forces **FLAT** Physics | Glass glows require darkness to be visible. |
| **Retro + Light Mode** | Forces **DARK** Mode | CRT Phosphor effects require a black canvas. |

**Why?** CoNexus is a narrative platform. The visual rendering engine is part of the storytelling. Breaking the physics of a theme breaks the immersion of the story.

### DOM Contract

The `<html>` element carries the runtime state:

| Attribute | Values | Set by |
| :--- | :--- | :--- |
| `data-atmosphere` | Theme ID (e.g., `void`, `paper`) | VoidEngine |
| `data-physics` | `glass` \| `flat` \| `retro` | VoidEngine |
| `data-mode` | `light` \| `dark` | VoidEngine |
| `data-auth` | Present (no value) when any user is authenticated, including Guest | UserScript.astro |

CSS utilities `.auth-only` and `.public-only` read `data-auth` to show/hide content before Svelte hydrates (FOUC-safe). All authenticated users (including Guest) set `data-auth`.

## ⚠️ ARCHITECTURE & DISCIPLINE (READ BEFORE CODING)

This project uses a strict **Hybrid Protocol** to manage the complexity of the Void Engine.

### 1. The Separation of Concerns (Hybrid Protocol)
We separate **Composition Layout** from **Material + Shipped Primitive Geometry**.

* **HTML/Svelte (`.svelte`, `.astro`):**
    * Use **Tailwind** for page composition, spacing, responsive structure, and consumer-side geometry.
    * ✅ `flex flex-col gap-md p-lg w-full`
    * ❌ `<div style="margin-top: 20px">` (Breaks Density Engine)

* **SCSS (`src/styles/**/*.scss`):**
    * Use **SCSS** for Visuals, Physics, Complex States, and token-driven component-internal geometry that ships with a primitive out of the box.
    * ✅ `.surface-glass { @include glass-float; }`
    * ✅ `button { min-height: var(--control-height); display: inline-flex; }`
    * ❌ `.surface-glass { width: 300px; margin-bottom: 20px; }` (Arbitrary page/layout bleed)

**Allowed SCSS geometry exceptions**
* Native control baselines (`button`, `input`, `select`, `textarea`)
* Primitive-internal alignment/spacing required so the component works without repeated utility boilerplate
* Token-driven sizing tied to component state or behavior (for example modal sizing)

**Still not allowed**
* One-off page layout or section layout in SCSS
* Raw geometry values that bypass tokens
* Visual/material effects moved into Tailwind utilities

### 2. The Law of Tokens
* **Never hardcode pixels or colors.**
* All spacing must use semantic tokens (`gap-md`, `p-sm`) to respect the User Density Engine.
* All colors must use semantic variables (`bg-canvas`, `energy-primary`) to respect the Atmosphere Engine.

### 3. The Laws of Physics

| Concept | Rule |
| :--- | :--- |
| **Material is Truth** | **Glass:** Blur, Shadows, Glows (0.3s cubic-bezier).<br>**Flat:** Borders, Drop Shadows, No Glows (0.2s ease-out).<br>**Retro:** Pixel Borders, No Shadows (0s steps). |
| **Depth is Tiered** | **Sunk (-Z):** Inputs/Wells (`shadow-sunk`).<br>**Float (+Z):** Cards/Surfaces (`shadow-float`).<br>**Lift (++Z):** Interactive/Modals (`shadow-lift`). |
| **Atmosphere is Context** | The UI adapts to the story. Switching from `void` to `paper` changes physics instantly. |

### 4. The Single Source of Truth
* **DO NOT** edit `_generated-themes.scss`, `void-registry.json`, or `void-physics.json`.
* **EDIT** `src/config/design-tokens.ts` and run `npm run build:tokens`.

### 5. The State Protocol
* **State lives in the DOM.** Do not use classes like `.active` or `.show`.
* Use semantic attributes: `[data-state="open"]`, `[aria-pressed="true"]`.
* This ensures CSS transitions (Enter/Exit) trigger correctly via the Physics Engine.

## 🧩 UI Pattern Philosophy

Void Energy is a **native-first** design system. It does not try to ship a bespoke Svelte primitive for every UI noun.

Patterns in this system are delivered in three ways:

| Delivery Mode | Meaning | Examples |
| :--- | :--- | :--- |
| **Reusable Primitive** | Shipped component when behavior is non-trivial, repeated, and worth standardizing | `Dropdown`, `Sidebar`, `Toggle`, `Selector`, `Switcher`, charts, modals |
| **Native-Styled HTML** | Semantic HTML element styled globally so raw markup already looks like the system | `<details>`, `<table>`, `<progress>`, `<meter>`, `<audio>`, prose elements |
| **Documented Recipe** | Composition pattern built from HTML + Tailwind + existing primitives, documented but not abstracted into a dedicated component | Nav menu, accordion groups via `details[name]`, drawer-like layouts built from `Sidebar` |

This means a pattern is **not automatically missing** just because there is no single file named after it.

The goal is to standardize the parts that carry shared behavior and shared accessibility contracts, while leaving browser-native semantics intact wherever the platform already gives the right abstraction. If semantic HTML plus existing system styles are enough, Void Energy prefers that over adding another wrapper component.

## 📂 Project Structure

```text
/
├── scripts/
│   ├── generate-tokens.ts        <-- 🧠 The Compiler (build:tokens)
│   ├── generate_context.py       <-- Context generation for AI
│   ├── scan-physics.ts           <-- Advisory raw-value scanner
│   └── local-dev.ts              <-- 🛠️ Dev Server Orchestrator
├── src/
│   ├── actions/
│   │   ├── kinetic.ts            <-- Typewriter/decode text action
│   │   ├── morph.ts              <-- FLIP size-morphing action
│   │   ├── navlink.ts            <-- Navigation loading state action
│   │   └── tooltip.ts            <-- Floating UI tooltip action
│   ├── adapters/
│   │   └── void-engine.svelte.ts <-- ⚡ The Reactive Brain (State)
│   ├── components/
│   │   ├── core/
│   │   │   ├── AtmosphereScope.svelte <-- Theme context provider
│   │   │   ├── ThemeScript.astro <-- 🚀 The Bootloader (Anti-FOUC)
│   │   │   └── UserScript.astro  <-- Auth state bootstrapper
│   │   ├── icons/                <-- 🎨 Interactive animated icons
│   │   ├── modals/               <-- Modal dialog fragments
│   │   ├── ui/                   <-- Reusable UI components
│   │   └── ui-library/           <-- Showcase / documentation pages
│   ├── config/
│   │   ├── constants.ts          <-- Shared Keys (Storage/Attr)
│   │   ├── design-tokens.ts      <-- 🧠 EDIT THIS (Single Source of Truth)
│   │   ├── font-registry.ts      <-- 🤖 Generated (Font preload map)
│   │   ├── modal-registry.ts     <-- Modal Component Map
│   │   ├── ui-geometry.ts        <-- Semantic geometry constants
│   │   ├── void-physics.json     <-- 🤖 Generated (Physics per preset)
│   │   └── void-registry.json    <-- 🤖 Generated (Theme metadata)
│   ├── lib/
│   │   ├── layer-stack.svelte.ts <-- LIFO Escape key dismissal
│   │   ├── modal-manager.svelte.ts
│   │   ├── native-control-foundation.ts <-- Native control wiring
│   │   ├── password-validation.svelte.ts <-- Password strength logic
│   │   ├── shortcut-registry.svelte.ts <-- ⌨️ Keyboard shortcuts
│   │   ├── timing.ts             <-- Duration/timing utilities
│   │   ├── transitions.svelte.ts <-- 🌌 The Physics Motion Engine
│   │   ├── void-boot.js          <-- The Shared Kernel (No-Dep)
│   │   └── void-tooltip.ts       <-- Floating UI Logic
│   ├── stores/
│   │   ├── toast.svelte.ts       <-- Notification State
│   │   └── user.svelte.ts        <-- User/Auth State
│   ├── styles/
│   │   ├── abstracts/            <-- Tools (No CSS Output)
│   │   ├── base/                 <-- Global Resets & Typography
│   │   ├── components/           <-- "Materials" (Classes)
│   │   ├── config/
│   │   │   ├── _generated-themes.scss <-- 🤖 Generated (SCSS Maps)
│   │   │   └── _fonts.scss       <-- 🤖 Generated (@font-face)
│   │   └── global.scss           <-- Main CSS Entry Point
│   └── types/
│       ├── api.d.ts              <-- API response types
│       ├── global.d.ts           <-- Global type augmentations
│       ├── modal.d.ts            <-- Modal system types
│       ├── story-engine.d.ts     <-- Story engine types
│       └── void-ui.d.ts          <-- Design system types
├── tailwind.config.mjs           <-- The Bridge (Maps Tokens to Tailwind)
```

### Key Singletons

Import and use — never re-instantiate.

| Singleton | Import | Role |
| :--- | :--- | :--- |
| `voidEngine` | `@adapters/void-engine.svelte` | Theme, physics, mode |
| `modal` | `@lib/modal-manager.svelte` | Dialog orchestration |
| `toast` | `@stores/toast.svelte` | Notification queue |
| `layerStack` | `@lib/layer-stack.svelte` | Escape-key LIFO dismissal |
| `shortcutRegistry` | `@lib/shortcut-registry.svelte` | Keyboard shortcut catalog |
| `user` | `@stores/user.svelte` | Auth state, role flags |

See [CLAUDE.md → State Management & Singletons](./CLAUDE.md) for full API reference.

## 🔌 API Integration (Future Proofing)

The Void Engine is ready to accept dynamic themes from an external API.
If a collaborator needs to inject a custom brand theme, send a JSON payload matching this runtime theme shape:

```json
{
  "id": "collaborator-brand-v1",
  "mode": "light", // or "dark"
  "physics": "flat", // "glass", "flat", or "retro"
  "palette": {
    "bg-canvas": "#ffffff",
    "bg-surface": "#f0f0f0",
    "bg-sunk": "#e0e0e0",
    "bg-spotlight": "#ffffff",
    "energy-primary": "#0066cc",
    "energy-secondary": "#99ccff",
    "border-color": "#cccccc",
    "text-main": "#000000",
    "text-dim": "#666666",
    "text-mute": "#999999",
    "color-premium": "#ffcc00",
    "color-system": "#cc00ff",
    "color-success": "#00cc66",
    "color-error": "#ff0033"
  }
}
```

Implementation:

- `voidEngine.registerTheme(id, partialDef)` accepts partial runtime themes and merges them safely onto the base theme.
- `await voidEngine.loadExternalTheme(url)` fetches, validates, registers, and activates a remote payload. It returns a typed `Result`.

⚠️ API Warning: The Active Guardrail system applies here too. If your API payload requests `physics: 'glass'` with `mode: 'light'`, the engine will silently override physics to `flat` to prevent a broken UI state.
