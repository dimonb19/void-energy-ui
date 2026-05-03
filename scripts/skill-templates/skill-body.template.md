# Void Energy — design system skill

Models default to design slop without specific guidance. Per Anthropic's [frontend-design blog post](https://claude.com/blog/improving-frontend-design-through-skills), *"models predict tokens based on statistical patterns in training data. Safe design choices — those that work universally and offend no one — dominate web training data."* The visible markers are Inter, Roboto, Arial, system fonts, purple gradients on white, predictable layouts, and cookie-cutter patterns lacking context-specific character.

**Void Energy is the concrete answer to that convergence.** Every surface is the intersection of three environmental variables — an **atmosphere** (palette + font), a **physics** preset (texture, motion, borders), and a **mode** (light or dark polarity) — composed from a token dictionary, never raw values. An optional **brand** overlay can sit between physics and atmosphere to carry identity (radii / motion / type-treatment / per-role weights) without touching color or composition. A runtime engine enforces constraints at the DOM level. Output produced through this skill diverges from the convergent center because the system itself is opinionated.

> Do not paint pixels. Declare materials.

---

## The Five Laws (non-negotiable)

1. **Hybrid Protocol** — Tailwind owns composition; SCSS owns material.
   - ✅ `class="flex flex-col gap-md p-lg"` ❌ `.section { display: grid; gap: 24px; }`
   - ✅ `.card { @include surface-raised; }` ❌ `class="shadow-lg bg-blue-500"`

2. **Token Law** — No raw px, hex, rgb, hsl, or rem in app code. Semantic tokens only.
   - ✅ `padding: var(--space-lg);` `class="gap-md p-lg text-body"`
   - ❌ `padding: 32px;` `class="gap-[20px] max-w-[400px]"`

3. **Runes Doctrine** — Svelte 5 runes only. No legacy patterns.
   - ✅ `let { value = $bindable() }: Props = $props();` `$effect(() => { ... });`
   - ❌ `export let value;` `$: x = ...;` `onMount(...)` `writable(...)`

4. **State Protocol** — State lives in the DOM. `data-*` and ARIA, never modifier classes.
   - ✅ `data-state="open"` `aria-pressed="true"` `aria-expanded="false"`
   - ❌ `class="is-active"` `class="open"` `class="selected"`

5. **Spacing Gravity** — Default generous; when uncertain, go ONE size up.
   - Floor: floating surface → `p-lg gap-lg`. Sunk surface → `p-md gap-md`.
   - `gap-xs` / `gap-sm` are reserved for items that are semantically one unit.

---

## The Triad

The `<html>` element carries three attributes. The runtime reacts when any change.

| Attribute | Values | Meaning |
| --- | --- | --- |
| `data-atmosphere` | `frost`, `graphite`, `terminal`, `meridian`, plus registered custom themes | Palette + font |
| `data-physics` | `glass`, `flat`, `retro` | Texture, blur, motion, borders |
| `data-mode` | `light`, `dark` | Canvas polarity |
| `data-brand` | `nike`, `stripe`, `lamborghini`, plus registered profiles (optional) | Identity overlay (radii / motion / type / per-role weights) |

**Engine-enforced invariants — only four of six combinations are valid:**

- `glass` + `dark` ✅ — backdrop blur, organic motion, glow borders
- `flat` + `dark` ✅ — clean ease-out, solid borders
- `flat` + `light` ✅ — same physics in light polarity
- `retro` + `dark` ✅ — instant steps, hard borders, CRT phosphor
- `glass` + `light` → runtime downgrades physics to `flat` (glass needs darkness to glow)
- `retro` + `light` → runtime forces mode to `dark` (CRT requires a black canvas)

Drive the triad through `voidEngine.setAtmosphere()` or DOM attributes. The engine guards itself; never patch invalid combinations manually.

---

## Opinionated defaults

One recommended path per task. Reach into the registry only when the task is genuinely outside this list.

- **Icon + text action** → `<ActionBtn icon={X} text="..." class="btn-cta" />`. The text is a prop, not children.
- **Icon-only action** → `<IconBtn icon={X} aria-label="..." />`.
- **Button variants** → `class="btn-cta | btn-premium | btn-system | btn-success | btn-error | btn-ghost"`. There is no `variant=` prop. Modal-dismiss / cancel uses `class="btn-ghost btn-error"`.
- **Single-choice picker** → `Selector` (native `<select>` wrap). Tab-style choice → `Switcher` or `Tabs`. Type-to-filter → `Combobox`.
- **Boolean toggle** → `Toggle` (renders `<input type="checkbox" role="switch">`).
- **Text input** → `EditField` (inline-editable), `SearchField`, `PasswordField`, `CopyField`, `ColorField`, `SliderField`, `GenerateField` / `GenerateTextarea` (AI-generate).
- **Field composition** → `FormField` wraps label + input + hint + error.
- **Modal / dialog** → `import { modal } from '@lib/modal-manager.svelte'`. Use `modal.confirm({ ... })` for destructive actions.
- **Transient feedback** → `import { toast } from '@stores/toast.svelte'`. `toast.success | error | info | warning | loading | promise`.
- **Floating panel** → `Dropdown` (trigger + popover snippet props). Slide-out → `Sidebar`.
- **Avatar / image / video** → `Avatar`, `Image`, `AdaptiveImage`, `Video`. Do not author raw `<img>` for content media.
- **Authored markdown** → `<Markdown source={...} />`. Inline phrasing → `<Markdown source={...} inline />`. Never hand-roll `marked()` + `{@html}`.
- **Glass refraction** → mount `<LiquidGlassFilter />` once at app root.
- **Theme creation UI** → `ThemeBuilder`. Lifecycle-bound theming → `AtmosphereScope`.
- **Narrative motion** (character reveals, mood-driven typography, TTS sync) → `KineticText` from `@void-energy/kinetic-text`. Use this — not the free `use:kinetic` action — when the task is narrative.
- **Backdrop weather, mood, environmental color grading** → `ambient.push(category, variant, intensity)` from `@void-energy/ambient-layers`. Mount `<AmbientHost />` once at app root.
- **Page scaffold** → `<div class="container flex flex-col gap-2xl py-2xl"><section class="flex flex-col gap-xl"><div class="surface-raised p-lg flex flex-col gap-lg">...</div></section></div>`.

New consumer-side components belong in `@components/app/`. `@components/ui/` is reserved for the shipped primitive library and is read-only.

---

## Hard prohibitions

- Bracket-syntax Tailwind utilities (`gap-[20px]`, `max-w-[400px]`, `tablet:max-w-[400px]`).
- Hallucinated alias roots. Valid: `@components/{ui,core,icons,app}`, `@adapters`, `@actions`, `@lib`, `@stores`, `@config`, `@service`, `@styles`.
- Physics utilities in Tailwind (`shadow-lg`, `backdrop-blur-md`).
- Composition in SCSS (one-off page grids, margin-based positioning).
- Modifier classes for state (`.is-active`, `.open`, `.selected`).
- `variant=` props on shipped buttons.
- Children content on `ActionBtn` (the label is the `text` prop).
- Inline visual styles. Inline styles are reserved for runtime positioning.
- Editing generated files (`_generated-themes.scss`, `_fonts.scss`, `void-registry.json`, `void-physics.json`, `font-registry.ts`). Edit `src/config/design-tokens.ts` and run `npm run build:tokens`.

---

## Acceptance

A Void Energy output is complete when types check, the registry aligns with every component use, no raw values appear in touched files (exceptions carry `// void-ignore` with justification), and the result renders correctly across all three physics presets and both modes where the active physics permits.

---

## References

Lazy-loaded depth — read on demand:

- `references/component-catalog.md` — every shipped primitive: import path, props, slots, compose guidance, example.
- `references/token-vocabulary.md` — full semantic-token dictionary: spacing, color, typography, motion, breakpoints.
- `references/composition-recipes.md` — page archetypes (dashboard, settings, list/detail, hero) composed from shipped primitives.

The full L1 Svelte runtime — singletons (`voidEngine`, `modal`, `toast`), 45+ shipped primitives, premium packages — installs via `npm install void-energy`. The framework-agnostic L0 preset (CSS + tokens + vanilla runtime) installs separately as `@void-energy/tailwind` for non-Svelte consumers.

<!--
M6b — references-tree generation logic (deterministic emitters; no LLM calls):

  references/component-catalog.md ← src/config/component-registry.json
    For each component entry, emit a `## <component>` block containing:
      - import line from `import` field
      - props table from `props` field (name, type, default, description)
      - slots list from `slots` field
      - compose paragraph from `compose` field
      - first example from `example` field (fenced ```svelte block)
      - related cross-links from `related` field
    Group by `_categories` index. Stable sort within group.

  references/token-vocabulary.md ← src/config/design-tokens.ts
    Walk the tokens object; emit one section per top-level group:
      spacing, color, typography, motion, easing, surface, depth,
      radius, z-index, breakpoints, max-width.
    For each token: name, raw value, purpose (one-line if comment exists).
    Note density-scaling factor (0.75x – 1.25x) for spacing + typography.

  references/composition-recipes.md ← COMPOSITION-RECIPES.md
    Pass-through with light reformat: each archetype gets its own H2.
    Strip cross-doc TOC; keep code blocks verbatim.
    Append a "Page Scaffold (default)" appendix from §7 of SYSTEM-PROMPT.md.

  Frontmatter (stitched by build-skill.ts; never authored here):
    ---
    name: void-energy
    description: <DESCRIPTION_FROM_M6A — see scripts/skill-templates/description.md>
    license: <LICENSE_TBD>
    ---
-->
