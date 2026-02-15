# 🌌 Void Energy UI

> "We do not paint pixels; we define materials."

The Void Energy UI is a framework-agnostic, physics-based design system for the **CoNexus** storytelling platform.
It combines the performance of **Tailwind CSS** (for Layout) with a bespoke **SCSS Physics Engine** (for Materials).

## 📚 Documentation

- **[CHEAT-SHEET.md](./CHEAT-SHEET.md)** — Quick reference for developers (components, mixins, tokens)
- **[THEME-GUIDE.md](./THEME-GUIDE.md)** — Step-by-step guide to creating custom themes
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** — Contribution guidelines and PR process

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

## ⚠️ ARCHITECTURE & DISCIPLINE (READ BEFORE CODING)

This project uses a strict **Hybrid Protocol** to manage the complexity of the Void Engine.

### 1. The Separation of Concerns (Hybrid Protocol)
We separate **Layout** (Geometry) from **Materials** (Physics).

* **HTML/Svelte (`.svelte`, `.astro`):**
    * Use **Tailwind** for Layout, Spacing, and Sizing.
    * ✅ `flex flex-col gap-md p-lg w-full`
    * ❌ `<div style="margin-top: 20px">` (Breaks Density Engine)

* **SCSS (`src/styles/**/*.scss`):**
    * Use **SCSS** for Visuals, Physics, and Complex States.
    * ✅ `.surface-glass { @include glass-float; }`
    * ❌ `.surface-glass { width: 300px; margin-bottom: 20px; }` (Layout Bleed)

### 2. The Law of Tokens
* **Never hardcode pixels or colors.**
* All spacing must use semantic tokens (`gap-md`, `p-sm`) to respect the User Density Engine.
* All colors must use semantic variables (`bg-canvas`, `energy-primary`) to respect the Atmosphere Engine.

### 3. The Laws of Physics

| Concept | Rule |
| :--- | :--- |
| **Material is Truth** | **Glass:** Blur, Shadows, Glows (0.3s cubic-bezier).<br>**Flat:** Borders, Drop Shadows, No Glows (0.2s ease-out).<br>**Retro:** Pixel Borders, No Shadows (0s steps). |
| **Depth is Tiered** | **Sink (-Z):** Inputs/Wells (`shadow-sunk`).<br>**Float (+Z):** Cards/Surfaces (`shadow-float`).<br>**Lift (++Z):** Interactive/Modals (`shadow-lift`). |
| **Atmosphere is Context** | The UI adapts to the story. Switching from `void` to `paper` changes physics instantly. |

### 4. The Single Source of Truth
* **DO NOT** edit `_generated-themes.scss`, `void-registry.json`, or `void-physics.json`.
* **EDIT** `src/config/design-tokens.ts` and run `npm run build:tokens`.

### 5. The State Protocol
* **State lives in the DOM.** Do not use classes like `.active` or `.show`.
* Use semantic attributes: `[data-state="open"]`, `[aria-pressed="true"]`.
* This ensures CSS transitions (Enter/Exit) trigger correctly via the Physics Engine.

## 📂 Project Structure

```text
/
├── scripts/
│   ├── generate-tokens.ts        <-- 🧠 The Compiler (build:tokens)
│   ├── scan-physics.ts           <-- Physics preset scanner
│   └── local-dev.ts              <-- 🛠️ Dev Server Orchestrator
├── src/
│   ├── actions/
│   │   ├── morph.ts              <-- FLIP size-morphing action
│   │   └── tooltip.ts            <-- Floating UI tooltip action
│   ├── adapters/
│   │   └── void-engine.svelte.ts <-- ⚡ The Reactive Brain (State)
│   ├── components/
│   │   ├── core/
│   │   │   ├── ThemeScript.astro <-- 🚀 The Bootloader (Anti-FOUC)
│   │   │   └── AtmosphereScope.svelte <-- Theme context provider
│   │   ├── icons/                <-- 🎨 Interactive animated icons
│   │   ├── modals/               <-- Modal dialog fragments
│   │   ├── ui/                   <-- Reusable UI components
│   │   └── ui-library/           <-- Showcase / documentation pages
│   ├── config/
│   │   ├── constants.ts          <-- Shared Keys (Storage/Attr)
│   │   ├── design-tokens.ts      <-- 🧠 EDIT THIS (Single Source of Truth)
│   │   ├── font-registry.ts      <-- 🤖 Generated (Font preload map)
│   │   ├── modal-registry.ts     <-- Modal Component Map
│   │   ├── void-physics.json     <-- 🤖 Generated (Physics per preset)
│   │   └── void-registry.json    <-- 🤖 Generated (Theme metadata)
│   ├── lib/
│   │   ├── modal-manager.svelte.ts
│   │   ├── transitions.svelte.ts <-- 🌌 The Physics Motion Engine
│   │   ├── void-boot.js          <-- The Shared Kernel (No-Dep)
│   │   └── void-tooltip.ts       <-- Floating UI Logic
│   ├── stores/
│   │   └── toast.svelte.ts       <-- Notification State
│   ├── styles/
│   │   ├── abstracts/            <-- Tools (No CSS Output)
│   │   ├── base/                 <-- Global Resets & Typography
│   │   ├── components/           <-- "Materials" (Classes)
│   │   ├── config/
│   │   │   ├── _generated-themes.scss <-- 🤖 Generated (SCSS Maps)
│   │   │   └── _fonts.scss       <-- 🤖 Generated (@font-face)
│   │   └── global.scss           <-- Main CSS Entry Point
│   └── types/
│       └── void-ui.d.ts          <-- Type Definitions
├── tailwind.config.mjs           <-- The Bridge (Maps Tokens to Tailwind)
```

## 🔌 API Integration (Future Proofing)

The Void Engine is ready to accept dynamic themes from an external API.
If a collaborator needs to inject a custom brand theme, send a JSON payload matching this schema:

```json
{
  "id": "collaborator-brand-v1",
  "type": "light", // or "dark"
  "physics": "flat", // "glass", "flat", or "retro"
  "palette": {
    "bg-canvas": "#ffffff",
    "bg-surface": "#f0f0f0",
    "bg-sink": "#e0e0e0",
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

Implementation: Pass this object to voidEngine.registerTheme(id, data) and the system will render it instantly.

⚠️ API Warning: The Active Guardrail system applies here too. If your API payload requests physics: 'glass' but type: 'light', the engine will silently override physics to 'flat' to prevent a broken UI state.