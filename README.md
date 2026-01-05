# 🌌 Void Energy UI

> "We do not paint pixels; we define materials."

The Void Energy UI is a framework-agnostic, physics-based design system for the **CoNexus** storytelling platform.
It combines the performance of **Tailwind CSS** (for Layout) with a bespoke **SCSS Physics Engine** (for Materials).

## 🚀 The Triad Architecture

Every pixel on screen is calculated by the intersection of three layers:

1.  **Atmosphere (The Soul):** Defines Color (`--energy-primary`) and Fonts.
2.  **Physics (The Laws):** Defines Texture, Geometry, and Motion (`glass`, `flat`, `retro`).
3.  **Mode (The Polarity):** Handles Light/Dark environment switching.

### The Law of Immutability
In the Void Energy system, **Atmospheres are strict presets.**
* **User Choice:** Users select an **Atmosphere** (e.g., "Void", "Paper", "Terminal").
* **System Enforced:** The Atmosphere dictates the **Physics** and **Mode**.
    * *Example:* You cannot have "Void" (Cyberpunk) in "Light Mode".
    * *Example:* You cannot have "Paper" (Flat) with "Glass" physics.

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
    * ✅ `.card-glass { @include glass-float; }`
    * ❌ `.card-glass { width: 300px; margin-bottom: 20px; }` (Layout Bleed)

### 2. The Law of Tokens
* **Never hardcode pixels or colors.**
* All spacing must use semantic tokens (`gap-md`, `p-sm`) to respect the User Density Engine.
* All colors must use semantic variables (`bg-canvas`, `energy-primary`) to respect the Atmosphere Engine.

### 3. The Laws of Physics

| Concept | Rule |
| :--- | :--- |
| **Material is Truth** | **Glass:** Has Blur, Shadows, and Glows.<br>**Flat:** Has Borders, No Shadows, No Glows.<br>**Retro:** Has Pixel Borders, Instant Motion. |
| **Depth is Tiered** | **Sink (-Z):** Inputs/Wells (`shadow-sunk`).<br>**Float (+Z):** Cards/Surfaces (`shadow-float`).<br>**Lift (++Z):** Interactive/Modals (`shadow-lift`). |
| **Atmosphere is Context** | The UI adapts to the story. Switching from `void` to `paper` changes physics instantly. |

### 4. The Single Source of Truth
* **DO NOT** edit `_generated-themes.scss` or `void-registry.json`.
* Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.

### 5. The State Protocol
* **State lives in the DOM.** Do not use classes like `.active` or `.show`.
* Use semantic attributes: `[data-state="open"]`, `[aria-pressed="true"]`.
* This ensures CSS transitions (Enter/Exit) trigger correctly via the Physics Engine.

## 📂 Project Structure

```text
/
├── src/
│   ├── config/
│   │   ├── design-tokens.ts      <-- 🧠 EDIT THIS (SSOT)
│   │   └── void-registry.json    <-- 🤖 Generated (Logic)
│   ├── styles/
│   │   ├── abstracts/            <-- Functions, Mixins, Variables
│   │   ├── base/                 <-- Resets, Typography
│   │   ├── components/           <-- .btn, .card, .input
│   │   ├── config/
│   │   │   └── _generated-themes.scss <-- 🤖 Generated (Styles)
│   │   └── global.scss           <-- The Cascade Entry Point
│   └── components/               <-- Svelte/Astro Components
└── scripts/
    └── generate-tokens.ts        <-- The Compiler
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
    "border-highlight": "#cccccc",
    "border-shadow": "#bbbbbb",
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