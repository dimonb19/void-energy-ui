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
| `data-atmosphere` | `frost`, `graphite`, `terminal`, `meridian`, or a registered custom theme | Color palette and font family |
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

Exceptions carry `// void-ignore` with a written justification (shimmer highlights, readability floors, browser-mandated constants, scan-line / dotted pattern stripe widths that have no token equivalent). They are audited; do not add new ones casually.

```scss
// Retro physics scan-line — 1px stripes are the visual primitive; no token applies.
background: repeating-linear-gradient(
  0deg,
  transparent 0,
  transparent 1px,                                  // void-ignore: scan-line stripe primitive
  var(--text-mute) 1px,                             // void-ignore: scan-line stripe primitive
  var(--text-mute) 2px                              // void-ignore: scan-line stripe primitive
);
```

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

**Data loading on mount uses `$effect`, NOT `onMount`.** This is the most common regression — write the rune.

```
✅ $effect(() => { void loadData(); });
✅ $effect(() => { const id = setInterval(tick, 1000); return () => clearInterval(id); });
❌ import { onMount } from 'svelte'; onMount(async () => { await loadData(); });
❌ import { onDestroy } from 'svelte'; onDestroy(() => cleanup());
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

**Map raw concepts to tokens — these are the most-invented raw values:**

| Raw concept                                | Use this token instead                                              |
| ------------------------------------------ | ------------------------------------------------------------------- |
| Backdrop blur (`filter: blur(Npx)`)        | `filter: var(--physics-blur);` — physics-correct per preset         |
| Primitive border width (`border: Npx ...`) | `border-width: var(--physics-border-width);` — 1px glass/flat, 2px retro |
| Outline / gradient stop color              | `var(--border-color)`, `var(--energy-primary)`, `var(--text-mute)`   |
| Drop shadow                                | `var(--shadow-float | --shadow-lift | --shadow-sunk)`                |
| Overlay positioning offsets (`inset: ±Npx`) | Drop the offset, or carry `// void-ignore` with justification — physics layer is owned by `surface-*` mixins |
| Scan-line / dotted overlay raw px stops    | `var(--physics-border-width)`, or `// void-ignore` if the pattern needs literal-px stripes |

### Typography (semantic, density-scaled)

```
--text-caption    --text-small    --text-base    --text-h6    --text-h5    --text-h4    --text-h3    --text-h2    --text-h1
--font-weight-regular (400)    --font-weight-medium (500)    --font-weight-semibold (600)    --font-weight-bold (700)
```

For type sizes use these tokens — never `font-size: 0.75rem`, `font-size: 12px`, or any raw rem/px. `--text-caption` covers what `0.75rem` is reaching for; `--text-small` covers `0.875rem`; `--text-base` is body text. Body buttons and form controls use `--font-weight-medium` (500) by default.

### Z-Index (semantic layers)

```
sunk(-1)  floor(0)  base(1)  decorate(2)  float(10)  sticky(20)  header(40)  dropdown(50)  overlay(90)
```

### Breakpoints (mobile-first)

```
mobile (0)   tablet (768)   small-desktop (1024)   large-desktop (1440)   full-hd (1920)   quad-hd (2560)
```

> Custom names. Do not assume Tailwind's defaults (`sm`, `md`, `lg`) — they are replaced.

### Max-width T-shirt scale (preserved from standard Tailwind)

```
max-w-3xs  (16rem)   max-w-2xs (18rem)   max-w-xs  (20rem)   max-w-sm  (24rem)
max-w-md   (28rem)   max-w-lg  (32rem)   max-w-xl  (36rem)   max-w-2xl (42rem)
max-w-3xl  (48rem)   max-w-4xl (56rem)   max-w-5xl (64rem)   max-w-6xl (72rem)   max-w-7xl (80rem)
```

For width constraints (search fields in toolbars, prose containers, narrow forms) use this scale — never `max-w-[NNNpx]` brackets. `max-w-md` ≈ 448px; `max-w-sm` ≈ 384px; `max-w-lg` ≈ 512px.

---

## 5. Component Contract

Void Energy is **native-first**. Components are thin wrappers around native HTML — they add layout, labeling, and physics styling. They never reimplement browser behavior.

### Always Native

`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`, `<details>`, `<fieldset>`, `<label>`, `<table>`, `<progress>`, `<meter>`, `<audio>`.

### Shipped Primitives (use before inventing)

| Need                                | Primitive(s)                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Single-choice picker                | `Selector`, `Switcher`, `Tabs`, `Combobox`                                                         |
| Boolean                             | `Toggle`                                                                                           |
| Text input                          | `EditField`, `EditTextarea`, `SearchField`, `GenerateField`, `GenerateTextarea`, `PasswordField`   |
| Numeric / range                     | `SliderField`                                                                                      |
| Color                               | `ColorField`                                                                                       |
| Copy-to-clipboard                   | `CopyField`                                                                                        |
| File upload                         | `DropZone`                                                                                         |
| Password feedback                   | `PasswordMeter`, `PasswordChecklist` (both consume `createPasswordValidation()`)                   |
| Media transport                     | `MediaScrubber`, `MediaSlider`                                                                     |
| Field composition                   | `FormField` (label + slot + hint + error)                                                          |
| Settings row                        | `SettingsRow` (label + control alignment for settings dialogs)                                     |
| Buttons                             | `<button class="btn-*">`, `ActionBtn`, `IconBtn`, `ProfileBtn`, `ThemesBtn`                        |
| Overlays                            | `Modal`, `Dropdown`, `Sidebar`                                                                     |
| Pull-to-refresh                     | `PullRefresh`                                                                                      |
| Media                               | `Image`, `Avatar`, `Video`, `AdaptiveImage`                                                        |
| Authored / formatted string content | `Markdown`                                                                                         |
| Theme creation (AI + manual)        | `ThemeBuilder`                                                                                     |
| Theme scoping (lifecycle-bound)     | `AtmosphereScope`                                                                                  |
| Glass refraction filter (mount once) | `LiquidGlassFilter`                                                                               |
| Feedback                            | `toast`, `modal.alert`, `modal.confirm`, `Skeleton`, `ProgressRing`                                |
| Navigation                          | `Sidebar`, `Breadcrumbs`, `Tabs`, `Pagination`, `LoadMore`, `use:navlink`                          |
| Data display                        | `StatCard`, `LineChart`, `BarChart`, `DonutChart`, `Sparkline`                                     |
| Motion                              | `use:tooltip`, `use:morph`, `use:kinetic`, `use:narrative`, `use:fontShift`, `use:laserAim`        |
| Ambient light                       | `use:aura`, `extractAura`                                                                          |
| Drag & reorder                      | `use:draggable`, `use:dropTarget`, `reorderByDrop`, `resolveReorderByDrop`                         |
| Imperative typing                   | `typewrite`                                                                                        |
| Singletons                          | `voidEngine`, `modal`, `toast`, `user`, `layerStack`, `shortcutRegistry`                           |

### Ambient light constraint (`use:aura`)

Use `use:aura` **only** on image-backed or atmosphere-primary surfaces — story scenes, hero panels, album-cover-style cards. Do not attach Aura to dashboard tiles, form fields, navigation chrome, or generic cards. Multiple Auras in a single visible region produce rainbow-disco output; prefer one focal Aura per region. The `color` prop is optional — omit it for an atmosphere-driven glow (falls back to `--energy-primary`). Pair with `extractAura()` from `@lib/aura` only when the color must come from an image.

### Markdown rendering constraint (`<Markdown>`)

If the source string may contain markdown syntax (`**bold**`, `#`, `-`, fenced code, links), render it through `<Markdown source={...}>`. If it is guaranteed plain text, render directly into a `<p>` or other native element. Do not hand-roll `marked()` + `{@html}` or wrap output in your own sanitizer — the primitive already runs `marked` + `sanitize-html` and applies `.prose` styling. Default usage is **safe** (sanitizer runs on every call). The `trusted` flag bypasses the sanitizer and **must only be used for strings committed in source** (changelog, help copy, settings descriptions); when `trusted` appears in a diff, treat it as a sanitizer-bypass review surface and verify the source is system-authored, not AI / CMS / user input. For phrasing contexts (tooltip body, label text), pass `inline` so the wrapper is `<span>` and there is no leading `<p>`.

### Premium Packages (sit on top of the L1 contract)

Two add-on packages consume the atmosphere × physics × mode contract and add narrative-grade motion. Both are usable standalone and have a canonical `AI-REFERENCE.md` for their effect vocabularies.

| Package                          | Surface                                                              | Use For                                                                  |
| -------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `@void-energy/ambient-layers`    | `<AmbientHost />` + `ambient.push(category, variant, intensity)` / `ambient.fire(variant, intensity)`; raw `AtmosphereLayer` / `PsychologyLayer` / `ActionLayer` / `EnvironmentLayer` | Backdrop weather, mood, environment color grading, one-shot scene beats |
| `@void-energy/kinetic-text`      | `KineticText` (engine), `TtsKineticBlock` (TTS-synced), `KineticSkeleton` (placeholder); style snapshot via `createVoidEnergyTextStyleSnapshot` | Character-level reveals, 21 continuous mood effects, 16 one-shot punctuation effects, TTS-synced narrative |

The free `use:kinetic` action covers basic typewriter / cycle / decode reveals; the paid engine adds character-level pretext layout and the 37-effect narrative library. Do not mix the two — pick the level of fidelity the task demands.

### Prop API conventions (the ones AI agents most often invent)

- **Button variants are class names, not `variant=` props.** Valid variant classes: `btn-cta`, `btn-premium`, `btn-system`, `btn-success`, `btn-error`, `btn-ghost`, `btn-loud`, `btn-icon`, `btn-void`. Apply via the `class` prop. There is no `variant="danger"` / `variant="primary"` / `variant="..."` prop on `ActionBtn`, `IconBtn`, `ProfileBtn`, or `ThemesBtn`. Modal-dismiss / cancel buttons use `class="btn-ghost btn-error"` (red ghost), not plain `btn-ghost`.
- **`ActionBtn` takes `text` as a prop, not children.** Correct: `<ActionBtn icon={Sparkle} text="Generate" class="btn-cta" onclick={...} />`. Incorrect: `<ActionBtn>...</ActionBtn>`.
- **`IconBtn` is icon-only.** Pass `icon` + accessibility-relevant `...rest` (`aria-label`, `title`). Use `ActionBtn` when an action benefits from a label.
- **Modal / Dropdown / Sidebar take Svelte 5 snippets via slot props.** Do not call them with positional children for content the registry calls a `panel`, `trigger`, or `children` snippet.
- **`Toggle` exposes a native `<input type="checkbox" role="switch">`** — use `bind:checked` and `...rest` for native attributes (`name`, `disabled`, `aria-*`).
- **State drives via `data-state` / `aria-*`, never `variant=` or `mode=` props.** A control that's "active" carries `data-state="active"` or `aria-pressed="true"`, not `variant="active"`.

### When to build new

Only when **all three** are true:

1. No native element covers the interaction.
2. No shipped primitive covers the behavior.
3. The need will recur in three or more places.

Otherwise, compose with what already ships.

---

## 6. Import Paths

All UI primitives import from a single alias root. Pattern: `@components/ui/<ComponentName>.svelte`.

**Valid alias roots (do not invent new ones):**

| Alias                 | Maps to                | Use For                                                              |
| --------------------- | ---------------------- | -------------------------------------------------------------------- |
| `@components/ui/`     | `src/components/ui/`   | Shipped UI primitives                                                |
| `@components/core/`   | `src/components/core/` | Astro scaffolding (`AtmosphereScope`, `LiquidGlassFilter`)           |
| `@components/icons/`  | `src/components/icons/` | Custom interactive icon components                                   |
| `@components/app/`    | `src/components/app/`  | App-level / consumer-side components                                 |
| `@adapters/`          | `src/adapters/`        | `voidEngine` and adapter modules                                     |
| `@actions/`           | `src/actions/`         | Svelte actions (`tooltip`, `morph`, `kinetic`, …)                    |
| `@lib/`               | `src/lib/`             | Singletons + utilities (`modal-manager`, `aura`, `password-validation`) |
| `@stores/`            | `src/stores/`          | Reactive state singletons (`toast`, `user`)                          |
| `@config/`            | `src/config/`          | Token + atmosphere + font configuration                              |
| `@service/` `@styles/` | `src/service/` `src/styles/` | Service shims and SCSS entrypoints                              |

There is no `@components/dashboard/`, `@components/terminal/`, `@components/forms/`, or any other invented subroot. Compose pages from the four valid `@components/*` subroots above.

**New components the consumer authors live in `@components/app/`, not `@components/ui/`.** `@components/ui/` is reserved for the shipped primitive library — it is read-only outside system-level tasks. When you write a new consumer-side component (a custom card, a feature-specific widget, a domain-specific composite), place it in `@components/app/`. Do not author into `@components/ui/`. Better still: see if a `surface-*` class on a native `<div>` plus the registered primitives covers the need without a new component file at all.

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
import Markdown from '@components/ui/Markdown.svelte';
import MediaScrubber from '@components/ui/MediaScrubber.svelte';

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
import { kinetic, typewrite } from '@actions/kinetic';
import { narrative, isOneShotEffect } from '@actions/narrative';
import { draggable, dropTarget, reorderByDrop, resolveReorderByDrop } from '@actions/drag';
import { aura } from '@actions/aura';
import { extractAura } from '@lib/aura';
import { laserAim } from '@actions/laser-aim';
import { fontShift } from '@actions/font-shift';

// Validation factory
import { createPasswordValidation } from '@lib/password-validation.svelte';

// Transitions
import { emerge, dissolve, materialize, dematerialize, implode, live } from '@lib/transitions.svelte';

// Premium packages (separate npm scopes; consume the L1 contract)
import { ambient, AmbientHost } from '@void-energy/ambient-layers';
import { KineticText, TtsKineticBlock, KineticSkeleton } from '@void-energy/kinetic-text';
import { createVoidEnergyTextStyleSnapshot } from '@void-energy/kinetic-text/adapters/void-energy-host';
```

The complete machine-readable inventory (props, slots, compose guidance, examples) lives in [src/config/component-registry.json](src/config/component-registry.json). Read that file when you need exact prop shapes. Premium-package vocabularies live in [packages/ambient-layers/AI-REFERENCE.md](packages/ambient-layers/AI-REFERENCE.md) and [packages/kinetic-text/AI-REFERENCE.md](packages/kinetic-text/AI-REFERENCE.md).

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

- **Raw values.** Hardcoded px, rem, %, hex, rgb, rgba, hsl, hsla in application code. Specific failure modes:
  - `filter: blur(Npx)` → `filter: var(--physics-blur);`
  - `inset: ±Npx` for overlays → drop the offset, or carry a `// void-ignore` with justification.
  - `rgba(0, 0, 0, N)` for shadows / gradient stops → use `var(--shadow-*)` or `var(--border-color)`.
  - `border: Npx solid #...` → `border: var(--physics-border-width) solid var(--border-color);`
  - `text-shadow: 0 0 Npx ...` / `box-shadow: 0 0 Npx ...` → use a shadow token (`var(--shadow-float | --shadow-lift)`) or `--physics-blur` for the blur radius. Never spell out raw px shadow blur radii (`8px`, `16px`).
  - `width: Npx; height: Npx;` for tiny ornaments (cursor caret, dot indicator) → use `var(--space-xs)` (8px) or carry `// void-ignore`.
  - `min-width: Nrem` / `min-height: Nrem` → use a `--space-*` token (`--space-xs` 8 / `sm` 16 / `md` 24 / `lg` 32 / `xl` 48 / `2xl` 64).
- **Arbitrary Tailwind brackets for layout values.** `gap-[20px]`, `p-[32px]`, `w-[400px]`, `max-w-[600px]`, `min-h-[200px]`, `h-[80vh]`, `max-w-[400px]`. **All bracket-syntax utilities are banned** — including responsive variants like `tablet:max-w-[400px]`. Compose from the semantic token scale (`gap-md`, `p-lg`, `w-full`, container queries, container `max-w-prose`-style classes) — if no token covers the case, use SCSS with a token, not an arbitrary bracket utility.
- **Hallucinated import aliases.** `@components/dashboard/`, `@components/terminal/`, `@components/forms/`, etc. The valid alias subroots are listed in §6 — only `@components/{ui,core,icons,app}` plus the top-level `@adapters` / `@actions` / `@lib` / `@stores` / `@config` / `@service` / `@styles`.
- **Physics in Tailwind.** `shadow-lg`, `backdrop-blur-md`, arbitrary `bg-*` utilities for material.
- **Composition in SCSS.** One-off page sections, grid layouts, margin-based positioning.
- **Classes for state.** `.active`, `.open`, `.selected`, `.is-*`, `.has-*`. State lives on `data-state="..."` or `aria-*` attributes.
- **`variant=` props on shipped buttons.** `ActionBtn`, `IconBtn`, `ProfileBtn`, and `ThemesBtn` consume variants via `class="btn-..."` — there is no `variant=` prop. Modal-dismiss / cancel uses `class="btn-ghost btn-error"`, not `variant="danger"`.
- **Children content on `ActionBtn`.** It takes `text` as a prop, not a slot.
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
- [THEME-GUIDE.md](THEME-GUIDE.md) — building and validating custom themes (palette contract, WCAG, collisions).
- [src/config/component-registry.json](src/config/component-registry.json) — machine-readable inventory of shipped primitives.
- [src/config/design-tokens.ts](src/config/design-tokens.ts) — single source of truth for every token value.
- [packages/ambient-layers/AI-REFERENCE.md](packages/ambient-layers/AI-REFERENCE.md) — canonical ambient-layer vocabulary (variants, intensity, lifetime semantics, scene recipes).
- [packages/kinetic-text/AI-REFERENCE.md](packages/kinetic-text/AI-REFERENCE.md) — canonical kinetic-text vocabulary (reveal styles, continuous effects, one-shot punctuation, style spans, TTS sync).
- [DESIGN.md](DESIGN.md) — aesthetic snapshot (Frost) for agents building VE-inspired UI without installing VE. Tool-agnostic. Not the AI-build contract — that's this file.
