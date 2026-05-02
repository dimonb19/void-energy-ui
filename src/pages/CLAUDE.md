# Consumer Rules — `src/pages/`

You are building **consumer-side code**: pages, layouts, app-level screens that compose the shipped library. The 5 Laws (root [CLAUDE.md](../../CLAUDE.md)) apply. The strict library audit protocol from [src/CLAUDE.md](../CLAUDE.md) does **not** apply here — page work should compose freely from existing primitives, not pre-flight every change against an analog.

This file is loaded for any session whose CWD is in `src/pages/` or `src/components/app/`.

---

## 1. You are a consumer

- Compose primitives from `src/components/ui/*`. Do **NOT** modify them from here.
- If a primitive is missing or needs a new prop, propose the change to the user — do not reach across into `src/components/ui/` to edit. Library work is a different task with its own pre-flight (see [src/CLAUDE.md](../CLAUDE.md)).
- The **memory-indexed reusable component table** (`MEMORY.md`) is the fast lookup. The full source of truth is `src/config/component-registry.json`. Read the registry before assuming a primitive does or doesn't exist.

---

## 2. AI build order (page / app composition)

When the task is page or app composition, read in this order:

1. `src/config/component-registry.json` — what already exists
2. [AI-PLAYBOOK.md](../../AI-PLAYBOOK.md) — high-level working order
3. [COMPOSITION-RECIPES.md](../../COMPOSITION-RECIPES.md) — page archetypes (dashboard, settings, list/detail, etc.)
4. nearest local analog in `src/pages/`, `src/layouts/`, or `src/components/app/`
5. relevant `.claude/rules/*.md` (auto-loaded on path match — `page-composition.md`, `tailwind-registry.md`, `spacing-protocol.md`, etc.)

**Default to editing consumer files.** Do not edit `src/components/ui/`, `src/components/icons/`, `src/components/core/`, `src/styles/`, `src/types/`, or `src/config/design-tokens.ts` unless the user explicitly asks for system-level work.

---

## 3. Page composition pattern

`.astro` files are route shells. `src/layouts/` owns the shared app shell. `src/components/app/*.svelte` owns sections, form state, async actions. See [.claude/rules/page-composition.md](../../.claude/rules/page-composition.md) for the full scaffold and architecture rules.

```astro
---
import Layout from '@layouts/Layout.astro';
import AccountPage from '@components/app/AccountPage.svelte';
---

<Layout title="Account">
  <AccountPage client:load />
</Layout>
```

Spacing rhythm follows [.claude/rules/spacing-protocol.md](../../.claude/rules/spacing-protocol.md). Quick reference:
- Page wrapper: `container flex flex-col gap-2xl py-2xl`
- Section: `flex flex-col gap-xl`
- Card: `surface-raised p-lg flex flex-col gap-lg`
- Inner well: `surface-sunk p-md flex flex-col gap-md`

---

## 4. Reuse-first composites

Before reaching for raw `<input>` / `<button>` / `<select>`, check the registry for a composite. Common composites:

- **Fields:** `SearchField`, `EditField`, `EditTextarea`, `PasswordField`, `CopyField`, `ColorField`, `GenerateField`, `GenerateTextarea`, `FormField` (label + slot), `Selector`, `Combobox`, `Switcher`, `SliderField`, `Toggle`
- **Buttons:** `ActionBtn` (icon + text), `IconBtn` (icon-only round), `ProfileBtn`, `ThemesBtn`. Use plain `<button class="btn-cta">` / `<button class="btn-ghost">` for text-only actions.
- **Overlays:** `Modal`, `Dropdown`, `Sidebar` (open via the `modal` / `layerStack` singletons — never re-instantiate).
- **Navigation:** `Tabs`, `Pagination`, `LoadMore`.

If a composite doesn't support `...rest` and you need to pass extra native attributes, **extend the composite** — don't duplicate its template.

---

## 5. Icons

### Static icons (Lucide)
```svelte
<script lang="ts">
  import { Heart, TriangleAlert } from '@lucide/svelte';
</script>
<Heart class="icon" data-size="lg" />
<TriangleAlert class="icon text-error" />
```
Lucide icons (ISC, commercial-safe). Always `class="icon"`. Sizing via `data-size` (`sm | md | lg | xl | 2xl | 3xl | 4xl`).

### Interactive icons (custom)
Custom animated icons live in `src/components/icons/`. Use them like Lucide icons — class pattern is `icon-[name] icon`.

### Color
Icons inherit color from their parent via `currentColor`. Color is decided at the usage site:
- **Inside a button/container:** icon inherits parent color — no class needed.
- **Standalone semantic indicator:** apply Tailwind class — `<Check class="icon text-success" />`.
- **`btn-icon` hover:** uses `filter: brightness()` — no `hover:text-*` needed.
- **Inline icon hover (non-`btn-icon`):** set color on parent — `<button class="text-mute hover:text-error"><X class="icon" /></button>`.

### Never
- Never create custom static SVG icon components — use Lucide instead.

---

## 6. Empty states

Plain text, muted color, centered, generous padding. No italic — italic is reserved for prose semantics.

```html
<p class="text-mute text-center p-lg">No items yet</p>
```

---

## 7. Premium-package integration

Premium packages (`@void-energy/ambient-layers`, `@void-energy/kinetic-text`) are consumed through their published exports. From consumer code:

```ts
import { ambientLayer } from '@void-energy/ambient-layers';
import { kinetic, narrative } from '@void-energy/kinetic-text';
```

Do not reach into `packages/<name>/src/` via relative paths. Each premium package documents its API in its own `AI-REFERENCE.md` (see `packages/ambient-layers/AI-REFERENCE.md` and `packages/kinetic-text/AI-REFERENCE.md`).

---

## 8. State

- Local UI state: `$state` in the page-level Svelte component.
- Global / shared state: shipped singletons (`modal`, `toast`, `user`, `voidEngine`, `layerStack`, `shortcutRegistry`) — see root [CLAUDE.md](../../CLAUDE.md#4-state-management--singletons-import--never-re-instantiate).
- Do not create new stores for routine page work.
