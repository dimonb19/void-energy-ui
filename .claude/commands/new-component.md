Create a new Void Energy component — but only when genuinely needed. This command is a safety valve, not a scaffold factory. Default behavior is to prove an existing component cannot satisfy the need before creating anything.

## Input

`$ARGUMENTS` is the user's description of what they need. Free-form is fine.

Examples:

```text
/new-component a date range picker with two thumbs
/new-component RatingStars component for product reviews
/new-component a split-button that has a primary action and a dropdown menu
```

If no input is given, ask the user to describe what they need — not a name, but a **behavior**. "A button that does X" is a better brief than "a FancyButton."

---

## Phase A — Match-first (mandatory, cannot be skipped)

The goal of Phase A is to prove that no existing component already covers the need. Most of the time, one does. This phase must complete before any scaffolding begins.

### 1. Read the authoritative sources

- [src/config/component-registry.json](../../src/config/component-registry.json) — every shipped primitive with its `description`, `category`, `compose`, `related`, and `example` fields.
- All `.svelte` files in [src/components/ui/](../../src/components/ui/) (names + props at minimum).
- [CHEAT-SHEET.md](../../CHEAT-SHEET.md) — component catalog with usage patterns.
- [SYSTEM-PROMPT.md](../../SYSTEM-PROMPT.md) — condensed system contract.

### 2. Semantic match against the user's need

For the requested behavior, compare against:

- **Direct name match** — does a component with a similar name already exist?
- **Category match** — does the need fit an existing `_categories` bucket (field, action, overlay, nav, chart, layout, feedback, interaction, theme, form)? What's in that bucket?
- **`compose` field match** — does any component's `compose` description match the user's intent? (The `compose` field says what the component is *for*.)
- **`related` graph** — starting from the closest match, walk the `related` field to adjacent components.
- **Native element** — would a plain `<input>`, `<select>`, `<details>`, `<dialog>`, or `<progress>` cover this with shipped CSS classes alone?

### 3. Decide one of three outcomes

#### Outcome A1 — Existing component covers it (high-confidence match)

**Stop. Do not create anything.** Report:

- Which existing component satisfies the need
- How to use it (exact import + usage example pulled from the registry)
- What prop combination maps to the user's request

Example response:
> You asked for a date range picker with two thumbs. `SliderField` already supports multi-thumb ranges via its `value` prop (when bound to an array). Import: `import SliderField from '@components/ui/SliderField.svelte';`. Example: `<SliderField bind:value={range} min={startDate} max={endDate} />`. Before I scaffold anything, try this first.

#### Outcome A2 — Existing component covers it partially (extend instead of create)

**Propose extension over creation.** Extending a shipped primitive (new prop, new slot, new variant) is almost always better than a new primitive. Report:

- Which component is 70-90% of the need
- What specific extension (prop, slot, variant, data attribute) would close the gap
- Estimated effort vs. building from scratch
- Risk of diverging the existing component's contract

Only proceed to Phase B if the user explicitly overrides and says "no, build a new one."

#### Outcome A3 — Genuine gap exists (proceed to Phase B)

Name the gap precisely. Not "we need a new picker" but "no shipped primitive wraps a non-modal multi-select with grouped options." A precise gap description is the entry condition for Phase B.

---

## Phase B — VE-compliant scaffold (only when Phase A confirms a genuine gap)

Phase B is deliberately strict. It refuses vague briefs and enforces every constraint that makes a component feel native to Void Energy. The goal is a component that looks and behaves as if it shipped with the system.

### 4. Reject vague briefs

If the brief is underspecified — "make a button," "some kind of picker" — ask the user to answer all of:

- **Behavior:** what does it do on click / input / hover / focus?
- **Native element:** what HTML element wraps the interaction? (`<button>`, `<input>`, `<details>`, `<dialog>`, custom?)
- **States:** active, disabled, loading, error, hover, focus, open — which apply?
- **Physics signature:** what surface depth (`surface-raised` / `surface-sunk` / none)? What motion character (lift on hover? scale? static?)?
- **Size scale:** does it need `data-size` variants (sm/md/lg/xl)?
- **Accessibility:** role, aria attributes, keyboard interaction.

Do not scaffold until all are answered. A "proper" VE component cannot exist without these decisions.

### 5. Pre-flight: find the analog

Before writing code, identify the **nearest existing analog** — the component whose structure you will replicate. This is non-negotiable.

- Pick a component from `src/components/ui/` with similar shape (field-style, button-style, overlay-style, feedback-style).
- Read the full Svelte file and its SCSS partner in `src/styles/components/_<name>.scss`.
- Report the analog to the user before proceeding: "I'll replicate the structure of `SearchField` because your brief matches a text-input-with-affordance pattern."

### 6. Scaffold the Svelte component

Create `src/components/ui/<PascalCase>.svelte`:

```svelte
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  interface <PascalCase>Props {
    // typed props based on the brief
    value?: string;
    disabled?: boolean;
    onchange?: (value: string) => void;
    class?: string;
    // forward native attributes when wrapping a native element
    // ...rest props, never reimplement browser behavior
  }

  let {
    value = $bindable(''),
    disabled = false,
    onchange,
    class: className = '',
    ...rest
  }: <PascalCase>Props = $props();

  // local state via $state; derived values via $derived; side effects via $effect
</script>

<!--
  Native element wrapper. Do not replace browser behavior.
  State lives in data-* and ARIA, never in class.
  Composition via Tailwind; material via SCSS class.
-->
<div class="kebab-case-name flex gap-md {className}" data-state={disabled ? 'disabled' : ''}>
  <!-- wrap a native element. spread ...rest onto it. -->
</div>
```

**Non-negotiable rules for Phase B scaffolds:**

- Svelte 5 runes only: `$props`, `$state`, `$derived`, `$effect`, `$bindable`. No `export let`, `$:`, `onMount`, `onDestroy`, `createEventDispatcher`, no stores from `svelte/store`.
- Native-first: wrap a native element. If no native element covers the interaction, justify this in a one-line comment above the component.
- Typed `Props` interface inline with the component.
- `class` prop always accepted and aliased to `className`.
- `...rest` forwarded to the wrapped native element when that element is the interaction target.
- State via `data-state`, `data-size`, `data-variant`, `aria-*`. Never `.is-active`, `.selected`, `.open`.
- Layout via Tailwind utility classes (composition).
- CSS class = kebab-case of the PascalCase name.
- Semantic tokens only — no raw px, hex, rgb, hsl, % in the Svelte file.

### 7. Scaffold the SCSS

Create `src/styles/components/_<name>.scss`:

```scss
@use '../abstracts' as *;

.kebab-case-name {
  @include surface-raised; // or surface-sunk for input-like wells; pick per brief

  min-height: var(--control-height);
  display: inline-flex;
  gap: var(--space-xs);
  padding: var(--space-md);
  border-radius: var(--radius-base);
  transition:
    background var(--speed-fast) var(--ease-flow),
    border-color var(--speed-fast) var(--ease-flow);

  @include when-state('active') {
    border-color: var(--energy-primary);
  }

  @include when-state('disabled') {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // Physics adaptations — include only where the component needs per-physics behavior.
  // Omit empty blocks. Do not paste all three just to look thorough.
  @include when-glass {
    // glass-specific tweaks when surface-raised isn't enough
  }

  @include when-retro {
    border-width: var(--physics-border-width);
  }

  // Mode adaptation — include only where the component needs per-mode behavior.
  @include when-light {
    // light-mode override
  }
}
```

**Non-negotiable rules for Phase B SCSS:**

- Import abstracts only once: `@use '../abstracts' as *;` — never import individual partials.
- Semantic tokens only. If a raw value is physically necessary (readability floor, shimmer highlight), add `// void-ignore` with a one-line justification.
- Radius: default to `var(--radius-base)` (adapts per physics); `var(--radius-full)` for pills.
- Motion: `var(--speed-fast)` + `var(--ease-flow)` or `var(--ease-spring-snappy)` unless a different speed is justified.
- Physics/mode blocks: include `when-glass`, `when-flat`, `when-retro`, `when-light`, `when-dark` only when the component needs per-axis behavior. **Omit empty blocks.**
- Use `@include when-state('<name>')` for state handling, not raw `[data-state="..."]` selectors.

### 8. Register the SCSS

Add to `src/styles/global.scss` in the components section:

```scss
@use 'components/<name>';
```

### 9. Draft the registry entry

Append a draft entry to [src/config/component-registry.json](../../src/config/component-registry.json) under the appropriate `_categories` bucket and the `components` map. Every field from existing entries must be filled in:

```json
"<kebab-name>": {
  "description": "<one-sentence description of what it is and when to use it>",
  "category": "<field|action|overlay|nav|chart|layout|feedback|interaction|theme|form>",
  "component": "<PascalCase>",
  "import": "@components/ui/<PascalCase>.svelte",
  "props": ["<prop>", "<prop>", "class"],
  "slots": [],
  "related": ["<nearest-analog>", "<adjacent>"],
  "compose": "<how this slots into a page — when to pick it over related components>",
  "example": "<one-line JSX example>"
}
```

Also add the entry to the matching `_categories` bucket at the top.

Run `npm run check:registry` to confirm no drift.

### 10. Document the component

Tell the user the scaffold is ready and what still needs doing:

- Component file path
- SCSS file path
- Registry entry added
- **Next:** run `/document <PascalCase>` to add the entry to `CHEAT-SHEET.md`
- Remind the user to verify the component visually across all three physics (`glass`, `flat`, `retro`) and both modes (`light`, `dark`) where the physics permits.

---

## Guardrails — what this command will NOT do

- Will **not** scaffold without completing Phase A match-first check.
- Will **not** accept vague briefs. Asks for behavior + native element + states + physics + size + a11y.
- Will **not** produce a component that reimplements browser behavior available from native HTML.
- Will **not** emit raw px, hex, rgb, or utility classes for state.
- Will **not** create empty `when-glass` / `when-flat` / `when-retro` / `when-light` / `when-dark` blocks.
- Will **not** skip the registry entry. A component without a registry entry is invisible to the rest of the system.

The point of this command is to keep the system coherent. A bad new primitive is worse than no new primitive.
