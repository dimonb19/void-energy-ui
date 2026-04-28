# SYSTEM-PROMPT.md — Void Energy UI

> The portable system prompt for Void Energy. Any LLM — Claude, GPT, Gemini, or a future model — can consume this file via API as a system prompt and produce constraint-following Void Energy code.
> This file is **tool-agnostic**. It does not describe the Claude Code harness, the `.claude/` directory, hooks, or rules. Those exist in their own layer. This file is the contract the AI must honor when generating Void Energy UI code.
> If a single document in this repo could be passed to an AI with the instruction _"build on this,"_ it is this one.

---

## 1. Identity

Void Energy is a **physics-based, theme-reactive design system** built for narrative software. It separates **composition** (what goes where) from **material** (how it looks, moves, and feels). Every pixel on screen is the intersection of three environmental variables: an **Atmosphere** (color + font), a **Physics** preset (texture + motion), and a **Mode** (light/dark polarity).

The system ships as:

- A **token dictionary** — semantic CSS variables, no raw values.
- A set of **primitives** — native HTML wrapped in physics-aware SCSS.
- A set of **actions, transitions, and singletons** — motion and orchestration.
- A **runtime engine** (`voidEngine`) that enforces constraints at the DOM level.

> **You do not paint pixels. You declare materials.**

---

## 2. The Triad

The UI reads three attributes on the `<html>` element and reacts instantly when any of them change.

| Attribute         | Values                                                                                                                       | Meaning                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `data-atmosphere` | `void`, `paper`, `terminal`, `crimson`, `nebula`, `overgrowth`, `velvet`, `solar`, `onyx`, `laboratory`, `playground`, `focus`, or a registered custom theme | Color palette and font family |
| `data-physics`    | `glass`, `flat`, `retro`                                                                                                     | Texture, blur, motion, borders   |
| `data-mode`       | `light`, `dark`                                                                                                              | Polarity of the canvas           |

### Physics Contract

| Physics | Blur       | Motion                     | Borders    | Valid Modes    |
| ------- | ---------- | -------------------------- | ---------- | -------------- |
| `glass` | 20px backdrop | organic cubic-bezier (0.3s) | 1px glow   | `dark` only    |
| `flat`  | none       | clean ease-out (0.2s)       | 1px solid  | `light`, `dark` |
| `retro` | none       | instant steps (0s)          | 2px hard   | `dark` only    |

**Engine-enforced invariants:**

- `glass` + `light` → runtime downgrades physics to `flat`. Glass needs darkness to glow.
- `retro` + `light` → runtime forces mode to `dark`. CRT phosphor requires a black canvas.
- Never set an invalid combination manually — use `voidEngine.setAtmosphere()` or DOM attributes; the runtime guards itself.

---

## 3. The Five Laws

These are non-negotiable. Every component, every page, every generated output honors them.

### Law 1 — Hybrid Protocol

**Tailwind owns composition. SCSS owns material.**

- Tailwind: `flex`, `gap-md`, `p-lg`, responsive breakpoints, consumer-side geometry.
- SCSS: shadows, blur, glows, border physics, primitive-internal geometry tied to a token.

```
✅ class="flex flex-col gap-md p-lg"         (composition in Tailwind)
✅ .card { @include surface-raised; }         (physics in SCSS)
❌ class="shadow-lg bg-blue-500"              (physics in Tailwind)
❌ .section { display: grid; gap: 24px; }     (composition in SCSS)
```

### Law 2 — Token Law

**No raw values. Ever.** Every pixel, color, and duration is a semantic token.

```
✅ padding: var(--space-lg);
✅ class="gap-md p-lg text-body"
❌ padding: 32px;
❌ class="gap-[20px]"
❌ color: #ffffff;
```

Exceptions carry `// void-ignore` with a written justification (shimmer highlights, readability floors, browser-mandated constants). They are audited; do not add new ones casually.

### Law 3 — Runes Doctrine (Svelte 5)

Runes only. No legacy patterns.

```
✅ let { value = $bindable() }: Props = $props();
✅ let count = $state(0);
✅ const doubled = $derived(value * 2);
✅ $effect(() => { setup(); return () => teardown(); });
❌ export let value;
❌ $: reactive = value * 2;
❌ onMount / onDestroy / createEventDispatcher
❌ writable / readable / derived from 'svelte/store'
```

### Law 4 — State Protocol

**State lives in the DOM.** Attributes drive CSS, not modifier classes.

```
✅ data-state="open"   aria-pressed="true"   aria-expanded="false"
❌ class="is-active"   class="show"          class="selected"
```

This guarantees enter/exit transitions fire through the Physics Engine rather than arbitrary class toggling, and screen readers pick up the same signal the UI uses.

### Law 5 — Spacing Gravity

**Default generous. When uncertain, go ONE size up — never down.**

| Context                                     | Floor           |
| ------------------------------------------- | --------------- |
| Floating surface (`.surface-raised`)        | `p-lg gap-lg`   |
| Sunk well (`.surface-sunk`)                 | `p-md gap-md`   |
| Between page sections                       | `gap-2xl`       |
| Between content blocks in a section         | `gap-xl`        |
| Card grids                                  | `gap-lg`        |
| Form field groups                           | `gap-md`        |
| Tight coupling (label→input, icon+text, chips) | `gap-xs` / `gap-sm` |

`gap-xs` and `gap-sm` are reserved for items that are semantically one unit. Never use them between distinct groups.

---

## 4. The Token Dictionary

All values flow from a single source and are exposed as CSS custom properties. Pick from the dictionary; do not invent.

### Spacing (4px base, density-scaled 0.75× – 1.25×)

```
--space-xs    8px     Tight coupling, icon gaps
--space-sm    16px    Button padding, dense rows
--space-md    24px    Card padding, standard rhythm
--space-lg    32px    Section padding, floating surfaces
--space-xl    48px    Between content blocks
--space-2xl   64px    Between page sections
--space-3xl   96px    Hero rhythm
--space-4xl   128px   Hero sections
--space-5xl   160px   Mega whitespace
```

### Colors (theme-reactive)

```
Canvas:    --bg-canvas    --bg-surface    --bg-sunk    --bg-spotlight
Energy:    --energy-primary    --energy-secondary
Text:      --text-main    --text-dim    --text-mute
Border:    --border-color
Semantic:  --color-premium    --color-system    --color-success    --color-error
           (each has -light, -dark, -subtle variants)
```

### Physics (changes per preset)

```
Motion:    --speed-instant   --speed-fast   --speed-base   --speed-slow
Easing:    --ease-spring-gentle   --ease-spring-snappy   --ease-spring-bounce   --ease-flow
Surface:   --physics-blur   --physics-border-width
Depth:     --shadow-float   --shadow-lift   --shadow-sunk   --focus-ring
Feedback:  --lift   --scale   (glass lifts -3px, flat is static, retro uses steps)
Radius:    --radius-base (default)   --radius-full (pills)
           --radius-sm/md/lg/xl (explicit sizes; all zeroed under retro)
```

### Z-Index (semantic layers)

```
sunk(-1)  floor(0)  base(1)  decorate(2)  float(10)  sticky(20)  header(40)  dropdown(50)  overlay(90)
```

### Breakpoints (mobile-first)

```
mobile (0)   tablet (768)   small-desktop (1024)   large-desktop (1440)   full-hd (1920)   quad-hd (2560)
```

> Custom names. Do not assume Tailwind's defaults (`sm`, `md`, `lg`) — they are replaced.

---

## 5. Component Contract

Void Energy is **native-first**. Components are thin wrappers around native HTML — they add layout, labeling, and physics styling. They never reimplement browser behavior.

### Always Native

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`, `<table>`, `<progress>`, `<meter>`, `<audio>`.

### Shipped Primitives (use before inventing)

| Need                              | Primitive(s)                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| Single-choice picker              | `Selector`, `Switcher`, `Tabs`, `Combobox`                                                      |
| Boolean                           | `Toggle`                                                                                        |
| Text input                        | `EditField`, `EditTextarea`, `SearchField`, `GenerateField`, `GenerateTextarea`, `PasswordField` |
| Numeric / range                   | `SliderField`                                                                                   |
| Color                             | `ColorField`                                                                                    |
| Field composition                 | `FormField` (label + slot + hint + error)                                                       |
| Buttons                           | `<button class="btn-*">`, `ActionBtn`, `IconBtn`, `ProfileBtn`, `ThemesBtn`                     |
| Overlays                          | `Modal`, `Dropdown`, `Sidebar`                                                                  |
| Media                             | `Image`, `Avatar`, `Video`, `AdaptiveImage`                                                      |
| Theme creation (AI + manual)      | `ThemeBuilder`                                                                                  |
| Feedback                          | `toast`, `modal.alert`, `modal.confirm`, `Skeleton`, `ProgressRing`                             |
| Navigation                        | `Sidebar`, `Breadcrumbs`, `Tabs`, `Pagination`, `LoadMore`, `use:navlink`                       |
| Data display                      | `StatCard`, `LineChart`, `BarChart`, `DonutChart`, `Sparkline`                                   |
| Motion                            | `use:tooltip`, `use:morph`, `use:kinetic`, `use:narrative`                                      |
| Drag & reorder                    | `use:draggable`, `use:dropTarget`, `reorderByDrop`                                              |

### When to build new

Only when **all three** are true:

1. No native element covers the interaction.
2. No shipped primitive covers the behavior.
3. The need will recur in three or more places.

Otherwise, compose with what already ships.

---

## 6. Import Paths

All UI primitives import from a single alias root. Pattern: `@components/ui/<ComponentName>.svelte`.

```ts
// Fields
import SearchField from '@components/ui/SearchField.svelte';
import EditField from '@components/ui/EditField.svelte';
import EditTextarea from '@components/ui/EditTextarea.svelte';
import PasswordField from '@components/ui/PasswordField.svelte';
import PasswordMeter from '@components/ui/PasswordMeter.svelte';
import PasswordChecklist from '@components/ui/PasswordChecklist.svelte';
import ColorField from '@components/ui/ColorField.svelte';
import CopyField from '@components/ui/CopyField.svelte';
import SliderField from '@components/ui/SliderField.svelte';
import GenerateField from '@components/ui/GenerateField.svelte';
import GenerateTextarea from '@components/ui/GenerateTextarea.svelte';
import Toggle from '@components/ui/Toggle.svelte';
import Switcher from '@components/ui/Switcher.svelte';
import Selector from '@components/ui/Selector.svelte';
import Combobox from '@components/ui/Combobox.svelte';
import DropZone from '@components/ui/DropZone.svelte';
import FormField from '@components/ui/FormField.svelte';
import MediaSlider from '@components/ui/MediaSlider.svelte';

// Buttons
import ActionBtn from '@components/ui/ActionBtn.svelte';
import IconBtn from '@components/ui/IconBtn.svelte';
import ThemesBtn from '@components/ui/ThemesBtn.svelte';
import ProfileBtn from '@components/ui/ProfileBtn.svelte';

// Overlays
import Dropdown from '@components/ui/Dropdown.svelte';
import Sidebar from '@components/ui/Sidebar.svelte';

// Navigation
import Tabs from '@components/ui/Tabs.svelte';
import Pagination from '@components/ui/Pagination.svelte';
import LoadMore from '@components/ui/LoadMore.svelte';
import Breadcrumbs from '@components/ui/Breadcrumbs.svelte';

// Layout + feedback
import SettingsRow from '@components/ui/SettingsRow.svelte';
import PullRefresh from '@components/ui/PullRefresh.svelte';
import Skeleton from '@components/ui/Skeleton.svelte';

// Media
import Image from '@components/ui/Image.svelte';
import AdaptiveImage from '@components/ui/AdaptiveImage.svelte';
import Avatar from '@components/ui/Avatar.svelte';
import Video from '@components/ui/Video.svelte';

// Charts
import ProgressRing from '@components/ui/ProgressRing.svelte';
import Sparkline from '@components/ui/Sparkline.svelte';
import StatCard from '@components/ui/StatCard.svelte';
import DonutChart from '@components/ui/DonutChart.svelte';
import LineChart from '@components/ui/LineChart.svelte';
import BarChart from '@components/ui/BarChart.svelte';

// Theme
import AtmosphereScope from '@components/core/AtmosphereScope.svelte';
import LiquidGlassFilter from '@components/core/LiquidGlassFilter.svelte';
import ThemeBuilder from '@components/ui/ThemeBuilder.svelte';

// Singletons (import, never re-instantiate)
import { voidEngine } from '@adapters/void-engine.svelte';
import { modal } from '@lib/modal-manager.svelte';
import { toast } from '@stores/toast.svelte';
import { layerStack } from '@lib/layer-stack.svelte';
import { shortcutRegistry } from '@lib/shortcut-registry.svelte';
import { user } from '@stores/user.svelte';

// Actions
import { morph } from '@actions/morph';
import { tooltip } from '@actions/tooltip';
import { navlink } from '@actions/navlink';
import { kinetic } from '@actions/kinetic';
import { narrative, isOneShotEffect } from '@actions/narrative';
import { draggable, dropTarget, reorderByDrop } from '@actions/drag';

// Transitions
import { emerge, dissolve, materialize, dematerialize, implode, live } from '@lib/transitions.svelte';
```

The complete machine-readable inventory (props, slots, compose guidance, examples) lives in [src/config/component-registry.json](src/config/component-registry.json). Read that file when you need exact prop shapes.

---

## 7. The Build Procedure

When asked for a page, screen, or feature:

1. **Parse the request.** Goals, content blocks, interactions, mood.
2. **Check the registry.** `component-registry.json` lists every shipped primitive, action, and singleton.
3. **Find the nearest analog.** An existing page or component that matches the shape. Read it before writing anything.
4. **Pick tokens from the dictionary.** Spacing, color, motion — all semantic.
5. **Compose, don't construct.** Assemble shipped primitives with Tailwind for layout. Reach for SCSS only when the task is system-level.
6. **Verify across all three physics and both modes.** If the design breaks under `glass`, `flat`, or `retro`, it isn't done.

### Page Scaffold (default)

```svelte
<div class="container flex flex-col gap-2xl py-2xl">
  <section class="flex flex-col gap-xl">
    <div class="surface-raised p-lg flex flex-col gap-lg">
      <div class="flex flex-col gap-xs">
        <h3>Section Title</h3>
        <p class="text-dim">Description</p>
      </div>
      <div class="surface-sunk p-md flex flex-col gap-md">
        <!-- content -->
      </div>
    </div>
  </section>
</div>
```

### Component Skeleton (Svelte)

```svelte
<script lang="ts">
  interface Props {
    value: string;
    checked?: boolean;
    onchange?: (value: string) => void;
    class?: string;
  }

  let {
    value,
    checked = $bindable(false),
    onchange,
    class: className = '',
  }: Props = $props();
</script>

<div
  class="flex gap-md {className}"
  data-state={checked ? 'active' : ''}
>
  <!-- Composition = Tailwind. State = data attributes. Material = SCSS class. -->
</div>
```

---

## 8. Hard Prohibitions

These break the system. Do not ship them.

- **Raw values.** Hardcoded px, rem, %, hex, rgb, hsl in application code.
- **Physics in Tailwind.** `shadow-lg`, `backdrop-blur-md`, arbitrary `bg-*` utilities for material.
- **Composition in SCSS.** One-off page sections, grid layouts, margin-based positioning.
- **Classes for state.** `.active`, `.open`, `.selected`, `.is-*`, `.has-*`.
- **Legacy Svelte.** `export let`, `$:`, `onMount`, `onDestroy`, `createEventDispatcher`, stores from `svelte/store` (use runes).
- **New primitives when one ships.** Rebuilding `<select>`, `<dialog>`, or any shipped UI component from scratch.
- **Editing generated files.** `src/styles/config/_generated-themes.scss`, `src/styles/config/_fonts.scss`, `src/config/void-registry.json`, `src/config/void-physics.json`, `src/config/font-registry.ts`. Edit `src/config/design-tokens.ts` instead.
- **Invalid physics combinations.** Manually setting `physics="glass"` with `mode="light"`, or `physics="retro"` with `mode="light"`.
- **Inline styles for visuals.** Use a token-backed class. Inline styles are reserved for runtime positioning and browser APIs.

---

## 9. Acceptance Criteria

A Void Energy output is complete when:

- **Types check.** All Svelte and TypeScript types resolve.
- **Registry aligns.** Every component use matches the registry's props and imports.
- **No raw values.** No hardcoded px, hex, rgb, hsl in touched files (exceptions carry `// void-ignore` with justification).
- **Renders across physics.** Works in `glass`, `flat`, **and** `retro`.
- **Renders across modes.** Works in both `light` and `dark` where the active physics permits (glass + retro are dark-only).
- **No new `// void-ignore` annotations without a written justification.**

For UI work, "looks right in one physics" is never enough. The system is the three intersecting presets — verify all of them.

---

## 10. Extension

### Register a custom theme at runtime

```ts
voidEngine.registerTheme('brand-v1', {
  mode: 'dark',
  physics: 'glass',
  palette: {
    'bg-canvas': '#010020',
    'bg-surface': 'rgba(22, 30, 95, 0.4)',
    'bg-sunk': '#020014',
    'bg-spotlight': '#0a0a2a',
    'energy-primary': '#33e2e6',
    'energy-secondary': '#3875fa',
    'border-color': 'rgba(51, 226, 230, 0.3)',
    'text-main': '#ffffff',
    'text-dim': '#a0a0b8',
    'text-mute': '#6a6a85',
    'color-premium': '#ffcc00',
    'color-system': '#a078ff',
    'color-success': '#00cc66',
    'color-error': '#ff3c40',
  },
});
```

### Load a remote theme

```ts
const result = await voidEngine.loadExternalTheme('https://example.com/theme.json');
// result: VoidResult — { ok: true } or { ok: false, error }
```

The active guardrail system still applies. If the payload requests `physics: 'glass'` with `mode: 'light'`, the engine silently corrects physics to `flat` to preserve legibility.

---

## 11. The Philosophy, Compact

- **Composition is separate from material.** Layout is a consumer concern; physics is a system concern.
- **Tokens are the only vocabulary.** Raw values are a failure of imagination.
- **State lives in the DOM.** CSS reads what the browser already knows.
- **The system adapts; the designer chooses.** One attribute change reshapes the entire UI.
- **Native is the baseline.** If the browser does it well, wrap it — never replace it.
- **Generous over cramped.** When in doubt, breathe.

> You do not paint pixels. You declare materials.

---

## Cross-References

For depth beyond this contract — available to agents with file-system access:

- [CHEAT-SHEET.md](CHEAT-SHEET.md) — complete developer reference: mixins, patterns, actions, transitions.
- [COMPOSITION-RECIPES.md](COMPOSITION-RECIPES.md) — page archetypes composed from shipped primitives.
- [AI-PLAYBOOK.md](AI-PLAYBOOK.md) — compact operating guide for agents building consumer pages.
- [THEME-GUIDE.md](THEME-GUIDE.md) — building and validating custom themes (palette contract, WCAG, collisions).
- [src/config/component-registry.json](src/config/component-registry.json) — machine-readable inventory of shipped primitives.
- [src/config/design-tokens.ts](src/config/design-tokens.ts) — single source of truth for every token value.
- [DESIGN.md](DESIGN.md) — aesthetic snapshot (Frost) for agents building VE-inspired UI without installing VE. Tool-agnostic. Not the AI-build contract — that's this file.
