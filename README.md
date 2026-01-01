# 🌌 Void Energy UI

> "We do not paint pixels; we define materials."

The Void Energy UI is a framework-agnostic, physics-based design system for the **CoNexus** storytelling platform. It combines the performance of **Tailwind CSS** (for Layout) with a bespoke **SCSS Physics Engine** (for Materials).

## 🚀 The Triad Architecture

Every pixel on screen is calculated by the intersection of three layers:

1.  **Atmosphere (The Soul):** Defines Color (`--energy-primary`) and Fonts.
2.  **Physics (The Laws):** Defines Texture, Geometry, and Motion (`glass`, `flat`, `retro`).
3.  **Mode (The Optics):** Handles Light/Dark contrast and Glow intensity.

## 🛠 Developer Workflow

### 1. The Single Source of Truth
We utilize a **Token-First** architecture. You do **not** edit SCSS theme files manually.

* **Logic Core:** [`src/config/design-tokens.ts`](./src/config/design-tokens.ts)
* **Command:** `npm run build:tokens`

This command generates:
* `src/styles/config/_generated-themes.scss` (The Paint)
* `src/config/void-registry.json` (The Brain)

### 2. Syntax & Usage
We use a **Hybrid Protocol**:

* **Layout (Tailwind):** Use standard utilities for geometry.
    * ✅ `p-md`, `gap-lg`, `flex`, `hidden tablet:block`
    * ❌ `padding: 20px` (Breaks the Density Engine)
* **Materials (Void SCSS):** Use component classes for physics.
    * ✅ `.surface-glass`, `.btn-cta`, `.text-highlight`
    * ❌ `bg-blue-500` (Breaks the Atmosphere Engine)

### 3. The Laws of Physics

| Concept | Rule |
| :--- | :--- |
| **Light is Signal** | We do not use shadows for contrast; we use **Glows**. If it glows, it is interactive. |
| **Depth is Logic** | **Float (+Z):** Cards/Modals (Glass). **Sink (-Z):** Inputs/Wells (Void Depth). |
| **Atmosphere is Context** | The UI adapts to the story. Switching from `void` to `paper` changes physics instantly. |

## 🧞 Commands

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local dev server (and auto-builds tokens) |
| `npm run build:tokens` | Compiles `design-tokens.ts` into SCSS/JSON |
| `npm run build` | Production build |

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

### 4. The Law of Immutability
In the Void Energy system, **Atmospheres are strict presets.** * **User Choice:** Users select an **Atmosphere** (e.g., "Void", "Paper", "Terminal").
* **System Enforced:** The Atmosphere dictates the **Physics** and **Mode**.
    * *Example:* You cannot have "Void" (Cyberpunk) in "Light Mode".
    * *Example:* You cannot have "Paper" (Flat) with "Glass" physics.

**Why?** CoNexus is a narrative platform. The visual rendering engine is part of the storytelling. Breaking the physics of a theme breaks the immersion of the story. We provide distinct themes to cover accessibility needs (e.g., "Focus" for high contrast), but we do not allow mixing and matching of Triad layers by the end-user.