# Library Rules — `src/`

You are editing **the core library**. The 5 Laws (root [CLAUDE.md](../CLAUDE.md)) apply, plus the strict additions below.

This file is loaded for any session whose CWD is in `src/`. If your CWD is in `src/pages/` or you are doing consumer-side composition, also read [src/pages/CLAUDE.md](pages/CLAUDE.md) — different rules apply there.

---

## 0. Mandatory pre-flight (do this before every task)

Before writing a single line of code, complete this audit and report findings:

1. **Read the task-relevant component directory** (`src/components/ui/`, `src/components/icons/`, etc.) — list every existing component that could relate to this task.
2. **Read the relevant SCSS file** in `src/styles/components/` for the component you're touching or creating.
3. **Find the nearest existing analog** — the component whose patterns you will replicate. Name it explicitly.
4. **Check `src/config/design-tokens.ts`** for any tokens relevant to this task.
5. **Read `.claude/rules/`** for any domain-specific rules loaded for this file type.

**Report format:**
> Analog: [component name + file path]
> Related SCSS: [file path]
> Relevant tokens: [list]
> Plan: [what you will do, where, and why it fits the system]

**Do NOT proceed to implementation until the user responds with "go" or "looks good".**

---

## 1. Read-only paths

These directories are off-limits unless the user explicitly asks for system-level work:

- `src/components/ui/` — shipped UI primitives
- `src/components/icons/` — shipped icon components
- `src/components/core/` — Astro scaffolding (AtmosphereScope, ThemeScript)
- `src/styles/` — SCSS engine
- `src/types/` — ambient global type declarations
- `src/config/design-tokens.ts` — token SSOT (edit + run `npm run build:tokens`)

Developer-editable config files (these ARE editable for routine work):
- `src/config/fonts.ts` — add/remove font families
- `src/config/atmospheres.ts` — add/replace theme palettes (see `.claude/rules/theme-creation.md`)
- `src/config/constants.ts` — change default atmosphere / physics

If the file you're about to edit is in a read-only path and the user did **not** ask for system-level work, stop and propose the change instead of making it.

---

## 2. Migration / authoring protocol

1. **SCOPE:** do exactly what is asked. One component, one file, one feature at a time.
2. **READ FIRST:** the target file, all files in the same directory, the corresponding SCSS in `src/styles/components/`, at least 2 existing components as pattern references. Report what you found before proceeding.
3. **PRESERVE:** keep existing behavior. Migration changes HOW code is written, not WHAT it does.
4. **MATCH PATTERNS:** find the nearest existing Void Energy component/style and replicate its patterns.
5. **NO INVENTIONS:** do not create new abstractions, mixins, utilities, or architecture. Use only what exists in the system.
6. **INCREMENTAL:** if a task feels large, propose breaking it into steps. Ask before proceeding.
7. **VERIFY:** after migration, the component must work correctly across all 3 physics presets (glass, flat, retro) and both modes (light, dark).

---

## 3. Component patterns (library-internal)

### Svelte component
```svelte
<script lang="ts">
  interface MyComponentProps {
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
  }: MyComponentProps = $props();
</script>

<div class="my-component flex gap-md {className}" data-state={checked ? 'active' : ''}>
  <!-- Layout = Tailwind. State = data attributes. Visual physics = SCSS class. -->
</div>
```

### SCSS component
```scss
@use '../abstracts' as *;

.my-component {
  @include surface-raised;

  @include when-state('active') { border-color: var(--energy-primary); }
  @include when-retro           { border-width: var(--physics-border-width); }
  @include when-light           { background: var(--bg-surface); }
}
```

### Interactive icon (custom)
Custom animated icons live in `src/components/icons/` using the `icon-[name]` class namespace.
```svelte
<svg class="icon-burger icon {className ?? ''}" viewBox="0 0 24 24" aria-hidden="true" {...rest}>
  <!-- animated SVG with scoped <style> -->
</svg>
```
Class ordering: `"icon-[name] icon {className ?? ''}"` — component class first, base class second, consumer classes last.

### Static icons (Lucide)
Library-internal usage of `@lucide/svelte` is consumer-style — see [src/pages/CLAUDE.md](pages/CLAUDE.md) for the icon-color and `data-size` rules.

---

## 4. Library-only gotchas {#gotchas}

- **SCSS import path:** always `@use '../abstracts' as *;` — never import individual partial files.
- **Tailwind v4 token bridge:** the bridge file is [src/styles/tailwind-theme.css](styles/tailwind-theme.css). There is no `tailwind.config.mjs`. Add semantic design values to `design-tokens.ts` and regenerate; only touch `tailwind-theme.css` when changing the framework bridge itself.
- **Tailwind v4 cascade layers.** Order: `void-scss, properties, theme, base, components, utilities, void-overrides`. `void-scss` (lowest) holds Void Energy SCSS; `void-overrides` (highest) is reserved for v4-vs-system conflicts. Do not reorder; do not put arbitrary SCSS into `void-overrides`.
- **v4 namespace modes.** Token names already at `:root` go under `@theme reference` in `tailwind-theme.css` — never `@theme inline` (creates a self-reference cycle). Forwarders (different names) go in `@theme inline`. Literal values go in plain `@theme`.
- **Radius tokens in SCSS:** default to `var(--radius-base)` (8px glass/flat, 0 retro). Use `var(--radius-full)` for pills. Scale tokens (`--radius-sm/md/lg/xl`) are available when you need a specific size; all are force-zeroed in retro.
- **Modern-Chrome Defaults (out-of-the-box).** VE ships modern-balanced chrome: 16px body ceiling, 36px desktop control height (32px Compact, 44px touch), CTA matches regular button height. Generosity lives in surface whitespace (Law 5), not chrome. Users dial up via `userConfig.scale` or `userConfig.density`. Do not "fix" tighter chrome to match old pre-2026 dimensions — those were deliberately modernized.
- **Flat physics has no hover lift/scale.** Flat buttons use background tint changes only on hover (12% secondary blend) — no `translateY` or `scale()`. Glass retains lift (-3px) and scale (1.02). Retro has no transitions.
- **Button typography is sentence case by default** (Phase 0b modernization). Buttons use `font-weight: medium` (500), `letter-spacing: 0.02em`, `text-transform: none`. CTA (`.btn-cta`) follows sentence case — its importance is asserted through extrabold weight and the animated comet border, not uppercase. For uppercase, use `.btn-loud`.
- **Modal dismiss buttons use `btn-ghost btn-error`** — not plain `btn-ghost`. Closing/canceling is mildly destructive; red ghost provides subtle signaling without the weight of solid `btn-error`.
- **`btn-icon` vs `btn-ghost`:** icon-only buttons use `btn-icon` (square hit targets via `var(--control-height)`, centered flex, icon-appropriate hover). `btn-ghost` is for **text-based** secondary actions (Cancel, Dismiss, Skip). Never use `btn-ghost` on an icon-only button.
- **Never guess patterns.** If you haven't read the analog component and its SCSS, stop and read them first. Inventing patterns that "seem right" is the most common source of system inconsistency.
